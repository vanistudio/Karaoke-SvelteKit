import { roomRepository } from '../repositories/room.repository';

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
}

export const roomService = new RoomService();
