<script lang="ts">
	import { trpc } from '$lib/trpc/client';
	import Icon from '@iconify/svelte';
	import { addToast } from '$lib/stores/toast';

	let bookings = $state<any[]>([]);
	let isReady = $state(false);
	let filterStatus = $state('all');

	$effect(() => {
		loadData();
	});

	async function loadData() {
		try {
			bookings = await trpc().dashboard.enrichedBookings.query();
		} catch (e) {
			console.error(e);
		} finally {
			isReady = true;
		}
	}

	let filtered = $derived(
		filterStatus === 'all' ? bookings : bookings.filter(b => b.status === filterStatus)
	);
	let pendingCount = $derived(bookings.filter(b => b.status === 'pending').length);
	let confirmedCount = $derived(bookings.filter(b => b.status === 'confirmed').length);
	let cancelledCount = $derived(bookings.filter(b => b.status === 'cancelled').length);

	async function changeStatus(id: number, newStatus: 'pending' | 'confirmed' | 'cancelled') {
		try {
			await trpc().booking.changeStatus.mutate({ id, status: newStatus });
			addToast(`Đơn #${id} đã cập nhật!`, 'success');
			await loadData();
		} catch (e: any) {
			addToast(e?.message || 'Cập nhật thất bại.', 'error');
		}
	}

	function fmtVND(v: number) {
		return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);
	}

	function fmtTime(d: string | Date | null) {
		if (!d) return '—';
		return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(d));
	}

	const statusMap: Record<string, { text: string; cls: string }> = {
		pending: { text: 'Chờ Duyệt', cls: 'badge-warning' },
		confirmed: { text: 'Xác Nhận', cls: 'badge-success' },
		cancelled: { text: 'Đã Hủy', cls: 'badge-error text-white' }
	};
</script>

<svelte:head><title>Lịch Đặt Phòng | KaraSystem Admin</title></svelte:head>

<div class="flex flex-col gap-6">
	<div class="flex items-center justify-between">
		<div>
			<h2 class="text-xl font-bold">Lịch Đặt Phòng</h2>
			<p class="text-sm text-base-content/40 font-medium mt-0.5">Quản lý tất cả đơn đặt phòng karaoke</p>
		</div>
		<button onclick={loadData} class="btn btn-ghost btn-sm rounded-lg text-base-content/40 hover:text-primary">
			<Icon icon="solar:refresh-line-duotone" class="text-lg"/>
			Làm Mới
		</button>
	</div>

	<div class="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
		<div class="bg-base-100 rounded-xl border border-base-300/50 p-4 lg:p-5">
			<p class="text-[10px] font-bold text-base-content/40 uppercase tracking-widest">Tổng Đơn</p>
			<p class="text-2xl font-black mt-1">{bookings.length}</p>
		</div>
		<div class="bg-base-100 rounded-xl border border-base-300/50 p-4 lg:p-5">
			<p class="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Chờ Duyệt</p>
			<p class="text-2xl font-black text-amber-600 mt-1">{pendingCount}</p>
		</div>
		<div class="bg-base-100 rounded-xl border border-base-300/50 p-4 lg:p-5">
			<p class="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Xác Nhận</p>
			<p class="text-2xl font-black text-emerald-600 mt-1">{confirmedCount}</p>
		</div>
		<div class="bg-base-100 rounded-xl border border-base-300/50 p-4 lg:p-5">
			<p class="text-[10px] font-bold text-red-500 uppercase tracking-widest">Đã Hủy</p>
			<p class="text-2xl font-black text-red-500 mt-1">{cancelledCount}</p>
		</div>
	</div>

	<div class="flex gap-2 flex-wrap">
		<button onclick={() => filterStatus = 'all'} class="btn btn-xs rounded-lg font-bold {filterStatus === 'all' ? 'btn-primary' : 'btn-ghost'}">Tất Cả ({bookings.length})</button>
		<button onclick={() => filterStatus = 'pending'} class="btn btn-xs rounded-lg font-bold {filterStatus === 'pending' ? 'btn-warning' : 'btn-ghost'}">Chờ Duyệt ({pendingCount})</button>
		<button onclick={() => filterStatus = 'confirmed'} class="btn btn-xs rounded-lg font-bold {filterStatus === 'confirmed' ? 'btn-success' : 'btn-ghost'}">Xác Nhận ({confirmedCount})</button>
		<button onclick={() => filterStatus = 'cancelled'} class="btn btn-xs rounded-lg font-bold {filterStatus === 'cancelled' ? 'btn-error text-white' : 'btn-ghost'}">Đã Hủy ({cancelledCount})</button>
	</div>

	<div class="bg-base-100 rounded-xl border border-base-300/50 overflow-hidden">
		<div class="overflow-x-auto">
			<table class="table table-sm">
				<thead>
					<tr class="text-[10px] uppercase tracking-widest text-base-content/30 bg-base-200/30">
						<th class="font-bold">Mã</th>
						<th class="font-bold">Khách Hàng</th>
						<th class="font-bold">Phòng</th>
						<th class="font-bold">Bắt Đầu</th>
						<th class="font-bold">Kết Thúc</th>
						<th class="font-bold text-right">Tổng Cước</th>
						<th class="font-bold text-center">Trạng Thái</th>
						<th class="font-bold text-right">Thao Tác</th>
					</tr>
				</thead>
				<tbody>
					{#if !isReady}
						<tr><td colspan="8" class="text-center py-12"><span class="loading loading-spinner text-primary"></span></td></tr>
					{:else if filtered.length === 0}
						<tr><td colspan="8" class="text-center py-12 text-base-content/30 font-medium">Không có đơn nào.</td></tr>
					{:else}
						{#each filtered as bk}
							{@const st = statusMap[bk.status] || { text: bk.status, cls: 'badge-ghost' }}
							<tr class="hover">
								<td class="font-mono text-xs font-bold text-base-content/30">#{bk.id}</td>
								<td>
									<div class="flex flex-col">
										<span class="font-semibold text-sm">{bk.userName || '—'}</span>
										<span class="text-[11px] text-base-content/30">{bk.userEmail || ''}</span>
									</div>
								</td>
								<td class="text-sm font-medium text-primary">{bk.roomName || '—'}</td>
								<td class="text-xs font-medium text-base-content/50">{fmtTime(bk.startTime)}</td>
								<td class="text-xs font-medium text-base-content/50">{fmtTime(bk.endTime)}</td>
								<td class="text-right font-mono text-sm font-bold">{fmtVND(bk.totalCost ?? 0)}</td>
								<td class="text-center"><span class="badge {st.cls} badge-xs rounded-md font-bold">{st.text}</span></td>
								<td class="text-right">
									{#if bk.status === 'pending'}
										<div class="join">
											<button onclick={() => changeStatus(bk.id, 'confirmed')} class="btn btn-xs btn-success text-white join-item" title="Phê Duyệt">
												<Icon icon="solar:check-circle-bold" class="text-sm"/>
											</button>
											<button onclick={() => changeStatus(bk.id, 'cancelled')} class="btn btn-xs btn-error text-white join-item" title="Từ Chối">
												<Icon icon="solar:close-circle-bold" class="text-sm"/>
											</button>
										</div>
									{:else if bk.status === 'confirmed'}
										<button onclick={() => changeStatus(bk.id, 'cancelled')} class="btn btn-xs btn-outline btn-error rounded-md font-bold">Hủy</button>
									{:else}
										<span class="text-[10px] font-bold text-base-content/20 uppercase tracking-widest">—</span>
									{/if}
								</td>
							</tr>
						{/each}
					{/if}
				</tbody>
			</table>
		</div>
	</div>
</div>
