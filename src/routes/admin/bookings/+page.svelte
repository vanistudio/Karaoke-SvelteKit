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
		filterStatus === 'all' ? bookings : bookings.filter((b) => b.status === filterStatus)
	);
	let pendingCount = $derived(bookings.filter((b) => b.status === 'pending').length);
	let confirmedCount = $derived(bookings.filter((b) => b.status === 'confirmed').length);
	let checkedInCount = $derived(bookings.filter((b) => b.status === 'checked_in').length);
	let cancelledCount = $derived(bookings.filter((b) => b.status === 'cancelled').length);

	async function changeStatus(
		id: number,
		newStatus: 'pending' | 'confirmed' | 'cancelled' | 'checked_in'
	) {
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
		return new Intl.DateTimeFormat('vi-VN', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		}).format(new Date(d));
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
			<p class="mt-0.5 text-sm font-medium text-base-content/40">
				Quản lý tất cả đơn đặt phòng karaoke
			</p>
		</div>
		<div class="flex items-center gap-2">
			<a
				href="/api/export/bookings"
				target="_blank"
				class="btn rounded-lg text-base-content/40 btn-ghost btn-sm hover:text-primary"
			>
				<Icon icon="solar:file-download-line-duotone" class="text-lg" />
				Xuất CSV
			</a>
			<button
				onclick={loadData}
				class="btn rounded-lg text-base-content/40 btn-ghost btn-sm hover:text-primary"
			>
				<Icon icon="solar:refresh-line-duotone" class="text-lg" />
				Làm Mới
			</button>
		</div>
	</div>

	<div class="grid grid-cols-2 gap-3 lg:grid-cols-5 lg:gap-4">
		<div class="rounded-xl border border-base-300/50 bg-base-100 p-4 lg:p-5">
			<p class="text-[10px] font-bold tracking-widest text-base-content/40 uppercase">Tổng Đơn</p>
			<p class="mt-1 text-2xl font-black">{bookings.length}</p>
		</div>
		<div class="rounded-xl border border-base-300/50 bg-base-100 p-4 lg:p-5">
			<p class="text-[10px] font-bold tracking-widest text-amber-600 uppercase">Chờ Duyệt</p>
			<p class="mt-1 text-2xl font-black text-amber-600">{pendingCount}</p>
		</div>
		<div class="rounded-xl border border-base-300/50 bg-base-100 p-4 lg:p-5">
			<p class="text-[10px] font-bold tracking-widest text-emerald-600 uppercase">Xác Nhận</p>
			<p class="mt-1 text-2xl font-black text-emerald-600">{confirmedCount}</p>
		</div>
		<div class="rounded-xl border border-base-300/50 bg-base-100 p-4 lg:p-5">
			<p class="text-[10px] font-bold tracking-widest text-sky-600 uppercase">Đã Đến</p>
			<p class="mt-1 text-2xl font-black text-sky-600">{checkedInCount}</p>
		</div>
		<div class="rounded-xl border border-base-300/50 bg-base-100 p-4 lg:p-5">
			<p class="text-[10px] font-bold tracking-widest text-red-500 uppercase">Đã Hủy</p>
			<p class="mt-1 text-2xl font-black text-red-500">{cancelledCount}</p>
		</div>
	</div>

	<div class="flex flex-wrap gap-2">
		<button
			onclick={() => (filterStatus = 'all')}
			class="btn rounded-lg font-bold btn-xs {filterStatus === 'all' ? 'btn-primary' : 'btn-ghost'}"
			>Tất Cả ({bookings.length})</button
		>
		<button
			onclick={() => (filterStatus = 'pending')}
			class="btn rounded-lg font-bold btn-xs {filterStatus === 'pending'
				? 'btn-warning'
				: 'btn-ghost'}">Chờ Duyệt ({pendingCount})</button
		>
		<button
			onclick={() => (filterStatus = 'confirmed')}
			class="btn rounded-lg font-bold btn-xs {filterStatus === 'confirmed'
				? 'btn-success'
				: 'btn-ghost'}">Xác Nhận ({confirmedCount})</button
		>
		<button
			onclick={() => (filterStatus = 'checked_in')}
			class="btn rounded-lg font-bold btn-xs {filterStatus === 'checked_in'
				? 'text-white btn-info'
				: 'btn-ghost'}">Đã Đến ({checkedInCount})</button
		>
		<button
			onclick={() => (filterStatus = 'cancelled')}
			class="btn rounded-lg font-bold btn-xs {filterStatus === 'cancelled'
				? 'text-white btn-error'
				: 'btn-ghost'}">Đã Hủy ({cancelledCount})</button
		>
	</div>

	<div class="overflow-hidden rounded-xl border border-base-300/50 bg-base-100">
		<div class="overflow-x-auto">
			<table class="table table-sm">
				<thead>
					<tr class="bg-base-200/30 text-[10px] tracking-widest text-base-content/30 uppercase">
						<th class="font-bold">Mã</th>
						<th class="font-bold">Khách Hàng</th>
						<th class="font-bold">Phòng</th>
						<th class="font-bold">Bắt Đầu</th>
						<th class="font-bold">Kết Thúc</th>
						<th class="text-right font-bold">Tổng Cước</th>
						<th class="text-center font-bold">Trạng Thái</th>
						<th class="text-right font-bold">Thao Tác</th>
					</tr>
				</thead>
				<tbody>
					{#if !isReady}
						<tr
							><td colspan="8" class="py-12 text-center"
								><span class="loading loading-spinner text-primary"></span></td
							></tr
						>
					{:else if filtered.length === 0}
						<tr
							><td colspan="8" class="py-12 text-center font-medium text-base-content/30"
								>Không có đơn nào.</td
							></tr
						>
					{:else}
						{#each filtered as bk}
							{@const st = statusMap[bk.status] || { text: bk.status, cls: 'badge-ghost' }}
							<tr class="hover">
								<td class="font-mono text-xs font-bold text-base-content/30">#{bk.id}</td>
								<td>
									<div class="flex flex-col">
										<span class="text-sm font-semibold">{bk.userName || '—'}</span>
										<span class="text-[11px] text-base-content/30">{bk.userEmail || ''}</span>
									</div>
								</td>
								<td class="text-sm font-medium text-primary">{bk.roomName || '—'}</td>
								<td class="text-xs font-medium text-base-content/50">{fmtTime(bk.startTime)}</td>
								<td class="text-xs font-medium text-base-content/50">{fmtTime(bk.endTime)}</td>
								<td class="text-right font-mono text-sm font-bold">{fmtVND(bk.totalCost ?? 0)}</td>
								<td class="text-center"
									><span class="badge {st.cls} rounded-md badge-xs font-bold">{st.text}</span></td
								>
								<td class="text-right">
									{#if bk.status === 'pending'}
										<div class="join">
											<button
												onclick={() => changeStatus(bk.id, 'confirmed')}
												class="btn join-item text-white btn-xs btn-success"
												title="Phê Duyệt"
											>
												<Icon icon="solar:check-circle-bold" class="text-sm" />
											</button>
											<button
												onclick={() => openCancelModal(bk.id)}
												class="btn join-item text-white btn-xs btn-error"
												title="Từ Chối"
											>
												<Icon icon="solar:close-circle-bold" class="text-sm" />
											</button>
										</div>
									{:else if bk.status === 'confirmed'}
										<div class="join">
											<button
												onclick={() => handleCheckin(bk.id)}
												class="btn join-item text-white btn-xs btn-info"
												title="Check-in"
											>
												<Icon icon="solar:login-3-bold" class="text-sm" />
											</button>
											<button
												onclick={() => openCancelModal(bk.id)}
												class="btn join-item text-white btn-xs btn-error"
												title="Hủy"
											>
												<Icon icon="solar:close-circle-bold" class="text-sm" />
											</button>
										</div>
									{:else}
										<span
											class="text-[10px] font-bold tracking-widest text-base-content/20 uppercase"
											>—</span
										>
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
	<div class="modal-box max-w-sm rounded-xl">
		<h3 class="mb-3 flex items-center gap-2 text-lg font-bold text-red-500">
			<Icon icon="solar:close-circle-bold-duotone" class="text-xl" />
			Xác Nhận Hủy Đơn
		</h3>
		{#if cancelTarget}
			<p class="mb-3 text-sm text-base-content/50">
				Hủy đơn <span class="font-bold text-base-content">#{cancelTarget.id}</span>? Vui lòng nhập
				lý do:
			</p>
			<textarea
				bind:value={cancelReason}
				placeholder="Lý do hủy (VD: Khách yêu cầu, hết phòng...)"
				class="textarea-bordered textarea w-full rounded-lg text-sm"
				rows="3"
			></textarea>
			<div class="modal-action border-t border-base-200 pt-4">
				<form method="dialog">
					<button class="btn rounded-lg font-medium btn-ghost" disabled={isCancelling}
						>Giữ Lại</button
					>
				</form>
				<button
					onclick={handleCancelWithReason}
					class="btn rounded-lg px-6 font-bold text-white btn-error"
					disabled={isCancelling}
				>
					{#if isCancelling}<span class="loading loading-sm loading-spinner"></span>{:else}Xác Nhận
						Hủy{/if}
				</button>
			</div>
		{/if}
	</div>
	<form method="dialog" class="modal-backdrop"><button>close</button></form>
</dialog>
