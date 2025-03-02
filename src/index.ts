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
	return res.status(200).type("text/html").send(`
    <html>
      <head>
        <title>Expense Tracker API</title>
      </head>
      <body>
        <h1>Expense Tracker API</h1>
        <p>The API is running successfully!</p>
        <a href="/documentation" class="button">Expense Tracker API Documentation</a>
      </body>
    </html>
  `);
});

// Initialize Swagger before handling requests
const initApp = async () => {
	try {
		await app.ready();
		logger.info("Application initialized successfully");
	} catch (err) {
		if (err instanceof Error) {
			logger.error(`Error initializing app: ${err.message}`);
		} else {
			logger.error("Unknown error initializing app");
		}
	}
};

// Initialize the app
initApp();

// Export for Vercel serverless deployment
export default async (req: any, res: any) => {
	try {
		// await app.ready();
		app.server.emit("request", req, res);
	} catch (err) {
		console.error("Error handling request:", err);
		res.statusCode = 500;
		res.end("Internal Server Error");
	}
};
