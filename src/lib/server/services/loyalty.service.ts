import { db } from '$lib/server/db';
import { user, pointHistory } from '$lib/server/db/schema';
import { eq, sql } from 'drizzle-orm';
import { calculateNewTier as staticCalculateNewTier, calculateReward as staticCalculateReward, type Tier, TIER_THRESHOLDS as STATIC_THRESHOLDS, REWARD_RATES as STATIC_RATES } from '../config/loyalty';
import { settingService } from './setting.service';

export class LoyaltyService {
	private async getConfig() {
		try {
			return await settingService.getLoyaltyConfig();
		} catch {
			return {
				thresholds: STATIC_THRESHOLDS,
				rates: STATIC_RATES
			};
		}
	}

	private calculateTier(totalSpent: number, thresholds: Record<string, number>): Tier {
		if (totalSpent >= thresholds.diamond) return 'diamond';
		if (totalSpent >= thresholds.gold) return 'gold';
		if (totalSpent >= thresholds.silver) return 'silver';
		return 'bronze';
	}

	private calculateRewardPoints(tier: Tier, amount: number, rates: Record<string, number>): number {
		const rate = rates[tier] || rates.bronze || 0.02;
		return Math.floor(amount * rate);
	}

	async rewardPoints(userId: string, bookingId: number, totalCost: number) {
		const u = await db.select({ id: user.id, tier: user.tier, totalSpent: user.totalSpent }).from(user).where(eq(user.id, userId)).then(res => res[0]);
		if (!u) throw new Error('User not found');

		const config = await this.getConfig();
		const currentTier = u.tier as Tier;
		const earnedPoints = this.calculateRewardPoints(currentTier, totalCost, config.rates);
		const newTotalSpent = u.totalSpent + totalCost;
		const newTier = this.calculateTier(newTotalSpent, config.thresholds);

		await db.transaction(async (tx) => {
			await tx.update(user)
				.set({
					points: sql`${user.points} + ${earnedPoints}`,
					totalSpent: newTotalSpent,
					tier: newTier
				})
				.where(eq(user.id, userId));
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
	async refundPoints(userId: string, amount: number, bookingId: number) {
		if (amount <= 0) return true;
		await db.transaction(async (tx) => {
			await tx.update(user)
				.set({ points: sql`${user.points} + ${amount}` })
				.where(eq(user.id, userId));

			await tx.insert(pointHistory).values({
				userId,
				bookingId,
				amount: amount,
				type: 'admin_adjustment',
				description: `Hoàn điểm cọc do hủy đơn hàng #${bookingId}`
			});
		});
		return true;
	}
	async revertRewardedPoints(userId: string, bookingId: number) {
		const historyRecord = await db.select().from(pointHistory).where(
			sql`${pointHistory.bookingId} = ${bookingId} AND ${pointHistory.type} = 'reward'`
		).then(res => res[0]);

		if (!historyRecord) return true;
		
		const amountToRevert = historyRecord.amount;
		
		await db.transaction(async (tx) => {
			await tx.update(user)
				.set({ points: sql`${user.points} - ${amountToRevert}` })
				.where(eq(user.id, userId));

			await tx.insert(pointHistory).values({
				userId,
				bookingId,
				amount: -amountToRevert,
				type: 'admin_adjustment',
				description: `Thu hồi điểm thưởng của đơn hàng #${bookingId}`
			});
		});
		
		return true;
	}
	async getLoyaltyInfo(userId: string) {
		const u = await db.select({ points: user.points, tier: user.tier, totalSpent: user.totalSpent }).from(user).where(eq(user.id, userId)).then(res => res[0]);
		if (!u) throw new Error('User not found');

		const config = await this.getConfig();
		const thresholds = config.thresholds;

		const nextTierMap: Record<string, { next: Tier | null, threshold: number }> = {
			bronze: { next: 'silver', threshold: thresholds.silver },
			silver: { next: 'gold', threshold: thresholds.gold },
			gold: { next: 'diamond', threshold: thresholds.diamond },
			diamond: { next: null, threshold: thresholds.diamond }
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
