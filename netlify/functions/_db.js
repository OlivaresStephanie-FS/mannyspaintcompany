import { MongoClient } from "mongodb";

let cachedClient = null;
let cachedDb = null;

export async function getDb() {
	const uri = process.env.MONGODB_URI;
	const dbName = process.env.MONGODB_DB || "mannyspaintcompany";

	if (!uri) throw new Error("Missing MONGODB_URI");

	if (cachedDb) return cachedDb;

	if (!cachedClient) {
		cachedClient = new MongoClient(uri);
		await cachedClient.connect();
	}

	cachedDb = cachedClient.db(dbName);
	return cachedDb;
}
