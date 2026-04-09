import { roomService } from '$lib/server/services/room.service';

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

	async updateRoom(id: number, data: Parameters<typeof roomService.updateRoom>[1]) {
		return await roomService.updateRoom(id, data);
	}

	async deleteRoom(id: number) {
		return await roomService.deleteRoom(id);
	}

	async countRooms() {
		return await roomService.countRooms();
	}

	async findAvailableRooms(startTime: Date, endTime: Date, minCapacity?: number) {
		return await roomService.findAvailableRooms(startTime, endTime, minCapacity);
	}
}

export const roomController = new RoomController();
