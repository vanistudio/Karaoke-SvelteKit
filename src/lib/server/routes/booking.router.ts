import {
	adminProcedure,
	protectedProcedure,
	publicProcedure,
	rateLimitedProcedure,
	router,
	staffProcedure
} from '$lib/server/trpc/t';
import { z } from 'zod';
import { bookingController } from '$lib/server/controllers/booking.controller';
import { activityService } from '$lib/server/services/activity.service';

export const bookingRouter = router({
	list: staffProcedure.query(async () => {
		return await bookingController.listBookings();
	}),
	getById: protectedProcedure.input(z.number().int().positive()).query(async ({ input, ctx }) => {
		return await bookingController.getBooking(input, { id: ctx.user.id, role: ctx.user.role });
	}),
	myBookings: protectedProcedure.query(async ({ ctx }) => {
		return await bookingController.getBookingsByUser(ctx.user.id);
	}),
	checkAvailability: publicProcedure
		.input(
			z.object({
				roomId: z.number().int().positive(),
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
				roomId: z.number().int().positive(),
				startTime: z.string().datetime().or(z.date()),
				endTime: z.string().datetime().or(z.date()),
				guestCount: z.number().int().positive().optional(),
				pointsToUse: z.number().int().min(0).optional(),
				services: z
					.array(
						z.object({
							id: z.number().int().positive(),
							qty: z.number().int().positive()
						})
					)
					.optional(),
				voucherCode: z.string().trim().min(1).optional()
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
		.input(z.number().int().positive())
		.mutation(async ({ input, ctx }) => {
			const targetBooking = await bookingController.getBooking(input, {
				id: ctx.user.id,
				role: ctx.user.role
			});
			if (targetBooking.userId !== ctx.user.id) {
				throw new Error('Bạn không có quyền hủy đơn này.');
			}
			if (targetBooking.status !== 'pending') {
				throw new Error('Chỉ có thể hủy đơn đang chờ duyệt.');
			}
			return await bookingController.changeStatus(input, 'cancelled');
		}),
	changeStatus: adminProcedure
		.input(
			z.object({
				id: z.number().int().positive(),
				status: z.enum(['pending', 'confirmed', 'cancelled', 'checked_in'])
			})
		)
		.mutation(async ({ input, ctx }) => {
			const updated = await bookingController.changeStatus(input.id, input.status);
			await activityService.log(
				ctx.user.id,
				'status_change',
				'booking',
				input.id,
				`Admin đổi trạng thái ${input.status}`
			);
			return updated;
		}),
	checkin: staffProcedure.input(z.number().int().positive()).mutation(async ({ input, ctx }) => {
		const targetBooking = await bookingController.getBooking(input, {
			id: ctx.user.id,
			role: ctx.user.role
		});
		if (targetBooking.status !== 'confirmed') {
			throw new Error('Chỉ có thể check-in đơn đã xác nhận.');
		}
		const checkedIn = await bookingController.changeStatus(input, 'checked_in');
		await activityService.log(ctx.user.id, 'status_change', 'booking', input, 'Check-in don');
		return checkedIn;
	})
});
