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

	const navItems = [
		{ label: 'Tổng Quan', href: '/admin', icon: 'solar:pie-chart-2-line-duotone', iconActive: 'solar:pie-chart-2-bold-duotone', exact: true },
		{ label: 'Lịch Đặt Phòng', href: '/admin/bookings', icon: 'solar:ticket-line-duotone', iconActive: 'solar:ticket-bold-duotone' },
		{ label: 'Hệ Thống Phòng', href: '/admin/rooms', icon: 'solar:home-smile-angle-line-duotone', iconActive: 'solar:home-smile-angle-bold-duotone' },
		{ label: 'Menu Dịch Vụ', href: '/admin/services', icon: 'solar:wineglass-triangle-line-duotone', iconActive: 'solar:wineglass-triangle-bold-duotone' },
		{ label: 'Khuyến Mãi', href: '/admin/promotions', icon: 'solar:tag-price-line-duotone', iconActive: 'solar:tag-price-bold-duotone' }
	];

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
		<button class="fixed inset-0 bg-black/40 z-40 lg:hidden" onclick={() => sidebarOpen = false}></button>
	{/if}

	<aside class="fixed lg:sticky top-0 left-0 z-50 h-screen flex flex-col bg-base-100 border-r border-base-300/80 transition-all duration-300
		{sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
		{sidebarCollapsed ? 'w-[72px]' : 'w-64'}">

		<div class="h-16 flex items-center px-4 border-b border-base-200 shrink-0 {sidebarCollapsed ? 'justify-center' : 'gap-3'}">
			{#if !sidebarCollapsed}
				<a href="/" class="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
					<Icon icon="solar:microphone-3-line-duotone" class="text-primary text-2xl shrink-0" />
					<span class="text-lg font-black uppercase tracking-[0.1em] leading-none">KARA<span class="text-primary">SYSTEM</span></span>
				</a>
			{:else}
				<a href="/" class="hover:opacity-80 transition-opacity">
					<Icon icon="solar:microphone-3-line-duotone" class="text-primary text-2xl" />
				</a>
			{/if}
		</div>

		<nav class="flex-1 overflow-y-auto py-4 px-3">
			{#if !sidebarCollapsed}
				<p class="text-[10px] font-bold tracking-[0.2em] uppercase text-base-content/30 px-3 mb-2">Điều Hành</p>
			{/if}
			<div class="flex flex-col gap-1">
				{#each navItems as item}
					{@const active = isActive(item.href, item.exact)}
					<a
						href={item.href}
						onclick={() => sidebarOpen = false}
						class="flex items-center gap-3 px-3 h-10 rounded-lg text-[13px] font-medium transition-all duration-200
							{sidebarCollapsed ? 'justify-center' : ''}
							{active
								? 'bg-primary/10 text-primary font-semibold'
								: 'text-base-content/50 hover:text-base-content hover:bg-base-200/60'}"
						title={sidebarCollapsed ? item.label : ''}
					>
						<Icon icon={active ? item.iconActive : item.icon} class="text-xl shrink-0" />
						{#if !sidebarCollapsed}
							<span>{item.label}</span>
						{/if}
						{#if active && !sidebarCollapsed}
							<span class="ml-auto w-1.5 h-1.5 rounded-full bg-primary"></span>
						{/if}
					</a>
				{/each}
			</div>
		</nav>

		<div class="border-t border-base-200 p-3 shrink-0">
			{#if !sidebarCollapsed}
				<a href="/" class="flex items-center gap-3 px-3 h-10 rounded-lg text-[13px] font-medium text-base-content/50 hover:text-base-content hover:bg-base-200/60 transition-colors mb-1">
					<Icon icon="solar:arrow-left-line-duotone" class="text-xl" />
					Về Trang Chủ
				</a>
			{/if}
			<button onclick={() => sidebarCollapsed = !sidebarCollapsed} class="hidden lg:flex items-center gap-3 px-3 h-10 rounded-lg text-[13px] font-medium text-base-content/30 hover:text-base-content/60 hover:bg-base-200/40 transition-colors w-full {sidebarCollapsed ? 'justify-center' : ''}">
				<Icon icon={sidebarCollapsed ? 'solar:arrow-right-line-duotone' : 'solar:arrow-left-line-duotone'} class="text-lg" />
				{#if !sidebarCollapsed}<span>Thu Gọn</span>{/if}
			</button>
		</div>
	</aside>

	<div class="flex-1 flex flex-col min-h-screen min-w-0">
		<header class="lg:hidden h-16 bg-base-100 border-b border-base-200 flex items-center justify-between px-4 sticky top-0 z-30 shrink-0">
			<a href="/admin" class="flex items-center gap-2">
				<Icon icon="solar:microphone-3-line-duotone" class="text-primary text-xl" />
				<span class="text-xs font-black uppercase tracking-[0.1em]">KARA<span class="text-primary">ADMIN</span></span>
			</a>
			<button onclick={() => sidebarOpen = true} class="btn btn-ghost btn-sm btn-square rounded-lg">
				<Icon icon="solar:hamburger-menu-line-duotone" class="text-2xl text-base-content/70" />
			</button>
		</header>
		<main class="flex-1 px-4 lg:px-8 py-6">
			{@render children()}
		</main>
	</div>
</div>
