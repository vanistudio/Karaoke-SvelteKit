<script lang="ts">
	import { trpc } from '$lib/trpc/client';
	import Icon from '@iconify/svelte';

	let services = $state<any[]>([]);
	let isReady = $state(false);
	let activeCategory = $state('all');

	$effect(() => {
		fetchServices();
	});

	async function fetchServices() {
		try {
			services = await trpc().service.list.query();
		} catch (error) {
			console.error(error);
		} finally {
			isReady = true;
		}
	}

	let filtered = $derived(
		activeCategory === 'all' ? services.filter(s => s.isAvailable) : services.filter(s => s.isAvailable && s.category === activeCategory)
	);

	const categoryLabel: Record<string, string> = { food: 'Đồ Ăn', drink: 'Đồ Uống', decoration: 'Trang Trí', other: 'Khác' };
	const categoryIcon: Record<string, string> = {
		food: 'solar:chef-hat-bold-duotone',
		drink: 'solar:cup-hot-bold-duotone',
		decoration: 'solar:magic-stick-3-bold-duotone',
		other: 'solar:star-bold-duotone'
	};
	const categoryColor: Record<string, string> = {
		food: 'text-orange-500 bg-orange-500/10',
		drink: 'text-cyan-500 bg-cyan-500/10',
		decoration: 'text-pink-500 bg-pink-500/10',
		other: 'text-violet-500 bg-violet-500/10'
	};

	function formatVND(value: number) {
		return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
	}
</script>

<svelte:head>
	<title>Dịch Vụ | KaraSystem</title>
</svelte:head>

<div class="flex flex-col gap-8">
	<div class="gradient-karaoke rounded-2xl p-8 lg:p-10 relative overflow-hidden">
		<div class="absolute top-4 right-8 opacity-10">
			<Icon icon="solar:cup-hot-bold-duotone" class="text-[100px] text-white" />
		</div>
		<div class="relative z-10 text-center max-w-2xl mx-auto">
			<div class="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 mb-4">
				<Icon icon="solar:wineglass-triangle-bold-duotone" class="text-sm text-violet-300"/>
				<span class="text-[11px] font-bold text-white/80 uppercase tracking-widest">Menu Dịch Vụ</span>
			</div>
			<h1 class="text-2xl lg:text-4xl font-black text-white uppercase tracking-tight leading-tight mb-3">
				Dịch Vụ & Ẩm Thực
			</h1>
			<p class="text-white/50 font-medium text-sm">Đặt kèm dịch vụ khi book phòng — đồ ăn, đồ uống, trang trí sự kiện.</p>
		</div>
	</div>
	<div class="flex gap-2 flex-wrap justify-center">
		<button onclick={() => activeCategory = 'all'} class={`btn btn-sm rounded-lg font-bold tracking-wider ${activeCategory === 'all' ? 'btn-primary' : 'btn-ghost'}`}>
			<Icon icon="solar:widget-2-line-duotone" class="text-base"/>
			Tất Cả ({services.filter(s => s.isAvailable).length})
		</button>
		{#each Object.entries(categoryLabel) as [key, label]}
			<button onclick={() => activeCategory = key} class={`btn btn-sm rounded-lg font-bold tracking-wider ${activeCategory === key ? 'btn-primary' : 'btn-ghost'}`}>
				<Icon icon={categoryIcon[key]} class="text-base"/>
				{label} ({services.filter(s => s.isAvailable && s.category === key).length})
			</button>
		{/each}
	</div>
	{#if !isReady}
		<div class="flex items-center justify-center min-h-[30vh]">
			<span class="loading loading-spinner loading-lg text-primary"></span>
		</div>
	{:else if filtered.length === 0}
		<div class="bg-base-100 rounded-xl neon-border p-10 text-center">
			<Icon icon="solar:cup-hot-line-duotone" class="text-5xl text-base-content/15 mx-auto mb-4" />
			<h3 class="font-bold text-lg">Chưa có dịch vụ nào trong danh mục này</h3>
		</div>
	{:else}
		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
			{#each filtered as svc}
				{@const catColor = categoryColor[svc.category] || 'text-base-content/50 bg-base-200'}
				<div class="card bg-base-100 rounded-xl neon-border group">
					<div class="card-body p-5">
						<div class="flex items-start justify-between mb-3">
							<div class="w-11 h-11 rounded-lg {catColor} flex items-center justify-center group-hover:scale-110 transition-transform">
								<Icon icon={categoryIcon[svc.category] || 'solar:star-bold-duotone'} class="text-xl" />
							</div>
							<span class="badge badge-xs rounded-md font-bold uppercase {catColor} border-0">
								{categoryLabel[svc.category] || svc.category}
							</span>
						</div>

						<h3 class="text-sm font-bold leading-tight">{svc.name}</h3>
						{#if svc.description}
							<p class="text-xs text-base-content/40 font-medium mt-1 line-clamp-2">{svc.description}</p>
						{/if}

						<div class="mt-auto pt-3 border-t border-base-200 mt-3">
							<span class="text-lg font-black gradient-text">{formatVND(svc.price)}</span>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}
	<div class="bg-base-100 rounded-xl neon-border p-6">
		<div class="flex items-center gap-3 mb-4">
			<div class="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
				<Icon icon="solar:info-circle-bold-duotone" class="text-lg text-primary"/>
			</div>
			<h3 class="font-bold text-sm">Cách Đặt Dịch Vụ</h3>
		</div>
		<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
			<div class="flex items-start gap-3">
				<div class="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
					<span class="text-xs font-black text-primary">1</span>
				</div>
				<p class="text-xs text-base-content/50 font-medium">Chọn phòng và thời gian đặt phòng trước.</p>
			</div>
			<div class="flex items-start gap-3">
				<div class="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
					<span class="text-xs font-black text-primary">2</span>
				</div>
				<p class="text-xs text-base-content/50 font-medium">Trong form đặt phòng, chọn dịch vụ đi kèm và số lượng.</p>
			</div>
			<div class="flex items-start gap-3">
				<div class="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
					<span class="text-xs font-black text-primary">3</span>
				</div>
				<p class="text-xs text-base-content/50 font-medium">Xác nhận đặt phòng — dịch vụ sẽ được chuẩn bị sẵn khi bạn đến.</p>
			</div>
		</div>
	</div>
</div>
