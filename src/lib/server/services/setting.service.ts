import { settingRepository } from '$lib/server/repositories/setting.repository';

export const DEFAULT_SETTINGS: Record<string, { value: string; group: string }> = {
	site_name: { value: 'KaraSystem', group: 'general' },
	site_slogan: { value: 'Đẳng cấp âm thanh', group: 'general' },
	site_phone: { value: '1900 1000', group: 'general' },
	site_address: { value: '123 Premium Street, District 1', group: 'general' },
	site_email: { value: 'contact@karasystem.vn', group: 'general' },
	site_open_time: { value: '08:00', group: 'general' },
	site_close_time: { value: '02:00', group: 'general' },
	loyalty_bronze_threshold: { value: '0', group: 'loyalty' },
	loyalty_silver_threshold: { value: '5000000', group: 'loyalty' },
	loyalty_gold_threshold: { value: '20000000', group: 'loyalty' },
	loyalty_diamond_threshold: { value: '50000000', group: 'loyalty' },
	loyalty_bronze_rate: { value: '0.02', group: 'loyalty' },
	loyalty_silver_rate: { value: '0.05', group: 'loyalty' },
	loyalty_gold_rate: { value: '0.08', group: 'loyalty' },
	loyalty_diamond_rate: { value: '0.12', group: 'loyalty' },
	booking_min_hours: { value: '1', group: 'booking' },
	booking_max_hours: { value: '8', group: 'booking' },
	booking_cancel_policy: {
		value: 'Chỉ hủy được khi đơn đang ở trạng thái chờ duyệt.',
		group: 'booking'
	},
	booking_advance_days: { value: '30', group: 'booking' }
};

export class SettingService {
	private parseIntegerSetting(key: string, fallback: number) {
		const raw = DEFAULT_SETTINGS[key]?.value;
		const parsed = raw ? Number(raw) : fallback;
		return Number.isFinite(parsed) ? parsed : fallback;
	}

	async getAllSettings() {
		return await settingRepository.findAll();
	}

	async getSettingsByGroup(group: string) {
		const settings = await settingRepository.findByGroup(group);
		const defaults = Object.entries(DEFAULT_SETTINGS)
			.filter(([, v]) => v.group === group)
			.map(([key, v]) => ({ key, value: v.value, group: v.group }));

		const merged = defaults.map((d) => {
			const found = settings.find((s) => s.key === d.key);
			return found ? { key: found.key, value: found.value, group: found.group } : d;
		});

		const extra = settings.filter((s) => !defaults.find((d) => d.key === s.key));
		return [...merged, ...extra];
	}

	async getSetting(key: string): Promise<string> {
		const record = await settingRepository.findByKey(key);
		if (record) return record.value;
		return DEFAULT_SETTINGS[key]?.value ?? '';
	}

	async getSettingsMap(keys: string[]): Promise<Record<string, string>> {
		const result: Record<string, string> = {};
		for (const key of keys) {
			result[key] = await this.getSetting(key);
		}
		return result;
	}

	async updateSettings(entries: { key: string; value: string; group: string }[]) {
		await settingRepository.upsertMany(entries);
		return true;
	}

	async getLoyaltyConfig() {
		const keys = [
			'loyalty_bronze_threshold',
			'loyalty_silver_threshold',
			'loyalty_gold_threshold',
			'loyalty_diamond_threshold',
			'loyalty_bronze_rate',
			'loyalty_silver_rate',
			'loyalty_gold_rate',
			'loyalty_diamond_rate'
		];
		const map = await this.getSettingsMap(keys);
		return {
			thresholds: {
				bronze: Number(map['loyalty_bronze_threshold']),
				silver: Number(map['loyalty_silver_threshold']),
				gold: Number(map['loyalty_gold_threshold']),
				diamond: Number(map['loyalty_diamond_threshold'])
			},
			rates: {
				bronze: Number(map['loyalty_bronze_rate']),
				silver: Number(map['loyalty_silver_rate']),
				gold: Number(map['loyalty_gold_rate']),
				diamond: Number(map['loyalty_diamond_rate'])
			}
		};
	}

	async getBookingPolicy() {
		const keys = ['booking_min_hours', 'booking_max_hours', 'booking_advance_days'];
		const map = await this.getSettingsMap(keys);

		const minHours = Number(map['booking_min_hours'] ?? this.parseIntegerSetting('booking_min_hours', 1));
		const maxHours = Number(map['booking_max_hours'] ?? this.parseIntegerSetting('booking_max_hours', 8));
		const advanceDays = Number(
			map['booking_advance_days'] ?? this.parseIntegerSetting('booking_advance_days', 30)
		);

		return {
			minHours: Number.isFinite(minHours) && minHours > 0 ? minHours : 1,
			maxHours: Number.isFinite(maxHours) && maxHours > 0 ? maxHours : 8,
			advanceDays: Number.isFinite(advanceDays) && advanceDays > 0 ? advanceDays : 30
		};
	}
}

export const settingService = new SettingService();
