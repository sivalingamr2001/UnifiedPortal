using DynamicTransaction;
using JanaticsAdminPortal.API.Data;
using JanaticsAdminPortal.API.Repositories;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Serilog;
using Server.Infrastructure.Data.ExternalSources;
using System.IdentityModel.Tokens.Jwt;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// CRITICAL: without this, Dapper's default mapper only matches columns to
// properties by exact name (case-insensitive) - USER_ID does NOT
// automatically match UserId, PASSWORD_HASH does NOT automatically match
// PasswordHash, etc. Every QueryAsync<T> call in every repository in this
// project relies on this being set, or most fields silently come back
// null/default instead of throwing an error - which is exactly the "empty
// PasswordHash/PasswordSalt" symptom that took this long to track down.
Dapper.DefaultTypeMap.MatchNamesWithUnderscores = true;

builder.Host.UseSerilog((ctx, cfg) => cfg
    .WriteTo.Console()
    .WriteTo.File("logs/janatics-admin-.log", rollingInterval: RollingInterval.Day)
    .MinimumLevel.Information());

// ---------------------------------------------------------------------
// DI - IDbConnectionFactory (simple Dapper access, used by every
// repository below) and OracleDb (resilient raw-command access, kept
// available separately - not currently used by any repository).
// ---------------------------------------------------------------------
builder.Services.AddControllers()
        .AddNewtonsoftJson();
builder.Services.AddSingleton<IDbConnectionFactory, OracleConnectionFactory>();
builder.Services.AddSingleton<OracleDb>();

var oracleService = new OracleService();
var connectionString = oracleService.GetConnectionString();

builder.Services.AddDynamicTransaction(connectionString);
builder.Services.AddScoped<OracleService>();

builder.Services.AddScoped<RoleRepository>();
builder.Services.AddScoped<ModuleRepository>();
builder.Services.AddScoped<MenuRepository>();
builder.Services.AddScoped<UserRepository>();
builder.Services.AddScoped<RoleMenuRepository>();
builder.Services.AddScoped<OrgUnitRepository>();
builder.Services.AddScoped<UserAccessRightsRepository>();
builder.Services.AddScoped<SessionRepository>();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Description = "Paste the JWT from POST /api/auth/login (without the 'Bearer ' prefix - Swagger adds it)."
    });
    c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference { Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            Array.Empty<string>()
        }
    });
});

var allowedOrigins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>() ?? Array.Empty<string>();
builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        policy.WithOrigins(allowedOrigins).AllowAnyHeader().AllowAnyMethod();
    });
});

var jwtKey = builder.Configuration["Jwt:Key"] ?? throw new InvalidOperationException("Jwt:Key is not configured.");

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        // Without this, ASP.NET Core silently renames well-known short
        // claim names (like "sub") to long XML-namespace URIs when it
        // builds User.Claims - meaning code that looks for the literal
        // "sub" claim (JwtRegisteredClaimNames.Sub) gets null back, even
        // though the token genuinely contains it. This keeps claim types
        // exactly as issued.
        options.MapInboundClaims = false;
        options.RequireHttpsMetadata = true;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidateAudience = true,
            ValidAudience = builder.Configuration["Jwt:Audience"],
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromMinutes(1),
        };

        options.Events = new JwtBearerEvents
        {
            OnTokenValidated = async context =>
            {
                var jti = context.Principal?.FindFirst(JwtRegisteredClaimNames.Jti)?.Value;
                if (string.IsNullOrEmpty(jti)) { context.Fail("Token is missing a jti claim."); return; }

                var sessions = context.HttpContext.RequestServices.GetRequiredService<SessionRepository>();
                var isValid = await sessions.ValidateAndTouchAsync(jti);
                if (!isValid) context.Fail("Session has ended.");
            }
        };
    });

builder.Services.AddAuthorization();

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();

app.UseSerilogRequestLogging();
app.UseHttpsRedirection();

app.Use(async (context, next) =>
{
    context.Response.Headers["X-Content-Type-Options"] = "nosniff";
    context.Response.Headers["X-Frame-Options"] = "DENY";
    context.Response.Headers["Referrer-Policy"] = "no-referrer";
    await next();
});

app.UseCors("Frontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
