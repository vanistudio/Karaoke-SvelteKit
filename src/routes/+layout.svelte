<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import Icon from '@iconify/svelte';
	import { page } from '$app/stores';

	let { children } = $props();

	// Define navigation items
	const navigation = [
		{ name: 'Trang chủ', href: '/', icon: 'solar:home-2-line-duotone' },
		{ name: 'Phòng Hát', href: '/rooms', icon: 'solar:soundwave-circle-line-duotone' },
		{ name: 'Menu Dịch Vụ', href: '/services', icon: 'solar:cup-hot-line-duotone' },
		{ name: 'Khuyến Mãi', href: '/promotions', icon: 'solar:tag-price-line-duotone' }
	];
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>KaraSystem - Bảng Điều Khiển</title>
</svelte:head>

<div class="flex h-screen w-full flex-col overflow-hidden bg-surface-50 transition-colors">
	<header class="flex h-16 w-full shrink-0 border-b border-surface-200 bg-white shadow-sm">
		<div class="container mx-auto flex items-center justify-between px-4">
			<a href="/" class="flex items-center gap-2">
				<Icon icon="solar:microphone-3-line-duotone" class="text-3xl text-primary-500" />
				<span class="text-xl font-black uppercase tracking-widest text-primary-600">KaraSystem</span>
			</a>
			<nav class="hidden md:flex flex-1 items-center justify-center gap-8">
				{#each navigation as item}
					<a
						href={item.href}
						class="flex items-center gap-2 font-medium transition-colors hover:text-primary-500 {$page.url.pathname === item.href ? 'text-primary-500' : 'text-surface-600'}"
					>
						<Icon icon={item.icon} class="text-xl" />
						{item.name}
					</a>
				{/each}
			</nav>
			<div class="flex items-center gap-4">
				<button class="btn preset-tonal-primary hidden sm:flex">
					<Icon icon="solar:magnifer-line-duotone" class="text-xl" />
				</button>
				
				<div class="h-6 w-px bg-surface-200"></div>
				
				<a href="/login" class="btn preset-filled-primary font-semibold">
					Đăng nhập
				</a>
			</div>
		</div>
	</header>
	<div class="flex flex-1 overflow-hidden">
		<main class="flex-1 overflow-auto bg-surface-50/50 p-6">
			<div class="container mx-auto max-w-7xl">
				{@render children()}
			</div>
		</main>
	</div>
</div>
