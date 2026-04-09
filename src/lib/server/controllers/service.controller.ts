import { serviceService } from '$lib/server/services/service.service';

export class ServiceController {
	async listServices() {
		return await serviceService.getAllServices();
	}

	async getService(id: number) {
		return await serviceService.getService(id);
	}

	async addService(data: Parameters<typeof serviceService.createService>[0]) {
		return await serviceService.createService(data);
	}

	async updateService(id: number, data: Parameters<typeof serviceService.updateService>[1]) {
		return await serviceService.updateService(id, data);
	}

	async deleteService(id: number) {
		return await serviceService.deleteService(id);
	}

	async countServices() {
		return await serviceService.countServices();
	}
}

export const serviceController = new ServiceController();
