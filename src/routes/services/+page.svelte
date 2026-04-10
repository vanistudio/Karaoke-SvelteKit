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
			services = (await trpc().service.list.query()).filter((s: any) => s.isAvailable);
		} catch (error) {
			console.error(error);
		} finally {
			isReady = true;
		}
	}

	let filteredServices = $derived(
		activeCategory === 'all' ? services : services.filter(s => s.category === activeCategory)
	);

	const categoryLabel: Record<string, string> = { food: 'Đồ Ăn', drink: 'Thức Uống', decoration: 'Trang Trí', other: 'Khác' };
	const categoryIcon: Record<string, string> = { food: 'solar:chef-hat-heart-line-duotone', drink: 'solar:wineglass-triangle-line-duotone', decoration: 'solar:star-shine-line-duotone', other: 'solar:box-line-duotone' };

	function formatVND(value: number) {
		return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
	}
</script>

<svelte:head>
	<title>Menu Dịch Vụ | KaraSystem</title>
</svelte:head>

<div class="flex flex-col gap-8">
	<div class="bg-base-200 rounded-md py-10 px-6 border border-base-300">
		<div class="text-center w-full max-w-3xl mx-auto">
			<div class="badge badge-primary rounded-md mb-4 tracking-widest font-bold font-mono px-4 py-3">MENU DỊCH VỤ</div>
			<h1 class="text-3xl lg:text-4xl font-black uppercase tracking-tight text-base-content mb-4 leading-tight">
				Ẩm Thực & Dịch Vụ Đi Kèm
			</h1>
			<p class="py-2 text-base-content/70 font-medium">Đa dạng lựa chọn từ đồ ăn nhẹ đến tiệc buffet, thức uống cao cấp và dịch vụ trang trí sự kiện.</p>
		</div>
	</div>

	<div class="flex gap-2 flex-wrap justify-center">
		<button onclick={() => activeCategory = 'all'} class={`btn btn-sm rounded-md font-bold tracking-widest uppercase ${activeCategory === 'all' ? 'btn-primary' : 'btn-ghost'}`}>Tất Cả ({services.length})</button>
		{#each Object.entries(categoryLabel) as [key, label]}
			<button onclick={() => activeCategory = key} class={`btn btn-sm rounded-md font-bold tracking-wider ${activeCategory === key ? 'btn-primary' : 'btn-ghost'}`}>
				<Icon icon={categoryIcon[key]} class="text-base"/>
				{label} ({services.filter(s => s.category === key).length})
			</button>
		{/each}
	</div>

	{#if !isReady}
		<div class="flex items-center justify-center min-h-[30vh]">
			<span class="loading loading-spinner loading-lg text-primary"></span>
		</div>
	{:else if filteredServices.length === 0}
		<div class="bg-base-100 rounded-md border border-base-300 p-10 text-center">
			<Icon icon="solar:box-minimalistic-line-duotone" class="text-5xl text-base-content/20 mx-auto mb-4" />
			<h3 class="font-bold text-lg">Chưa có dịch vụ nào trong danh mục này</h3>
		</div>
	{:else}
		<div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
			{#each filteredServices as svc}
				<div class="card bg-base-100 rounded-md border border-base-300 hover:border-primary transition-colors duration-300 group overflow-hidden">
					{#if svc.imageUrl}
						<figure class="h-48 w-full bg-base-200 border-b border-base-300 overflow-hidden relative">
							<img src={svc.imageUrl} alt={svc.name} class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
							<div class="absolute top-3 right-3 badge badge-sm badge-base-100/90 backdrop-blur-md rounded-md font-bold uppercase border-none shadow-sm">
								{categoryLabel[svc.category] || svc.category}
							</div>
						</figure>
					{/if}
					<div class="card-body p-6">
						{#if !svc.imageUrl}
							<div class="flex items-start justify-between mb-3">
								<div class="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center group-hover:scale-105 transition-transform">
									<Icon icon={categoryIcon[svc.category] || 'solar:box-line-duotone'} class="text-2xl text-primary"/>
								</div>
								<div class="badge badge-sm badge-ghost rounded-md font-bold uppercase">
									{categoryLabel[svc.category] || svc.category}
								</div>
							</div>
						{/if}
						<h3 class="font-bold text-lg {svc.imageUrl ? 'mt-1' : ''}">{svc.name}</h3>
						{#if svc.description}
							<p class="text-sm text-base-content/60 font-medium mt-1 line-clamp-2">{svc.description}</p>
						{/if}
						<div class="flex items-end justify-between mt-4">
							<p class="text-2xl font-black text-primary">{formatVND(svc.price)}</p>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
