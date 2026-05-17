import { userRepository } from '$lib/server/repositories/user.repository';

export class UserService {
	async listUsers(params: { page?: number; limit?: number; search?: string; role?: string; tier?: string } = {}) {
		return await userRepository.findAll(params);
	}

	async getUser(id: string) {
		const u = await userRepository.findById(id);
		if (!u) throw new Error('User not found');
		return u;
	}

	async updateRole(id: string, role: string) {
		const validRoles = ['admin', 'user', 'banned'];
		if (!validRoles.includes(role)) throw new Error('Role không hợp lệ');
		const u = await userRepository.findById(id);
		if (!u) throw new Error('User not found');
		return await userRepository.updateRole(id, role);
	}

	async banUser(id: string) {
		const u = await userRepository.findById(id);
		if (!u) throw new Error('User not found');
		if (u.role === 'admin') throw new Error('Không thể khóa tài khoản admin');
		return await userRepository.updateBanStatus(id, true);
	}

	async unbanUser(id: string) {
		const u = await userRepository.findById(id);
		if (!u) throw new Error('User not found');
		return await userRepository.updateBanStatus(id, false);
	}
}

export const userService = new UserService();
