import { db } from '$lib/server/db';
import { promotionRepository } from '$lib/server/repositories/promotion.repository';

type PromotionRecord = Awaited<ReturnType<typeof promotionRepository.findByCode>>;

export class PromotionService {
	private calculateDiscount(promo: NonNullable<PromotionRecord>, orderAmount: number): number {
		const discount =
			promo.type === 'percent' ? Math.round((orderAmount * promo.value) / 100) : promo.value;

		return Math.min(discount, orderAmount);
	}

	private async getActiveVoucher(
		code: string,
		orderAmount: number,
		executor: any = db
	): Promise<NonNullable<PromotionRecord>> {
		const promo = await promotionRepository.findByCode(code.toUpperCase(), executor);
		if (!promo) throw new Error('Mã voucher không tồn tại');
		if (!promo.isActive) throw new Error('Voucher đã ngừng hoạt động');
		if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) {
			throw new Error('Voucher đã hết hạn');
		}
		if (promo.currentUsage >= promo.maxUsage) {
			throw new Error('Voucher đã hết lượt sử dụng');
		}
		if (orderAmount < promo.minOrderAmount) {
			throw new Error(`Đơn hàng tối thiểu ${promo.minOrderAmount.toLocaleString('vi-VN')}₫`);
		}

		return promo;
	}

	async getAllPromotions() {
		return await promotionRepository.findAll();
	}

	async getPromotion(id: number) {
		const promo = await promotionRepository.findById(id);
		if (!promo) throw new Error('Promotion not found');
		return promo;
	}

	async createPromotion(data: Parameters<typeof promotionRepository.create>[0]) {
		const existing = await promotionRepository.findByCode(data.code);
		if (existing) throw new Error('Mã voucher đã tồn tại');
		return await promotionRepository.create(data);
	}

	async updatePromotion(id: number, data: Parameters<typeof promotionRepository.update>[1]) {
		const existing = await promotionRepository.findById(id);
		if (!existing) throw new Error('Promotion not found');
		return await promotionRepository.update(id, data);
	}

	async deletePromotion(id: number) {
		const existing = await promotionRepository.findById(id);
		if (!existing) throw new Error('Promotion not found');
		return await promotionRepository.delete(id);
	}

	async countPromotions() {
		return await promotionRepository.count();
	}

	async validateVoucher(code: string, orderAmount: number, executor: any = db) {
		const promo = await this.getActiveVoucher(code, orderAmount, executor);

		return {
			code: promo.code,
			type: promo.type,
			value: promo.value,
			minOrderAmount: promo.minOrderAmount
		};
	}

	async applyVoucher(code: string, orderAmount: number, executor: any = db) {
		const promo = await this.getActiveVoucher(code, orderAmount, executor);
		const discount = this.calculateDiscount(promo, orderAmount);

		return {
			promotionId: promo.id,
			code: promo.code,
			type: promo.type,
			value: promo.value,
			discount,
			finalAmount: orderAmount - discount
		};
	}

	async reserveVoucher(code: string, orderAmount: number, executor: any = db) {
		const promo = await this.getActiveVoucher(code, orderAmount, executor);
		const updated = await promotionRepository.incrementUsage(promo.id, executor);
		if (!updated) {
			throw new Error('Voucher đã hết lượt sử dụng');
		}

		const discount = this.calculateDiscount(promo, orderAmount);

		return {
			promotionId: promo.id,
			code: promo.code,
			type: promo.type,
			value: promo.value,
			discount,
			finalAmount: orderAmount - discount
		};
	}

	async releaseVoucherUsage(promotionId: number, executor: any = db) {
		return await promotionRepository.decrementUsage(promotionId, executor);
	}
}

export const promotionService = new PromotionService();
