using MongoDB.Driver;
using MongoDB.Bson;

namespace DatashiftAPI.Services
{
    public class MongoDBTransferData : IDataTransfer
    {
        private string sourceConnectionString;
        private string destinationConnectionString;

        public MongoDBTransferData(string sourceConnectionString, string destinationConnectionString)
        {
            this.sourceConnectionString = sourceConnectionString;
            this.destinationConnectionString = destinationConnectionString;
        }


        //*********************
        //READ FUNCTIE LOGICA
        //*********************

        public Dictionary<string, Dictionary<string, List<Dictionary<string, object>>>> Read()
        {
            var clusterData = new Dictionary<string, Dictionary<string, List<Dictionary<string, object>>>>();
            var sourceClient = new MongoClient(sourceConnectionString);
            var databases = fetchDBNames(sourceClient);

            foreach (var database in databases)
            {
                
                var collectionsData = new Dictionary<string, List<Dictionary<string, object>>>();
                var documentsData = new List<Dictionary<string, object>>();
                var singleDocumentData = new Dictionary<string, object>();

                var sourceDB = sourceClient.GetDatabase(database);
                var collectionNames = sourceDB.ListCollectionNames().ToList();
                
                foreach (var collection in collectionNames)
                {
                   
                    var sourceCollection = sourceDB.GetCollection<BsonDocument>(collection);
                    var documents = sourceCollection.Find(_ => true).ToList();

                    foreach (var document in documents)
                    {
                        singleDocumentData = new Dictionary<string, object>();
                        foreach (var doc in document)
                        {
                            singleDocumentData.Add(doc.Name, doc.Value ?? BsonNull.Value);
                        }
                        documentsData.Add(singleDocumentData);
                    }


                    collectionsData.Add(collection, documentsData);
                    documentsData = new List<Dictionary<string, object>>();
                }

                clusterData.Add(database, collectionsData);
                collectionsData = new Dictionary<string, List<Dictionary<string, object>>>();

            }

            return clusterData;
        }


        //*********************
        //WRITE FUNCTIE LOGICA
        //*********************

        public void Write (Dictionary<string, Dictionary<string, List<Dictionary<string, object>>>> DatabaseData)
        {
            foreach (var databaseEntry in DatabaseData)
            {
                var dbName = databaseEntry.Key;
                var destinationClient = new MongoClient(destinationConnectionString);


                var collectionsData = databaseEntry.Value;

                var destinationDB = destinationClient.GetDatabase(dbName);

                foreach (var collectionEntry in collectionsData)
                {
                    var collectionName = collectionEntry.Key;
                    var documentsData = collectionEntry.Value;

                    var destinationCollection = destinationDB.GetCollection<BsonDocument>(collectionName);

                    foreach (var documentData in documentsData)
                    {
                        var bsonDocument = new BsonDocument(documentData);

                        try
                        {
                            destinationCollection.InsertOne(bsonDocument);
                        }
                        catch (MongoWriteException ex)
                        {
                            if (ex.WriteError.Category == ServerErrorCategory.DuplicateKey)
                            {
                                Console.WriteLine($"Duplicate key error: {ex.WriteError.Message}");
                               
                            }
                            else
                            {
                                Console.WriteLine($"Error writing document: {ex}");
                               
                            }
                        }
                    }
                }
            }
        }




        private List<string> fetchDBNames(MongoClient sourceClient)
        {
            var temporaryDatabases = sourceClient.ListDatabaseNames().ToList();

            var databases = new List<string>();


            for (int i = 0; i < temporaryDatabases.Count - 2; i++)
            {
                databases.Add(temporaryDatabases[i]);
            }

            return databases;
        }

         private IMongoDatabase CreateDatabase(string dbName, MongoClient destinationCient)
        {

            return destinationCient.GetDatabase(dbName);
        }

         private IMongoCollection<BsonDocument> CreateCollection(string collectionName, IMongoDatabase destinationDB)
        {

            return destinationDB.GetCollection<BsonDocument>(collectionName);
        }
    }
}
