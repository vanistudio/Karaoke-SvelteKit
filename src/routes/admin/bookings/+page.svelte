<script lang="ts">
	import { trpc } from '$lib/trpc/client';
	import Icon from '@iconify/svelte';

	let bookings = $state<any[]>([]);
	let isReady = $state(false);
	async function fetchBookings() {
		try {
			bookings = await trpc().booking.list.query();
		} catch (error) {
			console.error("Fetch Err", error);
		} finally {
			isReady = true;
		}
	}

	$effect(() => {
		fetchBookings();
	});

	async function changeStatus(id: number, newStatus: 'pending' | 'confirmed' | 'cancelled') {
		try {
			await trpc().booking.changeStatus.mutate({
				id: id,
				status: newStatus
			});
			await fetchBookings();
		} catch (error) {
			alert("Cập nhật trạng thái thất bại.");
			console.error(error);
		}
	}
	
	function formatDate(dateString: string | Date | null) {
		if (!dateString) return "Trống";
		const dateObj = typeof dateString === 'string' ? new Date(dateString) : dateString;
		return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' }).format(dateObj);
	}
</script>

<svelte:head>
	<title>Quản Lý Đặt Chỗ | KaraSystem Admin</title>
</svelte:head>

<div class="flex flex-col gap-6">
	<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
		<div class="bg-base-100 p-6 rounded-md border border-base-300 shadow-sm flex items-center justify-between">
			<div>
				<p class="text-xs font-bold text-base-content/60 uppercase tracking-widest">Tổng Cuộc Gọi Đặt Đơn</p>
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
				<p class="text-xs font-bold text-warning uppercase tracking-widest">Đang Chờ Kích Hoạt</p>
				<h3 class="text-2xl font-black text-warning">
					{isReady ? bookings.filter((b: any) => b.status === 'pending').length : '...'}
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
					{isReady ? bookings.filter((b: any) => b.status === 'confirmed').length : '...'}
				</h3>
			</div>
			<div class="h-12 w-12 rounded-full bg-success/10 text-success flex items-center justify-center">
				<Icon icon="solar:check-circle-line-duotone" class="text-2xl" />
			</div>
		</div>
	</div>
	<div class="card bg-base-100 border border-base-300 shadow-sm rounded-md">
		<div class="overflow-x-auto w-full min-h-[50vh]">
			<table class="table table-zebra table-sm xs:table-sm w-full">
				<thead class="bg-base-200/50 uppercase tracking-widest text-[#888] text-[10px] sm:text-xs border-b border-base-300">
					<tr>
						<th>Mã Lịch</th>
						<th>Khách Hàng (User ID)</th>
						<th>Cơ Sở Lựa Chọn</th>
						<th>Thời Gian Bắt Đầu / Kết Thúc</th>
						<th class="text-right">Tổng Cước</th>
						<th class="text-center">Trạng Thái</th>
						<th class="text-right">Phê Duyệt Controls</th>
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
								Hoàn toàn trống. Tuyệt vời!
							</td>
						</tr>
					{:else}
						{#each bookings as booking}
							<tr class="hover whitespace-nowrap">
								<td class="font-mono text-xs font-bold text-base-content/50">#BKG-{booking.id}</td>
								<td class="font-bold max-w-[120px] truncate" title={booking.userId}>{booking.userId}</td>
								<td class="font-medium text-primary">Phòng ID: {booking.roomId}</td>
								<td class="text-xs font-medium">
									<div>{formatDate(booking.startTime)}</div>
									<div class="text-base-content/50">đến {formatDate(booking.endTime)}</div>
								</td>
								<td class="text-right font-mono font-bold">
									{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(booking.totalCost ?? 0)}
								</td>
								
								<td class="text-center">
									{#if booking.status === 'pending'}
										<div class="badge badge-warning badge-sm rounded-md font-bold w-24">CHỜ DUYỆT</div>
									{:else if booking.status === 'confirmed'}
										<div class="badge badge-success badge-sm rounded-md font-bold w-24">THÀNH CÔNG</div>
									{:else}
										<div class="badge badge-error badge-sm rounded-md font-bold w-24 text-white">ĐÃ HỦY ÁN</div>
									{/if}
								</td>
								
								<td class="text-right">
									{#if booking.status === 'pending'}
										<div class="join">
											<button onclick={() => changeStatus(booking.id, 'confirmed')} class="btn btn-xs btn-success text-white join-item tooltip tooltip-left" data-tip="Phê Duyệt Đơn Này">
												<Icon icon="solar:check-circle-bold-duotone" />
											</button>
											<button onclick={() => changeStatus(booking.id, 'cancelled')} class="btn btn-xs btn-error text-white join-item tooltip tooltip-left" data-tip="Hủy Cuộc Hẹn Này">
												<Icon icon="solar:close-circle-bold-duotone" />
											</button>
										</div>
									{:else if booking.status === 'confirmed'}
										<button onclick={() => changeStatus(booking.id, 'cancelled')} class="btn btn-xs btn-outline btn-error rounded-sm tooltip tooltip-left" data-tip="Hủy Chữ Tín Đơn Này">
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
