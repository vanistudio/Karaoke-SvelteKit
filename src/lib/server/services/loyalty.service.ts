import { db } from '$lib/server/db';
import { user, pointHistory } from '$lib/server/db/schema';
import { eq, sql } from 'drizzle-orm';
import { calculateNewTier, calculateReward, type Tier } from '../config/loyalty';

export class LoyaltyService {
	/**
	 * Nạp điểm cho user, tăng tổng chi tiêu và tự động xét nâng hạng.
	 */
	async rewardPoints(userId: string, bookingId: number, totalCost: number) {
		const u = await db.select({ id: user.id, tier: user.tier, totalSpent: user.totalSpent }).from(user).where(eq(user.id, userId)).then(res => res[0]);
		if (!u) throw new Error('User not found');

		const currentTier = u.tier as Tier;
		const earnedPoints = calculateReward(currentTier, totalCost);
		const newTotalSpent = u.totalSpent + totalCost;
		const newTier = calculateNewTier(newTotalSpent);

		await db.transaction(async (tx) => {
			// Cập nhật user
			await tx.update(user)
				.set({
					points: sql`${user.points} + ${earnedPoints}`,
					totalSpent: newTotalSpent,
					tier: newTier
				})
				.where(eq(user.id, userId));

			// Ghi log giao dịch
			if (earnedPoints > 0) {
				await tx.insert(pointHistory).values({
					userId,
					bookingId,
					amount: earnedPoints,
					type: 'reward',
					description: `Hoàn tiền ${earnedPoints.toLocaleString('vi-VN')} điểm từ đơn hàng #${bookingId}`
				});
			}
		});

		return { earnedPoints, newTier };
	}

	/**
	 * Khấu trừ điểm khi khách dùng điểm thanh toán.
	 */
	async redeemPoints(userId: string, amount: number, bookingId?: number) {
		if (amount <= 0) return true;

		const u = await db.select({ points: user.points }).from(user).where(eq(user.id, userId)).then(res => res[0]);
		if (!u) throw new Error('User not found');
		if (u.points < amount) throw new Error('Không đủ điểm để khấu trừ');

		await db.transaction(async (tx) => {
			await tx.update(user)
				.set({ points: sql`${user.points} - ${amount}` })
				.where(eq(user.id, userId));

			await tx.insert(pointHistory).values({
				userId,
				bookingId,
				amount: -amount,
				type: 'redeem',
				description: `Dùng điểm giảm giá hóa đơn ${bookingId ? '#' + bookingId : ''}`
			});
		});

		return true;
	}

	/**
	 * Lấy thông tin xếp hạng và điểm hiện tại của user.
	 */
	async getLoyaltyInfo(userId: string) {
		const u = await db.select({ points: user.points, tier: user.tier, totalSpent: user.totalSpent }).from(user).where(eq(user.id, userId)).then(res => res[0]);
		if (!u) throw new Error('User not found');
		
		const nextTierMap: Record<string, { next: Tier | null, threshold: number }> = {
			bronze: { next: 'silver', threshold: 5_000_000 },
			silver: { next: 'gold', threshold: 20_000_000 },
			gold: { next: 'diamond', threshold: 50_000_000 },
			diamond: { next: null, threshold: 50_000_000 }
		};

		const mapping = nextTierMap[u.tier] || nextTierMap.bronze;
		
		return {
			...u,
			nextTier: mapping.next,
			pointsNeeded: mapping.next ? mapping.threshold - u.totalSpent : 0
		};
	}
}

export const loyaltyService = new LoyaltyService();
