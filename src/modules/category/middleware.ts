// src/modules/category/middleware.ts
import { FastifyRequest, FastifyReply } from "fastify";
import { CategoryCreateDto, CategoryUpdateDto, CategoryParams } from "./controller";

export const categoryValidation = {
	validateCreate(request: FastifyRequest<{ Body: CategoryCreateDto }>, reply: FastifyReply, done: () => void) {
		const { name } = request.body;

		if (!name || typeof name !== "string" || name.trim() === "") {
			return reply.code(400).send({
				success: false,
				message: "Category name is required and must be a non-empty string",
			});
		}

		// Validate optional fields if they are provided
		const { description, icon, color } = request.body;

		if (description !== undefined && typeof description !== "string") {
			return reply.code(400).send({
				success: false,
				message: "Description must be a string",
			});
		}

		if (icon !== undefined && typeof icon !== "string") {
			return reply.code(400).send({
				success: false,
				message: "Icon must be a string",
			});
		}

		if (color !== undefined && (typeof color !== "string" || !color.match(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/))) {
			return reply.code(400).send({
				success: false,
				message: "Color must be a valid hex color code (e.g., #FF5733)",
			});
		}

		done();
	},

	validateUpdate(request: FastifyRequest<{ Body: CategoryUpdateDto; Params: CategoryParams }>, reply: FastifyReply, done: () => void) {
		const { id } = request.params;

		if (!id || typeof id !== "string") {
			return reply.code(400).send({
				success: false,
				message: "Valid category ID is required",
			});
		}

		const { name, description, icon, color } = request.body;

		// Ensure at least one field is provided for update
		if (!name && !description && !icon && !color) {
			return reply.code(400).send({
				success: false,
				message: "At least one field must be provided for update",
			});
		}

		// Validate fields if they are provided
		if (name !== undefined && (typeof name !== "string" || name.trim() === "")) {
			return reply.code(400).send({
				success: false,
				message: "Category name must be a non-empty string",
			});
		}

		if (description !== undefined && typeof description !== "string") {
			return reply.code(400).send({
				success: false,
				message: "Description must be a string",
			});
		}

		if (icon !== undefined && typeof icon !== "string") {
			return reply.code(400).send({
				success: false,
				message: "Icon must be a string",
			});
		}

		if (color !== undefined && (typeof color !== "string" || !color.match(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/))) {
			return reply.code(400).send({
				success: false,
				message: "Color must be a valid hex color code (e.g., #FF5733)",
			});
		}

		done();
	},

	validateId(request: FastifyRequest<{ Params: CategoryParams }>, reply: FastifyReply, done: () => void) {
		const { id } = request.params;

		if (!id || typeof id !== "string") {
			return reply.code(400).send({
				success: false,
				message: "Valid category ID is required",
			});
		}

		done();
	},
};
