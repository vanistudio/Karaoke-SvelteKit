import { db } from '$lib/server/db';
import { booking, user } from '$lib/server/db/schema';
import { bookingRepository } from '$lib/server/repositories/booking.repository';
import { promotionRepository } from '$lib/server/repositories/promotion.repository';
import { roomRepository } from '$lib/server/repositories/room.repository';
import { serviceRepository } from '$lib/server/repositories/service.repository';
import { eq, sql } from 'drizzle-orm';
import { activityService } from './activity.service';
import { emailService } from './email.service';
import { loyaltyService } from './loyalty.service';
import { pricingService } from './pricing.service';
import { promotionService } from './promotion.service';
import { settingService } from './setting.service';

type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'checked_in';
type BookingViewer = {
	id: string;
	role: string;
};
type BookingPayload = Parameters<typeof bookingRepository.create>[0];
type SelectedServiceInput = { id: number; qty: number };
type ValidServiceItem = { serviceId: number; quantity: number; priceAtBooking: number };

const STAFF_ROLES = new Set(['admin', 'manager', 'staff']);
const BOOKING_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
	pending: ['confirmed', 'cancelled'],
	confirmed: ['checked_in', 'cancelled'],
	cancelled: [],
	checked_in: []
};

export class BookingService {
	private normalizeTimeRange(startTime: Date | string, endTime: Date | string) {
		const normalizedStartTime = new Date(startTime);
		const normalizedEndTime = new Date(endTime);

		if (Number.isNaN(normalizedStartTime.getTime()) || Number.isNaN(normalizedEndTime.getTime())) {
			throw new Error('Invalid booking time');
		}
		if (normalizedStartTime.getTime() === normalizedEndTime.getTime()) {
			throw new Error('Start time and end time cannot be the same');
		}
		if (normalizedEndTime < normalizedStartTime) {
			normalizedEndTime.setDate(normalizedEndTime.getDate() + 1);
		}
		if (normalizedStartTime >= normalizedEndTime) {
			throw new Error('Start time must be before end time');
		}

		return { normalizedStartTime, normalizedEndTime };
	}

	private async validateBookingPolicy(startTime: Date, endTime: Date) {
		const now = new Date();
		if (startTime < now) {
			throw new Error('Cannot book a time slot in the past');
		}

		const durationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
		const policy = await settingService.getBookingPolicy();

		if (durationHours < policy.minHours) {
			throw new Error(`Booking must be at least ${policy.minHours} hour(s) long`);
		}
		if (durationHours > policy.maxHours) {
			throw new Error(`Booking cannot exceed ${policy.maxHours} hour(s)`);
		}

		const latestBookable = new Date(now);
		latestBookable.setDate(latestBookable.getDate() + policy.advanceDays);
		if (startTime > latestBookable) {
			throw new Error(`Bookings can only be created up to ${policy.advanceDays} day(s) ahead`);
		}
	}

	private ensurePositiveInteger(value: number, fieldName: string) {
		if (!Number.isInteger(value) || value <= 0) {
			throw new Error(`${fieldName} must be a positive integer`);
		}
	}

	private async buildValidServiceItems(selectedServices: SelectedServiceInput[]) {
		let extraServicesCost = 0;
		const validServicesToInsert: ValidServiceItem[] = [];

		for (const selectedService of selectedServices) {
			this.ensurePositiveInteger(selectedService.qty, 'Service quantity');

			const existingService = await serviceRepository.findById(selectedService.id);
			if (!existingService || !existingService.isAvailable) {
				throw new Error(`Service ${selectedService.id} is invalid or unavailable`);
			}

			extraServicesCost += existingService.price * selectedService.qty;
			validServicesToInsert.push({
				serviceId: existingService.id,
				quantity: selectedService.qty,
				priceAtBooking: existingService.price
			});
		}

		return { extraServicesCost, validServicesToInsert };
	}

	private async getUserEmail(userId: string) {
		return await db
			.select({ email: user.email })
			.from(user)
			.where(eq(user.id, userId))
			.then((res) => res[0] ?? null);
	}

	private assertCanViewBooking(targetBooking: Awaited<ReturnType<typeof bookingRepository.findById>>, viewer?: BookingViewer) {
		if (!targetBooking) {
			throw new Error('Booking not found');
		}
		if (!viewer) {
			return;
		}
		if (STAFF_ROLES.has(viewer.role)) {
			return;
		}
		if (targetBooking.userId !== viewer.id) {
			throw new Error('Bạn không có quyền xem đơn này.');
		}
	}

	private assertTransitionAllowed(currentStatus: BookingStatus, nextStatus: BookingStatus) {
		if (currentStatus === nextStatus) {
			throw new Error('Booking is already in the requested status');
		}
		if (!BOOKING_TRANSITIONS[currentStatus].includes(nextStatus)) {
			throw new Error(`Cannot change booking status from ${currentStatus} to ${nextStatus}`);
		}
	}

	async getAllBookings() {
		return await bookingRepository.findAll();
	}

	async getBooking(id: number, viewer?: BookingViewer) {
		const targetBooking = await bookingRepository.findById(id);
		this.assertCanViewBooking(targetBooking, viewer);
		return targetBooking;
	}

	async getBookingsByUser(userId: string) {
		return await bookingRepository.findByUserId(userId);
	}

	async estimateRoomCost(roomId: number, startTime: Date, endTime: Date) {
		const room = await roomRepository.findById(roomId);
		if (!room) throw new Error('Room does not exist');

		const { normalizedStartTime, normalizedEndTime } = this.normalizeTimeRange(startTime, endTime);
		await this.validateBookingPolicy(normalizedStartTime, normalizedEndTime);

		return await pricingService.calculateRoomCost(
			room.pricePerHour,
			normalizedStartTime,
			normalizedEndTime
		);
	}

	async checkAvailability(roomId: number, startTime: Date, endTime: Date) {
		const { normalizedStartTime, normalizedEndTime } = this.normalizeTimeRange(startTime, endTime);
		await this.validateBookingPolicy(normalizedStartTime, normalizedEndTime);

		const overlaps = await bookingRepository.findOverlappingBookings(
			roomId,
			normalizedStartTime,
			normalizedEndTime
		);
		return overlaps.length === 0;
	}

	async createBooking(
		data: BookingPayload,
		usedPoints: number = 0,
		selectedServices: SelectedServiceInput[] = [],
		voucherCode?: string
	) {
		if (usedPoints < 0 || !Number.isInteger(usedPoints)) {
			throw new Error('Points to use must be a non-negative integer');
		}

		const room = await roomRepository.findById(data.roomId);
		if (!room) throw new Error('Room does not exist');

		const { normalizedStartTime, normalizedEndTime } = this.normalizeTimeRange(
			data.startTime,
			data.endTime
		);
		await this.validateBookingPolicy(normalizedStartTime, normalizedEndTime);

		if (data.guestCount !== undefined && data.guestCount !== null) {
			this.ensurePositiveInteger(data.guestCount, 'Guest count');
			if (data.guestCount > room.capacity) {
				throw new Error(`Guest count cannot exceed room capacity (${room.capacity})`);
			}
		}

		const { extraServicesCost, validServicesToInsert } =
			await this.buildValidServiceItems(selectedServices);

		const bookingResult = await db.transaction(async (tx) => {
			await tx.execute(sql`SELECT pg_advisory_xact_lock(${data.roomId})`);

			const overlaps = await bookingRepository.findOverlappingBookings(
				data.roomId,
				normalizedStartTime,
				normalizedEndTime,
				tx
			);
			if (overlaps.length > 0) {
				throw new Error('Room is not available for the selected time slot');
			}

			const roomCost = await pricingService.calculateRoomCost(
				room.pricePerHour,
				normalizedStartTime,
				normalizedEndTime
			);
			const initialTotal = roomCost + extraServicesCost;

			let discountAmount = 0;
			if (voucherCode) {
				const promoResult = await promotionService.reserveVoucher(voucherCode, initialTotal, tx);
				discountAmount = promoResult.discount;
			}

			const pointsApplied = Math.min(usedPoints, Math.max(0, initialTotal - discountAmount));
			const finalCost = Math.max(0, initialTotal - discountAmount - pointsApplied);

			const createdBooking = await bookingRepository.create(
				{
					...data,
					startTime: normalizedStartTime,
					endTime: normalizedEndTime,
					totalCost: finalCost,
					voucherCode: voucherCode?.toUpperCase() || null,
					discountAmount,
					usedPoints: pointsApplied
				},
				tx
			);

			for (const serviceItem of validServicesToInsert) {
				await bookingRepository.createServiceItem(
					{
						bookingId: createdBooking.id,
						...serviceItem
					},
					tx
				);
			}

			if (pointsApplied > 0) {
				await loyaltyService.redeemPoints(data.userId, pointsApplied, createdBooking.id, tx);
			}

			await activityService.log(
				data.userId,
				'create',
				'booking',
				createdBooking.id,
				`Đặt phòng #${createdBooking.id}, tổng ${finalCost.toLocaleString('vi-VN')}₫`,
				tx
			);

			return { booking: createdBooking };
		});

		return bookingResult.booking;
	}

	async updateBookingStatus(id: number, nextStatus: BookingStatus) {
		const result = await db.transaction(async (tx) => {
			await tx.execute(sql`SELECT id FROM booking WHERE id = ${id} FOR UPDATE`);

			const currentBooking = await bookingRepository.findById(id, tx);
			if (!currentBooking) throw new Error('Booking not found');

			const currentStatus = currentBooking.status as BookingStatus;
			this.assertTransitionAllowed(currentStatus, nextStatus);

			const updatedBooking = await bookingRepository.updateStatus(id, nextStatus, tx);

			if (nextStatus === 'confirmed') {
				await loyaltyService.rewardPoints(
					currentBooking.userId,
					currentBooking.id,
					currentBooking.totalCost ?? 0,
					tx
				);
			}

			if (nextStatus === 'cancelled') {
				if (currentBooking.usedPoints > 0) {
					await loyaltyService.refundPoints(
						currentBooking.userId,
						currentBooking.usedPoints,
						currentBooking.id,
						tx
					);
				}

				if (currentStatus === 'confirmed') {
					await loyaltyService.revertRewardedPoints(
						currentBooking.userId,
						currentBooking.id,
						currentBooking.totalCost ?? 0,
						tx
					);
				}

				if (currentBooking.voucherCode) {
					const promo = await promotionRepository.findByCode(currentBooking.voucherCode, tx);
					if (promo) {
						await promotionService.releaseVoucherUsage(promo.id, tx);
					}
				}
			}

			await activityService.log(
				currentBooking.userId,
				'status_change',
				'booking',
				currentBooking.id,
				`Đơn #${id}: ${currentStatus} -> ${nextStatus}`,
				tx
			);

			return { updatedBooking, previousBooking: currentBooking };
		});

		try {
			const bookingOwner = await this.getUserEmail(result.previousBooking.userId);
			const targetRoom = await roomRepository.findById(result.previousBooking.roomId);

			if (bookingOwner && targetRoom) {
				if (nextStatus === 'confirmed') {
					await emailService.sendBookingConfirmed(bookingOwner.email, {
						bookingId: result.updatedBooking.id,
						roomName: targetRoom.name,
						startTime: result.updatedBooking.startTime,
						endTime: result.updatedBooking.endTime,
						totalCost: result.updatedBooking.totalCost ?? 0
					});
				}

				if (nextStatus === 'cancelled') {
					await emailService.sendBookingCancelled(bookingOwner.email, {
						bookingId: result.updatedBooking.id,
						roomName: targetRoom.name
					});
				}
			}
		} catch (error) {
			console.error('Booking email side effect failed:', error);
		}

		return result.updatedBooking;
	}

	async findAvailableRooms(startTime: Date, endTime: Date, minCapacity?: number) {
		const { normalizedStartTime, normalizedEndTime } = this.normalizeTimeRange(startTime, endTime);
		await this.validateBookingPolicy(normalizedStartTime, normalizedEndTime);

		const allRooms = await roomRepository.findAll();
		const availableRooms = [];

		for (const room of allRooms) {
			if (minCapacity && room.capacity < minCapacity) continue;

			const isAvailable = await this.checkAvailability(
				room.id,
				normalizedStartTime,
				normalizedEndTime
			);
			if (isAvailable) availableRooms.push(room);
		}

		return availableRooms;
	}
}

export const bookingService = new BookingService();
