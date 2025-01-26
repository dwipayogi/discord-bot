require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");
const {
  APPLICATION_ID,
  PUBLIC_KEY,
  GUILD_ID,
  CHANNEL_ID,
  MONGODB_URI,
  MONGODB_DBNAME,
  MONGODB_COLLECTIONNAME,
} = process.env;

const client = new MongoClient(MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

client.connect();

const database = client.db(MONGODB_DBNAME);
const collection = database.collection(MONGODB_COLLECTIONNAME);

export { client, collection, CHANNEL_ID, GUILD_ID, PUBLIC_KEY, APPLICATION_ID };

