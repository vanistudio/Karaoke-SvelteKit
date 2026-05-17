<script lang="ts">
	import { trpc } from '$lib/trpc/client';
	import Icon from '@iconify/svelte';

	let reviews = $state<any[]>([]);
	let overallStats = $state<any>(null);
	let isReady = $state(false);
	let currentPage = $state(1);
	let totalPages = $state(1);
	let totalReviews = $state(0);

	$effect(() => {
		loadData();
	});

	async function loadData() {
		try {
			const [result, stats] = await Promise.all([
				trpc().review.list.query({ page: currentPage, limit: 20 }),
				trpc().review.overallStats.query()
			]);
			reviews = result.data;
			totalPages = result.totalPages;
			totalReviews = result.total;
			overallStats = stats;
		} catch (e) {
			console.error(e);
		} finally {
			isReady = true;
		}
	}

	function goToPage(page: number) {
		if (page < 1 || page > totalPages) return;
		currentPage = page;
		loadData();
	}

	function fmtDate(d: string | Date | null) {
		if (!d) return '—';
		return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(d));
	}

	function renderStars(rating: number): string {
		return '★'.repeat(rating) + '☆'.repeat(5 - rating);
	}
</script>

<svelte:head><title>Đánh Giá | KaraSystem Admin</title></svelte:head>

{#if !isReady}
	<div class="flex items-center justify-center min-h-[50vh]">
		<span class="loading loading-spinner loading-lg text-primary"></span>
	</div>
{:else}
	<div class="flex flex-col gap-6">
		<div class="flex items-center justify-between">
			<div>
				<h2 class="text-xl font-bold">Đánh Giá Khách Hàng</h2>
				<p class="text-sm text-base-content/40 font-medium mt-0.5">Tổng cộng {totalReviews} đánh giá từ khách hàng</p>
			</div>
		</div>

		{#if overallStats}
			<div class="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
				<div class="bg-base-100 rounded-xl border border-base-300/50 p-4 lg:p-5">
					<p class="text-[10px] font-bold text-base-content/40 uppercase tracking-widest">Điểm Trung Bình</p>
					<div class="flex items-end gap-2 mt-1">
						<span class="text-2xl font-black text-amber-500">{overallStats.avgRating}</span>
						<span class="text-sm font-bold text-base-content/30 mb-0.5">/ 5</span>
					</div>
					<p class="text-amber-500 text-sm mt-1 tracking-wider">{renderStars(Math.round(overallStats.avgRating))}</p>
				</div>
				<div class="bg-base-100 rounded-xl border border-base-300/50 p-4 lg:p-5">
					<p class="text-[10px] font-bold text-base-content/40 uppercase tracking-widest">Tổng Đánh Giá</p>
					<p class="text-2xl font-black mt-1">{overallStats.totalReviews}</p>
				</div>
				<div class="bg-base-100 rounded-xl border border-base-300/50 p-4 lg:p-5">
					<p class="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Tỷ Lệ Hài Lòng</p>
					<p class="text-2xl font-black text-emerald-600 mt-1">
						{overallStats.totalReviews > 0 ? Math.round((overallStats.avgRating / 5) * 100) : 0}%
					</p>
				</div>
			</div>
		{/if}

		<div class="bg-base-100 rounded-xl border border-base-300/50 overflow-hidden">
			{#if reviews.length === 0}
				<div class="p-12 text-center text-base-content/30 font-medium">
					<Icon icon="solar:star-line-duotone" class="text-4xl mx-auto mb-3 opacity-50" />
					<p class="text-sm">Chưa có đánh giá nào.</p>
				</div>
			{:else}
				<div class="divide-y divide-base-200">
					{#each reviews as r}
						<div class="px-5 py-4 hover:bg-base-200/30 transition-colors">
							<div class="flex items-start justify-between gap-4">
								<div class="flex items-start gap-3 flex-1 min-w-0">
									<div class="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
										<span class="text-sm font-black text-amber-500">{r.rating}</span>
									</div>
									<div class="flex-1 min-w-0">
										<div class="flex items-center gap-2 flex-wrap">
											<span class="text-sm font-bold">{r.userName || 'Ẩn danh'}</span>
											<span class="text-amber-500 text-xs tracking-wider">{renderStars(r.rating)}</span>
										</div>
										<div class="flex items-center gap-2 mt-0.5">
											<span class="text-xs text-primary font-medium">{r.roomName || '—'}</span>
											<span class="text-xs text-base-content/30">• Đơn #{r.bookingId}</span>
										</div>
										{#if r.comment}
											<p class="text-sm text-base-content/60 font-medium mt-2 leading-relaxed">"{r.comment}"</p>
										{/if}
									</div>
								</div>
								<span class="text-[11px] text-base-content/30 font-medium whitespace-nowrap shrink-0">{fmtDate(r.createdAt)}</span>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>

		{#if totalPages > 1}
			<div class="flex items-center justify-center gap-2">
				<button onclick={() => goToPage(currentPage - 1)} class="btn btn-ghost btn-sm rounded-lg" disabled={currentPage <= 1}>
					<Icon icon="solar:arrow-left-line-duotone" class="text-lg"/>
				</button>
				{#each Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1) as p}
					<button onclick={() => goToPage(p)} class="btn btn-sm rounded-lg min-w-[36px] {p === currentPage ? 'btn-primary' : 'btn-ghost'} font-bold">
						{p}
					</button>
				{/each}
				<button onclick={() => goToPage(currentPage + 1)} class="btn btn-ghost btn-sm rounded-lg" disabled={currentPage >= totalPages}>
					<Icon icon="solar:arrow-right-line-duotone" class="text-lg"/>
				</button>
			</div>
		{/if}
	</div>
{/if}
