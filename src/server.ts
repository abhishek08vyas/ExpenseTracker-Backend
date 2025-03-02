import buildApp from "./app";
import config from "./config/config";
import logger from "./utils/logger";
import prisma from "./config/database";
import http from "http";

const start = async () => {
	try {
		const app = buildApp();

		await prisma.$connect();
		logger.info("Database connection established successfully");

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

		// Get the HTTP server instance from Fastify
		const httpServer: http.Server = app.server;

		// Start server using Node.js http module
		await new Promise<void>((resolve, reject) => {
			httpServer
				.listen("8080", () => {
					logger.info(`Server started on port ${config.app.port}`);
					resolve();
				})
				.on("error", (err: Error) => {
					reject(err);
				});
		});
	} catch (err: unknown) {
		if (err instanceof Error) {
			logger.error(`Error starting server: ${err.message}`, { stack: err.stack });
		} else {
			logger.error("Unknown error occurred during server startup");
		}
		process.exit(1);
	}
};

start();
