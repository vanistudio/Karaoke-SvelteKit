export const TIER_THRESHOLDS = {
	bronze: 0,
	silver: 5_000_000,
	gold: 20_000_000,
	diamond: 50_000_000
};

export const REWARD_RATES = {
	bronze: 0.02, // 2%
	silver: 0.05, // 5%
	gold: 0.08,   // 8%
	diamond: 0.12 // 12%
};

export type Tier = keyof typeof TIER_THRESHOLDS;

export function calculateNewTier(totalSpent: number): Tier {
	if (totalSpent >= TIER_THRESHOLDS.diamond) return 'diamond';
	if (totalSpent >= TIER_THRESHOLDS.gold) return 'gold';
	if (totalSpent >= TIER_THRESHOLDS.silver) return 'silver';
	return 'bronze';
}

export function calculateReward(tier: Tier, amount: number): number {
	const rate = REWARD_RATES[tier] || REWARD_RATES.bronze;
	return Math.floor(amount * rate);
}
