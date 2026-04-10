import { bookingRepository } from '$lib/server/repositories/booking.repository';
import { roomRepository } from '$lib/server/repositories/room.repository';
import { serviceRepository } from '$lib/server/repositories/service.repository';
import { promotionService } from './promotion.service';
import { promotionRepository } from '$lib/server/repositories/promotion.repository';
import { loyaltyService } from './loyalty.service';
import { pricingService } from './pricing.service';

export class BookingService {
	async getAllBookings() {
		return await bookingRepository.findAll();
	}

	async getBooking(id: number) {
		const booking = await bookingRepository.findById(id);
		if (!booking) throw new Error('Booking not found');
		return booking;
	}

	async getBookingsByUser(userId: string) {
		return await bookingRepository.findByUserId(userId);
	}

	async estimateRoomCost(roomId: number, startTime: Date, endTime: Date) {
		const room = await roomRepository.findById(roomId);
		if (!room) throw new Error('Room does not exist');
		return await pricingService.calculateRoomCost(room.pricePerHour, startTime, endTime);
	}

	async checkAvailability(roomId: number, startTime: Date, endTime: Date) {
		const overlaps = await bookingRepository.findOverlappingBookings(roomId, startTime, endTime);
		return overlaps.length === 0;
	}

	async createBooking(
		data: Parameters<typeof bookingRepository.create>[0],
		usedPoints: number = 0,
		selectedServices: { id: number; qty: number }[] = [],
		voucherCode?: string
	) {
		const room = await roomRepository.findById(data.roomId);
		if (!room) throw new Error('Room does not exist');

		if (data.startTime >= data.endTime) {
			throw new Error('Start time must be before end time');
		}

		const now = new Date();
		if (data.startTime < now) {
			throw new Error('Cannot book a time slot in the past');
		}

		const isAvailable = await this.checkAvailability(data.roomId, data.startTime, data.endTime);
		if (!isAvailable) {
			throw new Error('Room is not available for the selected time slot');
		}
		const roomCost = await pricingService.calculateRoomCost(room.pricePerHour, data.startTime, data.endTime);
		let extraServicesCost = 0;
		const validServicesToInsert = [];
		for (const svc of selectedServices) {
			const s = await serviceRepository.findById(svc.id);
			if (!s || !s.isAvailable) throw new Error(`Service ${svc.id} is invalid or unavailable`);
			extraServicesCost += s.price * svc.qty;
			validServicesToInsert.push({ serviceId: s.id, quantity: svc.qty, priceAtBooking: s.price });
		}

		const initialTotal = roomCost + extraServicesCost;
		let discountAmount = 0;
		if (voucherCode) {
			const promoResult = await promotionService.applyVoucher(voucherCode, initialTotal);
			discountAmount = promoResult.discount;
		}

		const finalCost = Math.max(0, initialTotal - discountAmount - usedPoints);

		const bookingData = {
			...data,
			totalCost: finalCost,
			voucherCode: voucherCode || null,
			discountAmount: discountAmount,
			usedPoints: usedPoints
		};

		const booking = await bookingRepository.create(bookingData);
		for (const item of validServicesToInsert) {
			await bookingRepository.createServiceItem({
				bookingId: booking.id,
				...item
			});
		}

		if (usedPoints > 0) {
			await loyaltyService.redeemPoints(data.userId, usedPoints, booking.id);
		}

		return booking;
	}

	async updateBookingStatus(id: number, status: string) {
		const booking = await bookingRepository.findById(id);
		if (!booking) throw new Error('Booking not found');

		const oldStatus = booking.status;
		const updated = await bookingRepository.updateStatus(id, status);

		if (status === 'confirmed' && oldStatus !== 'confirmed') {
			try {
				await loyaltyService.rewardPoints(booking.userId, booking.id, booking.totalCost ?? 0);
			} catch (e) {
				console.error('Lỗi khi tính điểm thưởng:', e);
			}
		}

		if (status === 'cancelled' && oldStatus !== 'cancelled') {
			try {
				if (booking.usedPoints > 0) {
					await loyaltyService.refundPoints(booking.userId, booking.usedPoints, booking.id);
				}
				if (oldStatus === 'confirmed') {
					await loyaltyService.revertRewardedPoints(booking.userId, booking.id);
				}
				if (booking.voucherCode) {
					const promo = await promotionRepository.findByCode(booking.voucherCode);
					if (promo) {
						await promotionRepository.decrementUsage(promo.id);
					}
				}
			} catch (e) {
				console.error('Lỗi khi rollback Hủy Đơn Booking:', e);
			}
		}

		return updated;
	}
}
export const bookingService = new BookingService();