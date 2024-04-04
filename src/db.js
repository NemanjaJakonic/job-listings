const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = process.env.MONGO_URI;
const dbName = "job-listings";

let client = null;

async function connectDB() {
  if (!client) {
    client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
    });

    await client.connect();
    console.log("Connected successfully to server");
  }

  const db = client.db(dbName);
  const jobs = db.collection("jobs");
  const users = db.collection("users");

  return { jobs, users };
}

module.exports = { connectDB };
