<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import Icon from '@iconify/svelte';
	import { signOut } from '$lib/auth-client';
	import Toast from '$lib/components/Toast.svelte';
	import { addToast } from '$lib/stores/toast';
	import { trpc } from '$lib/trpc/client';

	let { children } = $props();

	let user = $derived($page.data.user);
	let mobileMenuOpen = $state(false);
	let userMenuOpen = $state(false);
	let isAdminRoute = $derived(String($page.url.pathname).startsWith('/admin'));

	let siteSettings = $state<Record<string, string>>({
		site_name: 'KaraSystem',
		site_slogan: 'Đẳng cấp âm thanh',
		site_phone: '1900 1000',
		site_address: '123 Premium Street, District 1',
		site_email: 'contact@karasystem.vn'
	});

	async function refreshSiteSettings() {
		try {
			siteSettings = await trpc().setting.getPublic.query();
		} catch {}
	}

	$effect(() => {
		if (!isAdminRoute) {
			refreshSiteSettings();
		}
	});

	$effect(() => {
		const handleSettingsUpdated = () => {
			refreshSiteSettings();
		};
		window.addEventListener('site-settings-updated', handleSettingsUpdated);
		return () => {
			window.removeEventListener('site-settings-updated', handleSettingsUpdated);
		};
	});

	const navigation = [
		{
			name: 'Trang Chủ',
			href: '/',
			icon: 'solar:home-2-line-duotone',
			iconActive: 'solar:home-2-bold-duotone'
		},
		{
			name: 'Phòng Hát',
			href: '/rooms',
			icon: 'solar:soundwave-circle-line-duotone',
			iconActive: 'solar:soundwave-circle-bold-duotone'
		},
		{
			name: 'Dịch Vụ',
			href: '/services',
			icon: 'solar:cup-hot-line-duotone',
			iconActive: 'solar:cup-hot-bold-duotone'
		},
		{
			name: 'Ưu Đãi',
			href: '/promotions',
			icon: 'solar:tag-price-line-duotone',
			iconActive: 'solar:tag-price-bold-duotone'
		},
		{
			name: 'Liên Hệ',
			href: '/contact',
			icon: 'solar:chat-round-dots-line-duotone',
			iconActive: 'solar:chat-round-dots-bold-duotone'
		}
	];

	function isActive(href: string) {
		const path = String($page.url.pathname);
		if (href === '/') return path === '/';
		return path.startsWith(href);
	}

	function closeMobileMenu() {
		mobileMenuOpen = false;
	}

	function toggleUserMenu() {
		userMenuOpen = !userMenuOpen;
	}

	async function handleLogout() {
		userMenuOpen = false;
		mobileMenuOpen = false;
		await signOut();
		addToast('Hẹn gặp lại bạn!', 'info');
		await goto('/login', { invalidateAll: true });
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>KaraSystem | Hệ Thống Phòng Hát Cao Cấp</title>
</svelte:head>

<svelte:window
	onclick={() => {
		if (userMenuOpen) userMenuOpen = false;
	}}
/>

<Toast />

<div class="flex min-h-screen flex-col bg-base-200 font-sans">
	{#if !isAdminRoute}
		<div
			class="hidden bg-neutral text-[10px] font-semibold tracking-[0.2em] text-neutral-content/70 uppercase lg:block"
		>
			<div class="mx-auto flex h-9 max-w-7xl items-center justify-between px-8">
				<div class="flex items-center gap-8">
					<a
						href="tel:{siteSettings.site_phone?.replace(/\s/g, '')}"
						class="flex items-center gap-1.5 transition-colors hover:text-white"
					>
						<Icon icon="solar:phone-calling-line-duotone" class="text-sm" />
						{siteSettings.site_phone}
					</a>
					<span class="flex items-center gap-1.5 text-neutral-content/40">
						<Icon icon="solar:map-point-wave-line-duotone" class="text-sm" />
						{siteSettings.site_address}
					</span>
				</div>
				<div class="flex items-center gap-6">
					<span class="flex items-center gap-1.5 text-primary">
						<Icon icon="solar:clock-circle-line-duotone" class="text-sm" />
						Mở cửa: {siteSettings.site_open_time || '08:00'} — {siteSettings.site_close_time ||
							'02:00'}
					</span>
				</div>
			</div>
		</div>

		<header class="sticky top-0 z-50 border-b border-base-300/80 bg-base-100/95 backdrop-blur-lg">
			<div
				class="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 lg:h-[72px] lg:px-8"
			>
				<a href="/" class="flex shrink-0 items-center gap-2.5 transition-opacity hover:opacity-80">
					<Icon icon="solar:microphone-3-line-duotone" class="text-3xl text-primary lg:text-4xl" />
					<div class="flex flex-col">
						<span class="text-lg leading-none font-black tracking-[0.12em] uppercase lg:text-xl"
							>KARA<span class="text-primary">SYSTEM</span></span
						>
						<span
							class="mt-0.5 hidden text-[8px] font-medium tracking-[0.25em] text-base-content/40 uppercase sm:block"
							>Đẳng cấp âm thanh</span
						>
					</div>
				</a>

				<nav class="hidden items-center gap-1 lg:flex">
					{#each navigation as item}
						<a
							href={item.href}
							class="relative rounded-lg px-4 py-2 text-[13px] font-semibold tracking-wide transition-all duration-200
								{isActive(item.href)
								? 'text-primary'
								: 'text-base-content/50 hover:bg-base-200/60 hover:text-base-content'}"
						>
							{item.name}
							{#if isActive(item.href)}
								<span
									class="absolute bottom-0 left-1/2 h-0.5 w-5 -translate-x-1/2 rounded-full bg-primary"
								></span>
							{/if}
						</a>
					{/each}
				</nav>

				<div class="flex shrink-0 items-center gap-2">
					{#if user}
						{#if ['admin', 'manager', 'staff'].includes(user.role)}
							<a
								href="/admin"
								class="hidden items-center gap-1.5 rounded-lg bg-primary/8 px-3.5 py-2 text-[11px] font-bold tracking-widest text-primary uppercase transition-colors hover:bg-primary/15 md:flex"
							>
								<Icon icon="solar:pie-chart-2-bold-duotone" class="text-sm" />
								{user.role === 'admin'
									? 'Admin'
									: user.role === 'manager'
										? 'Quản Lý'
										: 'Nhân Viên'}
							</a>
						{/if}
						<div class="relative">
							<button
								onclick={(e) => {
									e.stopPropagation();
									toggleUserMenu();
								}}
								class="flex items-center gap-2 rounded-lg px-3 py-1.5 transition-colors hover:bg-base-200/60"
							>
								<div class="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
									<Icon icon="solar:user-bold-duotone" class="text-lg text-primary" />
								</div>
								<span
									class="hidden max-w-[120px] truncate text-sm font-semibold text-base-content/70 md:block"
									>{user.name}</span
								>
								<Icon
									icon="solar:alt-arrow-down-line-duotone"
									class="hidden text-xs text-base-content/40 md:block"
								/>
							</button>
							{#if userMenuOpen}
								<div
									class="absolute top-full right-0 z-60 mt-2 w-56 rounded-xl border border-base-300 bg-base-100 py-2 shadow-xl"
								>
									<div class="border-b border-base-200 px-4 py-3">
										<p class="truncate text-sm font-bold">{user.name}</p>
										<p class="truncate text-xs text-base-content/50">{user.email}</p>
									</div>
									<a
										href="/profile"
										onclick={() => (userMenuOpen = false)}
										class="flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-base-200/60"
									>
										<Icon
											icon="solar:user-circle-line-duotone"
											class="text-lg text-base-content/50"
										/>
										Hồ Sơ Cá Nhân
									</a>
									<a
										href="/my-bookings"
										onclick={() => (userMenuOpen = false)}
										class="flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-base-200/60"
									>
										<Icon icon="solar:ticket-line-duotone" class="text-lg text-base-content/50" />
										Lịch Sử Đặt Phòng
									</a>
									{#if ['admin', 'manager', 'staff'].includes(user.role)}
										<a
											href="/admin"
											onclick={() => (userMenuOpen = false)}
											class="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-primary/5"
										>
											<Icon icon="solar:pie-chart-2-bold-duotone" class="text-lg" />
											Khu Vực Quản Trị
										</a>
									{/if}
									<div class="mt-1 border-t border-base-200 pt-1">
										<button
											onclick={handleLogout}
											class="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-error transition-colors hover:bg-error/5"
										>
											<Icon icon="solar:logout-2-line-duotone" class="text-lg" />
											Đăng Xuất
										</button>
									</div>
								</div>
							{/if}
						</div>
					{:else}
						<a
							href="/login"
							class="hidden rounded-lg px-3 py-2 text-sm font-semibold text-base-content/60 transition-colors hover:text-base-content md:block"
						>
							Đăng Nhập
						</a>
						<a
							href="/register"
							class="btn h-9 rounded-lg px-5 text-xs font-bold tracking-wider btn-sm btn-primary"
						>
							Đăng Ký
						</a>
					{/if}

					<button
						onclick={() => (mobileMenuOpen = !mobileMenuOpen)}
						class="btn btn-square rounded-lg btn-ghost btn-sm lg:hidden"
					>
						<Icon
							icon={mobileMenuOpen
								? 'solar:close-circle-line-duotone'
								: 'solar:hamburger-menu-line-duotone'}
							class="text-xl"
						/>
					</button>
				</div>
			</div>

			{#if mobileMenuOpen}
				<div
					class="animate-[slideDown_0.2s_ease-out] border-t border-base-200 bg-base-100 lg:hidden"
				>
					<div class="flex flex-col gap-1 px-4 py-3">
						{#each navigation as item}
							<a
								href={item.href}
								onclick={closeMobileMenu}
								class="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold transition-colors
									{isActive(item.href) ? 'bg-primary/8 text-primary' : 'text-base-content/60 hover:bg-base-200/60'}"
							>
								<Icon icon={isActive(item.href) ? item.iconActive : item.icon} class="text-xl" />
								{item.name}
							</a>
						{/each}

						{#if user}
							<div class="mt-2 border-t border-base-200 pt-2">
								<div class="flex items-center gap-3 px-4 py-3">
									<div class="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
										<Icon icon="solar:user-bold-duotone" class="text-primary" />
									</div>
									<div class="min-w-0 flex-1">
										<p class="truncate text-sm font-bold">{user.name}</p>
										<p class="truncate text-xs text-base-content/40">{user.email}</p>
									</div>
								</div>
								{#if user.role === 'admin'}
									<a
										href="/admin"
										onclick={closeMobileMenu}
										class="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary/5"
									>
										<Icon icon="solar:pie-chart-2-bold-duotone" class="text-xl" />
										Khu Vực Quản Trị
									</a>
								{/if}
								<button
									onclick={handleLogout}
									class="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold text-error transition-colors hover:bg-error/5"
								>
									<Icon icon="solar:logout-2-line-duotone" class="text-xl" />
									Đăng Xuất
								</button>
							</div>
						{:else}
							<div class="mt-2 flex gap-2 border-t border-base-200 px-4 pt-3 pb-2">
								<a
									href="/login"
									onclick={closeMobileMenu}
									class="btn flex-1 rounded-lg text-xs font-bold tracking-wider btn-ghost btn-sm"
									>Đăng Nhập</a
								>
								<a
									href="/register"
									onclick={closeMobileMenu}
									class="btn flex-1 rounded-lg text-xs font-bold tracking-wider btn-sm btn-primary"
									>Đăng Ký</a
								>
							</div>
						{/if}
					</div>
				</div>
			{/if}
		</header>

		<main class="mx-auto w-full max-w-7xl flex-1 p-4 pb-24 lg:p-8 lg:pb-8">
			{@render children()}
		</main>

		<footer class="mt-auto hidden border-t border-base-200 bg-base-100 lg:block">
			<div class="mx-auto w-full max-w-7xl px-8 py-16">
				<div class="grid grid-cols-4 gap-10">
					<div class="flex flex-col gap-5">
						<a href="/" class="flex items-center gap-2 transition-opacity hover:opacity-80">
							<Icon icon="solar:microphone-3-line-duotone" class="text-3xl text-primary" />
							<div class="flex flex-col">
								<span class="text-lg leading-none font-black tracking-[0.12em] uppercase"
									>KARA<span class="text-primary">SYSTEM</span></span
								>
								<span
									class="mt-0.5 text-[8px] font-medium tracking-[0.25em] text-base-content/40 uppercase"
									>{siteSettings.site_slogan}</span
								>
							</div>
						</a>
						<p class="pr-4 text-[13px] leading-relaxed text-base-content/50">
							{siteSettings.site_address} • {siteSettings.site_phone}
						</p>
						<div class="flex items-center gap-3">
							<a
								href="/"
								class="flex h-9 w-9 items-center justify-center rounded-lg bg-base-200 text-base-content/40 transition-colors hover:bg-primary/10 hover:text-primary"
								><Icon icon="solar:map-point-wave-line-duotone" class="text-lg" /></a
							>
							<a
								href="/"
								class="flex h-9 w-9 items-center justify-center rounded-lg bg-base-200 text-base-content/40 transition-colors hover:bg-primary/10 hover:text-primary"
								><Icon icon="solar:phone-calling-line-duotone" class="text-lg" /></a
							>
							<a
								href="/"
								class="flex h-9 w-9 items-center justify-center rounded-lg bg-base-200 text-base-content/40 transition-colors hover:bg-primary/10 hover:text-primary"
								><Icon icon="solar:letter-line-duotone" class="text-lg" /></a
							>
						</div>
					</div>
					<div>
						<h6 class="mb-5 text-xs font-bold tracking-widest text-base-content uppercase">
							Dịch Vụ
						</h6>
						<ul class="flex flex-col gap-3 text-[13px] font-medium text-base-content/50">
							<li>
								<a href="/rooms" class="transition-colors hover:text-primary"
									>Phòng Hát Tiêu Chuẩn</a
								>
							</li>
							<li>
								<a href="/rooms" class="transition-colors hover:text-primary"
									>Phòng Hội Nghị / Party</a
								>
							</li>
							<li>
								<a href="/services" class="transition-colors hover:text-primary">Dịch Vụ Ẩm Thực</a>
							</li>
							<li>
								<a href="/services" class="transition-colors hover:text-primary"
									>Trang Trí Sự Kiện</a
								>
							</li>
						</ul>
					</div>
					<div>
						<h6 class="mb-5 text-xs font-bold tracking-widest text-base-content uppercase">
							Công Ty
						</h6>
						<ul class="flex flex-col gap-3 text-[13px] font-medium text-base-content/50">
							<li><a href="/" class="transition-colors hover:text-primary">Về Chúng Tôi</a></li>
							<li><a href="/" class="transition-colors hover:text-primary">Tuyển Dụng</a></li>
							<li>
								<a href="/" class="transition-colors hover:text-primary">Tin Tức Khuyến Mãi</a>
							</li>
							<li><a href="/" class="transition-colors hover:text-primary">Liên Hệ Đặt Lịch</a></li>
						</ul>
					</div>
					<div>
						<h6 class="mb-5 text-xs font-bold tracking-widest text-base-content uppercase">
							Hỗ Trợ
						</h6>
						<ul class="flex flex-col gap-3 text-[13px] font-medium text-base-content/50">
							<li>
								<a href="/" class="transition-colors hover:text-primary">Điều Khoản Sử Dụng</a>
							</li>
							<li>
								<a href="/" class="transition-colors hover:text-primary">Chính Sách Bảo Mật</a>
							</li>
							<li>
								<a href="/" class="transition-colors hover:text-primary">Chính Sách Hoàn Tiền</a>
							</li>
							<li>
								<a href="/" class="transition-colors hover:text-primary">Trung Tâm Trợ Giúp</a>
							</li>
						</ul>
					</div>
				</div>
			</div>
			<div class="border-t border-base-200">
				<div class="mx-auto flex max-w-7xl items-center justify-between px-8 py-5">
					<span class="text-xs font-medium tracking-wide text-base-content/40">
						© 2026 KaraSystem. All rights reserved.
					</span>
					<div
						class="flex gap-6 text-[11px] font-semibold tracking-widest text-base-content/30 uppercase"
					>
						<a href="/" class="transition-colors hover:text-primary">Báo Lỗi</a>
						<a href="/" class="transition-colors hover:text-primary">Hỗ Trợ 24/7</a>
					</div>
				</div>
			</div>
		</footer>

		<nav
			class="safe-area-bottom fixed right-0 bottom-0 left-0 z-50 border-t border-base-300/80 bg-base-100/95 backdrop-blur-lg lg:hidden"
		>
			<div class="flex h-16 items-center justify-around px-2">
				{#each navigation as item}
					<a
						href={item.href}
						class="flex min-w-[60px] flex-col items-center gap-0.5 rounded-xl px-3 py-1 transition-colors
							{isActive(item.href) ? 'text-primary' : 'text-base-content/40 active:text-base-content/60'}"
					>
						<Icon icon={isActive(item.href) ? item.iconActive : item.icon} class="text-xl" />
						<span class="text-[10px] font-semibold tracking-wide">{item.name}</span>
						{#if isActive(item.href)}
							<span class="-mt-0.5 h-1 w-1 rounded-full bg-primary"></span>
						{/if}
					</a>
				{/each}
				{#if user}
					<button
						onclick={(e) => {
							e.stopPropagation();
							toggleUserMenu();
						}}
						class="flex min-w-[60px] flex-col items-center gap-0.5 rounded-xl px-3 py-1 text-base-content/40"
					>
						<div class="flex h-6 w-6 items-center justify-center rounded-full bg-primary/15">
							<Icon icon="solar:user-bold-duotone" class="text-sm text-primary" />
						</div>
						<span class="text-[10px] font-semibold tracking-wide">Tôi</span>
					</button>
				{:else}
					<a
						href="/login"
						class="flex min-w-[60px] flex-col items-center gap-0.5 rounded-xl px-3 py-1 text-base-content/40"
					>
						<Icon icon="solar:login-2-line-duotone" class="text-xl" />
						<span class="text-[10px] font-semibold tracking-wide">Đăng Nhập</span>
					</a>
				{/if}
			</div>
		</nav>
	{:else}
		{@render children()}
	{/if}
</div>

<style>
	@keyframes slideDown {
		from {
			opacity: 0;
			transform: translateY(-8px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
	.safe-area-bottom {
		padding-bottom: env(safe-area-inset-bottom, 0px);
	}
</style>
