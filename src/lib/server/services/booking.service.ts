import { bookingRepository } from '$lib/server/repositories/booking.repository';
import { roomRepository } from '$lib/server/repositories/room.repository';

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

	async createBooking(data: Parameters<typeof bookingRepository.create>[0]) {
		const room = await roomRepository.findById(data.roomId);
		if (!room) throw new Error('Room does not exist');

		if (data.startTime >= data.endTime) {
			throw new Error('Start time must be before end time');
		}
		const isAvailable = await this.checkAvailability(data.roomId, data.startTime, data.endTime);
		if (!isAvailable) {
			throw new Error('Room is not available for the selected time slot');
		}
		const durationMs = data.endTime.getTime() - data.startTime.getTime();
		const durationHours = durationMs / (1000 * 60 * 60);
		
		const bookingData = {
			...data,
			totalCost: Math.round(durationHours * room.pricePerHour)
		};

		return await bookingRepository.create(bookingData);
	}

	async updateBookingStatus(id: number, status: string) {
		const booking = await bookingRepository.findById(id);
		if (!booking) throw new Error('Booking not found');
		return await bookingRepository.updateStatus(id, status);
	}
}
export const bookingService = new BookingService();