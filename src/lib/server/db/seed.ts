import { db } from '$lib/server/db';
import { room, service, promotion, branch, setting } from '$lib/server/db/schema';
import { sql } from 'drizzle-orm';

export async function seedDatabase() {
	console.log('🌱 Seeding database...');

	// Branches
	const branches = await db.insert(branch).values([
		{ name: 'KaraSystem Quận 1', address: '123 Nguyễn Huệ, Quận 1, TP.HCM', phone: '028 1234 5678' },
		{ name: 'KaraSystem Quận 7', address: '456 Nguyễn Thị Thập, Quận 7, TP.HCM', phone: '028 8765 4321' },
		{ name: 'KaraSystem Thủ Đức', address: '789 Võ Văn Ngân, TP. Thủ Đức', phone: '028 5555 6666' }
	]).onConflictDoNothing().returning();
	console.log(`✓ ${branches.length} chi nhánh`);

	// Rooms
	const rooms = await db.insert(room).values([
		{ name: 'Phòng Ánh Sao', capacity: 5, type: 'standard', pricePerHour: 150000, branchId: branches[0]?.id },
		{ name: 'Phòng Trăng Vàng', capacity: 5, type: 'standard', pricePerHour: 150000, branchId: branches[0]?.id },
		{ name: 'Phòng Mây Bay', capacity: 8, type: 'standard', pricePerHour: 200000, branchId: branches[0]?.id },
		{ name: 'Phòng Hoàng Hôn', capacity: 10, type: 'vip', pricePerHour: 350000, branchId: branches[0]?.id },
		{ name: 'Phòng Bình Minh', capacity: 12, type: 'vip', pricePerHour: 400000, branchId: branches[1]?.id },
		{ name: 'Phòng Đại Dương', capacity: 15, type: 'vip', pricePerHour: 450000, branchId: branches[1]?.id },
		{ name: 'Phòng Kim Cương', capacity: 20, type: 'super_vip', pricePerHour: 600000, branchId: branches[1]?.id },
		{ name: 'Phòng Hoàng Gia', capacity: 30, type: 'super_vip', pricePerHour: 800000, branchId: branches[2]?.id },
		{ name: 'Phòng Thiên Đường', capacity: 25, type: 'super_vip', pricePerHour: 700000, branchId: branches[2]?.id },
		{ name: 'Phòng Ngân Hà', capacity: 8, type: 'vip', pricePerHour: 380000, branchId: branches[2]?.id }
	]).onConflictDoNothing().returning();
	console.log(`✓ ${rooms.length} phòng`);

	// Services
	const services = await db.insert(service).values([
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
	]).onConflictDoNothing().returning();
	console.log(`✓ ${services.length} dịch vụ`);

	// Promotions
	const promos = await db.insert(promotion).values([
		{ code: 'WELCOME10', type: 'percent', value: 10, minOrderAmount: 200000, maxUsage: 100, isActive: true, isPublic: true, expiresAt: new Date('2026-12-31') },
		{ code: 'VIP20', type: 'percent', value: 20, minOrderAmount: 500000, maxUsage: 50, isActive: true, isPublic: true, expiresAt: new Date('2026-12-31') },
		{ code: 'FLAT50K', type: 'fixed', value: 50000, minOrderAmount: 300000, maxUsage: 200, isActive: true, isPublic: true, expiresAt: new Date('2026-12-31') },
		{ code: 'BIRTHDAY', type: 'percent', value: 30, minOrderAmount: 0, maxUsage: 30, isActive: true, isPublic: false, expiresAt: new Date('2026-12-31') }
	]).onConflictDoNothing().returning();
	console.log(`✓ ${promos.length} khuyến mãi`);

	// Settings
	await db.insert(setting).values([
		{ key: 'site_name', value: 'KaraSystem', group: 'general' },
		{ key: 'site_slogan', value: 'Đẳng Cấp Âm Thanh', group: 'general' },
		{ key: 'site_phone', value: '1900 1000', group: 'general' },
		{ key: 'site_address', value: '123 Nguyễn Huệ, Quận 1, TP.HCM', group: 'general' },
		{ key: 'site_email', value: 'contact@karasystem.vn', group: 'general' },
		{ key: 'site_open_time', value: '08:00', group: 'general' },
		{ key: 'site_close_time', value: '02:00', group: 'general' }
	]).onConflictDoNothing();
	console.log('✓ Cài đặt hệ thống');

	console.log('🎉 Seed hoàn tất!');
}
