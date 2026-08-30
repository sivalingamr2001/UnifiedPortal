using System;
using System.Data;
using MySqlConnector;
using DynamicTransaction.Interfaces;

namespace CustomerComplaintApi.Data
{
    public class OracleParam
    {
        public string Name { get; set; }
        public object Value { get; set; }

        public OracleParam(string name, object value)
        {
            Name = name;
            Value = value;
        }
    }

    public class DbHelper
    {
        private readonly IDbConnectionFactory _connectionFactory;

        public DbHelper(IDbConnectionFactory connectionFactory)
        {
            _connectionFactory = connectionFactory;
        }

        public DataTable ExecuteQuery(string sql, OracleParam[] parameters)
        {
            var dt = new DataTable();
            using (var wrapper = _connectionFactory.CreateConnection())
            {
                var conn = wrapper.Connection;
                if (conn.State != ConnectionState.Open)
                {
                    conn.Open();
                }

                using (var cmd = conn.CreateCommand())
                {
                    cmd.CommandText = sql;
                    if (parameters != null)
                    {
                        foreach (var p in parameters)
                        {
                            var param = cmd.CreateParameter();
                            param.ParameterName = p.Name;
                            param.Value = p.Value ?? DBNull.Value;
                            cmd.Parameters.Add(param);
                        }
                    }

                    using (var reader = cmd.ExecuteReader())
                    {
                        dt.Load(reader);
                    }
                }
            }
            return dt;
        }

        public static T Val<T>(DataRow row, string columnName)
        {
            if (row == null || row.IsNull(columnName))
            {
                return default(T)!;
            }
            var val = row[columnName];
            try
            {
                if (typeof(T) == typeof(int) && val != null)
                {
                    return (T)(object)Convert.ToInt32(val);
                }
                if (typeof(T) == typeof(double) && val != null)
                {
                    return (T)(object)Convert.ToDouble(val);
                }
                return (T)Convert.ChangeType(val, typeof(T))!;
            }
            catch
            {
                return val == null ? default(T)! : (T)val!;
            }
        }
    }
}
