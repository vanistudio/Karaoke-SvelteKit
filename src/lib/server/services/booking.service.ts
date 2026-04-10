import { bookingRepository } from '$lib/server/repositories/booking.repository';
import { roomRepository } from '$lib/server/repositories/room.repository';
import { loyaltyService } from './loyalty.service';

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

	async checkAvailability(roomId: number, startTime: Date, endTime: Date) {
		const overlaps = await bookingRepository.findOverlappingBookings(roomId, startTime, endTime);
		return overlaps.length === 0;
	}

	async createBooking(data: Parameters<typeof bookingRepository.create>[0], usedPoints: number = 0) {
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
		const durationMs = data.endTime.getTime() - data.startTime.getTime();
		const durationHours = durationMs / (1000 * 60 * 60);
		
		const baseCost = Math.round(durationHours * room.pricePerHour);
		const finalCost = Math.max(0, baseCost - usedPoints);
		
		const bookingData = {
			...data,
			totalCost: finalCost
		};

		const booking = await bookingRepository.create(bookingData);
		
		if (usedPoints > 0) {
			await loyaltyService.redeemPoints(data.userId, usedPoints, booking.id);
		}

		return booking;
	}

	async updateBookingStatus(id: number, status: string) {
		const booking = await bookingRepository.findById(id);
		if (!booking) throw new Error('Booking not found');
		
		const updated = await bookingRepository.updateStatus(id, status);
		
		if (status === 'confirmed' && booking.status !== 'confirmed') {
			try {
				await loyaltyService.rewardPoints(booking.userId, booking.id, booking.totalCost ?? 0);
			} catch (e) {
				console.error('Lỗi khi tính điểm thưởng:', e);
			}
		}
		
		return updated;
	}
}
export const bookingService = new BookingService();