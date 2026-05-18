import { inArray } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { branch, promotion, room, service, setting } from './schema';
import type * as schema from './schema';

type Database = PostgresJsDatabase<typeof schema>;

const branchSeeds = [
	{
		name: 'KaraSystem Quận 1',
		address: '123 Nguyễn Huệ, Quận 1, TP.HCM',
		phone: '028 1234 5678'
	},
	{
		name: 'KaraSystem Quận 7',
		address: '456 Nguyễn Thị Thập, Quận 7, TP.HCM',
		phone: '028 8765 4321'
	},
	{
		name: 'KaraSystem Thủ Đức',
		address: '789 Võ Văn Ngân, TP. Thủ Đức',
		phone: '028 5555 6666'
	}
] as const;

const roomSeeds = [
	{
		name: 'Phòng Ánh Sao',
		capacity: 5,
		type: 'standard',
		pricePerHour: 150000,
		branchName: 'KaraSystem Quận 1'
	},
	{
		name: 'Phòng Trăng Vàng',
		capacity: 5,
		type: 'standard',
		pricePerHour: 150000,
		branchName: 'KaraSystem Quận 1'
	},
	{
		name: 'Phòng Mây Bay',
		capacity: 8,
		type: 'standard',
		pricePerHour: 200000,
		branchName: 'KaraSystem Quận 1'
	},
	{
		name: 'Phòng Hoàng Hôn',
		capacity: 10,
		type: 'vip',
		pricePerHour: 350000,
		branchName: 'KaraSystem Quận 1'
	},
	{
		name: 'Phòng Bình Minh',
		capacity: 12,
		type: 'vip',
		pricePerHour: 400000,
		branchName: 'KaraSystem Quận 7'
	},
	{
		name: 'Phòng Đại Dương',
		capacity: 15,
		type: 'vip',
		pricePerHour: 450000,
		branchName: 'KaraSystem Quận 7'
	},
	{
		name: 'Phòng Kim Cương',
		capacity: 20,
		type: 'super_vip',
		pricePerHour: 600000,
		branchName: 'KaraSystem Quận 7'
	},
	{
		name: 'Phòng Hoàng Gia',
		capacity: 30,
		type: 'super_vip',
		pricePerHour: 800000,
		branchName: 'KaraSystem Thủ Đức'
	},
	{
		name: 'Phòng Thiên Đường',
		capacity: 25,
		type: 'super_vip',
		pricePerHour: 700000,
		branchName: 'KaraSystem Thủ Đức'
	},
	{
		name: 'Phòng Ngân Hà',
		capacity: 8,
		type: 'vip',
		pricePerHour: 380000,
		branchName: 'KaraSystem Thủ Đức'
	}
] as const;

const serviceSeeds = [
	{ name: 'Combo Bia Tiger (6 lon)', price: 180000, category: 'drink', isAvailable: true },
	{ name: 'Combo Bia Heineken (6 lon)', price: 240000, category: 'drink', isAvailable: true },
	{ name: 'Nước Ngọt (Pepsi/Coca)', price: 25000, category: 'drink', isAvailable: true },
	{ name: 'Trà Đào Cam Sả', price: 45000, category: 'drink', isAvailable: true },
	{ name: 'Cocktail Mojito', price: 85000, category: 'drink', isAvailable: true },
	{ name: 'Cocktail Long Island', price: 95000, category: 'drink', isAvailable: true },
	{ name: 'Gà Rán Giòn (6 miếng)', price: 120000, category: 'food', isAvailable: true },
	{ name: 'Khoai Tây Chiên', price: 65000, category: 'food', isAvailable: true },
	{ name: 'Pizza Hải Sản Size L', price: 189000, category: 'food', isAvailable: true },
	{ name: 'Combo Nướng BBQ (4 người)', price: 350000, category: 'food', isAvailable: true },
	{ name: 'Trái Cây Tổng Hợp', price: 150000, category: 'food', isAvailable: true },
	{ name: 'Bánh Sinh Nhật (Size M)', price: 280000, category: 'food', isAvailable: true },
	{ name: 'Trang Trí Bóng Bay', price: 200000, category: 'decoration', isAvailable: true },
	{ name: 'Trang Trí Sinh Nhật VIP', price: 500000, category: 'decoration', isAvailable: true },
	{ name: 'Hoa Tươi Chúc Mừng', price: 300000, category: 'decoration', isAvailable: true },
	{ name: 'Khăn Lạnh + Nước Suối', price: 15000, category: 'other', isAvailable: true }
] as const;

const promotionSeeds = [
	{
		code: 'WELCOME10',
		type: 'percent',
		value: 10,
		minOrderAmount: 200000,
		maxUsage: 100,
		isActive: true,
		isPublic: true,
		expiresAt: new Date('2026-12-31')
	},
	{
		code: 'VIP20',
		type: 'percent',
		value: 20,
		minOrderAmount: 500000,
		maxUsage: 50,
		isActive: true,
		isPublic: true,
		expiresAt: new Date('2026-12-31')
	},
	{
		code: 'FLAT50K',
		type: 'fixed',
		value: 50000,
		minOrderAmount: 300000,
		maxUsage: 200,
		isActive: true,
		isPublic: true,
		expiresAt: new Date('2026-12-31')
	},
	{
		code: 'BIRTHDAY',
		type: 'percent',
		value: 30,
		minOrderAmount: 0,
		maxUsage: 30,
		isActive: true,
		isPublic: false,
		expiresAt: new Date('2026-12-31')
	}
] as const;

const settingSeeds = [
	{ key: 'site_name', value: 'KaraSystem', group: 'general' },
	{ key: 'site_slogan', value: 'Đẳng Cấp Âm Thanh', group: 'general' },
	{ key: 'site_phone', value: '1900 1000', group: 'general' },
	{ key: 'site_address', value: '123 Nguyễn Huệ, Quận 1, TP.HCM', group: 'general' },
	{ key: 'site_email', value: 'contact@karasystem.vn', group: 'general' },
	{ key: 'site_open_time', value: '08:00', group: 'general' },
	{ key: 'site_close_time', value: '02:00', group: 'general' }
] as const;

async function insertMissingByKey<TItem extends Record<string, unknown>, TExisting extends Record<string, unknown>>(
	db: Database,
	options: {
		table: Parameters<Database['insert']>[0];
		items: readonly TItem[];
		key: keyof TItem & keyof TExisting;
		label: string;
		selectExisting: () => Promise<TExisting[]>;
		toInsert?: (item: TItem) => Record<string, unknown>;
	}
) {
	const existingRows = await options.selectExisting();
	const existingKeys = new Set(existingRows.map((row) => String(row[options.key])));
	const missingItems = options.items.filter((item) => !existingKeys.has(String(item[options.key])));

	if (missingItems.length > 0) {
		await db.insert(options.table).values(missingItems.map((item) => options.toInsert?.(item) ?? item));
	}

	console.log(`Seeded ${missingItems.length} ${options.label} (${existingRows.length} already existed)`);
}

export async function seedDatabase(db: Database) {
	await insertMissingByKey(db, {
		table: branch,
		items: branchSeeds,
		key: 'name',
		label: 'branches',
		selectExisting: () =>
			db.select({ name: branch.name }).from(branch).where(inArray(branch.name, branchSeeds.map((item) => item.name)))
	});

	const allBranches = await db
		.select({ id: branch.id, name: branch.name })
		.from(branch)
		.where(inArray(branch.name, branchSeeds.map((item) => item.name)));
	const branchIds = new Map(allBranches.map((item) => [item.name, item.id]));

	await insertMissingByKey(db, {
		table: room,
		items: roomSeeds,
		key: 'name',
		label: 'rooms',
		selectExisting: () =>
			db.select({ name: room.name }).from(room).where(inArray(room.name, roomSeeds.map((item) => item.name))),
		toInsert: (item) => {
			const branchId = branchIds.get(item.branchName);
			if (!branchId) {
				throw new Error(`Missing branch for seeded room: ${item.branchName}`);
			}

			return {
				name: item.name,
				capacity: item.capacity,
				type: item.type,
				pricePerHour: item.pricePerHour,
				branchId
			};
		}
	});

	await insertMissingByKey(db, {
		table: service,
		items: serviceSeeds,
		key: 'name',
		label: 'services',
		selectExisting: () =>
			db
				.select({ name: service.name })
				.from(service)
				.where(inArray(service.name, serviceSeeds.map((item) => item.name)))
	});

	await insertMissingByKey(db, {
		table: promotion,
		items: promotionSeeds,
		key: 'code',
		label: 'promotions',
		selectExisting: () =>
			db
				.select({ code: promotion.code })
				.from(promotion)
				.where(inArray(promotion.code, promotionSeeds.map((item) => item.code)))
	});

	await insertMissingByKey(db, {
		table: setting,
		items: settingSeeds,
		key: 'key',
		label: 'settings',
		selectExisting: () =>
			db.select({ key: setting.key }).from(setting).where(inArray(setting.key, settingSeeds.map((item) => item.key)))
	});
}
