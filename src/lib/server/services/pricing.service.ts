import { pricingRepository } from '$lib/server/repositories/pricing.repository';

export class PricingService {
	async getAllRules() {
		return await pricingRepository.findAll();
	}

	async getRule(id: number) {
		const rule = await pricingRepository.findById(id);
		if (!rule) throw new Error('Cấu hình giá không tồn tại');
		return rule;
	}

	async createRule(data: Parameters<typeof pricingRepository.create>[0]) {
		return await pricingRepository.create(data);
	}

	async updateRule(id: number, data: Parameters<typeof pricingRepository.update>[1]) {
		return await pricingRepository.update(id, data);
	}

	async deleteRule(id: number) {
		return await pricingRepository.delete(id);
	}
	async calculateRoomCost(basePricePerHour: number, startTime: Date, endTime: Date): Promise<number> {
		const activeRules = await pricingRepository.findAllActive();
		let totalCost = 0;
		const costPerMinute = basePricePerHour / 60;
		let currentTime = new Date(startTime.getTime());
		
		while (currentTime < endTime) {
			let maxMultiplier = 1.0;
			
			for (const rule of activeRules) {
				if (rule.type === 'holiday' && rule.date) {
					const parts = rule.date.split('-');
					if (parts.length === 3) {
						const y = Number(parts[0]);
						const m = Number(parts[1]) - 1;
						const d = Number(parts[2]);
						if (currentTime.getFullYear() === y && currentTime.getMonth() === m && currentTime.getDate() === d) {
							maxMultiplier = Math.max(maxMultiplier, rule.multiplier);
						}
					}
				} 
				else if (rule.type === 'time_block' && rule.startTime && rule.endTime) {
					if (rule.daysOfWeek && rule.daysOfWeek.length > 0) {
						if (!rule.daysOfWeek.includes(currentTime.getDay())) continue;
					}
					const currentH = currentTime.getHours();
					const currentM = currentTime.getMinutes();
					const absoluteCurrentM = currentH * 60 + currentM;
					
					const [sH, sM] = rule.startTime.split(':').map(Number);
					const [eH, eM] = rule.endTime.split(':').map(Number);
					const absoluteStartM = sH * 60 + sM;
					const absoluteEndM = eH * 60 + eM;
					if (absoluteEndM < absoluteStartM) {
						if (absoluteCurrentM >= absoluteStartM || absoluteCurrentM < absoluteEndM) {
							maxMultiplier = Math.max(maxMultiplier, rule.multiplier);
						}
					} else {
						if (absoluteCurrentM >= absoluteStartM && absoluteCurrentM < absoluteEndM) {
							maxMultiplier = Math.max(maxMultiplier, rule.multiplier);
						}
					}
				}
			}
			
			totalCost += (costPerMinute * maxMultiplier);
			currentTime.setMinutes(currentTime.getMinutes() + 1);
		}
		
		return Math.round(totalCost);
	}
}

export const pricingService = new PricingService();
