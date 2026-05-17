<script lang="ts">
	import { trpc } from '$lib/trpc/client';
	import Icon from '@iconify/svelte';

	let stats = $state<any>(null);
	let recentBookings = $state<any[]>([]);
	let chartData = $state<any[]>([]);
	let occupancy = $state<any>(null);
	let heatmapData = $state<number[][]>([]);
	let topRooms = $state<any[]>([]);
	let topCustomers = $state<any[]>([]);
	let isReady = $state(false);
	let chartDays = $state(7);

	$effect(() => {
		loadData();
	});

	async function loadData() {
		try {
			const [s, rb, cd, oc, hm, tr, tc] = await Promise.all([
				trpc().dashboard.stats.query(),
				trpc().dashboard.recentBookings.query(5),
				trpc().dashboard.revenueChart.query(chartDays),
				trpc().dashboard.occupancy.query(),
				trpc().dashboard.heatmap.query(),
				trpc().dashboard.topRooms.query(),
				trpc().dashboard.topCustomers.query()
			]);
			stats = s;
			recentBookings = rb;
			chartData = cd;
			occupancy = oc;
			heatmapData = hm;
			topRooms = tr;
			topCustomers = tc;
		} catch (e) {
			console.error(e);
		} finally {
			isReady = true;
		}
	}

	async function changeChartDays(days: number) {
		chartDays = days;
		chartData = await trpc().dashboard.revenueChart.query(days);
	}

	function fmtVND(v: number) {
		return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);
	}

	function fmtTime(d: string | Date | null) {
		if (!d) return '—';
		return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(d));
	}

	function fmtShortDate(d: string) {
		const date = new Date(d);
		return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit' }).format(date);
	}

	let maxRevenue = $derived(Math.max(...chartData.map(d => d.revenue), 1));

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
		<div class="bg-base-100 rounded-xl border border-base-300/50 overflow-hidden">
			<div class="flex items-center justify-between px-5 py-4 border-b border-base-200">
				<div class="flex items-center gap-2 text-sm font-bold text-base-content/60">
					<Icon icon="solar:chart-2-line-duotone" class="text-base"/>
					Biểu Đồ Doanh Thu
				</div>
				<div class="flex gap-1">
					{#each [7, 14, 30] as days}
						<button
							onclick={() => changeChartDays(days)}
							class="btn btn-xs rounded-lg font-bold {chartDays === days ? 'btn-primary' : 'btn-ghost'}"
						>
							{days} ngày
						</button>
					{/each}
				</div>
			</div>
			<div class="p-5">
				{#if chartData.length > 0}
					<div class="flex items-end gap-1 h-40">
						{#each chartData as day}
							<div class="flex-1 flex flex-col items-center gap-1 group relative">
								<div class="absolute -top-8 left-1/2 -translate-x-1/2 bg-base-300 text-base-content text-[10px] font-bold px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
									{fmtVND(day.revenue)} • {day.bookings} đơn
								</div>
								<div
									class="w-full rounded-t-md bg-primary/80 hover:bg-primary transition-colors min-h-[4px]"
									style="height: {Math.max((day.revenue / maxRevenue) * 100, 3)}%"
								></div>
								<span class="text-[9px] font-bold text-base-content/30 mt-1">{fmtShortDate(day.date)}</span>
							</div>
						{/each}
					</div>
				{:else}
					<div class="text-center py-8 text-base-content/30 font-medium text-sm">Chưa có dữ liệu doanh thu.</div>
				{/if}
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
					{#if occupancy}
						<div class="bg-primary/5 border border-primary/15 rounded-lg p-4">
							<div class="flex items-center justify-between mb-2">
								<span class="text-xs font-bold text-base-content/50 uppercase tracking-widest">Tỷ Lệ Lấp Đầy Hôm Nay</span>
								<span class="text-lg font-black text-primary">{occupancy.rate}%</span>
							</div>
							<div class="w-full bg-base-200 rounded-full h-2">
								<div class="bg-primary rounded-full h-2 transition-all" style="width: {occupancy.rate}%"></div>
							</div>
							<p class="text-[11px] text-base-content/40 font-medium mt-2">{occupancy.occupied}/{occupancy.total} phòng có booking</p>
						</div>
					{/if}

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
		{#if heatmapData.length > 0}
			{@const maxVal = Math.max(...heatmapData.flat(), 1)}
			{@const dayLabels = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']}
			{@const hours = Array.from({ length: 18 }, (_, i) => i + 6)}
			<div class="bg-base-100 rounded-xl border border-base-300/50 overflow-hidden">
				<div class="px-5 py-4 border-b border-base-200 flex items-center gap-2 text-sm font-bold text-base-content/60">
					<Icon icon="solar:fire-bold-duotone" class="text-base"/>
					Giờ Cao Điểm (30 Ngày Gần Nhất)
				</div>
				<div class="p-5 overflow-x-auto">
					<div class="flex gap-0.5 min-w-[600px]">
						<div class="flex flex-col gap-0.5 pr-2">
							<div class="h-5"></div>
							{#each dayLabels as day}
								<div class="h-6 flex items-center text-[10px] font-bold text-base-content/40">{day}</div>
							{/each}
						</div>
						<div class="flex-1 flex flex-col gap-0.5">
							<div class="flex gap-0.5">
								{#each hours as h}
									<div class="flex-1 text-center text-[9px] font-bold text-base-content/30 h-5 flex items-center justify-center">{h}</div>
								{/each}
							</div>
							{#each heatmapData as row}
								<div class="flex gap-0.5">
									{#each hours as _, hi}
										{@const val = row[hi + 6] || 0}
										{@const intensity = val / maxVal}
										<div
											class="flex-1 h-6 rounded-sm transition-colors"
											style="background-color: oklch(0.65 0.2 270 / {Math.max(intensity * 0.9, 0.05)})"
											title="{val} booking(s)"
										></div>
									{/each}
								</div>
							{/each}
						</div>
					</div>
					<div class="flex items-center gap-2 mt-3 justify-end">
						<span class="text-[10px] text-base-content/30 font-medium">Ít</span>
						<div class="flex gap-0.5">
							{#each [0.1, 0.3, 0.5, 0.7, 0.9] as op}
								<div class="w-4 h-4 rounded-sm" style="background-color: oklch(0.65 0.2 270 / {op})"></div>
							{/each}
						</div>
						<span class="text-[10px] text-base-content/30 font-medium">Nhiều</span>
					</div>
				</div>
			</div>
		{/if}
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
			{#if topRooms.length > 0}
				<div class="bg-base-100 rounded-xl border border-base-300/50 overflow-hidden">
					<div class="px-5 py-4 border-b border-base-200 flex items-center gap-2 text-sm font-bold text-base-content/60">
						<Icon icon="solar:crown-star-bold-duotone" class="text-base text-amber-500"/>
						Top Phòng Được Đặt Nhiều Nhất
					</div>
					<div class="p-4">
						<div class="flex flex-col gap-2">
							{#each topRooms as rm, i}
								<div class="flex items-center gap-3 p-2 rounded-lg {i === 0 ? 'bg-amber-500/5' : ''}">
									<span class="w-6 h-6 rounded-full {i === 0 ? 'bg-amber-500 text-white' : i === 1 ? 'bg-base-300 text-base-content/60' : 'bg-base-200 text-base-content/40'} flex items-center justify-center text-[10px] font-black">{i + 1}</span>
									<div class="flex-1 min-w-0">
										<p class="font-bold text-sm truncate">{rm.roomName}</p>
										<p class="text-[10px] text-base-content/40 font-medium uppercase">{rm.roomType}</p>
									</div>
									<div class="text-right">
										<p class="text-sm font-black">{rm.bookingCount} đơn</p>
										<p class="text-[10px] text-base-content/40 font-medium">{fmtVND(rm.totalRevenue)}</p>
									</div>
								</div>
							{/each}
						</div>
					</div>
				</div>
			{/if}

			{#if topCustomers.length > 0}
				<div class="bg-base-100 rounded-xl border border-base-300/50 overflow-hidden">
					<div class="px-5 py-4 border-b border-base-200 flex items-center gap-2 text-sm font-bold text-base-content/60">
						<Icon icon="solar:users-group-rounded-bold-duotone" class="text-base text-primary"/>
						Top Khách Hàng Chi Tiêu Cao
					</div>
					<div class="p-4">
						<div class="flex flex-col gap-2">
							{#each topCustomers as cust, i}
								<div class="flex items-center gap-3 p-2 rounded-lg {i === 0 ? 'bg-primary/5' : ''}">
									<span class="w-6 h-6 rounded-full {i === 0 ? 'bg-primary text-white' : i === 1 ? 'bg-base-300 text-base-content/60' : 'bg-base-200 text-base-content/40'} flex items-center justify-center text-[10px] font-black">{i + 1}</span>
									<div class="flex-1 min-w-0">
										<p class="font-bold text-sm truncate">{cust.userName || 'N/A'}</p>
										<p class="text-[10px] text-base-content/40 font-medium truncate">{cust.userEmail}</p>
									</div>
									<div class="text-right">
										<p class="text-sm font-black text-primary">{fmtVND(cust.totalSpent)}</p>
										<p class="text-[10px] text-base-content/40 font-medium">{cust.bookingCount} đơn</p>
									</div>
								</div>
							{/each}
						</div>
					</div>
				</div>
			{/if}
		</div>
	</div>
{/if}
