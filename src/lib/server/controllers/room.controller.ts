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
}

export const roomController = new RoomController();
