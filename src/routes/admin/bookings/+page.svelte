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
			addToast(`Cập nhật trạng thái đơn #BKG-${id} thành công!`, 'success');
			await fetchBookings();
		} catch (error) {
			addToast('Cập nhật trạng thái thất bại.', 'error');
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
</script>

<svelte:head>
	<title>Quản Lý Đặt Chỗ | KaraSystem Admin</title>
</svelte:head>

<div class="flex flex-col gap-6">
	<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
		<div class="bg-base-100 p-6 rounded-md border border-base-300 shadow-sm flex items-center justify-between">
			<div>
				<p class="text-xs font-bold text-base-content/60 uppercase tracking-widest">Tổng Đơn Đặt Phòng</p>
				<h3 class="text-2xl font-black text-base-content">
					{isReady ? bookings.length : '...'}
				</h3>
			</div>
			<div class="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
				<Icon icon="solar:ticket-line-duotone" class="text-2xl" />
			</div>
		</div>
		<div class="bg-base-100 p-6 rounded-md border border-base-300 shadow-sm flex items-center justify-between">
			<div>
				<p class="text-xs font-bold text-warning uppercase tracking-widest">Đang Chờ Duyệt</p>
				<h3 class="text-2xl font-black text-warning">
					{isReady ? pendingCount : '...'}
				</h3>
			</div>
			<div class="h-12 w-12 rounded-full bg-warning/10 text-warning flex items-center justify-center">
				<Icon icon="solar:history-line-duotone" class="text-2xl" />
			</div>
		</div>
		<div class="bg-base-100 p-6 rounded-md border border-base-300 shadow-sm flex items-center justify-between">
			<div>
				<p class="text-xs font-bold text-success uppercase tracking-widest">Đã Xác Nhận</p>
				<h3 class="text-2xl font-black text-success">
					{isReady ? confirmedCount : '...'}
				</h3>
			</div>
			<div class="h-12 w-12 rounded-full bg-success/10 text-success flex items-center justify-center">
				<Icon icon="solar:check-circle-line-duotone" class="text-2xl" />
			</div>
		</div>
	</div>
	<div class="card bg-base-100 border border-base-300 shadow-sm rounded-md">
		<div class="overflow-x-auto w-full min-h-[50vh]">
			<table class="table table-zebra table-sm w-full">
				<thead class="bg-base-200/50 uppercase tracking-widest text-[#888] text-[10px] sm:text-xs border-b border-base-300">
					<tr>
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
						<tr>
							<td colspan="7" class="text-center py-10">
								<span class="loading loading-spinner text-primary"></span>
							</td>
						</tr>
					{:else if bookings.length === 0}
						<tr>
							<td colspan="7" class="text-center py-10 font-medium text-base-content/60">
								Chưa có đơn đặt phòng nào trong hệ thống.
							</td>
						</tr>
					{:else}
						{#each bookings as bk}
							<tr class="hover whitespace-nowrap">
								<td class="font-mono text-xs font-bold text-base-content/50">#BKG-{bk.id}</td>
								<td>
									<div class="flex flex-col">
										<span class="font-bold text-sm">{bk.userName || 'N/A'}</span>
										<span class="text-xs text-base-content/50">{bk.userEmail || ''}</span>
									</div>
								</td>
								<td class="font-medium text-primary">{bk.roomName || 'N/A'}</td>
								<td class="text-xs font-medium">
									<div>{formatDate(bk.startTime)}</div>
									<div class="text-base-content/50">đến {formatDate(bk.endTime)}</div>
								</td>
								<td class="text-right font-mono font-bold">
									{formatVND(bk.totalCost ?? 0)}
								</td>
								
								<td class="text-center">
									{#if bk.status === 'pending'}
										<div class="badge badge-warning badge-sm rounded-md font-bold w-24">CHỜ DUYỆT</div>
									{:else if bk.status === 'confirmed'}
										<div class="badge badge-success badge-sm rounded-md font-bold w-24">THÀNH CÔNG</div>
									{:else}
										<div class="badge badge-error badge-sm rounded-md font-bold w-24 text-white">ĐÃ HỦY</div>
									{/if}
								</td>
								
								<td class="text-right">
									{#if bk.status === 'pending'}
										<div class="join">
											<button onclick={() => changeStatus(bk.id, 'confirmed')} class="btn btn-xs btn-success text-white join-item tooltip tooltip-left" data-tip="Phê Duyệt">
												<Icon icon="solar:check-circle-bold-duotone" />
											</button>
											<button onclick={() => changeStatus(bk.id, 'cancelled')} class="btn btn-xs btn-error text-white join-item tooltip tooltip-left" data-tip="Hủy Đơn">
												<Icon icon="solar:close-circle-bold-duotone" />
											</button>
										</div>
									{:else if bk.status === 'confirmed'}
										<button onclick={() => changeStatus(bk.id, 'cancelled')} class="btn btn-xs btn-outline btn-error rounded-sm tooltip tooltip-left" data-tip="Hủy Đơn">
											<Icon icon="solar:shield-warning-line-duotone" /> HỦY
										</button>
									{:else}
										<span class="text-xs font-bold text-base-content/30 tracking-widest mr-2 uppercase">Closed</span>
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
