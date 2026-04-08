<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { page } from '$app/stores';
	import Icon from '@iconify/svelte';
	import { signOut } from '$lib/auth-client';

	let { children } = $props();

	let user = $derived($page.data.user);

	const navigation = [
		{ name: 'TRANG CHỦ', href: '/', icon: 'solar:home-2-line-duotone' },
		{ name: 'PHÒNG HÁT', href: '/rooms', icon: 'solar:soundwave-circle-line-duotone' },
		{ name: 'DỊCH VỤ', href: '/services', icon: 'solar:cup-hot-line-duotone' },
		{ name: 'KHÁCH HÀNG', href: '/customers', icon: 'solar:users-group-two-rounded-line-duotone' }
	];
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>KaraSystem | Quản Trị Hệ Thống</title>
</svelte:head>
<div class="drawer">
	<input id="mobile-sidebar" type="checkbox" class="drawer-toggle" />
	<div class="drawer-content flex flex-col min-h-screen bg-base-200 font-sans">
		<div class="bg-neutral text-neutral-content/80 text-xs py-2.5 px-4 lg:px-8 flex items-center justify-between font-medium tracking-widest uppercase">
			<div class="flex items-center gap-6">
				<a href="tel:19001000" class="flex items-center gap-2 hover:text-white transition-colors">
					<Icon icon="solar:phone-calling-line-duotone" class="text-lg" /> TỔNG ĐÀI: 1900 1000
				</a>
				<span class="hidden md:flex items-center gap-2 text-neutral-content/50">
					<Icon icon="solar:map-point-wave-line-duotone" class="text-lg" /> 123 PREMIUM VIP STREET, DISTRICT 1
				</span>
			</div>
			
			<div class="flex items-center gap-6">
				<span class="hidden sm:flex text-primary items-center gap-2">
					<Icon icon="solar:star-fall-bold-duotone" class="text-lg"/> GIỜ VÀNG GIẢM 20%
				</span>
				<div class="hidden lg:flex items-center gap-4 border-l border-neutral-content/20 pl-6 text-[10px]">
					<a href="/" class="hover:text-white transition-colors">TIẾNG VIỆT</a>
					<a href="/" class="hover:text-neutral-content/50 transition-colors text-neutral-content/30">ENGLISH</a>
				</div>
			</div>
		</div>
		<header class="bg-base-100 border-b border-base-300 sticky top-0 z-50 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
			<div class="w-full max-w-7xl mx-auto px-4 lg:px-8 h-20 flex items-center justify-between">
				<div class="flex items-center gap-2">
					<label for="mobile-sidebar" aria-label="Mở menu" class="btn btn-ghost lg:hidden rounded-md w-10 h-10 p-0 mr-2 flex justify-center items-center">
						<Icon icon="solar:hamburger-menu-line-duotone" class="text-2xl" />
					</label>
					<a href="/" class="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
						<Icon icon="solar:microphone-3-line-duotone" class="text-primary text-[38px]" />
						<div class="flex flex-col">
							<span class="text-[22px] font-black uppercase tracking-[0.15em] leading-none">KARA<span class="text-primary">SYSTEM</span></span>
							<span class="text-[9px] tracking-[0.3em] text-base-content/50 uppercase font-medium mt-1 hidden sm:block">Đẳng cấp âm thanh</span>
						</div>
					</a>
				</div>
				<nav class="hidden lg:flex items-center gap-1 flex-1 justify-center">
					{#each navigation as item}
						<a
							href={item.href}
							class="px-5 py-2.5 rounded-md text-sm font-medium tracking-widest uppercase transition-colors {$page.url.pathname === item.href ? 'text-primary bg-primary/5' : 'text-base-content/60 hover:text-base-content hover:bg-base-200/50'}"
						>
							{item.name}
						</a>
					{/each}
				</nav>
				<div class="flex items-center gap-6 justify-end">
					{#if user}
						<a href="/admin" class="text-sm font-medium tracking-widest uppercase hidden md:block text-base-content/70 hover:text-primary transition-colors shrink-0">Xin chào, {user.name}</a>
						<button onclick={async () => { await signOut(); window.location.href = '/login'; }} class="btn btn-outline border-base-300 hover:border-error hover:bg-error hover:text-white rounded-md font-semibold uppercase tracking-widest px-6 h-11 min-h-0 text-xs sm:text-sm shadow-sm transition-colors">
							ĐĂNG XUẤT
						</button>
					{:else}
						<a href="/login" class="text-sm font-medium tracking-widest uppercase hidden md:block text-base-content/70 hover:text-primary transition-colors shrink-0">ĐĂNG NHẬP</a>
						<a href="/register" class="btn btn-primary rounded-md font-semibold uppercase tracking-widest px-6 h-11 min-h-0 text-xs sm:text-sm shadow-sm">
							TẠO TÀI KHOẢN
						</a>
					{/if}
				</div>
			</div>
		</header>
		<main class="flex-1 w-full max-w-7xl mx-auto p-4 lg:p-8">
			{@render children()}
		</main>
		<div class="bg-base-100 border-t border-base-200 mt-auto">
			<div class="max-w-7xl mx-auto w-full px-4 lg:px-8 py-16 lg:py-20">
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
					<div class="flex flex-col gap-6">
						<a href="/" class="flex items-center gap-2 hover:opacity-80 transition-opacity">
							<Icon icon="solar:microphone-3-line-duotone" class="text-primary text-[38px]" />
							<div class="flex flex-col">
								<span class="text-[22px] font-black uppercase tracking-[0.15em] leading-none text-base-content">KARA<span class="text-primary">SYSTEM</span></span>
								<span class="text-[9px] tracking-[0.3em] text-base-content/50 uppercase font-medium mt-1">Đẳng cấp âm thanh</span>
							</div>
						</a>
						<p class="font-medium text-[13px] text-base-content/60 leading-relaxed lg:pr-8">
							Tổ hợp dịch vụ phòng hát thương gia đạt tiêu chuẩn âm thanh châu Âu. Tận tâm phục vụ từ năm 2018.
						</p>
						<div class="flex gap-4 items-center mt-2 text-base-content/40">
							<a href="/" class="hover:text-primary transition-colors"><Icon icon="solar:map-point-wave-line-duotone" class="text-2xl" /></a>
							<a href="/" class="hover:text-primary transition-colors"><Icon icon="solar:phone-calling-line-duotone" class="text-2xl" /></a>
							<a href="/" class="hover:text-primary transition-colors"><Icon icon="solar:letter-line-duotone" class="text-2xl" /></a>
						</div>
					</div>
					<div class="lg:pl-8">
						<h6 class="font-bold tracking-widest uppercase mb-6 text-base-content text-xs">Dịch Vụ</h6>
						<ul class="flex flex-col gap-4 text-[13px] text-base-content/60 font-medium">
							<li><a href="/" class="hover:text-primary transition-colors">Phòng Hát Tiêu Chuẩn</a></li>
							<li><a href="/" class="hover:text-primary transition-colors">Phòng Hội Nghị / Party</a></li>
							<li><a href="/" class="hover:text-primary transition-colors">Dịch Vụ Ẩm Thực</a></li>
							<li><a href="/" class="hover:text-primary transition-colors">Trang Trí Sự Kiện</a></li>
						</ul>
					</div>
					<div>
						<h6 class="font-bold tracking-widest uppercase mb-6 text-base-content text-xs">Công Ty</h6>
						<ul class="flex flex-col gap-4 text-[13px] text-base-content/60 font-medium">
							<li><a href="/" class="hover:text-primary transition-colors">Về Chúng Tôi</a></li>
							<li><a href="/" class="hover:text-primary transition-colors">Tuyển Dụng</a></li>
							<li><a href="/" class="hover:text-primary transition-colors">Tin Tức Khuyến Mãi</a></li>
							<li><a href="/" class="hover:text-primary transition-colors">Liên Hệ Đặt Lịch</a></li>
						</ul>
					</div>
					<div>
						<h6 class="font-bold tracking-widest uppercase mb-6 text-base-content text-xs">Hỗ Trợ</h6>
						<ul class="flex flex-col gap-4 text-[13px] text-base-content/60 font-medium">
							<li><a href="/" class="hover:text-primary transition-colors">Điều Khoản Sử Dụng</a></li>
							<li><a href="/" class="hover:text-primary transition-colors">Chính Sách Bảo Mật</a></li>
							<li><a href="/" class="hover:text-primary transition-colors">Chính Sách Hoàn Tiền</a></li>
							<li><a href="/" class="hover:text-primary transition-colors">Trung Tâm Trợ Giúp</a></li>
						</ul>
					</div>
				</div>
			</div>
			<div class="border-t border-base-200">
				<div class="max-w-7xl mx-auto w-full px-4 lg:px-8 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
					<div class="flex items-center gap-2 text-base-content/50 text-[13px] font-medium tracking-wide">
						<Icon icon="solar:copyright-line-duotone" class="text-xl" />
						<span>KaraSystem Management © 2026. All rights reserved.</span>
					</div>
					<div class="flex gap-6 text-[11px] font-bold text-base-content/40 uppercase tracking-widest">
						<a href="/" class="hover:text-primary transition-colors">Báo Cáo Lỗi</a>
						<a href="/" class="hover:text-primary transition-colors">Hỗ Trợ 24/7</a>
					</div>
				</div>
			</div>
		</div>
	</div>
	<div class="drawer-side z-100">
		<label for="mobile-sidebar" aria-label="đóng menu" class="drawer-overlay"></label>
		<ul class="menu bg-base-100 text-base-content min-h-full w-80 p-4 border-r border-base-300">
			<li class="mb-4 pointer-events-none">
				<div class="flex items-center gap-2 mb-2 pt-2">
					<Icon icon="solar:microphone-3-line-duotone" class="text-primary text-3xl" />
					<span class="text-2xl font-black uppercase tracking-widest">KARA<span class="text-primary">SYSTEM</span></span>
				</div>
			</li>
			
			<div class="divider mt-0 mb-2 text-xs font-bold tracking-widest text-base-content/50">ĐẶT PHÒNG</div>
			
			{#each navigation as item}
				<li class="mb-1">
					<a
						href={item.href}
						class="rounded-md font-bold text-sm tracking-wider {$page.url.pathname === item.href ? 'bg-primary/10 text-primary' : ''}"
					>
						<Icon icon={item.icon} class="text-xl" />
						{item.name}
					</a>
				</li>
			{/each}
			
			<div class="divider mt-4 mb-2 text-xs font-bold tracking-widest text-base-content/50">TÀI KHOẢN</div>
			{#if user}
				<li>
					<a href="/admin" class="rounded-md font-bold text-sm tracking-wider">
						<Icon icon="solar:pie-chart-2-line-duotone" class="text-xl" />
						QUẢN TRỊ (/ADMIN)
					</a>
				</li>
				<li>
					<button onclick={async () => { await signOut(); window.location.href = '/login'; }} class="rounded-md font-bold text-sm tracking-wider text-error">
						<Icon icon="solar:logout-2-line-duotone" class="text-xl" />
						ĐĂNG XUẤT
					</button>
				</li>
			{:else}
				<li>
					<a href="/login" class="rounded-md font-bold text-sm tracking-wider">
						<Icon icon="solar:login-2-line-duotone" class="text-xl" />
						ĐĂNG NHẬP
					</a>
				</li>
				<li>
					<a href="/register" class="rounded-md font-bold text-sm tracking-wider text-primary">
						<Icon icon="solar:user-plus-rounded-line-duotone" class="text-xl" />
						TẠO TÀI KHOẢN
					</a>
				</li>
			{/if}
		</ul>
	</div>
</div>
