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

	async function changeStatus(id: number, newStatus: 'pending' | 'confirmed' | 'cancelled' | 'checked_in') {
		try {
			await trpc().booking.changeStatus.mutate({ id, status: newStatus });
			addToast(`Đơn #${id} đã cập nhật!`, 'success');
			await loadData();
		} catch (e: any) {
			addToast(e?.message || 'Cập nhật thất bại.', 'error');
		}
	}

	let cancelTarget = $state<{ id: number } | null>(null);
	let cancelReason = $state('');
	let isCancelling = $state(false);

	function openCancelModal(id: number) {
		cancelTarget = { id };
		cancelReason = '';
		(document.getElementById('cancel_reason_modal') as HTMLDialogElement)?.showModal();
	}

	async function handleCancelWithReason() {
		if (!cancelTarget) return;
		isCancelling = true;
		try {
			await trpc().booking.changeStatus.mutate({ id: cancelTarget.id, status: 'cancelled' });
			addToast(`Đơn #${cancelTarget.id} đã hủy. Lý do: ${cancelReason || 'Không rõ'}`, 'success');
			(document.getElementById('cancel_reason_modal') as HTMLDialogElement)?.close();
			cancelTarget = null;
			await loadData();
		} catch (e: any) {
			addToast(e?.message || 'Hủy thất bại.', 'error');
		} finally {
			isCancelling = false;
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
		checked_in: { text: 'Đã Đến', cls: 'badge-info' },
		cancelled: { text: 'Đã Hủy', cls: 'badge-error text-white' }
	};

	async function handleCheckin(id: number) {
		try {
			await trpc().booking.checkin.mutate(id);
			addToast(`Đơn #${id} đã check-in!`, 'success');
			await loadData();
		} catch (e: any) {
			addToast(e?.message || 'Check-in thất bại.', 'error');
		}
	}
</script>

<svelte:head><title>Lịch Đặt Phòng | KaraSystem Admin</title></svelte:head>

<div class="flex flex-col gap-6">
	<div class="flex items-center justify-between">
		<div>
			<h2 class="text-xl font-bold">Lịch Đặt Phòng</h2>
			<p class="text-sm text-base-content/40 font-medium mt-0.5">Quản lý tất cả đơn đặt phòng karaoke</p>
		</div>
		<div class="flex items-center gap-2">
			<a href="/api/export/bookings" target="_blank" class="btn btn-ghost btn-sm rounded-lg text-base-content/40 hover:text-primary">
				<Icon icon="solar:file-download-line-duotone" class="text-lg"/>
				Xuất CSV
			</a>
			<button onclick={loadData} class="btn btn-ghost btn-sm rounded-lg text-base-content/40 hover:text-primary">
				<Icon icon="solar:refresh-line-duotone" class="text-lg"/>
				Làm Mới
			</button>
		</div>
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
										<button onclick={() => openCancelModal(bk.id)} class="btn btn-xs btn-error text-white join-item" title="Từ Chối">
											<Icon icon="solar:close-circle-bold" class="text-sm"/>
										</button>
									</div>
								{:else if bk.status === 'confirmed'}
									<div class="join">
										<button onclick={() => handleCheckin(bk.id)} class="btn btn-xs btn-info text-white join-item" title="Check-in">
											<Icon icon="solar:login-3-bold" class="text-sm"/>
										</button>
										<button onclick={() => openCancelModal(bk.id)} class="btn btn-xs btn-error text-white join-item" title="Hủy">
											<Icon icon="solar:close-circle-bold" class="text-sm"/>
										</button>
									</div>
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

<dialog id="cancel_reason_modal" class="modal">
	<div class="modal-box rounded-xl max-w-sm">
		<h3 class="font-bold text-lg mb-3 flex items-center gap-2 text-red-500">
			<Icon icon="solar:close-circle-bold-duotone" class="text-xl"/>
			Xác Nhận Hủy Đơn
		</h3>
		{#if cancelTarget}
			<p class="text-sm text-base-content/50 mb-3">Hủy đơn <span class="font-bold text-base-content">#{cancelTarget.id}</span>? Vui lòng nhập lý do:</p>
			<textarea bind:value={cancelReason} placeholder="Lý do hủy (VD: Khách yêu cầu, hết phòng...)" class="textarea textarea-bordered w-full rounded-lg text-sm" rows="3"></textarea>
			<div class="modal-action border-t border-base-200 pt-4">
				<form method="dialog"><button class="btn btn-ghost rounded-lg font-medium" disabled={isCancelling}>Giữ Lại</button></form>
				<button onclick={handleCancelWithReason} class="btn btn-error text-white rounded-lg font-bold px-6" disabled={isCancelling}>
					{#if isCancelling}<span class="loading loading-spinner loading-sm"></span>{:else}Xác Nhận Hủy{/if}
				</button>
			</div>
		{/if}
	</div>
	<form method="dialog" class="modal-backdrop"><button>close</button></form>
</dialog>
