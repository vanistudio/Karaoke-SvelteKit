import { router, publicProcedure, protectedProcedure, adminProcedure, rateLimitedProcedure, staffProcedure } from '$lib/server/trpc/t';
import { z } from 'zod';
import { bookingController } from '$lib/server/controllers/booking.controller';
import { activityService } from '$lib/server/services/activity.service';

export const bookingRouter = router({
	list: staffProcedure.query(async () => {
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
			const isAvailable = await bookingController.checkAvailability(input.roomId, start, end);
			const roomCost = await bookingController.estimateRoomCost(input.roomId, start, end);
			return { isAvailable, roomCost };
		}),
	create: rateLimitedProcedure
		.input(
			z.object({
				roomId: z.number().positive(),
				startTime: z.string().datetime().or(z.date()),
				endTime: z.string().datetime().or(z.date()),
				guestCount: z.number().positive().optional(),
				pointsToUse: z.number().min(0).optional(),
				services: z.array(z.object({ id: z.number(), qty: z.number() })).optional(),
				voucherCode: z.string().optional()
			})
		)
		.mutation(async ({ input, ctx }) => {
			return await bookingController.addBooking(
				{
					userId: ctx.user.id,
					roomId: input.roomId,
					startTime: new Date(input.startTime),
					endTime: new Date(input.endTime),
					guestCount: input.guestCount
				},
				input.pointsToUse || 0,
				input.services || [],
				input.voucherCode
			);
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
				status: z.enum(['pending', 'confirmed', 'cancelled', 'checked_in'])
			})
		)
		.mutation(async ({ input, ctx }) => {
			const updated = await bookingController.changeStatus(input.id, input.status);
			await activityService.log(ctx.user.id, 'status_change', 'booking', input.id, `Admin d?i tr?ng th�i th�nh ${input.status}`);
			return updated;
		}),
	checkin: staffProcedure
		.input(z.number())
		.mutation(async ({ input, ctx }) => {
			const bk = await bookingController.getBooking(input);
			if (bk.status !== 'confirmed') {
				throw new Error('Chỉ có thể check-in đơn đã xác nhận.');
			}
			const checkedIn = await bookingController.changeStatus(input, 'checked_in');
			await activityService.log(ctx.user.id, 'status_change', 'booking', input, 'Check-in don');
			return checkedIn;
		})
});
