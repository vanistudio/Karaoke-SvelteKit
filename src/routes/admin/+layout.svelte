<script lang="ts">
	import Icon from '@iconify/svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { signOut } from '$lib/auth-client';
	import { addToast } from '$lib/stores/toast';
	let { children } = $props();

	let user = $derived($page.data.user);
	let sidebarOpen = $state(false);
	let sidebarCollapsed = $state(false);

	const allNavItems = [
		{
			label: 'Tổng Quan',
			href: '/admin',
			icon: 'solar:pie-chart-2-line-duotone',
			iconActive: 'solar:pie-chart-2-bold-duotone',
			exact: true,
			roles: ['admin', 'manager']
		},
		{
			label: 'Lịch Đặt Phòng',
			href: '/admin/bookings',
			icon: 'solar:ticket-line-duotone',
			iconActive: 'solar:ticket-bold-duotone',
			roles: ['admin', 'manager', 'staff']
		},
		{
			label: 'Lịch Phòng',
			href: '/admin/calendar',
			icon: 'solar:calendar-line-duotone',
			iconActive: 'solar:calendar-bold-duotone',
			roles: ['admin', 'manager', 'staff']
		},
		{
			label: 'Hệ Thống Phòng',
			href: '/admin/rooms',
			icon: 'solar:home-smile-angle-line-duotone',
			iconActive: 'solar:home-smile-angle-bold-duotone',
			roles: ['admin', 'manager']
		},
		{
			label: 'Menu Dịch Vụ',
			href: '/admin/services',
			icon: 'solar:wineglass-triangle-line-duotone',
			iconActive: 'solar:wineglass-triangle-bold-duotone',
			roles: ['admin', 'manager']
		},
		{
			label: 'Khuyến Mãi',
			href: '/admin/promotions',
			icon: 'solar:tag-price-line-duotone',
			iconActive: 'solar:tag-price-bold-duotone',
			roles: ['admin', 'manager']
		},
		{
			label: 'Thành Viên',
			href: '/admin/users',
			icon: 'solar:users-group-two-rounded-line-duotone',
			iconActive: 'solar:users-group-two-rounded-bold-duotone',
			roles: ['admin']
		},
		{
			label: 'Đánh Giá',
			href: '/admin/reviews',
			icon: 'solar:star-line-duotone',
			iconActive: 'solar:star-bold-duotone',
			roles: ['admin', 'manager']
		},
		{
			label: 'Bảng Giá',
			href: '/admin/pricing',
			icon: 'solar:dollar-minimalistic-line-duotone',
			iconActive: 'solar:dollar-minimalistic-bold-duotone',
			roles: ['admin']
		},
		{
			label: 'Chi Nhánh',
			href: '/admin/branches',
			icon: 'solar:buildings-line-duotone',
			iconActive: 'solar:buildings-bold-duotone',
			roles: ['admin']
		},
		{
			label: 'Nhật Ký',
			href: '/admin/activity',
			icon: 'solar:history-line-duotone',
			iconActive: 'solar:history-bold-duotone',
			roles: ['admin', 'manager']
		},
		{
			label: 'Cài Đặt',
			href: '/admin/settings',
			icon: 'solar:settings-line-duotone',
			iconActive: 'solar:settings-bold-duotone',
			roles: ['admin']
		}
	];

	let navItems = $derived(allNavItems.filter((item) => item.roles.includes(user?.role ?? '')));

	function isActive(href: string, exact = false) {
		const path = String($page.url.pathname);
		if (exact) return path === href;
		return path.startsWith(href);
	}

	async function handleLogout() {
		await signOut();
		addToast('Đăng xuất phiên quản trị.', 'info');
		await goto('/login', { invalidateAll: true });
	}
</script>

<div class="flex min-h-screen bg-base-200 font-sans">
	{#if sidebarOpen}
		<button
			class="fixed inset-0 z-40 bg-black/40 lg:hidden"
			aria-label="Đóng thanh điều hướng"
			onclick={() => (sidebarOpen = false)}
		></button>
	{/if}

	<aside
		class="fixed top-0 left-0 z-50 flex h-screen flex-col border-r border-base-300/80 bg-base-100 transition-all duration-300 lg:sticky
		{sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
		{sidebarCollapsed ? 'w-[72px]' : 'w-64'}"
	>
		<div
			class="flex h-16 shrink-0 items-center border-b border-base-200 px-4 {sidebarCollapsed
				? 'justify-center'
				: 'gap-3'}"
		>
			{#if !sidebarCollapsed}
				<a href="/" class="flex items-center gap-2.5 transition-opacity hover:opacity-80">
					<Icon icon="solar:microphone-3-line-duotone" class="shrink-0 text-2xl text-primary" />
					<span class="text-lg leading-none font-black tracking-[0.1em] uppercase"
						>KARA<span class="text-primary">SYSTEM</span></span
					>
				</a>
			{:else}
				<a href="/" class="transition-opacity hover:opacity-80">
					<Icon icon="solar:microphone-3-line-duotone" class="text-2xl text-primary" />
				</a>
			{/if}
		</div>

		<nav class="flex-1 overflow-y-auto px-3 py-4">
			{#if !sidebarCollapsed}
				<p class="mb-2 px-3 text-[10px] font-bold tracking-[0.2em] text-base-content/30 uppercase">
					Điều Hành
				</p>
			{/if}
			<div class="flex flex-col gap-1">
				{#each navItems as item}
					{@const active = isActive(item.href, item.exact)}
					<a
						href={item.href}
						onclick={() => (sidebarOpen = false)}
						class="flex h-10 items-center gap-3 rounded-lg px-3 text-[13px] font-medium transition-all duration-200
							{sidebarCollapsed ? 'justify-center' : ''}
							{active
							? 'bg-primary/10 font-semibold text-primary'
							: 'text-base-content/50 hover:bg-base-200/60 hover:text-base-content'}"
						title={sidebarCollapsed ? item.label : ''}
					>
						<Icon icon={active ? item.iconActive : item.icon} class="shrink-0 text-xl" />
						{#if !sidebarCollapsed}
							<span>{item.label}</span>
						{/if}
						{#if active && !sidebarCollapsed}
							<span class="ml-auto h-1.5 w-1.5 rounded-full bg-primary"></span>
						{/if}
					</a>
				{/each}
			</div>
		</nav>

		<div class="shrink-0 border-t border-base-200 p-3">
			{#if !sidebarCollapsed}
				<a
					href="/"
					class="mb-1 flex h-10 items-center gap-3 rounded-lg px-3 text-[13px] font-medium text-base-content/50 transition-colors hover:bg-base-200/60 hover:text-base-content"
				>
					<Icon icon="solar:arrow-left-line-duotone" class="text-xl" />
					Về Trang Chủ
				</a>
			{/if}
			<button
				onclick={() => (sidebarCollapsed = !sidebarCollapsed)}
				aria-label={sidebarCollapsed ? 'Mở rộng thanh điều hướng' : 'Thu gọn thanh điều hướng'}
				class="hidden h-10 w-full items-center gap-3 rounded-lg px-3 text-[13px] font-medium text-base-content/30 transition-colors hover:bg-base-200/40 hover:text-base-content/60 lg:flex {sidebarCollapsed
					? 'justify-center'
					: ''}"
			>
				<Icon
					icon={sidebarCollapsed
						? 'solar:arrow-right-line-duotone'
						: 'solar:arrow-left-line-duotone'}
					class="text-lg"
				/>
				{#if !sidebarCollapsed}<span>Thu Gọn</span>{/if}
			</button>
		</div>
	</aside>

	<div class="flex min-h-screen min-w-0 flex-1 flex-col">
		<header
			class="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-base-200 bg-base-100 px-4 lg:hidden"
		>
			<a href="/admin" class="flex items-center gap-2">
				<Icon icon="solar:microphone-3-line-duotone" class="text-xl text-primary" />
				<span class="text-xs font-black tracking-[0.1em] uppercase"
					>KARA<span class="text-primary">ADMIN</span></span
				>
			</a>
			<button
				onclick={() => (sidebarOpen = true)}
				aria-label="Mở thanh điều hướng"
				class="btn btn-square rounded-lg btn-ghost btn-sm"
			>
				<Icon icon="solar:hamburger-menu-line-duotone" class="text-2xl text-base-content/70" />
			</button>
		</header>
		<main class="flex-1 px-4 py-6 lg:px-8">
			{@render children()}
		</main>
	</div>
</div>
