export const apps = [
	{
		name: "student-finance-tracker",
		script: "./dist/server.js",
		instances: "max",
		exec_mode: "cluster",
		env: {
			NODE_ENV: "development",
		},
		env_production: {
			NODE_ENV: "production",
		},
	},
];
