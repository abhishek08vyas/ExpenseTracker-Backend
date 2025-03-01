import buildApp from "./app";
import config from "./config/config";
import logger from "./utils/logger";
import prisma from "./config/database";

const start = async () => {
	try {
		const app = buildApp();

		await prisma.$connect();
		logger.info("Database connection established successfully");

		// Start server
		await app.listen({ port: config.app.port as number });
		logger.info(`Server started on port ${config.app.port}`);
	} catch (err) {
		logger.error("Error starting server:", err);
		process.exit(1);
	}
};

start();
