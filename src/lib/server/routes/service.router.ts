import { router, publicProcedure, adminProcedure } from '$lib/server/trpc/t';
import { z } from 'zod';
import { serviceController } from '$lib/server/controllers/service.controller';

export const serviceRouter = router({
	list: publicProcedure.query(async () => {
		return await serviceController.listServices();
	}),
	getById: publicProcedure.input(z.number()).query(async ({ input }) => {
		return await serviceController.getService(input);
	}),
	count: adminProcedure.query(async () => {
		return await serviceController.countServices();
	}),
	create: adminProcedure
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
	update: adminProcedure
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
	delete: adminProcedure
		.input(z.number())
		.mutation(async ({ input }) => {
			return await serviceController.deleteService(input);
		})
});
