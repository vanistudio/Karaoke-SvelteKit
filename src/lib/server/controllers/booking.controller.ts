import { bookingService } from '$lib/server/services/booking.service';

export class BookingController {
	async listBookings() {
		return await bookingService.getAllBookings();
	}

	async getBooking(id: number) {
		return await bookingService.getBooking(id);
	}

	async getBookingsByUser(userId: string) {
		return await bookingService.getBookingsByUser(userId);
	}

	async checkAvailability(roomId: number, startTime: Date, endTime: Date) {
		return await bookingService.checkAvailability(roomId, startTime, endTime);
	}

	async addBooking(data: Parameters<typeof bookingService.createBooking>[0]) {
		return await bookingService.createBooking(data);
	}
	
	async changeStatus(id: number, status: string) {
		return await bookingService.updateBookingStatus(id, status);
	}
}

export const bookingController = new BookingController();
