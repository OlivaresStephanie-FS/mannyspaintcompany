// netlify/functions/test-mongo.js
import { MongoClient } from "mongodb";

export const handler = async () => {
	try {
		const uri = process.env.MONGODB_URI;
		const dbName = process.env.MONGODB_DB;

		if (!uri) throw new Error("Missing MONGODB_URI");
		if (!dbName) throw new Error("Missing MONGODB_DB");

		const client = new MongoClient(uri);
		await client.connect();

		const db = client.db(dbName);
		const collections = await db.listCollections().toArray();

		await client.close();

		return {
			statusCode: 200,
			body: JSON.stringify({
				ok: true,
				dbName,
				collections: collections.map((c) => c.name),
			}),
		};
	} catch (err) {
		return {
			statusCode: 500,
			body: JSON.stringify({
				ok: false,
				error: err.message,
			}),
		};
	}
};