import { roomRepository } from '../repositories/room.repository';
import { bookingRepository } from '../repositories/booking.repository';

export class RoomService {
	async getAllRooms() {
		return await roomRepository.findAll();
	}

	async getRoom(id: number) {
		const room = await roomRepository.findById(id);
		if (!room) throw new Error('Room not found');
		return room;
	}

	async createRoom(data: Parameters<typeof roomRepository.create>[0]) {
		return await roomRepository.create(data);
	}

	async findAvailableRooms(startTime: Date, endTime: Date, minCapacity?: number) {
		const allRooms = await roomRepository.findAll();
		const availableRooms = [];

		for (const r of allRooms) {
			if (minCapacity && r.capacity < minCapacity) continue;
			const overlaps = await bookingRepository.findOverlappingBookings(r.id, startTime, endTime);
			if (overlaps.length === 0) {
				availableRooms.push(r);
			}
		}

		return availableRooms;
	}
}

export const roomService = new RoomService();
