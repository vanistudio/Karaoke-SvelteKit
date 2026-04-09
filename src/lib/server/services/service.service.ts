import { serviceRepository } from '$lib/server/repositories/service.repository';

export class ServiceService {
	async getAllServices() {
		return await serviceRepository.findAll();
	}

	async getService(id: number) {
		const svc = await serviceRepository.findById(id);
		if (!svc) throw new Error('Service not found');
		return svc;
	}

	async createService(data: Parameters<typeof serviceRepository.create>[0]) {
		return await serviceRepository.create(data);
	}

	async updateService(id: number, data: Parameters<typeof serviceRepository.update>[1]) {
		const existing = await serviceRepository.findById(id);
		if (!existing) throw new Error('Service not found');
		return await serviceRepository.update(id, data);
	}

	async deleteService(id: number) {
		const existing = await serviceRepository.findById(id);
		if (!existing) throw new Error('Service not found');
		return await serviceRepository.delete(id);
	}

	async countServices() {
		return await serviceRepository.count();
	}
}

export const serviceService = new ServiceService();
