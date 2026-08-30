using DynamicTransaction;
using Serilog;
using Server.Infrastructure.Data.ExternalSources;

Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .Enrich.FromLogContext()
    .Enrich.WithProperty("HostName", Environment.MachineName)
    .CreateLogger();

try
{
    Log.Information("Starting Web API host...");
    var builder = WebApplication.CreateBuilder(args);

    builder.Host.UseSerilog();

    builder.Services.AddCors(options =>
    {
        options.AddPolicy("AllowAll", policy =>
        {
            policy.AllowAnyOrigin()
                  .AllowAnyMethod()
                  .AllowAnyHeader();
        });
    });

    builder.Services.AddControllers()
        .AddNewtonsoftJson();

    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddSwaggerGen();

    var provider = builder.Configuration["ConnectionStrings:Provider"];

    if (string.Equals(provider, "Oracle", StringComparison.OrdinalIgnoreCase))
    {
        var oracleService = new OracleService();
        var connectionString = oracleService.GetConnectionString();

        builder.Services.AddDynamicTransaction(connectionString);
        builder.Services.AddScoped<OracleService>();
    }
    else
    {
        var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") ?? throw new InvalidOperationException("DefaultConnection connection string not found.");
        builder.Services.AddMySqlDynamicTransaction(connectionString);
    }

    builder.Services.AddScoped<JanaticsAdminPortal.API.Repositories.UserRepository>();
    builder.Services.AddScoped<JanaticsAdminPortal.API.Repositories.SessionRepository>();
    builder.Services.AddScoped<JanaticsAdminPortal.API.Repositories.RoleRepository>();
    builder.Services.AddScoped<JanaticsAdminPortal.API.Repositories.OrgUnitRepository>();
    builder.Services.AddScoped<CustomerComplaintApi.Data.DbHelper>();

    var app = builder.Build();

    if (app.Environment.IsDevelopment())
    {
        app.UseSwagger();
        app.UseSwaggerUI();
    }

    app.UseHttpsRedirection();
    app.UseCors("AllowAll");
    app.UseAuthorization();
    app.MapControllers();

    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Host terminated unexpectedly");
}
finally
{
    Log.CloseAndFlush();
}
