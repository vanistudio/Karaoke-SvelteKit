<script lang="ts">
	import { trpc } from '$lib/trpc/client';
	import Icon from '@iconify/svelte';

	let rooms = $state<any[]>([]);
	let isReady = $state(false);
	let activeFilter = $state('all');

	$effect(() => {
		fetchRooms();
	});

	async function fetchRooms() {
		try {
			rooms = await trpc().room.list.query();
		} catch (error) {
			console.error(error);
		} finally {
			isReady = true;
		}
	}

	let filteredRooms = $derived(
		activeFilter === 'all' ? rooms : rooms.filter(r => r.type === activeFilter)
	);

	const typeLabel: Record<string, string> = { standard: 'Cơ Bản', vip: 'VIP', super_vip: 'Super VIP' };
	const typeBadge: Record<string, string> = { standard: 'badge-ghost', vip: 'badge-secondary', super_vip: 'badge-accent' };
	const typeIcon: Record<string, string> = { standard: 'solar:home-smile-angle-line-duotone', vip: 'solar:crown-star-line-duotone', super_vip: 'solar:crown-star-bold-duotone' };

	function formatVND(value: number) {
		return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
	}
</script>

<svelte:head>
	<title>Phòng Hát | KaraSystem</title>
</svelte:head>

<div class="flex flex-col gap-8">
	<div class="bg-base-200 rounded-md py-10 px-6 border border-base-300">
		<div class="text-center w-full max-w-3xl mx-auto">
			<div class="badge badge-primary rounded-md mb-4 tracking-widest font-bold font-mono px-4 py-3">HỆ THỐNG PHÒNG</div>
			<h1 class="text-3xl lg:text-4xl font-black uppercase tracking-tight text-base-content mb-4 leading-tight">
				Khám Phá Phòng Hát
			</h1>
			<p class="py-2 text-base-content/70 font-medium">Đa dạng phòng từ Tiêu Chuẩn đến Super VIP — âm thanh đẳng cấp, không gian sang trọng.</p>
		</div>
	</div>

	<div class="flex gap-2 flex-wrap justify-center">
		<button onclick={() => activeFilter = 'all'} class={`btn btn-sm rounded-md font-bold tracking-widest uppercase ${activeFilter === 'all' ? 'btn-primary' : 'btn-ghost'}`}>Tất Cả ({rooms.length})</button>
		{#each Object.entries(typeLabel) as [key, label]}
			<button onclick={() => activeFilter = key} class={`btn btn-sm rounded-md font-bold tracking-wider ${activeFilter === key ? 'btn-primary' : 'btn-ghost'}`}>
				<Icon icon={typeIcon[key]} class="text-base"/>
				{label} ({rooms.filter(r => r.type === key).length})
			</button>
		{/each}
	</div>

	{#if !isReady}
		<div class="flex items-center justify-center min-h-[30vh]">
			<span class="loading loading-spinner loading-lg text-primary"></span>
		</div>
	{:else if filteredRooms.length === 0}
		<div class="bg-base-100 rounded-md border border-base-300 p-10 text-center">
			<Icon icon="solar:home-smile-angle-line-duotone" class="text-5xl text-base-content/20 mx-auto mb-4" />
			<h3 class="font-bold text-lg">Chưa có phòng nào trong danh mục này</h3>
		</div>
	{:else}
		<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
			{#each filteredRooms as room}
				<div class="card bg-base-100 rounded-md border border-base-300 hover:border-primary transition-colors duration-300 group">
					<div class="card-body p-6">
						<div class="flex items-start justify-between mb-4">
							<div class="w-14 h-14 rounded-md bg-primary/10 flex items-center justify-center group-hover:scale-105 transition-transform">
								<Icon icon={typeIcon[room.type] || 'solar:home-smile-angle-line-duotone'} class="text-3xl text-primary"/>
							</div>
							<div class={`badge badge-sm rounded-md font-bold uppercase ${typeBadge[room.type] || 'badge-ghost'}`}>
								{typeLabel[room.type] || room.type}
							</div>
						</div>
						<h3 class="text-xl font-bold">{room.name}</h3>
						<div class="flex flex-col gap-2 mt-3">
							<div class="flex justify-between text-sm font-medium border-b border-base-200 pb-2">
								<span class="text-base-content/60">Sức chứa</span>
								<span>Tối đa {room.capacity} Khách</span>
							</div>
							<div class="flex justify-between text-sm font-medium pt-1">
								<span class="text-base-content/60">Giá / Giờ</span>
								<span class="text-xl font-black text-primary">{formatVND(room.pricePerHour)}</span>
							</div>
						</div>
						<div class="card-actions mt-4">
							<a href="/booking/{room.id}" class="btn btn-primary btn-outline rounded-md w-full font-bold tracking-widest uppercase">
								<Icon icon="solar:calendar-add-line-duotone" class="text-xl"/>
								Đặt Phòng Ngay
							</a>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
