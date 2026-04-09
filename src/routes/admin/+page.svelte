<script lang="ts">
	import { trpc } from '$lib/trpc/client';
	import Icon from '@iconify/svelte';

	let stats = $state<any>(null);
	let recentBookings = $state<any[]>([]);
	let isReady = $state(false);

	async function fetchDashboard() {
		try {
			const [s, rb] = await Promise.all([
				trpc().dashboard.stats.query(),
				trpc().dashboard.recentBookings.query(5)
			]);
			stats = s;
			recentBookings = rb;
		} catch (error) {
			console.error(error);
		} finally {
			isReady = true;
		}
	}

	$effect(() => {
		fetchDashboard();
	});

	function formatVND(value: number) {
		return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
	}

	function formatDate(dateString: string | Date | null) {
		if (!dateString) return 'N/A';
		const dateObj = typeof dateString === 'string' ? new Date(dateString) : dateString;
		return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' }).format(dateObj);
	}
</script>

<svelte:head>
	<title>Tổng Quan Hệ Thống | KaraSystem Admin</title>
</svelte:head>

<div class="flex flex-col gap-8">
	{#if !isReady}
		<div class="flex items-center justify-center min-h-[50vh]">
			<span class="loading loading-spinner loading-lg text-primary"></span>
		</div>
	{:else}
		<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
			<div class="card bg-base-100 rounded-md border border-base-300 shadow-sm relative overflow-hidden">
				<div class="absolute -right-4 -top-4 text-primary/10">
					<Icon icon="solar:wallet-line-duotone" class="text-9xl" />
				</div>
				<div class="card-body p-6 z-10">
					<div class="flex flex-col gap-1">
						<p class="text-xs font-bold text-base-content/60 uppercase tracking-widest">Doanh Thu Hôm Nay</p>
						<h3 class="text-3xl font-black text-primary">{formatVND(stats?.todayRevenue || 0)}</h3>
					</div>
					<div class="mt-4 flex items-center gap-2 text-sm font-medium">
						<div class="badge badge-success rounded-md badge-sm">{stats?.confirmedBookings || 0} Đã Xác Nhận</div>
					</div>
				</div>
			</div>

			<div class="card bg-base-100 rounded-md border border-base-300 shadow-sm relative overflow-hidden">
				<div class="absolute -right-4 -top-4 text-secondary/10">
					<Icon icon="solar:ticket-bold-duotone" class="text-9xl" />
				</div>
				<div class="card-body p-6 z-10">
					<div class="flex flex-col gap-1">
						<p class="text-xs font-bold text-base-content/60 uppercase tracking-widest">Tổng Lịch Đặt Chỗ</p>
						<h3 class="text-3xl font-black text-secondary">{stats?.totalBookings || 0}</h3>
					</div>
					<div class="mt-4 flex items-center gap-2 text-sm font-medium">
						{#if stats?.pendingBookings > 0}
							<div class="badge badge-warning rounded-md badge-sm">{stats.pendingBookings} Chưa Xác Nhận</div>
						{:else}
							<div class="badge badge-success rounded-md badge-sm">Không Có Đơn Chờ</div>
						{/if}
					</div>
				</div>
			</div>

			<div class="card bg-base-100 rounded-md border border-base-300 shadow-sm relative overflow-hidden">
				<div class="absolute -right-4 -top-4 text-accent/10">
					<Icon icon="solar:home-smile-angle-bold-duotone" class="text-9xl" />
				</div>
				<div class="card-body p-6 z-10">
					<div class="flex flex-col gap-1">
						<p class="text-xs font-bold text-base-content/60 uppercase tracking-widest">Tổng Hệ Thống Phòng</p>
						<h3 class="text-3xl font-black text-accent">{stats?.totalRooms || 0}</h3>
					</div>
					<div class="mt-4 flex items-center gap-2 text-sm font-medium">
						<div class="badge badge-info rounded-md badge-sm">{stats?.totalServices || 0} Dịch Vụ</div>
						<span class="text-base-content/60">Đang Vận Hành</span>
					</div>
				</div>
			</div>

			<div class="card bg-base-100 rounded-md border border-base-300 shadow-sm relative overflow-hidden">
				<div class="absolute -right-4 -top-4 text-base-content/5">
					<Icon icon="solar:users-group-two-rounded-bold-duotone" class="text-9xl" />
				</div>
				<div class="card-body p-6 z-10">
					<div class="flex flex-col gap-1">
						<p class="text-xs font-bold text-base-content/60 uppercase tracking-widest">Thành Viên Hệ Thống</p>
						<h3 class="text-3xl font-black text-base-content">{stats?.totalUsers || 0}</h3>
					</div>
					<div class="mt-4 flex items-center gap-2 text-sm font-medium">
						<div class="badge badge-ghost rounded-md badge-sm">Tài Khoản Đăng Ký</div>
					</div>
				</div>
			</div>
		</div>

		<div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
			<div class="xl:col-span-2 card bg-base-100 rounded-md border border-base-300 shadow-sm">
				<div class="card-body p-6">
					<h2 class="card-title text-base font-bold tracking-widest uppercase mb-4 text-base-content/80 flex items-center gap-2">
						<Icon icon="solar:calendar-date-line-duotone" class="text-xl"/>
						Lịch Đặt Phòng Mới Nhất
					</h2>
					<div class="overflow-x-auto">
						<table class="table table-sm w-full">
							<thead>
								<tr class="uppercase text-[10px] tracking-widest border-b border-base-200">
									<th>Mã Booking</th>
									<th>Khách Hàng</th>
									<th>Phòng</th>
									<th>Thời Gian</th>
									<th class="text-right">Tổng Tiền</th>
									<th class="text-right">Trạng Thái</th>
								</tr>
							</thead>
							<tbody>
								{#if recentBookings.length === 0}
									<tr>
										<td colspan="6" class="text-center py-10 font-medium text-base-content/60">
											Chưa có đơn đặt phòng nào.
										</td>
									</tr>
								{:else}
									{#each recentBookings as bk}
										<tr>
											<td class="font-mono text-xs font-bold text-base-content/60">#BKG-{bk.id}</td>
											<td class="font-bold text-sm">{bk.userName || 'N/A'}</td>
											<td class="font-medium text-primary text-sm">{bk.roomName || 'N/A'}</td>
											<td class="text-xs font-medium">
												<div>{formatDate(bk.startTime)}</div>
												<div class="text-base-content/50">đến {formatDate(bk.endTime)}</div>
											</td>
											<td class="text-right font-mono font-medium">{formatVND(bk.totalCost ?? 0)}</td>
											<td class="text-right">
												{#if bk.status === 'pending'}
													<div class="badge badge-warning badge-sm rounded-md">Chờ Duyệt</div>
												{:else if bk.status === 'confirmed'}
													<div class="badge badge-success badge-sm rounded-md">Đã Xác Nhận</div>
												{:else}
													<div class="badge badge-error badge-sm rounded-md text-white">Đã Hủy</div>
												{/if}
											</td>
										</tr>
									{/each}
								{/if}
							</tbody>
						</table>
					</div>
					<div class="mt-4 border-t border-base-200 pt-4 flex justify-center">
						<a href="/admin/bookings" class="btn btn-sm btn-ghost rounded-md font-bold tracking-widest uppercase text-xs">Xem Tất Cả</a>
					</div>
				</div>
			</div>

			<div class="card bg-base-100 rounded-md border border-base-300 shadow-sm">
				<div class="card-body p-6">
					<h2 class="card-title text-base font-bold tracking-widest uppercase mb-4 text-base-content/80 flex items-center gap-2">
						<Icon icon="solar:bell-bing-line-duotone" class="text-xl"/>
						Trạng Thái Hệ Thống
					</h2>
					<div class="flex flex-col gap-3">
						{#if stats?.pendingBookings > 0}
							<div class="bg-warning/10 border border-warning/20 rounded-md p-4">
								<h4 class="font-bold text-warning text-sm mb-1">{stats.pendingBookings} Yêu Cầu Đặt Chỗ Mới</h4>
								<p class="text-xs font-medium text-base-content/60">Cần xác nhận lịch đặt chỗ để chốt công nợ.</p>
								<a href="/admin/bookings" class="btn btn-xs rounded-md btn-warning mt-3 font-bold tracking-widest">Xử Lý Ngay</a>
							</div>
						{:else}
							<div class="bg-success/10 border border-success/20 rounded-md p-4">
								<h4 class="font-bold text-success text-sm mb-1">Không Có Đơn Chờ Duyệt</h4>
								<p class="text-xs font-medium text-base-content/60">Tất cả đơn đặt hàng đã được xử lý.</p>
							</div>
						{/if}
						<div class="bg-base-200 border border-base-300 rounded-md p-4">
							<h4 class="font-bold text-base-content text-sm mb-1">Cơ Sở Dữ Liệu</h4>
							<p class="text-xs font-medium text-base-content/60">{stats?.totalRooms} Phòng · {stats?.totalServices} Dịch Vụ · {stats?.totalUsers} Thành Viên</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>
