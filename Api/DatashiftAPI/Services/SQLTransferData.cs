using MongoDB.Driver.Core.Configuration;
using MySql.Data.MySqlClient;
using System;
using System.Collections.Generic;


namespace DatashiftAPI.Services
{
        public class SQLTransferData : IDataTransfer
    {
        private string sourceConnectionString;
        private string destinationConnectionString;

        public SQLTransferData(string sourceConnectionString, string destinationConnectionString)
        {
            this.sourceConnectionString = sourceConnectionString;
            this.destinationConnectionString = destinationConnectionString;
        }

        //*********************
        //READ FUNCTIE LOGICA
        //*********************

        public Dictionary<string, Dictionary<string, List<Dictionary<string, object>>>> Read()
        {
            var result = new Dictionary<string, Dictionary<string, List<Dictionary<string, object>>>>();

            using (var sourceConnection = new MySqlConnection(sourceConnectionString))
            {
                var tableNames = GetTableNames(sourceConnection);
                sourceConnection.Open();
                Console.WriteLine("Connected to Source MySQL!");
                var tableData = new Dictionary<string, List<Dictionary<string, object>>>();
            

                foreach (var tableName in tableNames)
                {
                    tableData[tableName] = ReadTableData(sourceConnection, tableName);
                }

                result[sourceConnection.Database] = tableData;
            }
            
            return result;
        }

        public List<string> GetTableNames(MySqlConnection connection)
        {
            var tableNames = new List<string>();

            string sqlQuery = "SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE()";
            connection.Open();
            using (MySqlCommand cmd = new MySqlCommand(sqlQuery, connection))
            using (MySqlDataReader dataReader = cmd.ExecuteReader())
            {
                while (dataReader.Read())
                {
                    string tableName = dataReader.GetString("table_name");
                    tableNames.Add(tableName);
                }
            }
            connection.Close();
            return tableNames;
        }

        private new List<Dictionary<string, object>> ReadTableData(MySqlConnection connection, string tableName)
        {
            var tableData = new List<Dictionary<string, object>>();


            string selectQuery = $"SELECT * FROM {tableName}";
            using (MySqlCommand selectCmd = new MySqlCommand(selectQuery, connection))
            using (MySqlDataReader dataReader = selectCmd.ExecuteReader())
            {
                while (dataReader.Read())
                {
                    tableData.Add(ReadRowData(dataReader));

                }
            }

            return tableData;
        }

        private Dictionary<string, object> ReadRowData(MySqlDataReader dataReader)
        {
            var rowData = new Dictionary<string, object>();

            for (int i = 0; i < dataReader.FieldCount; i++)
            {
                string columnName = dataReader.GetName(i);
                object columnValue = dataReader.GetValue(i);


                rowData.Add(columnName, columnValue is DBNull ? null : columnValue);
            }

            return rowData;
        }


        //*********************
        //WRITE FUNCTIE LOGICA
        //*********************

        public void Write(Dictionary<string, Dictionary<string, List<Dictionary<string, object>>>> data)
        {
            ICollection<string> databaseNames = data.Keys;
            foreach (var databaseName in databaseNames)
            {
                int dbIndex = destinationConnectionString.IndexOf("Database=");
                string dbSubString = destinationConnectionString.Substring(dbIndex + "Database=".Length);
                int indexPuntComma = dbSubString.IndexOf(';');
                string dbNameToBeChanged = dbSubString.Substring(0, indexPuntComma);

                using (var destinationConnection = new MySqlConnection(destinationConnectionString.Replace(dbNameToBeChanged, databaseName)))
            {
                destinationConnection.Open();


               
                    foreach (var tableName in data[databaseName].Keys)
                    {
                        WriteTableData(destinationConnection, tableName, data[databaseName][tableName]);
                    }
               
            }
        
            }
        }

        private void WriteTableData(MySqlConnection destinationConnection, string tableName, List<Dictionary<string, object>> tableData)
        {
            foreach (var rowData in tableData)
            {
                WriteRowData(destinationConnection, tableName, rowData);
            }
        }

        private void WriteRowData(MySqlConnection destinationConnection, string tableName, Dictionary<string, object> rowData)
        {
            string insertQuery = $"INSERT INTO {tableName} (";
            string columns = "";
            string values = "";

            foreach (var entry in rowData)
            {
                columns += $"{entry.Key},";
                values += entry.Value is null ? "NULL," : $"'{MySqlHelper.EscapeString(entry.Value.ToString())}',";
            }

            columns = columns.TrimEnd(',');
            values = values.TrimEnd(',');

            insertQuery += $"{columns}) VALUES ({values})";

            using (MySqlCommand insertCmd = new MySqlCommand(insertQuery, destinationConnection))
            {
                try
                {
                    insertCmd.ExecuteNonQuery();
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Failed to insert data into {tableName}. Error: {ex.Message}");
                }
            }
        }

    }
}



