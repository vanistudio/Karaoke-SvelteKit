<script lang="ts">
	import { trpc } from '$lib/trpc/client';
	import Icon from '@iconify/svelte';

	let logs = $state<any[]>([]);
	let isReady = $state(false);
	let currentPage = $state(1);
	let totalPages = $state(1);
	let totalLogs = $state(0);
	let filterEntity = $state('');

	$effect(() => {
		loadData();
	});

	async function loadData() {
		try {
			const result = await trpc().activity.list.query({
				page: currentPage,
				limit: 20,
				entity: filterEntity || undefined
			});
			logs = result.data;
			totalPages = result.totalPages;
			totalLogs = result.total;
		} catch (e) {
			console.error(e);
		} finally {
			isReady = true;
		}
	}

	function handleFilter() {
		currentPage = 1;
		loadData();
	}

	function goToPage(page: number) {
		if (page < 1 || page > totalPages) return;
		currentPage = page;
		loadData();
	}

	function fmtTime(d: string | Date | null) {
		if (!d) return '—';
		return new Intl.DateTimeFormat('vi-VN', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit'
		}).format(new Date(d));
	}

	const actionIcons: Record<string, { icon: string; cls: string }> = {
		create: { icon: 'solar:add-circle-bold-duotone', cls: 'text-emerald-500' },
		update: { icon: 'solar:pen-2-bold-duotone', cls: 'text-blue-500' },
		delete: { icon: 'solar:trash-bin-trash-bold-duotone', cls: 'text-red-500' },
		status_change: { icon: 'solar:refresh-circle-bold-duotone', cls: 'text-amber-500' }
	};

	const entityLabels: Record<string, string> = {
		booking: 'Đặt Phòng',
		room: 'Phòng',
		service: 'Dịch Vụ',
		promotion: 'Khuyến Mãi',
		user: 'Thành Viên',
		setting: 'Cài Đặt',
		branch: 'Chi Nhánh',
		pricing: 'Giá/Khung Giờ'
	};

	const actionLabels: Record<string, string> = {
		create: 'Tạo Mới',
		update: 'Cập Nhật',
		delete: 'Xóa',
		status_change: 'Đổi Trạng Thái'
	};
</script>

<svelte:head><title>Nhật Ký Hoạt Động | KaraSystem Admin</title></svelte:head>

{#if !isReady}
	<div class="flex min-h-[50vh] items-center justify-center">
		<span class="loading loading-lg loading-spinner text-primary"></span>
	</div>
{:else}
	<div class="flex flex-col gap-6">
		<div class="flex items-center justify-between">
			<div>
				<h2 class="text-xl font-bold">Nhật Ký Hoạt Động</h2>
				<p class="mt-0.5 text-sm font-medium text-base-content/40">
					Tổng cộng {totalLogs} hoạt động được ghi nhận
				</p>
			</div>
		</div>

		<div class="flex flex-wrap gap-2">
			<button
				onclick={() => {
					filterEntity = '';
					handleFilter();
				}}
				class="btn rounded-lg font-bold btn-xs {filterEntity === '' ? 'btn-primary' : 'btn-ghost'}"
				>Tất Cả</button
			>
			<button
				onclick={() => {
					filterEntity = 'booking';
					handleFilter();
				}}
				class="btn rounded-lg font-bold btn-xs {filterEntity === 'booking'
					? 'btn-primary'
					: 'btn-ghost'}">Đặt Phòng</button
			>
			<button
				onclick={() => {
					filterEntity = 'room';
					handleFilter();
				}}
				class="btn rounded-lg font-bold btn-xs {filterEntity === 'room'
					? 'btn-primary'
					: 'btn-ghost'}">Phòng</button
			>
			<button
				onclick={() => {
					filterEntity = 'service';
					handleFilter();
				}}
				class="btn rounded-lg font-bold btn-xs {filterEntity === 'service'
					? 'btn-primary'
					: 'btn-ghost'}">Dịch Vụ</button
			>
			<button
				onclick={() => {
					filterEntity = 'promotion';
					handleFilter();
				}}
				class="btn rounded-lg font-bold btn-xs {filterEntity === 'promotion'
					? 'btn-primary'
					: 'btn-ghost'}">Khuyến Mãi</button
			>
			<button
				onclick={() => {
					filterEntity = 'user';
					handleFilter();
				}}
				class="btn rounded-lg font-bold btn-xs {filterEntity === 'user'
					? 'btn-primary'
					: 'btn-ghost'}">Thành Viên</button
			>
			<button
				onclick={() => {
					filterEntity = 'branch';
					handleFilter();
				}}
				class="btn rounded-lg font-bold btn-xs {filterEntity === 'branch'
					? 'btn-primary'
					: 'btn-ghost'}">Chi Nhánh</button
			>
			<button
				onclick={() => {
					filterEntity = 'pricing';
					handleFilter();
				}}
				class="btn rounded-lg font-bold btn-xs {filterEntity === 'pricing'
					? 'btn-primary'
					: 'btn-ghost'}">Giá/Khung Giờ</button
			>
			<button
				onclick={() => {
					filterEntity = 'setting';
					handleFilter();
				}}
				class="btn rounded-lg font-bold btn-xs {filterEntity === 'setting'
					? 'btn-primary'
					: 'btn-ghost'}">Cài Đặt</button
			>
		</div>

		<div class="overflow-hidden rounded-xl border border-base-300/50 bg-base-100">
			{#if logs.length === 0}
				<div class="p-12 text-center font-medium text-base-content/30">
					<Icon icon="solar:history-line-duotone" class="mx-auto mb-3 text-4xl opacity-50" />
					<p class="text-sm">Chưa có hoạt động nào được ghi nhận.</p>
				</div>
			{:else}
				<div class="divide-y divide-base-200">
					{#each logs as log}
						{@const ai = actionIcons[log.action] || {
							icon: 'solar:info-circle-bold-duotone',
							cls: 'text-base-content/40'
						}}
						<div class="flex items-start gap-4 px-5 py-4 transition-colors hover:bg-base-200/30">
							<div
								class="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-base-200"
							>
								<Icon icon={ai.icon} class="text-lg {ai.cls}" />
							</div>
							<div class="min-w-0 flex-1">
								<div class="flex flex-wrap items-center gap-2">
									<span class="text-sm font-bold">{log.userName || 'Hệ thống'}</span>
									<span class="text-xs font-medium text-base-content/40">
										{actionLabels[log.action] || log.action}
									</span>
									<span class="badge rounded-md badge-ghost badge-xs font-bold"
										>{entityLabels[log.entity] || log.entity}</span
									>
									{#if log.entityId}
										<span class="font-mono text-xs text-base-content/30">#{log.entityId}</span>
									{/if}
								</div>
								{#if log.details}
									<p class="mt-1 text-xs font-medium text-base-content/50">{log.details}</p>
								{/if}
							</div>
							<span class="shrink-0 text-[11px] font-medium whitespace-nowrap text-base-content/30"
								>{fmtTime(log.createdAt)}</span
							>
						</div>
					{/each}
				</div>
			{/if}
		</div>

		{#if totalPages > 1}
			<div class="flex items-center justify-center gap-2">
				<button
					onclick={() => goToPage(currentPage - 1)}
					class="btn rounded-lg btn-ghost btn-sm"
					disabled={currentPage <= 1}
				>
					<Icon icon="solar:arrow-left-line-duotone" class="text-lg" />
				</button>
				{#each Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
					if (totalPages <= 7) return i + 1;
					if (currentPage <= 4) return i + 1;
					if (currentPage >= totalPages - 3) return totalPages - 6 + i;
					return currentPage - 3 + i;
				}) as p}
					<button
						onclick={() => goToPage(p)}
						class="btn min-w-[36px] rounded-lg btn-sm {p === currentPage
							? 'btn-primary'
							: 'btn-ghost'} font-bold"
					>
						{p}
					</button>
				{/each}
				<button
					onclick={() => goToPage(currentPage + 1)}
					class="btn rounded-lg btn-ghost btn-sm"
					disabled={currentPage >= totalPages}
				>
					<Icon icon="solar:arrow-right-line-duotone" class="text-lg" />
				</button>
			</div>
		{/if}
	</div>
{/if}
