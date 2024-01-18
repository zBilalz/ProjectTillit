using Microsoft.AspNetCore.Mvc;
using DatashiftAPI.Entities;
using DatashiftAPI.Services;
using System;
using MongoDB.Driver;
using MySql.Data.MySqlClient;
using Microsoft.AspNetCore.Routing.Constraints;

namespace DatashiftAPI.Controllers
{
    
    [ApiController]
    [Route("[controller]")]
    public class DatabaseController : ControllerBase
    {

        private static Dictionary<string, Dictionary<string, List<Dictionary<string, object>>>> _dataBuffer;

        

        [HttpPost]
        [Route("readsql")]
        public IActionResult ReadFromSQL([FromBody] ConnectionStringsModel link)
        {
            try
            {

                if (link == null || string.IsNullOrEmpty(link.ConnectionString))
                {
                    return BadRequest("The connection string must be provided.");
                }

                var transfer = new SQLTransferData(link.ConnectionString, null);

                _dataBuffer = _dataBuffer ?? new Dictionary<string, Dictionary<string, List<Dictionary<string, object>>>>();
                _dataBuffer = transfer.Read();
                return Ok("Data read successfully!");
            }
            catch (Exception ex)
            {
                return BadRequest($"Error: {ex.Message}");
            }
        }

        [HttpPost]
        [Route("writesql")]
        public IActionResult WriteToSQL([FromBody] ConnectionStringsModel link)
        {
            try
            {
                if (_dataBuffer == null || _dataBuffer.Count == 0)
                {
                    return BadRequest("No data available to write. Ensure data is read first.");
                }


                if (link == null || string.IsNullOrEmpty(link.ConnectionString))
                {
                    return BadRequest("The destination connection string must be provided.");
                }

                var transfer = new SQLTransferData(null, link.ConnectionString);
                transfer.Write(_dataBuffer);
                _dataBuffer.Clear();
                return Ok("Data written successfully!");
            }
            catch (Exception ex)
            {
                return BadRequest($"Error: {ex.Message}");
            }
        }


        [HttpPost]
        [Route("fetchsqltables")]
        public IActionResult FetchTabesFromSqlDatabase([FromBody] ConnectionStringsModel link)
        {
            try
            {

                if (link == null || string.IsNullOrEmpty(link.ConnectionString))
                {
                    return BadRequest("The connection string must be provided.");
                }

                var sqlDb = new SQLTransferData(link.ConnectionString, null);
                var sqlTables = sqlDb.GetTableNames(new MySqlConnection(link.ConnectionString));
                return Ok(sqlTables);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error: {ex.Message}");
            }
        }



        [HttpPost]
        [Route("readmongodb")]
        public IActionResult ReadFromMongoDB([FromBody] ConnectionStringsModel link)
        {
            try
            {

                if (link == null || string.IsNullOrEmpty(link.ConnectionString))
                {
                    return BadRequest("The connection string must be provided.");
                }

                var transfer = new MongoDBTransferData(link.ConnectionString, null);

                _dataBuffer = _dataBuffer ?? new Dictionary<string, Dictionary<string, List<Dictionary<string, object>>>>();
                _dataBuffer = transfer.Read();
              
             
                return Ok("Data read successfully!");
            }
            catch (Exception ex)
            {
                return BadRequest($"Error: {ex.Message}");
            }
        }

        [HttpPost]
        [Route("writemongodb")]
        public IActionResult WriteToMongoDB([FromBody] ConnectionStringsModel link)
        {
            try
            {

                if (link == null || string.IsNullOrEmpty(link.ConnectionString))
                {
                    return BadRequest("The connection string must be provided.");
                }

                var transfer = new MongoDBTransferData(null, link.ConnectionString);

                transfer.Write(_dataBuffer);
     
               
                return Ok("Data Write successfully!");
            }
            catch (Exception ex)
            {
                return BadRequest($"Error: {ex.Message}");
            }
        }


    }
}


