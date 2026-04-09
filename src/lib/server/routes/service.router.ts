import { router, protectedProcedure } from '$lib/server/trpc/t';
import { z } from 'zod';
import { serviceController } from '$lib/server/controllers/service.controller';

export const serviceRouter = router({
	list: protectedProcedure.query(async () => {
		return await serviceController.listServices();
	}),
	getById: protectedProcedure.input(z.number()).query(async ({ input }) => {
		return await serviceController.getService(input);
	}),
	count: protectedProcedure.query(async () => {
		return await serviceController.countServices();
	}),
	create: protectedProcedure
		.input(
			z.object({
				name: z.string().min(1),
				category: z.enum(['food', 'drink', 'decoration', 'other']),
				price: z.number().positive(),
				description: z.string().optional(),
				isAvailable: z.boolean().optional()
			})
		)
		.mutation(async ({ input }) => {
			return await serviceController.addService(input);
		}),
	update: protectedProcedure
		.input(
			z.object({
				id: z.number(),
				name: z.string().min(1).optional(),
				category: z.enum(['food', 'drink', 'decoration', 'other']).optional(),
				price: z.number().positive().optional(),
				description: z.string().optional(),
				isAvailable: z.boolean().optional()
			})
		)
		.mutation(async ({ input }) => {
			const { id, ...data } = input;
			return await serviceController.updateService(id, data);
		}),
	delete: protectedProcedure
		.input(z.number())
		.mutation(async ({ input }) => {
			return await serviceController.deleteService(input);
		})
});
