import { db } from '$lib/server/db';
import { pointHistory, user } from '$lib/server/db/schema';
import { eq, sql } from 'drizzle-orm';
import {
	type Tier,
	TIER_THRESHOLDS as STATIC_THRESHOLDS,
	REWARD_RATES as STATIC_RATES
} from '../config/loyalty';
import { settingService } from './setting.service';

type LoyaltyExecutor = any;
type PointHistoryType = 'reward' | 'redeem' | 'refund' | 'reward_reversal';

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

	private async findHistoryRecord(
		userId: string,
		bookingId: number,
		type: PointHistoryType,
		executor: LoyaltyExecutor = db
	) {
		const rows = await executor
			.select()
			.from(pointHistory)
			.where(
				sql`${pointHistory.userId} = ${userId} AND ${pointHistory.bookingId} = ${bookingId} AND ${pointHistory.type} = ${type}`
			);
		return rows[0] ?? null;
	}

	async rewardPoints(
		userId: string,
		bookingId: number,
		totalCost: number,
		executor: LoyaltyExecutor = db
	) {
		if (totalCost <= 0) {
			return { earnedPoints: 0, newTier: 'bronze' as Tier, applied: false };
		}

		const existingReward = await this.findHistoryRecord(userId, bookingId, 'reward', executor);
		if (existingReward) {
			const currentUsers = await executor
				.select({ tier: user.tier })
				.from(user)
				.where(eq(user.id, userId));
			const currentUser = currentUsers[0];

			return {
				earnedPoints: existingReward.amount,
				newTier: (currentUser?.tier as Tier | undefined) ?? 'bronze',
				applied: false
			};
		}

		const currentUsers = await executor
			.select({ id: user.id, tier: user.tier, totalSpent: user.totalSpent })
			.from(user)
			.where(eq(user.id, userId));
		const currentUser = currentUsers[0];
		if (!currentUser) throw new Error('User not found');

		const config = await this.getConfig();
		const currentTier = currentUser.tier as Tier;
		const earnedPoints = this.calculateRewardPoints(currentTier, totalCost, config.rates);
		const newTotalSpent = currentUser.totalSpent + totalCost;
		const newTier = this.calculateTier(newTotalSpent, config.thresholds);

		await executor
			.update(user)
			.set({
				points: sql`${user.points} + ${earnedPoints}`,
				totalSpent: newTotalSpent,
				tier: newTier
			})
			.where(eq(user.id, userId));

		await executor.insert(pointHistory).values({
			userId,
			bookingId,
			amount: earnedPoints,
			type: 'reward',
			description: `Tích ${earnedPoints.toLocaleString('vi-VN')} điểm từ đơn hàng #${bookingId}`
		});

		return { earnedPoints, newTier, applied: true };
	}

	async redeemPoints(
		userId: string,
		amount: number,
		bookingId?: number,
		executor: LoyaltyExecutor = db
	) {
		if (amount <= 0) return { applied: false };

		if (bookingId) {
			const existingRedeem = await this.findHistoryRecord(userId, bookingId, 'redeem', executor);
			if (existingRedeem) {
				return { applied: false };
			}
		}

		const currentUsers = await executor
			.select({ points: user.points })
			.from(user)
			.where(eq(user.id, userId));
		const currentUser = currentUsers[0];
		if (!currentUser) throw new Error('User not found');
		if (currentUser.points < amount) throw new Error('Không đủ điểm để khấu trừ');

		await executor
			.update(user)
			.set({ points: sql`${user.points} - ${amount}` })
			.where(eq(user.id, userId));

		await executor.insert(pointHistory).values({
			userId,
			bookingId,
			amount: -amount,
			type: 'redeem',
			description: `Dùng điểm giảm giá hóa đơn ${bookingId ? '#' + bookingId : ''}`.trim()
		});

		return { applied: true };
	}

	async refundPoints(
		userId: string,
		amount: number,
		bookingId: number,
		executor: LoyaltyExecutor = db
	) {
		if (amount <= 0) return { applied: false };

		const existingRefund = await this.findHistoryRecord(userId, bookingId, 'refund', executor);
		if (existingRefund) {
			return { applied: false };
		}

		await executor
			.update(user)
			.set({ points: sql`${user.points} + ${amount}` })
			.where(eq(user.id, userId));

		await executor.insert(pointHistory).values({
			userId,
			bookingId,
			amount,
			type: 'refund',
			description: `Hoàn điểm do hủy đơn hàng #${bookingId}`
		});

		return { applied: true };
	}

	async revertRewardedPoints(
		userId: string,
		bookingId: number,
		totalCost: number,
		executor: LoyaltyExecutor = db
	) {
		const existingReversal = await this.findHistoryRecord(
			userId,
			bookingId,
			'reward_reversal',
			executor
		);
		if (existingReversal) {
			return { applied: false };
		}

		const rewardRecord = await this.findHistoryRecord(userId, bookingId, 'reward', executor);
		if (!rewardRecord) {
			return { applied: false };
		}

		const currentUsers = await executor
			.select({ points: user.points, totalSpent: user.totalSpent })
			.from(user)
			.where(eq(user.id, userId));
		const currentUser = currentUsers[0];
		if (!currentUser) throw new Error('User not found');

		const config = await this.getConfig();
		const nextTotalSpent = Math.max(0, currentUser.totalSpent - Math.max(totalCost, 0));
		const nextTier = this.calculateTier(nextTotalSpent, config.thresholds);

		await executor
			.update(user)
			.set({
				points: sql`GREATEST(${user.points} - ${rewardRecord.amount}, 0)`,
				totalSpent: nextTotalSpent,
				tier: nextTier
			})
			.where(eq(user.id, userId));

		await executor.insert(pointHistory).values({
			userId,
			bookingId,
			amount: -rewardRecord.amount,
			type: 'reward_reversal',
			description: `Thu hồi điểm thưởng của đơn hàng #${bookingId}`
		});

		return { applied: true };
	}

	async getLoyaltyInfo(userId: string) {
		const currentUsers = await db
			.select({ points: user.points, tier: user.tier, totalSpent: user.totalSpent })
			.from(user)
			.where(eq(user.id, userId));
		const currentUser = currentUsers[0];
		if (!currentUser) throw new Error('User not found');

		const config = await this.getConfig();
		const thresholds = config.thresholds;

		const nextTierMap: Record<string, { next: Tier | null; threshold: number }> = {
			bronze: { next: 'silver', threshold: thresholds.silver },
			silver: { next: 'gold', threshold: thresholds.gold },
			gold: { next: 'diamond', threshold: thresholds.diamond },
			diamond: { next: null, threshold: thresholds.diamond }
		};

		const mapping = nextTierMap[currentUser.tier] || nextTierMap.bronze;

		return {
			...currentUser,
			nextTier: mapping.next,
			pointsNeeded: mapping.next ? Math.max(mapping.threshold - currentUser.totalSpent, 0) : 0
		};
	}
}

export const loyaltyService = new LoyaltyService();
