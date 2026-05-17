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
		return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(new Date(d));
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
		pricing: 'Giá/Khung Gi�'
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
	<div class="flex items-center justify-center min-h-[50vh]">
		<span class="loading loading-spinner loading-lg text-primary"></span>
	</div>
{:else}
	<div class="flex flex-col gap-6">
		<div class="flex items-center justify-between">
			<div>
				<h2 class="text-xl font-bold">Nhật Ký Hoạt Động</h2>
				<p class="text-sm text-base-content/40 font-medium mt-0.5">Tổng cộng {totalLogs} hoạt động được ghi nhận</p>
			</div>
		</div>

		<div class="flex gap-2 flex-wrap">
			<button onclick={() => { filterEntity = ''; handleFilter(); }} class="btn btn-xs rounded-lg font-bold {filterEntity === '' ? 'btn-primary' : 'btn-ghost'}">Tất Cả</button>
			<button onclick={() => { filterEntity = 'booking'; handleFilter(); }} class="btn btn-xs rounded-lg font-bold {filterEntity === 'booking' ? 'btn-primary' : 'btn-ghost'}">Đặt Phòng</button>
			<button onclick={() => { filterEntity = 'room'; handleFilter(); }} class="btn btn-xs rounded-lg font-bold {filterEntity === 'room' ? 'btn-primary' : 'btn-ghost'}">Phòng</button>
			<button onclick={() => { filterEntity = 'service'; handleFilter(); }} class="btn btn-xs rounded-lg font-bold {filterEntity === 'service' ? 'btn-primary' : 'btn-ghost'}">Dịch Vụ</button>
			<button onclick={() => { filterEntity = 'promotion'; handleFilter(); }} class="btn btn-xs rounded-lg font-bold {filterEntity === 'promotion' ? 'btn-primary' : 'btn-ghost'}">Khuyến Mãi</button>
			<button onclick={() => { filterEntity = 'user'; handleFilter(); }} class="btn btn-xs rounded-lg font-bold {filterEntity === 'user' ? 'btn-primary' : 'btn-ghost'}">Thành Viên</button>
			<button onclick={() => { filterEntity = 'branch'; handleFilter(); }} class="btn btn-xs rounded-lg font-bold {filterEntity === 'branch' ? 'btn-primary' : 'btn-ghost'}">Chi Nhánh</button>
			<button onclick={() => { filterEntity = 'pricing'; handleFilter(); }} class="btn btn-xs rounded-lg font-bold {filterEntity === 'pricing' ? 'btn-primary' : 'btn-ghost'}">Giá/Khung Gi�</button>
			<button onclick={() => { filterEntity = 'setting'; handleFilter(); }} class="btn btn-xs rounded-lg font-bold {filterEntity === 'setting' ? 'btn-primary' : 'btn-ghost'}">Cài Đặt</button>
		</div>

		<div class="bg-base-100 rounded-xl border border-base-300/50 overflow-hidden">
			{#if logs.length === 0}
				<div class="p-12 text-center text-base-content/30 font-medium">
					<Icon icon="solar:history-line-duotone" class="text-4xl mx-auto mb-3 opacity-50" />
					<p class="text-sm">Chưa có hoạt động nào được ghi nhận.</p>
				</div>
			{:else}
				<div class="divide-y divide-base-200">
					{#each logs as log}
						{@const ai = actionIcons[log.action] || { icon: 'solar:info-circle-bold-duotone', cls: 'text-base-content/40' }}
						<div class="flex items-start gap-4 px-5 py-4 hover:bg-base-200/30 transition-colors">
							<div class="w-9 h-9 rounded-lg bg-base-200 flex items-center justify-center shrink-0 mt-0.5">
								<Icon icon={ai.icon} class="text-lg {ai.cls}" />
							</div>
							<div class="flex-1 min-w-0">
								<div class="flex items-center gap-2 flex-wrap">
									<span class="text-sm font-bold">{log.userName || 'Hệ thống'}</span>
									<span class="text-xs font-medium text-base-content/40">
										{actionLabels[log.action] || log.action}
									</span>
									<span class="badge badge-ghost badge-xs rounded-md font-bold">{entityLabels[log.entity] || log.entity}</span>
									{#if log.entityId}
										<span class="text-xs font-mono text-base-content/30">#{log.entityId}</span>
									{/if}
								</div>
								{#if log.details}
									<p class="text-xs text-base-content/50 font-medium mt-1">{log.details}</p>
								{/if}
							</div>
							<span class="text-[11px] text-base-content/30 font-medium whitespace-nowrap shrink-0">{fmtTime(log.createdAt)}</span>
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
				{#each Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
					if (totalPages <= 7) return i + 1;
					if (currentPage <= 4) return i + 1;
					if (currentPage >= totalPages - 3) return totalPages - 6 + i;
					return currentPage - 3 + i;
				}) as p}
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


