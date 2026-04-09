<script lang="ts">
	import Icon from '@iconify/svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { signOut } from '$lib/auth-client';
	import { addToast } from '$lib/stores/toast';
	let { children } = $props();
	
	let user = $derived($page.data.user);
</script>

<div class="drawer lg:drawer-open font-sans bg-base-200">
	<input id="admin-drawer" type="checkbox" class="drawer-toggle" />
	
	<div class="drawer-content flex flex-col min-h-screen">
		<div class="sticky top-0 z-40 w-full navbar bg-base-100/80 backdrop-blur-md border-b border-base-300/50 px-4 md:px-8 py-2">
			<div class="flex-none lg:hidden">
				<label for="admin-drawer" class="btn btn-square btn-ghost text-base-content/70 hover:text-primary">
					<Icon icon="solar:hamburger-menu-line-duotone" class="text-2xl" />
				</label>
			</div>
			<div class="flex-1 flex flex-col">
				<h1 class="text-lg md:text-xl font-bold tracking-widest uppercase text-base-content">
					Trung Tâm Điều Hành
				</h1>
				<span class="text-xs font-medium text-base-content/50 uppercase tracking-wider hidden md:block">Karaoke Booking & Management</span>
			</div>
			
			<div class="flex-none gap-2 md:gap-4">
				<div class="tooltip tooltip-bottom" data-tip="Thông báo mới">
					<button class="btn btn-ghost btn-circle text-base-content/70 hover:text-primary hover:bg-primary/10 transition-colors">
						<div class="indicator">
							<Icon icon="solar:bell-bing-line-duotone" class="text-[22px]" />
							<span class="badge badge-error badge-xs indicator-item"></span>
						</div>
					</button>
				</div>
				
				<div class="dropdown dropdown-end ml-2">
					<div role="button" class="flex items-center gap-3 btn btn-ghost px-2 hover:bg-base-200 rounded-md">
						<div class="text-right hidden sm:block">
							<div class="text-sm font-bold leading-none">{user?.name || 'Admin Manager'}</div>
							<div class="text-[10px] uppercase font-bold tracking-widest text-base-content/50 mt-1">{user?.role || 'Super Admin'}</div>
						</div>
						<div class="avatar">
							<div class="w-9 rounded-md border border-base-300 shadow-sm overflow-hidden">
								{#if user?.image}
									<img alt="Admin Avatar" src={user.image} />
								{:else}
									<img alt="Admin Avatar" src={`https://ui-avatars.com/api/?name=${user?.name || 'Admin'}&background=random`} />
								{/if}
							</div>
						</div>
						<Icon icon="solar:alt-arrow-down-line-duotone" class="text-base-content/40 hidden sm:block" />
					</div>
					<ul class="mt-3 z-1 p-2 shadow-lg menu menu-sm dropdown-content bg-base-100 rounded-md w-56 border border-base-300/50">
						<li class="menu-title px-4 py-2 border-b border-base-200 mb-1">
							<span class="text-xs uppercase tracking-widest font-bold">Tài Khoản</span>
						</li>
						<li><a href="#profile" class="py-2 hover:bg-base-200 rounded-sm font-medium"><Icon icon="solar:user-circle-line-duotone" class="text-lg opacity-70"/> Hồ sơ cá nhân</a></li>
						<li><a href="#settings" class="py-2 hover:bg-base-200 rounded-sm font-medium"><Icon icon="solar:settings-line-duotone" class="text-lg opacity-70"/> Cài đặt hệ thống</a></li>
						<div class="divider my-1"></div>
						<li><button onclick={async () => {
							await signOut();
							addToast('Đăng xuất phiên quản trị.', 'info');
							await goto('/login', { invalidateAll: true });
						}} class="py-2 hover:bg-error/10 text-error hover:text-error rounded-sm font-bold w-full text-left transition-colors"><Icon icon="solar:logout-2-line-duotone" class="text-lg"/> Đăng xuất</button></li>
					</ul>
				</div>
			</div>
		</div>
		<main class="flex-1 p-4 md:p-8 xl:px-10">
			{@render children()}
		</main>
	</div> 
	<div class="drawer-side border-r border-base-300 shadow-sm z-50">
		<label for="admin-drawer" aria-label="close sidebar" class="drawer-overlay"></label> 
		<ul class="menu p-4 w-72 min-h-full bg-base-100 text-base-content gap-2">
			<li class="mb-8 mt-2">
				<a href="/" class="text-xl font-black uppercase tracking-widest text-base-content px-2 hover:bg-transparent flex gap-3 items-center group">
					<div class="bg-primary/10 p-2 rounded-md group-hover:scale-105 transition-transform">
						<Icon icon="solar:microphone-3-line-duotone" class="text-primary text-2xl"/>
					</div>
					<span>KARA<span class="text-primary">SYSTEM</span></span>
				</a>
			</li>
			
			<li class="menu-title text-[10px] font-bold tracking-[0.2em] uppercase text-base-content/40 mt-2 mb-1 px-4">Điều Hành</li>
			
			<li>
				<a href="/admin" class="group {$page.url.pathname === '/admin' ? 'active font-bold bg-primary/10 text-primary border-r-4 border-primary rounded-none rounded-l-md' : 'rounded-md font-medium text-base-content/70 hover:bg-base-200 hover:text-base-content transition-colors'} py-3 px-4">
					<Icon icon="solar:pie-chart-2-line-duotone" class="text-[22px] group-hover:scale-110 transition-transform {$page.url.pathname === '/admin' ? 'text-primary' : 'opacity-70'}" />
					<span class="ml-2 tracking-wide">Tổng Quan</span>
				</a>
			</li>
			<li>
				<a href="/admin/bookings" class="group {$page.url.pathname.startsWith('/admin/bookings') ? 'active font-bold bg-primary/10 text-primary border-r-4 border-primary rounded-none rounded-l-md' : 'rounded-md font-medium text-base-content/70 hover:bg-base-200 hover:text-base-content transition-colors'} py-3 px-4">
					<Icon icon="solar:ticket-line-duotone" class="text-[22px] group-hover:scale-110 transition-transform {$page.url.pathname.startsWith('/admin/bookings') ? 'text-primary' : 'opacity-70'}" />
					<span class="ml-2 tracking-wide flex-1">Lịch Đặt Phòng</span>
				</a>
			</li>
			
			<div class="divider my-0"></div>
			<li class="menu-title text-[10px] font-bold tracking-[0.2em] uppercase text-base-content/40 mt-2 mb-1 px-4">Quản Lý Cơ Sở</li>
			
			<li>
				<a href="/admin/rooms" class="group {$page.url.pathname.startsWith('/admin/rooms') ? 'active font-bold bg-primary/10 text-primary border-r-4 border-primary rounded-none rounded-l-md' : 'rounded-md font-medium text-base-content/70 hover:bg-base-200 hover:text-base-content transition-colors'} py-3 px-4">
					<Icon icon="solar:home-smile-angle-line-duotone" class="text-[22px] group-hover:scale-110 transition-transform {$page.url.pathname.startsWith('/admin/rooms') ? 'text-primary' : 'opacity-70'}" />
					<span class="ml-2 tracking-wide">Danh Sách Phòng</span>
				</a>
			</li>
			<li>
				<a href="/admin/services" class="group {$page.url.pathname.startsWith('/admin/services') ? 'active font-bold bg-primary/10 text-primary border-r-4 border-primary rounded-none rounded-l-md' : 'rounded-md font-medium text-base-content/70 hover:bg-base-200 hover:text-base-content transition-colors'} py-3 px-4">
					<Icon icon="solar:wineglass-triangle-line-duotone" class="text-[22px] group-hover:scale-110 transition-transform {$page.url.pathname.startsWith('/admin/services') ? 'text-primary' : 'opacity-70'}" />
					<span class="ml-2 tracking-wide">Menu Dịch Vụ</span>
				</a>
			</li>
			<div class="flex-1"></div>
			<div class="p-4 bg-base-200/50 rounded-md border border-base-200 mt-4 mx-2">
				<p class="text-xs font-medium text-base-content/70 mb-3">Cần hỗ trợ kỹ thuật?</p>
				<button class="btn btn-sm btn-outline btn-primary w-full tracking-widest text-xs uppercase font-bold">Liên Hệ IT</button>
			</div>
		</ul>
	</div>
</div>
