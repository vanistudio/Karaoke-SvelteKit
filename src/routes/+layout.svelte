<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import Icon from '@iconify/svelte';
	import { signOut } from '$lib/auth-client';
	import Toast from '$lib/components/Toast.svelte';
	import { addToast } from '$lib/stores/toast';

	let { children } = $props();

	let user = $derived($page.data.user);
	let mobileMenuOpen = $state(false);
	let userMenuOpen = $state(false);
	let isAdminRoute = $derived(String($page.url.pathname).startsWith('/admin'));

	const navigation = [
		{ name: 'Trang Chủ', href: '/', icon: 'solar:home-2-line-duotone', iconActive: 'solar:home-2-bold-duotone' },
		{ name: 'Phòng Hát', href: '/rooms', icon: 'solar:soundwave-circle-line-duotone', iconActive: 'solar:soundwave-circle-bold-duotone' },
		{ name: 'Dịch Vụ', href: '/services', icon: 'solar:cup-hot-line-duotone', iconActive: 'solar:cup-hot-bold-duotone' },
		{ name: 'Đặt Chỗ', href: '/my-bookings', icon: 'solar:ticket-line-duotone', iconActive: 'solar:ticket-bold-duotone' }
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

<svelte:window onclick={() => { if (userMenuOpen) userMenuOpen = false; }} />

<Toast />

<div class="flex flex-col min-h-screen bg-base-200 font-sans">
	<div class="hidden lg:block bg-neutral text-neutral-content/70 text-[10px] tracking-[0.2em] uppercase font-semibold">
		<div class="max-w-7xl mx-auto px-8 h-9 flex items-center justify-between">
			<div class="flex items-center gap-8">
				<a href="tel:19001000" class="flex items-center gap-1.5 hover:text-white transition-colors">
					<Icon icon="solar:phone-calling-line-duotone" class="text-sm" />
					1900 1000
				</a>
				<span class="flex items-center gap-1.5 text-neutral-content/40">
					<Icon icon="solar:map-point-wave-line-duotone" class="text-sm" />
					123 Premium Street, District 1
				</span>
			</div>
			<div class="flex items-center gap-6">
				<span class="text-primary flex items-center gap-1.5">
					<Icon icon="solar:star-fall-bold-duotone" class="text-sm"/>
					Giờ Vàng Giảm 20%
				</span>
			</div>
		</div>
	</div>

	<header class="bg-base-100/95 backdrop-blur-lg border-b border-base-300/80 sticky top-0 z-50">
		<div class="max-w-7xl mx-auto px-4 lg:px-8 h-16 lg:h-[72px] flex items-center justify-between gap-4">
			<a href="/" class="flex items-center gap-2.5 hover:opacity-80 transition-opacity shrink-0">
				<Icon icon="solar:microphone-3-line-duotone" class="text-primary text-3xl lg:text-4xl" />
				<div class="flex flex-col">
					<span class="text-lg lg:text-xl font-black uppercase tracking-[0.12em] leading-none">KARA<span class="text-primary">SYSTEM</span></span>
					<span class="text-[8px] tracking-[0.25em] text-base-content/40 uppercase font-medium mt-0.5 hidden sm:block">Đẳng cấp âm thanh</span>
				</div>
			</a>

			<nav class="hidden lg:flex items-center gap-1">
				{#each navigation as item}
					<a
						href={item.href}
						class="relative px-4 py-2 rounded-lg text-[13px] font-semibold tracking-wide transition-all duration-200
							{isActive(item.href)
								? 'text-primary'
								: 'text-base-content/50 hover:text-base-content hover:bg-base-200/60'}"
					>
						{item.name}
						{#if isActive(item.href)}
							<span class="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-primary rounded-full"></span>
						{/if}
					</a>
				{/each}
			</nav>

			<div class="flex items-center gap-2 shrink-0">
				{#if user}
					{#if user.role === 'admin'}
						<a href="/admin" class="hidden md:flex items-center gap-1.5 text-[11px] font-bold tracking-widest uppercase text-primary bg-primary/8 hover:bg-primary/15 px-3.5 py-2 rounded-lg transition-colors">
							<Icon icon="solar:pie-chart-2-bold-duotone" class="text-sm"/>
							Admin
						</a>
					{/if}
					<div class="relative">
						<button
							onclick={(e) => { e.stopPropagation(); toggleUserMenu(); }}
							class="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-base-200/60 transition-colors"
						>
							<div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
								<Icon icon="solar:user-bold-duotone" class="text-primary text-lg" />
							</div>
							<span class="hidden md:block text-sm font-semibold text-base-content/70 max-w-[120px] truncate">{user.name}</span>
							<Icon icon="solar:alt-arrow-down-line-duotone" class="text-xs text-base-content/40 hidden md:block" />
						</button>
						{#if userMenuOpen}
							<div class="absolute right-0 top-full mt-2 w-56 bg-base-100 border border-base-300 rounded-xl shadow-xl py-2 z-[60]" onclick={(e) => e.stopPropagation()}>
								<div class="px-4 py-3 border-b border-base-200">
									<p class="text-sm font-bold truncate">{user.name}</p>
									<p class="text-xs text-base-content/50 truncate">{user.email}</p>
								</div>
								<a href="/my-bookings" onclick={() => userMenuOpen = false} class="flex items-center gap-3 px-4 py-2.5 text-sm font-medium hover:bg-base-200/60 transition-colors">
									<Icon icon="solar:ticket-line-duotone" class="text-lg text-base-content/50" />
									Lịch Sử Đặt Phòng
								</a>
								{#if user.role === 'admin'}
									<a href="/admin" onclick={() => userMenuOpen = false} class="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-primary hover:bg-primary/5 transition-colors">
										<Icon icon="solar:pie-chart-2-bold-duotone" class="text-lg" />
										Khu Vực Quản Trị
									</a>
								{/if}
								<div class="border-t border-base-200 mt-1 pt-1">
									<button onclick={handleLogout} class="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-error hover:bg-error/5 transition-colors w-full text-left">
										<Icon icon="solar:logout-2-line-duotone" class="text-lg" />
										Đăng Xuất
									</button>
								</div>
							</div>
						{/if}
					</div>
				{:else}
					<a href="/login" class="hidden md:block text-sm font-semibold text-base-content/60 hover:text-base-content px-3 py-2 rounded-lg transition-colors">
						Đăng Nhập
					</a>
					<a href="/register" class="btn btn-primary btn-sm rounded-lg font-bold tracking-wider text-xs h-9 px-5">
						Đăng Ký
					</a>
				{/if}

				<button onclick={() => mobileMenuOpen = !mobileMenuOpen} class="lg:hidden btn btn-ghost btn-sm btn-square rounded-lg">
					<Icon icon={mobileMenuOpen ? 'solar:close-circle-line-duotone' : 'solar:hamburger-menu-line-duotone'} class="text-xl" />
				</button>
			</div>
		</div>

		{#if mobileMenuOpen}
			<div class="lg:hidden border-t border-base-200 bg-base-100 animate-[slideDown_0.2s_ease-out]">
				<div class="px-4 py-3 flex flex-col gap-1">
					{#each navigation as item}
						<a
							href={item.href}
							onclick={closeMobileMenu}
							class="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-colors
								{isActive(item.href)
									? 'text-primary bg-primary/8'
									: 'text-base-content/60 hover:bg-base-200/60'}"
						>
							<Icon icon={isActive(item.href) ? item.iconActive : item.icon} class="text-xl" />
							{item.name}
						</a>
					{/each}

					{#if user}
						<div class="border-t border-base-200 mt-2 pt-2">
							<div class="flex items-center gap-3 px-4 py-3">
								<div class="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
									<Icon icon="solar:user-bold-duotone" class="text-primary" />
								</div>
								<div class="flex-1 min-w-0">
									<p class="text-sm font-bold truncate">{user.name}</p>
									<p class="text-xs text-base-content/40 truncate">{user.email}</p>
								</div>
							</div>
							{#if user.role === 'admin'}
								<a href="/admin" onclick={closeMobileMenu} class="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold text-primary hover:bg-primary/5 transition-colors">
									<Icon icon="solar:pie-chart-2-bold-duotone" class="text-xl" />
									Khu Vực Quản Trị
								</a>
							{/if}
							<button onclick={handleLogout} class="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold text-error hover:bg-error/5 transition-colors w-full">
								<Icon icon="solar:logout-2-line-duotone" class="text-xl" />
								Đăng Xuất
							</button>
						</div>
					{:else}
						<div class="border-t border-base-200 mt-2 pt-3 flex gap-2 px-4 pb-2">
							<a href="/login" onclick={closeMobileMenu} class="btn btn-ghost btn-sm rounded-lg flex-1 font-bold text-xs tracking-wider">Đăng Nhập</a>
							<a href="/register" onclick={closeMobileMenu} class="btn btn-primary btn-sm rounded-lg flex-1 font-bold text-xs tracking-wider">Đăng Ký</a>
						</div>
					{/if}
				</div>
			</div>
		{/if}
	</header>

	<main class="flex-1 w-full max-w-7xl mx-auto p-4 lg:p-8 pb-24 lg:pb-8">
		{@render children()}
	</main>

	<footer class="bg-base-100 border-t border-base-200 mt-auto hidden lg:block">
		<div class="max-w-7xl mx-auto w-full px-8 py-16">
			<div class="grid grid-cols-4 gap-10">
				<div class="flex flex-col gap-5">
					<a href="/" class="flex items-center gap-2 hover:opacity-80 transition-opacity">
						<Icon icon="solar:microphone-3-line-duotone" class="text-primary text-3xl" />
						<div class="flex flex-col">
							<span class="text-lg font-black uppercase tracking-[0.12em] leading-none">KARA<span class="text-primary">SYSTEM</span></span>
							<span class="text-[8px] tracking-[0.25em] text-base-content/40 uppercase font-medium mt-0.5">Đẳng cấp âm thanh</span>
						</div>
					</a>
					<p class="text-[13px] text-base-content/50 leading-relaxed pr-4">
						Tổ hợp phòng hát thương gia đạt tiêu chuẩn âm thanh châu Âu. Phục vụ từ 2018.
					</p>
					<div class="flex gap-3 items-center">
						<a href="/" class="w-9 h-9 rounded-lg bg-base-200 flex items-center justify-center text-base-content/40 hover:text-primary hover:bg-primary/10 transition-colors"><Icon icon="solar:map-point-wave-line-duotone" class="text-lg" /></a>
						<a href="/" class="w-9 h-9 rounded-lg bg-base-200 flex items-center justify-center text-base-content/40 hover:text-primary hover:bg-primary/10 transition-colors"><Icon icon="solar:phone-calling-line-duotone" class="text-lg" /></a>
						<a href="/" class="w-9 h-9 rounded-lg bg-base-200 flex items-center justify-center text-base-content/40 hover:text-primary hover:bg-primary/10 transition-colors"><Icon icon="solar:letter-line-duotone" class="text-lg" /></a>
					</div>
				</div>
				<div>
					<h6 class="text-xs font-bold tracking-widest uppercase mb-5 text-base-content">Dịch Vụ</h6>
					<ul class="flex flex-col gap-3 text-[13px] text-base-content/50 font-medium">
						<li><a href="/rooms" class="hover:text-primary transition-colors">Phòng Hát Tiêu Chuẩn</a></li>
						<li><a href="/rooms" class="hover:text-primary transition-colors">Phòng Hội Nghị / Party</a></li>
						<li><a href="/services" class="hover:text-primary transition-colors">Dịch Vụ Ẩm Thực</a></li>
						<li><a href="/services" class="hover:text-primary transition-colors">Trang Trí Sự Kiện</a></li>
					</ul>
				</div>
				<div>
					<h6 class="text-xs font-bold tracking-widest uppercase mb-5 text-base-content">Công Ty</h6>
					<ul class="flex flex-col gap-3 text-[13px] text-base-content/50 font-medium">
						<li><a href="/" class="hover:text-primary transition-colors">Về Chúng Tôi</a></li>
						<li><a href="/" class="hover:text-primary transition-colors">Tuyển Dụng</a></li>
						<li><a href="/" class="hover:text-primary transition-colors">Tin Tức Khuyến Mãi</a></li>
						<li><a href="/" class="hover:text-primary transition-colors">Liên Hệ Đặt Lịch</a></li>
					</ul>
				</div>
				<div>
					<h6 class="text-xs font-bold tracking-widest uppercase mb-5 text-base-content">Hỗ Trợ</h6>
					<ul class="flex flex-col gap-3 text-[13px] text-base-content/50 font-medium">
						<li><a href="/" class="hover:text-primary transition-colors">Điều Khoản Sử Dụng</a></li>
						<li><a href="/" class="hover:text-primary transition-colors">Chính Sách Bảo Mật</a></li>
						<li><a href="/" class="hover:text-primary transition-colors">Chính Sách Hoàn Tiền</a></li>
						<li><a href="/" class="hover:text-primary transition-colors">Trung Tâm Trợ Giúp</a></li>
					</ul>
				</div>
			</div>
		</div>
		<div class="border-t border-base-200">
			<div class="max-w-7xl mx-auto px-8 py-5 flex justify-between items-center">
				<span class="text-xs text-base-content/40 font-medium tracking-wide">
					© 2026 KaraSystem. All rights reserved.
				</span>
				<div class="flex gap-6 text-[11px] font-semibold text-base-content/30 uppercase tracking-widest">
					<a href="/" class="hover:text-primary transition-colors">Báo Lỗi</a>
					<a href="/" class="hover:text-primary transition-colors">Hỗ Trợ 24/7</a>
				</div>
			</div>
		</div>
	</footer>

	{#if !isAdminRoute}
		<nav class="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-base-100/95 backdrop-blur-lg border-t border-base-300/80 safe-area-bottom">
			<div class="flex items-center justify-around h-16 px-2">
				{#each navigation as item}
					<a
						href={item.href}
						class="flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-colors min-w-[60px]
							{isActive(item.href)
								? 'text-primary'
								: 'text-base-content/40 active:text-base-content/60'}"
					>
						<Icon icon={isActive(item.href) ? item.iconActive : item.icon} class="text-xl" />
						<span class="text-[10px] font-semibold tracking-wide">{item.name}</span>
						{#if isActive(item.href)}
							<span class="w-1 h-1 rounded-full bg-primary -mt-0.5"></span>
						{/if}
					</a>
				{/each}
				{#if user}
					<button
						onclick={(e) => { e.stopPropagation(); toggleUserMenu(); }}
						class="flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl text-base-content/40 min-w-[60px]"
					>
						<div class="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center">
							<Icon icon="solar:user-bold-duotone" class="text-primary text-sm" />
						</div>
						<span class="text-[10px] font-semibold tracking-wide">Tôi</span>
					</button>
				{:else}
					<a href="/login" class="flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl text-base-content/40 min-w-[60px]">
						<Icon icon="solar:login-2-line-duotone" class="text-xl" />
						<span class="text-[10px] font-semibold tracking-wide">Đăng Nhập</span>
					</a>
				{/if}
			</div>
		</nav>
	{/if}
</div>

<style>
	@keyframes slideDown {
		from { opacity: 0; transform: translateY(-8px); }
		to { opacity: 1; transform: translateY(0); }
	}
	.safe-area-bottom {
		padding-bottom: env(safe-area-inset-bottom, 0px);
	}
</style>
