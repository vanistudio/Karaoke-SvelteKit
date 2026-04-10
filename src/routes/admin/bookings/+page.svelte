<script lang="ts">
	import { trpc } from '$lib/trpc/client';
	import Icon from '@iconify/svelte';
	import { addToast } from '$lib/stores/toast';

	let bookings = $state<any[]>([]);
	let isReady = $state(false);

	async function fetchBookings() {
		try {
			bookings = await trpc().dashboard.enrichedBookings.query();
		} catch (error) {
			console.error(error);
		} finally {
			isReady = true;
		}
	}

	$effect(() => {
		fetchBookings();
	});

	async function changeStatus(id: number, newStatus: 'pending' | 'confirmed' | 'cancelled') {
		try {
			await trpc().booking.changeStatus.mutate({ id, status: newStatus });
			addToast(`Cập nhật trạng thái #BKG-${id} thành công!`, 'success');
			await fetchBookings();
		} catch (error) {
			addToast('Cập nhật thất bại.', 'error');
			console.error(error);
		}
	}

	function formatDate(dateString: string | Date | null) {
		if (!dateString) return 'N/A';
		const dateObj = typeof dateString === 'string' ? new Date(dateString) : dateString;
		return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' }).format(dateObj);
	}

	function formatVND(value: number) {
		return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
	}

	let pendingCount = $derived(bookings.filter(b => b.status === 'pending').length);
	let confirmedCount = $derived(bookings.filter(b => b.status === 'confirmed').length);

	const statusLabel: Record<string, { text: string; cls: string }> = {
		pending: { text: 'CHỜ DUYỆT', cls: 'badge-warning' },
		confirmed: { text: 'THÀNH CÔNG', cls: 'badge-success' },
		cancelled: { text: 'ĐÃ HỦY', cls: 'badge-error text-white' }
	};
</script>

<svelte:head>
	<title>Quản Lý Đặt Chỗ | KaraSystem Admin</title>
</svelte:head>

<div class="flex flex-col gap-6">
	<div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
		<div class="bg-base-100 rounded-xl border border-base-300/60 p-5 flex items-center justify-between">
			<div>
				<p class="text-[10px] font-bold text-base-content/40 uppercase tracking-widest">Tổng Đơn</p>
				<p class="text-2xl font-black">{isReady ? bookings.length : '...'}</p>
			</div>
			<div class="w-11 h-11 rounded-lg bg-primary/8 flex items-center justify-center">
				<Icon icon="solar:ticket-line-duotone" class="text-2xl text-primary" />
			</div>
		</div>
		<div class="bg-base-100 rounded-xl border border-base-300/60 p-5 flex items-center justify-between">
			<div>
				<p class="text-[10px] font-bold text-warning uppercase tracking-widest">Chờ Duyệt</p>
				<p class="text-2xl font-black text-warning">{isReady ? pendingCount : '...'}</p>
			</div>
			<div class="w-11 h-11 rounded-lg bg-warning/8 flex items-center justify-center">
				<Icon icon="solar:history-line-duotone" class="text-2xl text-warning" />
			</div>
		</div>
		<div class="bg-base-100 rounded-xl border border-base-300/60 p-5 flex items-center justify-between">
			<div>
				<p class="text-[10px] font-bold text-success uppercase tracking-widest">Xác Nhận</p>
				<p class="text-2xl font-black text-success">{isReady ? confirmedCount : '...'}</p>
			</div>
			<div class="w-11 h-11 rounded-lg bg-success/8 flex items-center justify-center">
				<Icon icon="solar:check-circle-line-duotone" class="text-2xl text-success" />
			</div>
		</div>
	</div>

	<div class="bg-base-100 rounded-xl border border-base-300/60">
		<div class="overflow-x-auto">
			<table class="table table-sm w-full">
				<thead>
					<tr class="text-[10px] uppercase tracking-widest text-base-content/30 border-b border-base-200 bg-base-200/30">
						<th>Mã Lịch</th>
						<th>Khách Hàng</th>
						<th>Phòng</th>
						<th>Thời Gian</th>
						<th class="text-right">Tổng Cước</th>
						<th class="text-center">Trạng Thái</th>
						<th class="text-right">Phê Duyệt</th>
					</tr>
				</thead>
				<tbody>
					{#if !isReady}
						<tr><td colspan="7" class="text-center py-10"><span class="loading loading-spinner text-primary"></span></td></tr>
					{:else if bookings.length === 0}
						<tr><td colspan="7" class="text-center py-10 font-medium text-base-content/40">Chưa có đơn đặt phòng nào.</td></tr>
					{:else}
						{#each bookings as bk}
							{@const st = statusLabel[bk.status] || { text: bk.status, cls: 'badge-ghost' }}
							<tr class="hover whitespace-nowrap">
								<td class="font-mono text-xs font-bold text-base-content/40">#BKG-{bk.id}</td>
								<td>
									<div class="flex flex-col">
										<span class="font-semibold text-sm">{bk.userName || 'N/A'}</span>
										<span class="text-xs text-base-content/30">{bk.userEmail || ''}</span>
									</div>
								</td>
								<td class="font-medium text-primary text-sm">{bk.roomName || 'N/A'}</td>
								<td class="text-xs font-medium">
									<div>{formatDate(bk.startTime)}</div>
									<div class="text-base-content/30">đến {formatDate(bk.endTime)}</div>
								</td>
								<td class="text-right font-mono font-bold">{formatVND(bk.totalCost ?? 0)}</td>
								<td class="text-center">
									<div class="badge {st.cls} badge-xs rounded-md font-bold w-20">{st.text}</div>
								</td>
								<td class="text-right">
									{#if bk.status === 'pending'}
										<div class="join">
											<button onclick={() => changeStatus(bk.id, 'confirmed')} class="btn btn-xs btn-success text-white join-item" title="Phê Duyệt">
												<Icon icon="solar:check-circle-bold-duotone" />
											</button>
											<button onclick={() => changeStatus(bk.id, 'cancelled')} class="btn btn-xs btn-error text-white join-item" title="Hủy">
												<Icon icon="solar:close-circle-bold-duotone" />
											</button>
										</div>
									{:else if bk.status === 'confirmed'}
										<button onclick={() => changeStatus(bk.id, 'cancelled')} class="btn btn-xs btn-outline btn-error rounded-md" title="Hủy Đơn">
											<Icon icon="solar:shield-warning-line-duotone" /> Hủy
										</button>
									{:else}
										<span class="text-xs font-bold text-base-content/20 tracking-widest uppercase">Closed</span>
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
