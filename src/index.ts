import buildApp from "./app";
import logger from "./utils/logger";
import prisma from "./config/database";

// Create the Fastify app
const app = buildApp();

// Connect to database when the app starts
prisma
	.$connect()
	.then(() => {
		logger.info("Database connection established successfully");
	})
	.catch((err: any) => {
		logger.error(`Failed to connect to database: ${err}`);
	});

// Add a health check route
app.get("/", async (req, res) => {
	return res.status(200).type("text/html").send("<h1>API is running</h1>");
});

// Export for Vercel serverless deployment
export default async (req: any, res: any) => {
	await app.ready();
	app.server.emit("request", req, res);
};
