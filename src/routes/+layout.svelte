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
		<div class="bg-neutral text-neutral-content mt-auto">
			<div class="border-b border-neutral-content/10">
				<div class="max-w-7xl mx-auto w-full px-4 lg:px-8 py-16 lg:py-20 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
					<div class="max-w-2xl">
						<h2 class="text-3xl lg:text-5xl font-black uppercase tracking-tighter mb-4 leading-tight">Đẳng cấp âm thanh<br/><span class="text-primary">Đỉnh cao giải trí.</span></h2>
						<p class="text-neutral-content/60 font-medium text-lg leading-relaxed">Liên hệ ngay để nhận tư vấn không gian sự kiện đặc quyền và báo giá dịch vụ phòng VIP.</p>
					</div>
					<a href="/rooms" class="btn btn-primary rounded-md font-bold uppercase tracking-widest px-8 h-14">
						Đặt Phòng Ngay
						<Icon icon="solar:arrow-right-line-duotone" class="text-xl" />
					</a>
				</div>
			</div>
			<div class="max-w-7xl mx-auto w-full px-4 lg:px-8 py-16 lg:py-20">
				<div class="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8">
					<div class="lg:col-span-5 flex flex-col justify-between">
						<div>
							<div class="flex items-center gap-2 mb-6">
								<Icon icon="solar:microphone-3-line-duotone" class="text-primary text-4xl" />
								<span class="text-3xl font-black uppercase tracking-widest flex items-center">KARA<span class="text-primary">SYSTEM</span></span>
							</div>
							<p class="text-neutral-content/60 leading-relaxed font-medium mb-8 max-w-sm">
								Tổ hợp giải trí đa phương tiện. Hơn 50 không gian phòng hát thương gia đạt tiêu chuẩn thẩm âm quốc tế.
							</p>
						</div>
						<div class="max-w-sm">
							<h6 class="font-bold tracking-widest uppercase mb-3 text-xs text-neutral-content/40">News & Offers</h6>
							<div class="join w-full">
								<input class="input input-bordered join-item w-full bg-base-100/10 text-neutral-content border-neutral-content/20 focus:border-primary rounded-md focus:bg-base-100 focus:text-base-content" placeholder="Email của bạn..."/>
								<button class="btn btn-primary join-item rounded-md uppercase font-bold tracking-widest px-6">Gửi</button>
							</div>
						</div>
					</div>
					<div class="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-8">
						<div class="flex flex-col gap-6">
							<h6 class="font-bold tracking-widest uppercase text-neutral-content/40 text-xs">Dịch Vụ</h6>
							<ul class="flex flex-col gap-4 text-sm font-medium">
								<li><a href="/" class="hover:text-primary transition-colors">Phòng Hát Tiêu Chuẩn</a></li>
								<li><a href="/" class="hover:text-primary transition-colors">Phòng Hội Nghị / Party</a></li>
								<li><a href="/" class="hover:text-primary transition-colors">Dịch Vụ Ẩm Thực</a></li>
								<li><a href="/" class="hover:text-primary transition-colors">Trang Trí Sự Kiện</a></li>
							</ul>
						</div>
						<div class="flex flex-col gap-6">
							<h6 class="font-bold tracking-widest uppercase text-neutral-content/40 text-xs">Công Ty</h6>
							<ul class="flex flex-col gap-4 text-sm font-medium">
								<li><a href="/" class="hover:text-primary transition-colors">Hồ Sơ Năng Lực</a></li>
								<li><a href="/" class="hover:text-primary transition-colors">Tuyển Dụng Mới</a></li>
								<li><a href="/" class="hover:text-primary transition-colors">Tin Tức / Blog</a></li>
								<li><a href="/" class="hover:text-primary transition-colors">Liên Hệ Đặt Lịch</a></li>
							</ul>
						</div>
						<div class="flex flex-col gap-6">
							<h6 class="font-bold tracking-widest uppercase text-neutral-content/40 text-xs">Pháp Lý</h6>
							<ul class="flex flex-col gap-4 text-sm font-medium">
								<li><a href="/" class="hover:text-primary transition-colors">Điều Khoản Dịch Vụ</a></li>
								<li><a href="/" class="hover:text-primary transition-colors">Chính Sách Bảo Mật</a></li>
								<li><a href="/" class="hover:text-primary transition-colors">Chính Sách Hoàn Tiền</a></li>
								<li><a href="/" class="hover:text-primary transition-colors">Quy Định Khách Hàng</a></li>
							</ul>
						</div>
					</div>
				</div>
			</div>
			<div class="border-t border-neutral-content/10 bg-neutral/50">
				<div class="max-w-7xl mx-auto w-full px-4 lg:px-8 py-6 flex flex-col md:flex-row justify-between items-center gap-6">
					<div class="flex flex-wrap gap-4 items-center text-neutral-content/50 text-xs font-bold uppercase tracking-widest">
						<span>© 2026 KaraSystem Mgmt.</span>
						<span class="hidden md:inline text-neutral-content/20">|</span>
						<a href="/" class="hover:text-neutral-content transition-colors">Báo lỗi hệ thống</a>
						<span class="hidden md:inline text-neutral-content/20">|</span>
						<a href="/" class="hover:text-neutral-content transition-colors">Cookies</a>
					</div>
					<div class="flex gap-4">
						<a href="/" class="w-10 h-10 flex items-center justify-center rounded-md bg-neutral-content/10 hover:bg-primary hover:text-primary-content transition-colors"><Icon icon="solar:round-alt-arrow-right-line-duotone" class="text-xl" /></a>
						<a href="/" class="w-10 h-10 flex items-center justify-center rounded-md bg-neutral-content/10 hover:bg-primary hover:text-primary-content transition-colors"><Icon icon="solar:phone-calling-line-duotone" class="text-xl" /></a>
						<a href="/" class="w-10 h-10 flex items-center justify-center rounded-md bg-neutral-content/10 hover:bg-primary hover:text-primary-content transition-colors"><Icon icon="solar:letter-line-duotone" class="text-xl" /></a>
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
