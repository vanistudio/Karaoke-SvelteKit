<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { page } from '$app/stores';
	import Icon from '@iconify/svelte';

	let { children } = $props();

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
		<div class="bg-primary text-primary-content px-4 py-2 flex justify-between items-center text-xs">
			<div class="flex items-center gap-2 font-bold font-mono">
				<Icon icon="solar:star-fall-bold-duotone" class="text-lg"/>
				<span class="tracking-widest">GIỜ VÀNG GIẢM GIÁ 20% TỪ 10:00 ĐẾN 16:00 MỖI NGÀY!</span>
			</div>
			<div class="badge badge-sm rounded-md bg-base-100 text-primary font-bold border-none tracking-widest hidden sm:flex">ĐẶT PHÒNG TRỰC TUYẾN</div>
		</div>
		<header class="navbar bg-base-100 border-b border-base-300 px-4 xl:px-8 z-50 rounded-b-md h-16 sticky top-0">
			<div class="navbar-start w-auto lg:w-1/4">
				<label for="mobile-sidebar" aria-label="Mở menu" class="btn btn-ghost lg:hidden rounded-md">
					<Icon icon="solar:hamburger-menu-line-duotone" class="text-2xl" />
				</label>
				<a href="/" class="btn btn-ghost text-xl font-black uppercase tracking-widest rounded-md gap-2">
					<Icon icon="solar:microphone-3-line-duotone" class="text-primary text-2xl" />
					KARA<span class="text-primary -ml-1">SYSTEM</span>
				</a>
			</div>
			<div class="navbar-center hidden lg:flex">
				<ul class="menu menu-horizontal px-1">
					{#each navigation as item}
						<li>
							<a
								href={item.href}
								class="rounded-md text-sm font-bold tracking-wider hover:bg-base-200 {$page.url.pathname === item.href ? 'border-b-2 border-primary text-primary' : 'text-base-content/80'}"
							>
								<Icon icon={item.icon} class="text-lg" />
								{item.name}
							</a>
						</li>
					{/each}
				</ul>
			</div>
			<div class="navbar-end w-auto lg:w-1/4 gap-4 ml-auto">
				<a href="/login" class="link text-sm font-bold tracking-wide uppercase hidden sm:block text-base-content/80">Đăng Nhập</a>
				<a href="/register" class="btn btn-primary btn-sm rounded-md font-bold uppercase tracking-widest">TẠO TÀI KHOẢN</a>
			</div>
		</header>

		<main class="flex-1 w-full max-w-7xl mx-auto p-4 lg:p-8">
			{@render children()}
		</main>
		<div class="bg-base-100 border-t border-base-300 mt-auto">
			<div class="max-w-7xl mx-auto w-full px-4 lg:px-8 py-12 lg:py-16">
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
					<div class="flex flex-col gap-4">
						<div class="flex items-center gap-2">
							<Icon icon="solar:microphone-3-line-duotone" class="text-primary text-3xl" />
							<span class="text-2xl font-black uppercase tracking-widest flex items-center">KARA<span class="text-primary">SYSTEM</span></span>
						</div>
						<p class="font-medium text-sm text-base-content/70 leading-relaxed mb-4 lg:pr-8">
							Hệ thống phòng hát thương gia đạt tiêu chuẩn âm thanh châu Âu. Cung cấp dịch vụ giải trí đỉnh cao từ năm 2018.
						</p>
						<div class="flex gap-4 items-center text-base-content/60">
							<a href="/" class="hover:text-primary transition-colors"><Icon icon="solar:map-point-wave-line-duotone" class="text-2xl" /></a>
							<a href="/" class="hover:text-primary transition-colors"><Icon icon="solar:phone-calling-line-duotone" class="text-2xl" /></a>
							<a href="/" class="hover:text-primary transition-colors"><Icon icon="solar:letter-line-duotone" class="text-2xl" /></a>
						</div>
					</div>
					<div>
						<h6 class="font-bold tracking-widest uppercase mb-6 text-base-content">Dịch Vụ</h6>
						<ul class="flex flex-col gap-4 text-sm text-base-content/70 font-medium">
							<li><a href="/" class="hover:text-primary transition-colors">Phòng Hát Tiêu Chuẩn</a></li>
							<li><a href="/" class="hover:text-primary transition-colors">Phòng Hội Nghị / Party</a></li>
							<li><a href="/" class="hover:text-primary transition-colors">Dịch Vụ Ăn Uống</a></li>
							<li><a href="/" class="hover:text-primary transition-colors">Trang Trí Sự Kiện</a></li>
						</ul>
					</div>
					<div>
						<h6 class="font-bold tracking-widest uppercase mb-6 text-base-content">Công Ty</h6>
						<ul class="flex flex-col gap-4 text-sm text-base-content/70 font-medium">
							<li><a href="/" class="hover:text-primary transition-colors">Về Chúng Tôi</a></li>
							<li><a href="/" class="hover:text-primary transition-colors">Tuyển Dụng</a></li>
							<li><a href="/" class="hover:text-primary transition-colors">Tin Tức Khuyến Mãi</a></li>
							<li><a href="/" class="hover:text-primary transition-colors">Liên Hệ Đặt Lịch</a></li>
						</ul>
					</div>
					<div>
						<h6 class="font-bold tracking-widest uppercase mb-6 text-base-content">Pháp Lý</h6>
						<ul class="flex flex-col gap-4 text-sm text-base-content/70 font-medium">
							<li><a href="/" class="hover:text-primary transition-colors">Điều Khoản Sử Dụng</a></li>
							<li><a href="/" class="hover:text-primary transition-colors">Chính Sách Bảo Mật</a></li>
							<li><a href="/" class="hover:text-primary transition-colors">Chính Sách Hoàn Tiền</a></li>
							<li><a href="/" class="hover:text-primary transition-colors">Quy Định Khách Hàng</a></li>
						</ul>
					</div>
				</div>
			</div>
			
			<div class="border-t border-base-200">
				<div class="max-w-7xl mx-auto w-full px-4 lg:px-8 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
					<div class="flex items-center gap-2 text-base-content/60 text-sm">
						<Icon icon="solar:copyright-line-duotone" class="text-xl" />
						<p class="font-bold tracking-wider">KaraSystem Management © 2026. All rights reserved.</p>
					</div>
					<div class="flex gap-6 text-sm font-bold text-base-content/50 uppercase tracking-widest">
						<a href="/" class="hover:text-primary transition-colors">Báo Cáo Lỗi</a>
						<a href="/" class="hover:text-primary transition-colors">Hỗ Trợ 24/7</a>
					</div>
				</div>
			</div>
		</div>
	</div> 
	
	<!-- Drawer Side (Mobile Sidebar) -->
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
		</ul>
	</div>
</div>
