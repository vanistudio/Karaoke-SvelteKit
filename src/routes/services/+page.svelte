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
		activeCategory === 'all'
			? services.filter((s) => s.isAvailable)
			: services.filter((s) => s.isAvailable && s.category === activeCategory)
	);

	const categoryLabel: Record<string, string> = {
		food: 'Đồ Ăn',
		drink: 'Đồ Uống',
		decoration: 'Trang Trí',
		other: 'Khác'
	};
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
	<div class="gradient-karaoke relative overflow-hidden rounded-2xl p-8 lg:p-10">
		<div class="absolute top-4 right-8 opacity-10">
			<Icon icon="solar:cup-hot-bold-duotone" class="text-[100px] text-white" />
		</div>
		<div class="relative z-10 mx-auto max-w-2xl text-center">
			<div
				class="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 backdrop-blur-sm"
			>
				<Icon icon="solar:wineglass-triangle-bold-duotone" class="text-sm text-violet-300" />
				<span class="text-[11px] font-bold tracking-widest text-white/80 uppercase"
					>Menu Dịch Vụ</span
				>
			</div>
			<h1
				class="mb-3 text-2xl leading-tight font-black tracking-tight text-white uppercase lg:text-4xl"
			>
				Dịch Vụ & Ẩm Thực
			</h1>
			<p class="text-sm font-medium text-white/50">
				Đặt kèm dịch vụ khi book phòng — đồ ăn, đồ uống, trang trí sự kiện.
			</p>
		</div>
	</div>
	<div class="flex flex-wrap justify-center gap-2">
		<button
			onclick={() => (activeCategory = 'all')}
			class={`btn rounded-lg font-bold tracking-wider btn-sm ${activeCategory === 'all' ? 'btn-primary' : 'btn-ghost'}`}
		>
			<Icon icon="solar:widget-2-line-duotone" class="text-base" />
			Tất Cả ({services.filter((s) => s.isAvailable).length})
		</button>
		{#each Object.entries(categoryLabel) as [key, label]}
			<button
				onclick={() => (activeCategory = key)}
				class={`btn rounded-lg font-bold tracking-wider btn-sm ${activeCategory === key ? 'btn-primary' : 'btn-ghost'}`}
			>
				<Icon icon={categoryIcon[key]} class="text-base" />
				{label} ({services.filter((s) => s.isAvailable && s.category === key).length})
			</button>
		{/each}
	</div>
	{#if !isReady}
		<div class="flex min-h-[30vh] items-center justify-center">
			<span class="loading loading-lg loading-spinner text-primary"></span>
		</div>
	{:else if filtered.length === 0}
		<div class="neon-border rounded-xl bg-base-100 p-10 text-center">
			<Icon icon="solar:cup-hot-line-duotone" class="mx-auto mb-4 text-5xl text-base-content/15" />
			<h3 class="text-lg font-bold">Chưa có dịch vụ nào trong danh mục này</h3>
		</div>
	{:else}
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
			{#each filtered as svc}
				{@const catColor = categoryColor[svc.category] || 'text-base-content/50 bg-base-200'}
				<div class="neon-border group card rounded-xl bg-base-100">
					<div class="card-body p-5">
						<div class="mb-3 flex items-start justify-between">
							<div
								class="h-11 w-11 rounded-lg {catColor} flex items-center justify-center transition-transform group-hover:scale-110"
							>
								<Icon
									icon={categoryIcon[svc.category] || 'solar:star-bold-duotone'}
									class="text-xl"
								/>
							</div>
							<span class="badge rounded-md badge-xs font-bold uppercase {catColor} border-0">
								{categoryLabel[svc.category] || svc.category}
							</span>
						</div>

						<h3 class="text-sm leading-tight font-bold">{svc.name}</h3>
						{#if svc.description}
							<p class="mt-1 line-clamp-2 text-xs font-medium text-base-content/40">
								{svc.description}
							</p>
						{/if}

						<div class="mt-3 mt-auto border-t border-base-200 pt-3">
							<span class="gradient-text text-lg font-black">{formatVND(svc.price)}</span>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}
	<div class="neon-border rounded-xl bg-base-100 p-6">
		<div class="mb-4 flex items-center gap-3">
			<div class="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
				<Icon icon="solar:info-circle-bold-duotone" class="text-lg text-primary" />
			</div>
			<h3 class="text-sm font-bold">Cách Đặt Dịch Vụ</h3>
		</div>
		<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
			<div class="flex items-start gap-3">
				<div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10">
					<span class="text-xs font-black text-primary">1</span>
				</div>
				<p class="text-xs font-medium text-base-content/50">
					Chọn phòng và thời gian đặt phòng trước.
				</p>
			</div>
			<div class="flex items-start gap-3">
				<div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10">
					<span class="text-xs font-black text-primary">2</span>
				</div>
				<p class="text-xs font-medium text-base-content/50">
					Trong form đặt phòng, chọn dịch vụ đi kèm và số lượng.
				</p>
			</div>
			<div class="flex items-start gap-3">
				<div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10">
					<span class="text-xs font-black text-primary">3</span>
				</div>
				<p class="text-xs font-medium text-base-content/50">
					Xác nhận đặt phòng — dịch vụ sẽ được chuẩn bị sẵn khi bạn đến.
				</p>
			</div>
		</div>
	</div>
</div>
