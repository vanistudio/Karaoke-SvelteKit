/**
 * RBAC Permission System
 * Roles: admin > manager > staff > user > banned
 * Each role has a set of permissions
 */

export const ROLES = ['admin', 'manager', 'staff', 'user', 'banned'] as const;
export type Role = (typeof ROLES)[number];

export const PERMISSIONS = {
	// Dashboard
	'dashboard:view': ['admin', 'manager'],
	'dashboard:analytics': ['admin'],

	// Bookings
	'booking:create': ['admin', 'manager', 'staff', 'user'],
	'booking:view_all': ['admin', 'manager', 'staff'],
	'booking:view_own': ['admin', 'manager', 'staff', 'user'],
	'booking:approve': ['admin', 'manager'],
	'booking:cancel_any': ['admin', 'manager'],
	'booking:cancel_own': ['admin', 'manager', 'staff', 'user'],
	'booking:checkin': ['admin', 'manager', 'staff'],

	// Rooms
	'room:view': ['admin', 'manager', 'staff', 'user'],
	'room:create': ['admin', 'manager'],
	'room:update': ['admin', 'manager'],
	'room:delete': ['admin'],

	// Services
	'service:view': ['admin', 'manager', 'staff', 'user'],
	'service:create': ['admin', 'manager'],
	'service:update': ['admin', 'manager'],
	'service:delete': ['admin'],

	// Promotions
	'promotion:view': ['admin', 'manager'],
	'promotion:create': ['admin', 'manager'],
	'promotion:update': ['admin', 'manager'],
	'promotion:delete': ['admin'],

	// Users
	'user:view': ['admin', 'manager'],
	'user:update_role': ['admin'],
	'user:ban': ['admin'],

	// Reviews
	'review:create': ['admin', 'manager', 'staff', 'user'],
	'review:view_all': ['admin', 'manager'],
	'review:delete': ['admin'],

	// Pricing
	'pricing:view': ['admin', 'manager'],
	'pricing:manage': ['admin'],

	// Settings
	'setting:view': ['admin'],
	'setting:update': ['admin'],

	// Activity Log
	'activity:view': ['admin', 'manager'],

	// Branches
	'branch:view': ['admin', 'manager', 'staff'],
	'branch:manage': ['admin'],

	// Calendar
	'calendar:view': ['admin', 'manager', 'staff'],

	// Reports / Export
	'report:export': ['admin', 'manager']
} as const;

export type Permission = keyof typeof PERMISSIONS;

export function hasPermission(role: string, permission: Permission): boolean {
	if (role === 'banned') return false;
	const allowedRoles = PERMISSIONS[permission];
	if (!allowedRoles) return false;
	return (allowedRoles as readonly string[]).includes(role);
}

export function hasAnyPermission(role: string, permissions: Permission[]): boolean {
	return permissions.some(p => hasPermission(role, p));
}

export function getRoleLevel(role: string): number {
	const levels: Record<string, number> = { admin: 100, manager: 75, staff: 50, user: 25, banned: 0 };
	return levels[role] ?? 0;
}

export function getRoleLabel(role: string): string {
	const labels: Record<string, string> = {
		admin: 'Quản Trị Viên',
		manager: 'Quản Lý',
		staff: 'Nhân Viên',
		user: 'Thành Viên',
		banned: 'Đã Khóa'
	};
	return labels[role] ?? role;
}
