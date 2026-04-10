import { router, publicProcedure, protectedProcedure, adminProcedure } from '$lib/server/trpc/t';
import { z } from 'zod';
import { bookingController } from '$lib/server/controllers/booking.controller';

export const bookingRouter = router({
	list: adminProcedure.query(async () => {
		return await bookingController.listBookings();
	}),
	getById: protectedProcedure.input(z.number()).query(async ({ input }) => {
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
				guestCount: z.number().positive().optional()
			})
		)
		.mutation(async ({ input, ctx }) => {
			return await bookingController.addBooking({
				userId: ctx.user.id,
				roomId: input.roomId,
				startTime: new Date(input.startTime),
				endTime: new Date(input.endTime),
				guestCount: input.guestCount
			});
		}),
	cancelMyBooking: protectedProcedure
		.input(z.number())
		.mutation(async ({ input, ctx }) => {
			const bk = await bookingController.getBooking(input);
			if (bk.userId !== ctx.user.id) {
				throw new Error('Bạn không có quyền hủy đơn này.');
			}
			if (bk.status !== 'pending') {
				throw new Error('Chỉ có thể hủy đơn đang chờ duyệt.');
			}
			return await bookingController.changeStatus(input, 'cancelled');
		}),
	changeStatus: adminProcedure
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
