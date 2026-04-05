<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import Icon from '@iconify/svelte';
	import { page } from '$app/stores';

	let { children } = $props();

	const navigation = [
		{ name: 'Trang chủ', href: '/', icon: 'solar:home-2-line-duotone' },
		{ name: 'Phòng Hát', href: '/rooms', icon: 'solar:soundwave-circle-line-duotone' },
		{ name: 'Menu Dịch Vụ', href: '/services', icon: 'solar:cup-hot-line-duotone' },
		{ name: 'Khuyến Mãi', href: '/promotions', icon: 'solar:tag-price-line-duotone' }
	];
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>KaraSystem - Nền Tảng Đặt Phòng Chuyên Nghiệp</title>
</svelte:head>

<div class="flex h-screen w-full flex-col bg-base-200">
	<!-- DaisyUI Navbar -->
	<header class="navbar bg-base-100 shadow-sm px-6 sticky top-0 z-50 border-b border-base-300">
		<!-- Navbar Start (Logo) -->
		<div class="navbar-start">
			<a href="/" class="flex items-center gap-2 hover:opacity-80 transition-opacity">
				<Icon icon="solar:microphone-3-line-duotone" class="text-3xl text-primary" />
				<span class="text-xl font-bold uppercase tracking-wider text-base-content">
					Kara<span class="text-primary">System</span>
				</span>
			</a>
		</div>

		<!-- Navbar Center (Menu) -->
		<div class="navbar-center hidden lg:flex">
			<ul class="menu menu-horizontal px-1 gap-2">
				{#each navigation as item}
					<li>
						<a 
							href={item.href} 
							class="font-medium {$page.url.pathname === item.href ? 'active text-primary bg-primary/10' : 'text-base-content/80 hover:text-primary'} gap-2"
						>
							<Icon icon={item.icon} class="text-xl" />
							{item.name}
						</a>
					</li>
				{/each}
			</ul>
		</div>

		<!-- Navbar End (Actions) -->
		<div class="navbar-end gap-4">
			<button class="btn btn-ghost btn-circle">
				<Icon icon="solar:magnifer-line-duotone" class="text-xl" />
			</button>
			
			<div class="hidden sm:block divider divider-horizontal m-0 w-0 h-6"></div>
			
			<div class="hidden md:flex items-center gap-2">
				<a href="/login" class="btn btn-ghost">Đăng nhập</a>
				<a href="/register" class="btn btn-primary">Đăng ký</a>
			</div>
            
            <!-- Avatar Dropdown for logged in user (example) -->
			<div class="dropdown dropdown-end">
				<div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar">
					<div class="w-10 rounded-full ring-1 ring-base-300">
						<img alt="User Avatar" src="https://i.pravatar.cc/150?u=123" />
					</div>
				</div>
				<ul tabindex="0" class="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow-lg border border-base-200">
					<li><a>Hồ sơ cá nhân</a></li>
					<li><a>Cài đặt</a></li>
					<li><a class="text-error">Đăng xuất</a></li>
				</ul>
			</div>
		</div>
	</header>

	<main class="flex-1 overflow-auto">
		{@render children()}
	</main>
</div>
