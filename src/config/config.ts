import "dotenv/config";
import { z } from "zod";

// Schema validation for environment variables - industry standard as of 2025
const envSchema = z.object({
	NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
	PORT: z.coerce.number().positive().default(3000),
	DATABASE_URL: z.string().min(1),
	JWT_SECRET: z.string().min(10).default("KUGsyv3xBMdy8LtMVEZUcX5NbazKBPuldbNr5qsTrlo="),
	APP_CLIENT_ID: z.string().min(10).default("student-finance-tracker-client-mun"),
	JWT_ISS: z.string().min(10).default("expense-tracker-mun.vercel.app"),
	// LOG_LEVEL: z.enum(["error", "warn", "info", "http", "debug"]).default("info"),
});

// Parse and validate environment variables
const env = envSchema.parse({
	NODE_ENV: process.env.NODE_ENV,
	PORT: process.env.PORT,
	DATABASE_URL: process.env.DATABASE_URL,
	JWT_SECRET: process.env.JWT_SECRET,
	APP_CLIENT_ID: process.env.APP_CLIENT_ID,
	JWT_ISS: process.env.JWT_ISS,
	// LOG_LEVEL: process.env.LOG_LEVEL,
});

const config = {
	app: {
		port: env.PORT,
		nodeEnv: env.NODE_ENV,
		// logLevel: env.LOG_LEVEL,
		isDevelopment: env.NODE_ENV === "development",
		isProduction: env.NODE_ENV === "production",
		isTest: env.NODE_ENV === "test",
	},
	database: {
		url: env.DATABASE_URL,
	},
	jwt: {
		secret: env.JWT_SECRET,
		iss: env.JWT_ISS,
		appClintId: env.APP_CLIENT_ID,
	},
};

export default config;
