import { roomService } from '../services/room.service';

export class RoomController {
	async listRooms() {
		return await roomService.getAllRooms();
	}

	async getRoom(id: number) {
		return await roomService.getRoom(id);
	}

	async addRoom(data: Parameters<typeof roomService.createRoom>[0]) {
		return await roomService.createRoom(data);
	}

	async findAvailableRooms(startTime: Date, endTime: Date, minCapacity?: number) {
		return await roomService.findAvailableRooms(startTime, endTime, minCapacity);
	}
}

export const roomController = new RoomController();
