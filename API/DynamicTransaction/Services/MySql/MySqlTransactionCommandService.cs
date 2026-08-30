using DynamicTransaction.Interfaces;
using DynamicTransaction.Models;
using DynamicTransaction.Infrastructure;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.Security.Cryptography;

namespace DynamicTransaction.Services.MySql;

public sealed class MySqlTransactionCommandService : ITransactionCommandService
{
    private readonly IDapperCommandExecutor _commandExecutor;
    private readonly ILogger<MySqlTransactionCommandService> _logger;

    private static readonly Dictionary<string, TransactionMapping> Mappings = new(StringComparer.OrdinalIgnoreCase)
    {
        ["Modules"] = new()
        {
            TransactionName = "Modules",
            MainTableName = "JAN_MODULES",
            PrimaryKeyColumn = "MODULE_ID",
            AutoIncrementPrimaryKey = true,
            AllowedColumns = new(StringComparer.OrdinalIgnoreCase)
            {
                "MODULE_ID", "MODULE_CODE", "MODULE_NAME", "DEFAULT_MENU", "SORT_ORDER", "REMARKS", "STATUS", "CREATED_BY", "CREATED_DATE", "MODIFIED_BY", "MODIFIED_DATE"
            }
        },
        ["Roles"] = new()
        {
            TransactionName = "Roles",
            MainTableName = "JAN_ROLES",
            PrimaryKeyColumn = "ROLE_ID",
            AutoIncrementPrimaryKey = true,
            AllowedColumns = new(StringComparer.OrdinalIgnoreCase)
            {
                "ROLE_ID", "ROLE_CODE", "ROLE_NAME", "SOURCE_TYPE", "REMARKS", "ROLE_VERSION", "STATUS", "CREATED_BY", "CREATED_DATE", "MODIFIED_BY", "MODIFIED_DATE"
            }
        },
        ["Menus"] = new()
        {
            TransactionName = "Menus",
            MainTableName = "JAN_MENUS",
            PrimaryKeyColumn = "MENU_ID",
            AutoIncrementPrimaryKey = true,
            AllowedColumns = new(StringComparer.OrdinalIgnoreCase)
            {
                "MENU_ID", "MENU_CODE", "MENU_NAME", "DISPLAY_NAME", "MODULE_ID", "PARENT_MENU_ID", "MENU_TYPE", "NATURE", "SORT_ORDER", "STATUS", "CREATED_BY", "CREATED_DATE", "MODIFIED_BY", "MODIFIED_DATE", "MENU_PATH", "MENU_ICON"
            }
        },
        ["UserMaster"] = new()
        {
            TransactionName = "UserMaster",
            MainTableName = "JAN_USER_MASTER",
            PrimaryKeyColumn = "USER_ID",
            AutoIncrementPrimaryKey = true,
            AllowedColumns = new(StringComparer.OrdinalIgnoreCase)
            {
                "USER_ID", "USER_CODE", "EMPLOYEE_ID", "FULL_NAME", "USER_NAME", "PASSWORD_HASH", "PASSWORD_SALT", "USER_TYPE", "SECURITY_LEVEL",
                "ROLE_ID", "VALID_FROM", "VALID_TO", "STATUS", "PRIMARY_EMAIL", "PRIMARY_MOBILE", "PASSWORD_POLICY", "WORK_OPERATING_UNIT",
                "THEME", "TIMEZONE", "MAX_SESSIONS", "LOGIN_WORKDAYS_ONLY", "LOGIN_FROM_TIME", "LOGIN_TO_TIME", "ALLOWED_MACHINES", "ALLOWED_IPS",
                "CREATED_BY", "CREATED_DATE", "MODIFIED_BY", "MODIFIED_DATE", "REPORTING_TO", "PASSWORD"
            }
        },
        ["RoleMenu"] = new()
        {
            TransactionName = "RoleMenu",
            MainTableName = "JAN_ROLE_MENU",
            PrimaryKeyColumn = "ROLE_MENU_ID",
            AutoIncrementPrimaryKey = true,
            AllowedColumns = new(StringComparer.OrdinalIgnoreCase)
            {
                "ROLE_MENU_ID", "ROLE_ID", "MODULE_ID", "MENU_ID", "PERM_VIEW", "PERM_ADD", "PERM_EDIT", "PERM_DELETE", "PERM_EXPORT", "PERM_APPROVE", "RESTRICTED_COLUMNS", "CREATED_BY", "CREATED_DATE", "MODIFIED_BY", "MODIFIED_DATE"
            }
        },
        ["UserAccessRights"] = new()
        {
            TransactionName = "UserAccessRights",
            MainTableName = "JAN_USER_MASTER",
            PrimaryKeyColumn = "USER_ID",
            AutoIncrementPrimaryKey = true,
            AllowedColumns = new(StringComparer.OrdinalIgnoreCase) { "USER_ID" },
            ChildMappings = new(StringComparer.OrdinalIgnoreCase)
            {
                ["orgUnits"] = new()
                {
                    TableName = "JAN_USER_ACCESS_RIGHTS",
                    PrimaryKeyColumn = "UAR_ID",
                    ForeignKeyColumn = "USER_ID",
                    AllowedColumns = new(StringComparer.OrdinalIgnoreCase)
                    {
                        "UAR_ID", "USER_ID", "OPERATING_UNIT", "ORGANIZATION_ID", "LIMIT_VALUE",
                        "ACCESS_CHANNEL", "STATUS", "REMARKS", "CREATED_BY"
                    }
                }
            }
        }
    };

    public MySqlTransactionCommandService(IDapperCommandExecutor commandExecutor, ILogger<MySqlTransactionCommandService> logger)
    {
        _commandExecutor = commandExecutor ?? throw new ArgumentNullException(nameof(commandExecutor));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    /// <inheritdoc/>
    public async Task<TransactionCommandResponse> ExecuteTransactionAsync(
        TransactionCommandRequest request,
        CancellationToken cancellationToken = default)
    {
        if (request == null)
        {
            return StructuredError("Validation failed: Request payload cannot be null.", "None", "Validation");
        }

        if (string.IsNullOrWhiteSpace(request.TransactionName))
        {
            return StructuredError("Validation failed: TransactionName is required.", "None", "Validation");
        }

        if (!Mappings.TryGetValue(request.TransactionName, out var mapping))
        {
            return StructuredError($"Validation failed: Unknown or unauthorized TransactionName '{request.TransactionName}'.", "None", "NotFound");
        }

        long transactionId = request.TransactionId ?? 0;
        string operation = transactionId > 0 ? "Update" : "Create";

        var validationError = ValidateRequest(request, mapping, operation);
        if (validationError != null)
        {
            _logger.LogWarning("MySqlTransactionCommandService.ExecuteTransactionAsync Validation FAILED. Name: {Name}, Error: {Error}", request.TransactionName, validationError.Message);
            return validationError;
        }

        int totalRowsAffected = 0;
        var sw = System.Diagnostics.Stopwatch.StartNew();

        var redactedMain = SafeLogExtensions.RedactParameters(request.MainProps);
        var redactedChild = SafeLogExtensions.RedactParameters(request.ChildProps);
        var redactedDel = SafeLogExtensions.RedactParameters(request.DelProps);

        _logger.LogInformation("MySqlTransactionCommandService.ExecuteTransactionAsync START. TransactionName: {Name}, Operation: {Operation}, MainProps: {MainProps}, ChildProps: {ChildProps}, DelProps: {DelProps}",
            request.TransactionName, operation, redactedMain, redactedChild, redactedDel);

        string generatedCodeResult = "";

        try
        {
            totalRowsAffected = await _commandExecutor.ExecuteInTransactionAsync(async (tx) =>
            {
                int rowsInTx = 0;

                // Phase A: DELETE Operations
                if (request.DelProps != null)
                {
                    foreach (var delProp in request.DelProps)
                    {
                        var entityKey = delProp.Key;
                        var delItems = delProp.Value as JArray;
                        if (delItems == null || delItems.Count == 0) continue;

                        string targetTableName;
                        string targetKeyColumn;

                        if (string.Equals(entityKey, mapping.TransactionName, StringComparison.OrdinalIgnoreCase) ||
                            string.Equals(entityKey, mapping.MainTableName, StringComparison.OrdinalIgnoreCase))
                        {
                            targetTableName = mapping.MainTableName;
                            targetKeyColumn = mapping.PrimaryKeyColumn;
                        }
                        else
                        {
                            var childMap = mapping.ChildMappings[entityKey];
                            targetTableName = childMap.TableName;
                            targetKeyColumn = childMap.PrimaryKeyColumn;
                        }

                        foreach (var item in delItems)
                        {
                            object? idValue;
                            if (item.Type == JTokenType.Object)
                            {
                                var obj = (JObject)item;
                                var pkValProp = obj.Properties().FirstOrDefault(p => string.Equals(p.Name, targetKeyColumn, StringComparison.OrdinalIgnoreCase));
                                idValue = ConvertJTokenToValue(pkValProp?.Value);
                            }
                            else
                            {
                                idValue = ConvertJTokenToValue(item);
                            }

                            var deleteSql = BuildDeleteSql(targetTableName, targetKeyColumn);
                            rowsInTx += await _commandExecutor.ExecuteAsync(
                                deleteSql,
                                new Dictionary<string, object?> { ["_key_id_"] = idValue },
                                transaction: tx,
                                cancellationToken: cancellationToken);
                        }
                    }
                }

                // Phase B: Main Record INSERT or UPDATE
                if (request.MainProps != null && request.MainProps.HasValues)
                {
                    var mainPropsDict = new Dictionary<string, object?>();
                    foreach (var prop in request.MainProps.Properties())
                    {
                        bool isPk = string.Equals(prop.Name, mapping.PrimaryKeyColumn, StringComparison.OrdinalIgnoreCase);
                        if (operation == "Create" && isPk && mapping.AutoIncrementPrimaryKey)
                        {
                            continue;
                        }
                        mainPropsDict[prop.Name] = ConvertJTokenToValue(prop.Value);
                    }

                    // Handle password hashing if provided (ISO/IEC 18033-5 PBKDF2 compliant)
                    string? rawPassword = null;
                    if (mainPropsDict.TryGetValue("password", out var pwdVal) && pwdVal is string pwdStr && !string.IsNullOrWhiteSpace(pwdStr))
                    {
                        rawPassword = pwdStr;
                    }
                    else if (mainPropsDict.TryGetValue("PASSWORD", out var pwdVal2) && pwdVal2 is string pwdStr2 && !string.IsNullOrWhiteSpace(pwdStr2))
                    {
                        rawPassword = pwdStr2;
                    }

                    if (rawPassword != null)
                    {
                        byte[] saltBytes = RandomNumberGenerator.GetBytes(16);
                        string salt = Convert.ToBase64String(saltBytes);
                        using var pbkdf2 = new Rfc2898DeriveBytes(rawPassword, saltBytes, 10000, HashAlgorithmName.SHA256);
                        string hash = Convert.ToBase64String(pbkdf2.GetBytes(32));

                        mainPropsDict["PASSWORD_HASH"] = hash;
                        mainPropsDict["PASSWORD_SALT"] = salt;
                    }

                    // Remove raw password fields so they don't get matched to DB columns
                    mainPropsDict.Remove("password");
                    mainPropsDict.Remove("PASSWORD");

                    if (operation == "Create")
                    {
                        // Auto-generate Code columns if empty
                        if (mapping.TransactionName == "Modules" && !mainPropsDict.ContainsKey("MODULE_CODE"))
                        {
                            var count = await _commandExecutor.ExecuteScalarAsync<long>("SELECT COUNT(*) FROM JAN_MODULES", transaction: tx, cancellationToken: cancellationToken);
                            generatedCodeResult = "MOD" + (count + 1).ToString("D3");
                            mainPropsDict["MODULE_CODE"] = generatedCodeResult;
                        }
                        else if (mapping.TransactionName == "Roles" && !mainPropsDict.ContainsKey("ROLE_CODE"))
                        {
                            var count = await _commandExecutor.ExecuteScalarAsync<long>("SELECT COUNT(*) FROM JAN_ROLES", transaction: tx, cancellationToken: cancellationToken);
                            generatedCodeResult = "ROL" + (count + 1).ToString("D3");
                            mainPropsDict["ROLE_CODE"] = generatedCodeResult;
                        }
                        else if (mapping.TransactionName == "Menus" && !mainPropsDict.ContainsKey("MENU_CODE"))
                        {
                            var count = await _commandExecutor.ExecuteScalarAsync<long>("SELECT COUNT(*) FROM JAN_MENUS", transaction: tx, cancellationToken: cancellationToken);
                            generatedCodeResult = "MNU" + (count + 1).ToString("D3");
                            mainPropsDict["MENU_CODE"] = generatedCodeResult;
                        }
                        else if (mapping.TransactionName == "UserMaster" && !mainPropsDict.ContainsKey("USER_CODE"))
                        {
                            var count = await _commandExecutor.ExecuteScalarAsync<long>("SELECT COUNT(*) FROM JAN_USER_MASTER", transaction: tx, cancellationToken: cancellationToken);
                            generatedCodeResult = "U" + (count + 1).ToString("D4");
                            mainPropsDict["USER_CODE"] = generatedCodeResult;
                        }

                        if (!mainPropsDict.ContainsKey("CREATED_BY")) mainPropsDict["CREATED_BY"] = "SYSTEM";
                        if (!mainPropsDict.ContainsKey("CREATED_DATE")) mainPropsDict["CREATED_DATE"] = DateTime.Now;

                        var columns = mainPropsDict.Keys.ToList();
                        var insertSql = BuildInsertSql(mapping.MainTableName, columns);

                        rowsInTx += await _commandExecutor.ExecuteAsync(
                            insertSql,
                            mainPropsDict,
                            transaction: tx,
                            cancellationToken: cancellationToken);

                        var lastId = await _commandExecutor.ExecuteScalarAsync<object>("SELECT LAST_INSERT_ID()", transaction: tx, cancellationToken: cancellationToken);
                        transactionId = ConvertToInt64(lastId);
                    }
                    else // UPDATE
                    {
                        if (!mainPropsDict.ContainsKey("MODIFIED_BY")) mainPropsDict["MODIFIED_BY"] = "SYSTEM";
                        mainPropsDict["MODIFIED_DATE"] = DateTime.Now;

                        var updateColumns = mainPropsDict.Keys.Where(c => !string.Equals(c, mapping.PrimaryKeyColumn, StringComparison.OrdinalIgnoreCase)).ToList();
                        var updateSql = BuildUpdateSql(mapping.MainTableName, updateColumns, mapping.PrimaryKeyColumn);

                        var mysqlParams = new Dictionary<string, object?>();
                        foreach (var col in updateColumns)
                        {
                            mysqlParams[col] = mainPropsDict[col];
                        }
                        mysqlParams["_key_id_"] = transactionId;

                        rowsInTx += await _commandExecutor.ExecuteAsync(
                            updateSql,
                            mysqlParams,
                            transaction: tx,
                            cancellationToken: cancellationToken);
                    }
                }

                // Phase C: Child Records INSERT or UPDATE
                if (request.ChildProps != null)
                {
                    foreach (var childProp in request.ChildProps)
                    {
                        var childKey = childProp.Key;
                        var childItems = childProp.Value as JArray;
                        if (childItems == null || childItems.Count == 0) continue;

                        var childMap = mapping.ChildMappings[childKey];

                        foreach (var childItem in childItems)
                        {
                            var childObj = (JObject)childItem;
                            var childDict = new Dictionary<string, object?>();
                            foreach (var prop in childObj.Properties())
                            {
                                childDict[prop.Name] = ConvertJTokenToValue(prop.Value);
                            }

                            childDict[childMap.ForeignKeyColumn] = transactionId;

                            var childPkProp = childObj.GetValue(childMap.PrimaryKeyColumn);
                            bool isChildUpdate = childPkProp != null && childPkProp.Type != JTokenType.Null && childPkProp.Value<long>() > 0;

                            if (isChildUpdate)
                            {
                                var updateColumns = childDict.Keys.Where(c => !string.Equals(c, childMap.PrimaryKeyColumn, StringComparison.OrdinalIgnoreCase)).ToList();
                                var updateSql = BuildUpdateSql(childMap.TableName, updateColumns, childMap.PrimaryKeyColumn);

                                var mysqlParams = new Dictionary<string, object?>();
                                foreach (var col in updateColumns)
                                {
                                    mysqlParams[col] = childDict[col];
                                }
                                mysqlParams["_key_id_"] = childPkProp!.Value<long>();

                                rowsInTx += await _commandExecutor.ExecuteAsync(
                                    updateSql,
                                    mysqlParams,
                                    transaction: tx,
                                    cancellationToken: cancellationToken);
                            }
                            else
                            {
                                var insertColumns = childDict.Keys.ToList();
                                if (childPkProp == null || childPkProp.Type == JTokenType.Null)
                                {
                                    insertColumns = insertColumns.Where(c => !string.Equals(c, childMap.PrimaryKeyColumn, StringComparison.OrdinalIgnoreCase)).ToList();
                                }

                                var insertSql = BuildInsertSql(childMap.TableName, insertColumns);

                                var mysqlParams = new Dictionary<string, object?>();
                                foreach (var col in insertColumns)
                                {
                                    mysqlParams[col] = childDict[col];
                                }

                                rowsInTx += await _commandExecutor.ExecuteAsync(
                                    insertSql,
                                    mysqlParams,
                                    transaction: tx,
                                    cancellationToken: cancellationToken);
                            }
                        }
                    }
                }

                return rowsInTx;
            });

            _logger.LogInformation("MySqlTransactionCommandService.ExecuteTransactionAsync SUCCESS. TransactionName: {Name}, Operation: {Operation}, RowsAffected: {RowsAffected}, TransactionId: {TxId}, DurationMs: {DurationMs}, Success: true",
                request.TransactionName, operation, totalRowsAffected, transactionId, sw.ElapsedMilliseconds);

            return new TransactionCommandResponse
            {
                Success = true,
                TransactionId = transactionId,
                RowsAffected = totalRowsAffected,
                Operation = operation,
                Message = string.IsNullOrEmpty(generatedCodeResult) 
                    ? "Database transaction executed successfully." 
                    : $"Database transaction executed successfully. GeneratedCode: {generatedCodeResult}"
            };
        }
        catch (OperationCanceledException)
        {
            _logger.LogWarning("MySqlTransactionCommandService.ExecuteTransactionAsync CANCELED. TransactionName: {Name}, DurationMs: {DurationMs}", request.TransactionName, sw.ElapsedMilliseconds);
            throw;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "MySqlTransactionCommandService.ExecuteTransactionAsync ERROR. TransactionName: {Name}, Operation: {Operation}, DurationMs: {DurationMs}, Success: false, ErrorMessage: {ErrorMessage}",
                request.TransactionName, operation, sw.ElapsedMilliseconds, ex.Message);

            return new TransactionCommandResponse
            {
                Success = false,
                TransactionId = transactionId,
                RowsAffected = 0,
                Operation = operation,
                Message = $"Database operation failed. Error: {ex.Message}",
                ErrorType = "Database"
            };
        }
    }

    private static TransactionCommandResponse? ValidateRequest(TransactionCommandRequest request, TransactionMapping mapping, string operation)
    {
        if (operation == "Create" && (request.MainProps == null || !request.MainProps.HasValues))
        {
            return StructuredError("Validation failed: MainProps payload cannot be empty for a Create (INSERT) operation.", operation);
        }

        if (operation == "Update")
        {
            if (request.MainProps == null || !request.MainProps.HasValues)
            {
                bool hasChildOps = request.ChildProps != null && request.ChildProps.HasValues;
                bool hasDelOps = request.DelProps != null && request.DelProps.HasValues;
                if (!hasChildOps && !hasDelOps)
                {
                    return StructuredError("Validation failed: Update request must contain at least one main record update, child update, or deletion operation.", operation);
                }
            }
            else
            {
                var writableColumns = request.MainProps.Properties()
                    .Select(p => p.Name)
                    .Where(c => !string.Equals(c, mapping.PrimaryKeyColumn, StringComparison.OrdinalIgnoreCase))
                    .ToList();

                if (writableColumns.Count == 0)
                {
                    return StructuredError("Validation failed: MainProps must contain at least one column to update (excluding the primary key).", operation);
                }
            }
        }

        if (operation == "Create" && !mapping.AutoIncrementPrimaryKey)
        {
            var pkProp = request.MainProps?.GetValue(mapping.PrimaryKeyColumn);
            if (pkProp == null || pkProp.Type == JTokenType.Null || pkProp.Value<long>() <= 0)
            {
                return StructuredError($"Validation failed: Primary key '{mapping.PrimaryKeyColumn}' must be provided in MainProps when auto-increment is disabled.", operation);
            }
        }

        if (request.MainProps != null)
        {
            foreach (var prop in request.MainProps.Properties())
            {
                bool isAutoGeneratedPk = string.Equals(prop.Name, mapping.PrimaryKeyColumn, StringComparison.OrdinalIgnoreCase) && mapping.AutoIncrementPrimaryKey;
                
                if (operation == "Create" && isAutoGeneratedPk) continue;

                if (!mapping.AllowedColumns.Contains(prop.Name))
                {
                    return StructuredError($"Validation failed: Unknown column '{prop.Name}' in main table '{mapping.MainTableName}'.", operation);
                }
            }

            var insertableColumns = request.MainProps.Properties()
                .Select(p => p.Name)
                .Where(c => !string.Equals(c, mapping.PrimaryKeyColumn, StringComparison.OrdinalIgnoreCase) || !mapping.AutoIncrementPrimaryKey)
                .ToList();
            
            if (operation == "Create" && insertableColumns.Count == 0)
            {
                // Modules/Roles/Menus/Users codes can be auto-generated, so we allow empty insertable columns if they will be auto-generated
                bool isAutoGenerateExpected = mapping.TransactionName == "Modules" || mapping.TransactionName == "Roles" || mapping.TransactionName == "Menus" || mapping.TransactionName == "UserMaster";
                if (!isAutoGenerateExpected)
                {
                    return StructuredError("Validation failed: MainProps has no columns available to insert.", operation);
                }
            }
        }

        if (request.ChildProps != null)
        {
            foreach (var childProp in request.ChildProps)
            {
                var childKey = childProp.Key;

                if (!mapping.ChildMappings.TryGetValue(childKey, out var childMap))
                {
                    return StructuredError($"Validation failed: Child entity mapping '{childKey}' is not configured under transaction mapping '{mapping.TransactionName}'.", operation);
                }

                var childItems = childProp.Value as JArray;
                if (childItems == null)
                {
                    return StructuredError($"Validation failed: Value for ChildProps key '{childKey}' must be a JSON array.", operation);
                }

                foreach (var childItem in childItems)
                {
                    var childObj = childItem as JObject;
                    if (childObj == null)
                    {
                        return StructuredError($"Validation failed: All child items in array '{childKey}' must be JSON objects.", operation);
                    }

                    var childPropsList = childObj.Properties().ToList();
                    foreach (var prop in childPropsList)
                    {
                        if (!childMap.AllowedColumns.Contains(prop.Name))
                        {
                            return StructuredError($"Validation failed: Unknown column '{prop.Name}' in child table '{childMap.TableName}'.", operation);
                        }
                    }

                    var childPkProp = childObj.GetValue(childMap.PrimaryKeyColumn);
                    bool isChildUpdate = childPkProp != null && childPkProp.Type != JTokenType.Null && childPkProp.Value<long>() > 0;

                    if (isChildUpdate)
                    {
                        var childWritableCols = childPropsList
                            .Select(p => p.Name)
                            .Where(c => !string.Equals(c, childMap.PrimaryKeyColumn, StringComparison.OrdinalIgnoreCase))
                            .ToList();
                        
                        if (childWritableCols.Count == 0)
                        {
                            return StructuredError($"Validation failed: Child update in table '{childMap.TableName}' has no columns to update (excluding the primary key).", operation);
                        }
                    }
                }
            }
        }

        if (request.DelProps != null)
        {
            if (!request.DelProps.HasValues)
            {
                return StructuredError("Validation failed: DelProps must not be empty if provided.", operation);
            }

            foreach (var delProp in request.DelProps)
            {
                var entityKey = delProp.Key;

                var delItems = delProp.Value as JArray;
                if (delItems == null)
                {
                    return StructuredError($"Validation failed: DelProps value for target '{entityKey}' must be a JSON array.", operation);
                }

                if (delItems.Count == 0)
                {
                    return StructuredError($"Validation failed: Deletion list for target '{entityKey}' must not be empty.", operation);
                }

                string targetKeyColumn;
                if (string.Equals(entityKey, mapping.TransactionName, StringComparison.OrdinalIgnoreCase) ||
                    string.Equals(entityKey, mapping.MainTableName, StringComparison.OrdinalIgnoreCase))
                {
                    targetKeyColumn = mapping.PrimaryKeyColumn;
                }
                else if (mapping.ChildMappings.TryGetValue(entityKey, out var childMap))
                {
                    targetKeyColumn = childMap.PrimaryKeyColumn;
                }
                else
                {
                    return StructuredError($"Validation failed: Delete target '{entityKey}' is not configured for TransactionName '{mapping.TransactionName}'.", operation);
                }

                foreach (var item in delItems)
                {
                    object? idValue = null;
                    if (item.Type == JTokenType.Object)
                    {
                        var obj = (JObject)item;
                        var pkValProp = obj.Properties().FirstOrDefault(p => string.Equals(p.Name, targetKeyColumn, StringComparison.OrdinalIgnoreCase));
                        var pkVal = pkValProp?.Value;
                        if (pkVal != null && pkVal.Type != JTokenType.Null)
                        {
                            idValue = ConvertJTokenToValue(pkVal);
                        }
                    }
                    else
                    {
                        idValue = ConvertJTokenToValue(item);
                    }

                    if (idValue == null)
                    {
                        return StructuredError($"Validation failed: Deletion item in target '{entityKey}' is missing key '{targetKeyColumn}'.", operation);
                    }
                    
                    if ((idValue is long l && l <= 0) || (idValue is int i && i <= 0) || (idValue is string s && string.IsNullOrWhiteSpace(s)))
                    {
                        return StructuredError($"Validation failed: Deletion item in target '{entityKey}' contains an invalid primary key value (0, empty, or negative).", operation);
                    }
                }
            }
        }

        return null;
    }

    private static TransactionCommandResponse StructuredError(string message, string operation, string errorType = "Validation")
    {
        return new TransactionCommandResponse
        {
            Success = false,
            TransactionId = 0,
            RowsAffected = 0,
            Operation = operation,
            Message = message,
            ErrorType = errorType
        };
    }

    private static string BuildInsertSql(string tableName, IEnumerable<string> columns)
    {
        var colsList = columns.ToList();
        var valuePlaceholders = colsList.Select(c => "@" + c);

        return $"INSERT INTO {tableName} ({string.Join(", ", colsList)}) VALUES ({string.Join(", ", valuePlaceholders)})";
    }

    private static string BuildUpdateSql(string tableName, IEnumerable<string> columns, string keyColumn)
    {
        var colsList = columns.ToList();
        var setClauses = colsList.Select(c => $"{c} = @{c}");

        return $"UPDATE {tableName} SET {string.Join(", ", setClauses)} WHERE {keyColumn} = @_key_id_";
    }

    private static string BuildDeleteSql(string tableName, string keyColumn)
    {
        return $"DELETE FROM {tableName} WHERE {keyColumn} = @_key_id_";
    }

    private static object? ConvertJTokenToValue(JToken? token)
    {
        if (token == null || token.Type is JTokenType.Null or JTokenType.Undefined)
            return null;

        return token.Type switch
        {
            JTokenType.Boolean => token.Value<bool>() ? 1 : 0,
            JTokenType.Integer => token.Value<long>(),
            JTokenType.Float => token.Value<double>(),
            JTokenType.Date => token.Value<DateTime>(),
            JTokenType.Guid => token.Value<Guid>(),
            JTokenType.String => token.Value<string>(),
            _ => token.ToString(Newtonsoft.Json.Formatting.None)
        };
    }

    private static long ConvertToInt64(object? value)
    {
        if (value == null || value == DBNull.Value)
        {
            throw new InvalidOperationException("Generated ID returned null or DBNull.");
        }
        return Convert.ToInt64(value);
    }

    private sealed class TransactionMapping
    {
        public string TransactionName { get; set; } = string.Empty;
        public string MainTableName { get; set; } = string.Empty;
        public string PrimaryKeyColumn { get; set; } = string.Empty;
        public bool AutoIncrementPrimaryKey { get; set; } = true;
        public HashSet<string> AllowedColumns { get; set; } = new(StringComparer.OrdinalIgnoreCase);
        public Dictionary<string, ChildMapping> ChildMappings { get; set; } = new(StringComparer.OrdinalIgnoreCase);
    }

    private sealed class ChildMapping
    {
        public string TableName { get; set; } = string.Empty;
        public string PrimaryKeyColumn { get; set; } = string.Empty;
        public string ForeignKeyColumn { get; set; } = string.Empty;
        public HashSet<string> AllowedColumns { get; set; } = new(StringComparer.OrdinalIgnoreCase);
    }
}
