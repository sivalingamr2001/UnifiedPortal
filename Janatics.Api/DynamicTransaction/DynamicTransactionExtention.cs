using DynamicTransaction.Interfaces;
using DynamicTransaction.Services;
using DynamicTransaction.Services.MySql;
using Microsoft.Extensions.DependencyInjection;

namespace DynamicTransaction;

public static class DynamicTransactionExtension
{
    public static IServiceCollection AddDynamicTransaction(
        this IServiceCollection services,
        string defaultConnectionString)
    {
        services.AddScoped<IDbConnectionFactory>(_ =>
            new DbConnectionFactory(defaultConnectionString));

        services.AddScoped<IQueryExecutor, QueryExecutor>();
        services.AddScoped<IDynamicQueryExecutor, DynamicQueryExecutor>();
        services.AddScoped<IDapperCommandExecutor, DapperCommandExecutor>();
        services.AddScoped<ITransactionCommandService, TransactionCommandService>();

        return services;
    }

    public static IServiceCollection AddDynamicTransaction<TFactory, TExecutor>(
        this IServiceCollection services)
        where TFactory : class, IDbConnectionFactory
        where TExecutor : class, IQueryExecutor
    {
        services.AddScoped<IQueryExecutor, TExecutor>();
        services.AddSingleton<IDbConnectionFactory, TFactory>();
        services.AddScoped<IDapperCommandExecutor, DapperCommandExecutor>();
        services.AddScoped<ITransactionCommandService, TransactionCommandService>();

        return services;
    }

    public static IServiceCollection AddMySqlDynamicTransaction(
        this IServiceCollection services,
        string defaultConnectionString)
    {
        services.AddScoped<IDbConnectionFactory>(_ =>
            new MySqlDbConnectionFactory(defaultConnectionString));

        services.AddScoped<IQueryExecutor, MySqlQueryExecutor>();
        services.AddScoped<IDapperCommandExecutor, MySqlDapperCommandExecutor>();
        services.AddScoped<ITransactionCommandService, MySqlTransactionCommandService>();

        return services;
    }
}
