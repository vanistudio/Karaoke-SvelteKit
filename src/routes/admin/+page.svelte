<script lang="ts">
	import { trpc } from '$lib/trpc/client';
	import Icon from '@iconify/svelte';

	let stats = $state<any>(null);
	let recentBookings = $state<any[]>([]);
	let isReady = $state(false);

	$effect(() => {
		loadData();
	});

	async function loadData() {
		try {
			const [s, rb] = await Promise.all([
				trpc().dashboard.stats.query(),
				trpc().dashboard.recentBookings.query(5)
			]);
			stats = s;
			recentBookings = rb;
		} catch (e) {
			console.error(e);
		} finally {
			isReady = true;
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

<svelte:head><title>Tổng Quan | KaraSystem Admin</title></svelte:head>

{#if !isReady}
	<div class="flex items-center justify-center min-h-[50vh]">
		<span class="loading loading-spinner loading-lg text-primary"></span>
	</div>
{:else}
	<div class="flex flex-col gap-6">
		<div class="flex items-center justify-between">
			<div>
				<h2 class="text-xl font-bold">Tổng Quan</h2>
				<p class="text-sm text-base-content/40 font-medium mt-0.5">Báo cáo hoạt động hệ thống</p>
			</div>
			<button onclick={loadData} class="btn btn-ghost btn-sm rounded-lg text-base-content/40 hover:text-primary">
				<Icon icon="solar:refresh-line-duotone" class="text-lg"/>
				Làm Mới
			</button>
		</div>

		<div class="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
			<div class="bg-base-100 rounded-xl border border-base-300/50 p-4 lg:p-5">
				<div class="flex items-center justify-between mb-3">
					<div class="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center">
						<Icon icon="solar:wallet-line-duotone" class="text-lg text-emerald-500" />
					</div>
					{#if stats.confirmedBookings > 0}
						<span class="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">{stats.confirmedBookings} xác nhận</span>
					{/if}
				</div>
				<p class="text-[10px] font-bold text-base-content/40 uppercase tracking-widest">Doanh Thu Hôm Nay</p>
				<p class="text-lg lg:text-xl font-black text-emerald-600 mt-1">{fmtVND(stats.todayRevenue)}</p>
			</div>

			<div class="bg-base-100 rounded-xl border border-base-300/50 p-4 lg:p-5">
				<div class="flex items-center justify-between mb-3">
					<div class="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
						<Icon icon="solar:ticket-line-duotone" class="text-lg text-blue-500" />
					</div>
					{#if stats.pendingBookings > 0}
						<span class="text-[10px] font-bold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full">{stats.pendingBookings} chờ duyệt</span>
					{/if}
				</div>
				<p class="text-[10px] font-bold text-base-content/40 uppercase tracking-widest">Tổng Đặt Chỗ</p>
				<p class="text-lg lg:text-xl font-black mt-1">{stats.totalBookings}</p>
			</div>

			<div class="bg-base-100 rounded-xl border border-base-300/50 p-4 lg:p-5">
				<div class="flex items-center justify-between mb-3">
					<div class="w-9 h-9 rounded-lg bg-violet-500/10 flex items-center justify-center">
						<Icon icon="solar:home-smile-angle-line-duotone" class="text-lg text-violet-500" />
					</div>
					<span class="text-[10px] font-bold text-base-content/30 bg-base-200 px-2 py-0.5 rounded-full">{stats.totalServices} dịch vụ</span>
				</div>
				<p class="text-[10px] font-bold text-base-content/40 uppercase tracking-widest">Hệ Thống Phòng</p>
				<p class="text-lg lg:text-xl font-black mt-1">{stats.totalRooms}</p>
			</div>

			<div class="bg-base-100 rounded-xl border border-base-300/50 p-4 lg:p-5">
				<div class="flex items-center justify-between mb-3">
					<div class="w-9 h-9 rounded-lg bg-orange-500/10 flex items-center justify-center">
						<Icon icon="solar:users-group-two-rounded-line-duotone" class="text-lg text-orange-500" />
					</div>
				</div>
				<p class="text-[10px] font-bold text-base-content/40 uppercase tracking-widest">Thành Viên</p>
				<p class="text-lg lg:text-xl font-black mt-1">{stats.totalUsers}</p>
			</div>
		</div>

		<div class="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6">
			<div class="xl:col-span-2 bg-base-100 rounded-xl border border-base-300/50 overflow-hidden">
				<div class="flex items-center justify-between px-5 py-4 border-b border-base-200">
					<div class="flex items-center gap-2 text-sm font-bold text-base-content/60">
						<Icon icon="solar:calendar-date-line-duotone" class="text-base"/>
						Đặt Phòng Gần Đây
					</div>
					<a href="/admin/bookings" class="text-xs font-bold text-primary hover:underline">Xem tất cả →</a>
				</div>
				<div class="overflow-x-auto">
					<table class="table table-sm">
						<thead>
							<tr class="text-[10px] uppercase tracking-widest text-base-content/30 bg-base-200/30">
								<th class="font-bold">Mã</th>
								<th class="font-bold">Khách Hàng</th>
								<th class="font-bold">Phòng</th>
								<th class="font-bold">Thời Gian</th>
								<th class="font-bold text-right">Tổng</th>
								<th class="font-bold text-center">Trạng Thái</th>
							</tr>
						</thead>
						<tbody>
							{#if recentBookings.length === 0}
								<tr><td colspan="6" class="text-center py-12 text-base-content/30 font-medium">Chưa có đơn đặt phòng nào.</td></tr>
							{:else}
								{#each recentBookings as bk}
									{@const st = statusMap[bk.status] || { text: bk.status, cls: 'badge-ghost' }}
									<tr class="hover">
										<td class="font-mono text-xs font-bold text-base-content/30">#{bk.id}</td>
										<td>
											<span class="font-semibold text-sm">{bk.userName || '—'}</span>
										</td>
										<td class="text-sm font-medium text-primary">{bk.roomName || '—'}</td>
										<td class="text-xs font-medium text-base-content/50">{fmtTime(bk.startTime)}</td>
										<td class="text-right font-mono text-sm font-bold">{fmtVND(bk.totalCost ?? 0)}</td>
										<td class="text-center"><span class="badge {st.cls} badge-xs rounded-md font-bold">{st.text}</span></td>
									</tr>
								{/each}
							{/if}
						</tbody>
					</table>
				</div>
			</div>

			<div class="bg-base-100 rounded-xl border border-base-300/50 overflow-hidden flex flex-col">
				<div class="px-5 py-4 border-b border-base-200">
					<div class="flex items-center gap-2 text-sm font-bold text-base-content/60">
						<Icon icon="solar:chart-2-line-duotone" class="text-base"/>
						Trạng Thái Hệ Thống
					</div>
				</div>
				<div class="p-4 flex flex-col gap-3 flex-1">
					{#if stats.pendingBookings > 0}
						<div class="bg-amber-500/5 border border-amber-500/15 rounded-lg p-4">
							<div class="flex items-center gap-2 mb-1">
								<Icon icon="solar:bell-bing-bold-duotone" class="text-amber-500"/>
								<span class="text-sm font-bold text-amber-600">{stats.pendingBookings} Yêu Cầu Mới</span>
							</div>
							<p class="text-xs text-base-content/40 font-medium">Đang chờ phê duyệt từ quản lý.</p>
							<a href="/admin/bookings" class="btn btn-xs btn-warning rounded-md mt-3 font-bold">Xử Lý Ngay</a>
						</div>
					{:else}
						<div class="bg-emerald-500/5 border border-emerald-500/15 rounded-lg p-4">
							<div class="flex items-center gap-2 mb-1">
								<Icon icon="solar:check-circle-bold-duotone" class="text-emerald-500"/>
								<span class="text-sm font-bold text-emerald-600">Tất Cả Đã Xử Lý</span>
							</div>
							<p class="text-xs text-base-content/40 font-medium">Không có đơn nào đang chờ duyệt.</p>
						</div>
					{/if}
					<div class="bg-base-200/40 rounded-lg p-4 flex-1">
						<p class="text-xs font-bold text-base-content/50 uppercase tracking-widest mb-3">Tổng Quan Cơ Sở</p>
						<div class="flex flex-col gap-2.5">
							<div class="flex justify-between text-sm">
								<span class="text-base-content/50 font-medium">Phòng Hoạt Động</span>
								<span class="font-bold">{stats.totalRooms}</span>
							</div>
							<div class="flex justify-between text-sm">
								<span class="text-base-content/50 font-medium">Dịch Vụ Trong Menu</span>
								<span class="font-bold">{stats.totalServices}</span>
							</div>
							<div class="flex justify-between text-sm">
								<span class="text-base-content/50 font-medium">Tài Khoản Thành Viên</span>
								<span class="font-bold">{stats.totalUsers}</span>
							</div>
							<div class="flex justify-between text-sm">
								<span class="text-base-content/50 font-medium">Đơn Đã Xác Nhận</span>
								<span class="font-bold text-emerald-600">{stats.confirmedBookings}</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}
