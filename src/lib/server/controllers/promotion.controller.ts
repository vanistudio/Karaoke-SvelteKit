import { promotionService } from '$lib/server/services/promotion.service';

export class PromotionController {
	async listPromotions() {
		return await promotionService.getAllPromotions();
	}

	async getPromotion(id: number) {
		return await promotionService.getPromotion(id);
	}

	async addPromotion(data: Parameters<typeof promotionService.createPromotion>[0]) {
		return await promotionService.createPromotion(data);
	}

	async updatePromotion(id: number, data: Parameters<typeof promotionService.updatePromotion>[1]) {
		return await promotionService.updatePromotion(id, data);
	}

	async deletePromotion(id: number) {
		return await promotionService.deletePromotion(id);
	}

	async countPromotions() {
		return await promotionService.countPromotions();
	}

	async validateVoucher(code: string, orderAmount: number) {
		return await promotionService.validateVoucher(code, orderAmount);
	}

	async applyVoucher(code: string, orderAmount: number) {
		return await promotionService.applyVoucher(code, orderAmount);
	}
}

export const promotionController = new PromotionController();
