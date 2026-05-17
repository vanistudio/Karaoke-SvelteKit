<script lang="ts">
	import { trpc } from '$lib/trpc/client';
	import Icon from '@iconify/svelte';

	let rooms = $state<any[]>([]);
	let roomStats = $state<any[]>([]);
	let isReady = $state(false);
	let activeFilter = $state('all');

	$effect(() => {
		fetchData();
	});

	async function fetchData() {
		try {
			const [r, stats] = await Promise.all([
				trpc().room.list.query(),
				trpc().review.allRoomStats.query()
			]);
			rooms = r;
			roomStats = stats;
		} catch (error) {
			console.error(error);
		} finally {
			isReady = true;
		}
	}

	let filteredRooms = $derived(
		activeFilter === 'all' ? rooms : rooms.filter(r => r.type === activeFilter)
	);

	function getRoomRating(roomId: number) {
		const stat = roomStats.find(s => s.roomId === roomId);
		return stat ? { avg: stat.avgRating, total: stat.totalReviews } : { avg: 0, total: 0 };
	}

	const typeLabel: Record<string, string> = { standard: 'Cơ Bản', vip: 'VIP', super_vip: 'Super VIP' };
	const typeBadge: Record<string, string> = { standard: 'bg-base-200 text-base-content/60', vip: 'bg-secondary/10 text-secondary', super_vip: 'bg-primary/10 text-primary' };
	const typeIcon: Record<string, string> = { standard: 'solar:home-smile-angle-bold-duotone', vip: 'solar:crown-star-bold-duotone', super_vip: 'solar:crown-star-bold-duotone' };

	function formatVND(value: number) {
		return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
	}

	function renderStars(rating: number): string {
		return '★'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating));
	}
</script>

<svelte:head>
	<title>Phòng Hát | KaraSystem</title>
</svelte:head>

<div class="flex flex-col gap-8">
	<div class="gradient-karaoke rounded-2xl p-8 lg:p-10 relative overflow-hidden">
		<div class="absolute top-4 right-8 opacity-10">
			<Icon icon="solar:soundwave-bold-duotone" class="text-[100px] text-white" />
		</div>
		<div class="relative z-10 text-center max-w-2xl mx-auto">
			<div class="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 mb-4">
				<Icon icon="solar:microphone-3-bold-duotone" class="text-sm text-violet-300"/>
				<span class="text-[11px] font-bold text-white/80 uppercase tracking-widest">Hệ Thống Phòng</span>
			</div>
			<h1 class="text-2xl lg:text-4xl font-black text-white uppercase tracking-tight leading-tight mb-3">
				Khám Phá Phòng Hát
			</h1>
			<p class="text-white/50 font-medium text-sm">Đa dạng từ Tiêu Chuẩn đến Super VIP — âm thanh đẳng cấp, không gian sang trọng.</p>
		</div>
	</div>
	<div class="flex gap-2 flex-wrap justify-center">
		<button onclick={() => activeFilter = 'all'} class={`btn btn-sm rounded-lg font-bold tracking-wider ${activeFilter === 'all' ? 'btn-primary' : 'btn-ghost'}`}>
			<Icon icon="solar:widget-2-line-duotone" class="text-base"/>
			Tất Cả ({rooms.length})
		</button>
		{#each Object.entries(typeLabel) as [key, label]}
			<button onclick={() => activeFilter = key} class={`btn btn-sm rounded-lg font-bold tracking-wider ${activeFilter === key ? 'btn-primary' : 'btn-ghost'}`}>
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
		<div class="bg-base-100 rounded-xl neon-border p-10 text-center">
			<Icon icon="solar:microphone-3-line-duotone" class="text-5xl text-base-content/15 mx-auto mb-4" />
			<h3 class="font-bold text-lg">Chưa có phòng nào trong danh mục này</h3>
			<p class="text-sm text-base-content/40 font-medium mt-1">Vui lòng chọn danh mục khác.</p>
		</div>
	{:else}
		<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
			{#each filteredRooms as room}
				{@const rating = getRoomRating(room.id)}
				<div class="card bg-base-100 rounded-xl neon-border group">
					<div class="card-body p-5">
						<div class="flex items-start justify-between mb-3">
							<div class="w-14 h-14 rounded-xl bg-primary/8 flex items-center justify-center group-hover:scale-110 transition-transform">
								<Icon icon={typeIcon[room.type] || 'solar:home-smile-angle-bold-duotone'} class="text-3xl text-primary"/>
							</div>
							<div class="flex flex-col items-end gap-1">
								<span class={`badge badge-sm rounded-md font-bold uppercase ${typeBadge[room.type] || 'badge-ghost'}`}>
									{typeLabel[room.type] || room.type}
								</span>
								{#if rating.total > 0}
									<div class="flex items-center gap-1">
										<span class="text-amber-500 text-xs">{renderStars(rating.avg)}</span>
										<span class="text-[10px] text-base-content/30 font-bold">({rating.total})</span>
									</div>
								{/if}
							</div>
						</div>

						<h3 class="text-xl font-bold">{room.name}</h3>

						<div class="flex flex-col gap-2 mt-3">
							<div class="flex justify-between text-sm font-medium border-b border-base-200 pb-2">
								<span class="text-base-content/50 flex items-center gap-1.5">
									<Icon icon="solar:users-group-rounded-line-duotone" class="text-sm"/>
									Sức chứa
								</span>
								<span>Tối đa {room.capacity} Khách</span>
							</div>
							<div class="flex justify-between text-sm font-medium pt-1">
								<span class="text-base-content/50 flex items-center gap-1.5">
									<Icon icon="solar:tag-price-line-duotone" class="text-sm"/>
									Giá / Giờ
								</span>
								<span class="text-xl font-black gradient-text">{formatVND(room.pricePerHour)}</span>
							</div>
						</div>

						<div class="card-actions mt-4">
							<a href="/booking/{room.id}" class="btn btn-primary rounded-lg w-full font-bold tracking-wider uppercase text-xs group-hover:glow-purple transition-shadow">
								<Icon icon="solar:calendar-add-bold-duotone" class="text-lg"/>
								Đặt Phòng Ngay
							</a>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
