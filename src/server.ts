import { VercelRequest, VercelResponse } from "@vercel/node";
import buildApp from "./app";
import prisma from "./config/database"; // Import Prisma
import logger from "./utils/logger";

const app = buildApp();

export default async function handler(req: VercelRequest, res: VercelResponse) {
	try {
		// Ensure Prisma is connected before handling requests
		await prisma.$connect();
		logger.info("Database connection established successfully");

		await app.ready();
		app.server.emit("request", req, res);
	} catch (err) {
		logger.error("Error starting server:", err);
		res.status(500).send({ error: "Internal Server Error" });
	}
}
