import { router, publicProcedure, protectedProcedure } from '$lib/server/trpc/t';
import { z } from 'zod';
import { bookingController } from '$lib/server/controllers/booking.controller';

export const bookingRouter = router({
	list: publicProcedure.query(async () => {
		return await bookingController.listBookings();
	}),
	getById: publicProcedure.input(z.number()).query(async ({ input }) => {
		return await bookingController.getBooking(input);
	}),
	myBookings: protectedProcedure.query(async ({ ctx }) => {
		return await bookingController.getBookingsByUser(ctx.user.id);
	}),
	checkAvailability: publicProcedure
		.input(
			z.object({
				roomId: z.number().positive(),
				startTime: z.string().datetime().or(z.date()),
				endTime: z.string().datetime().or(z.date())
			})
		)
		.query(async ({ input }) => {
			const start = new Date(input.startTime);
			const end = new Date(input.endTime);
			return {
				isAvailable: await bookingController.checkAvailability(input.roomId, start, end)
			};
		}),
	create: protectedProcedure
		.input(
			z.object({
				roomId: z.number().positive(),
				startTime: z.string().datetime().or(z.date()),
				endTime: z.string().datetime().or(z.date()),
				status: z.enum(['pending', 'confirmed', 'cancelled']).optional()
			})
		)
		.mutation(async ({ input, ctx }) => {
			return await bookingController.addBooking({
				userId: ctx.user.id,
				roomId: input.roomId,
				startTime: new Date(input.startTime),
				endTime: new Date(input.endTime),
				status: input.status
			});
		}),
	changeStatus: protectedProcedure
		.input(
			z.object({
				id: z.number(),
				status: z.enum(['pending', 'confirmed', 'cancelled'])
			})
		)
		.mutation(async ({ input }) => {
			return await bookingController.changeStatus(input.id, input.status);
		})
});
