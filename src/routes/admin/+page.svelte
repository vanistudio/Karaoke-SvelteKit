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
		return new Intl.DateTimeFormat('vi-VN', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		}).format(new Date(d));
	}

	function fmtShortDate(d: string) {
		const date = new Date(d);
		return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit' }).format(date);
	}

	let maxRevenue = $derived(Math.max(...chartData.map((d) => d.revenue), 1));

	const statusMap: Record<string, { text: string; cls: string }> = {
		pending: { text: 'Chờ Duyệt', cls: 'badge-warning' },
		confirmed: { text: 'Xác Nhận', cls: 'badge-success' },
		checked_in: { text: 'Đã Đến', cls: 'badge-info' },
		cancelled: { text: 'Đã Hủy', cls: 'badge-error text-white' }
	};
</script>

<svelte:head><title>Tổng Quan | KaraSystem Admin</title></svelte:head>

{#if !isReady}
	<div class="flex min-h-[50vh] items-center justify-center">
		<span class="loading loading-lg loading-spinner text-primary"></span>
	</div>
{:else}
	<div class="flex flex-col gap-6">
		<div class="flex items-center justify-between">
			<div>
				<h2 class="text-xl font-bold">Tổng Quan</h2>
				<p class="mt-0.5 text-sm font-medium text-base-content/40">Báo cáo hoạt động hệ thống</p>
			</div>
			<button
				onclick={loadData}
				class="btn rounded-lg text-base-content/40 btn-ghost btn-sm hover:text-primary"
			>
				<Icon icon="solar:refresh-line-duotone" class="text-lg" />
				Làm Mới
			</button>
		</div>

		<div class="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
			<div class="rounded-xl border border-base-300/50 bg-base-100 p-4 lg:p-5">
				<div class="mb-3 flex items-center justify-between">
					<div class="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10">
						<Icon icon="solar:wallet-line-duotone" class="text-lg text-emerald-500" />
					</div>
					{#if stats.confirmedBookings > 0}
						<span
							class="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600"
							>{stats.confirmedBookings} xác nhận</span
						>
					{/if}
				</div>
				<p class="text-[10px] font-bold tracking-widest text-base-content/40 uppercase">
					Doanh Thu Hôm Nay
				</p>
				<p class="mt-1 text-lg font-black text-emerald-600 lg:text-xl">
					{fmtVND(stats.todayRevenue)}
				</p>
			</div>

			<div class="rounded-xl border border-base-300/50 bg-base-100 p-4 lg:p-5">
				<div class="mb-3 flex items-center justify-between">
					<div class="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10">
						<Icon icon="solar:ticket-line-duotone" class="text-lg text-blue-500" />
					</div>
					{#if stats.pendingBookings > 0}
						<span
							class="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-600"
							>{stats.pendingBookings} chờ duyệt</span
						>
					{/if}
				</div>
				<p class="text-[10px] font-bold tracking-widest text-base-content/40 uppercase">
					Tổng Đặt Chỗ
				</p>
				<p class="mt-1 text-lg font-black lg:text-xl">{stats.totalBookings}</p>
			</div>

			<div class="rounded-xl border border-base-300/50 bg-base-100 p-4 lg:p-5">
				<div class="mb-3 flex items-center justify-between">
					<div class="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/10">
						<Icon icon="solar:home-smile-angle-line-duotone" class="text-lg text-violet-500" />
					</div>
					<span
						class="rounded-full bg-base-200 px-2 py-0.5 text-[10px] font-bold text-base-content/30"
						>{stats.totalServices} dịch vụ</span
					>
				</div>
				<p class="text-[10px] font-bold tracking-widest text-base-content/40 uppercase">
					Hệ Thống Phòng
				</p>
				<p class="mt-1 text-lg font-black lg:text-xl">{stats.totalRooms}</p>
			</div>

			<div class="rounded-xl border border-base-300/50 bg-base-100 p-4 lg:p-5">
				<div class="mb-3 flex items-center justify-between">
					<div class="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500/10">
						<Icon
							icon="solar:users-group-two-rounded-line-duotone"
							class="text-lg text-orange-500"
						/>
					</div>
				</div>
				<p class="text-[10px] font-bold tracking-widest text-base-content/40 uppercase">
					Thành Viên
				</p>
				<p class="mt-1 text-lg font-black lg:text-xl">{stats.totalUsers}</p>
			</div>
		</div>
		<div class="overflow-hidden rounded-xl border border-base-300/50 bg-base-100">
			<div class="flex items-center justify-between border-b border-base-200 px-5 py-4">
				<div class="flex items-center gap-2 text-sm font-bold text-base-content/60">
					<Icon icon="solar:chart-2-line-duotone" class="text-base" />
					Biểu Đồ Doanh Thu
				</div>
				<div class="flex gap-1">
					{#each [7, 14, 30] as days}
						<button
							onclick={() => changeChartDays(days)}
							class="btn rounded-lg font-bold btn-xs {chartDays === days
								? 'btn-primary'
								: 'btn-ghost'}"
						>
							{days} ngày
						</button>
					{/each}
				</div>
			</div>
			<div class="p-5">
				{#if chartData.length > 0}
					<div class="flex h-40 items-end gap-1">
						{#each chartData as day}
							<div class="group relative flex flex-1 flex-col items-center gap-1">
								<div
									class="pointer-events-none absolute -top-8 left-1/2 z-10 -translate-x-1/2 rounded-md bg-base-300 px-2 py-1 text-[10px] font-bold whitespace-nowrap text-base-content opacity-0 transition-opacity group-hover:opacity-100"
								>
									{fmtVND(day.revenue)} • {day.bookings} đơn
								</div>
								<div
									class="min-h-[4px] w-full rounded-t-md bg-primary/80 transition-colors hover:bg-primary"
									style="height: {Math.max((day.revenue / maxRevenue) * 100, 3)}%"
								></div>
								<span class="mt-1 text-[9px] font-bold text-base-content/30"
									>{fmtShortDate(day.date)}</span
								>
							</div>
						{/each}
					</div>
				{:else}
					<div class="py-8 text-center text-sm font-medium text-base-content/30">
						Chưa có dữ liệu doanh thu.
					</div>
				{/if}
			</div>
		</div>

		<div class="grid grid-cols-1 gap-4 lg:gap-6 xl:grid-cols-3">
			<div class="overflow-hidden rounded-xl border border-base-300/50 bg-base-100 xl:col-span-2">
				<div class="flex items-center justify-between border-b border-base-200 px-5 py-4">
					<div class="flex items-center gap-2 text-sm font-bold text-base-content/60">
						<Icon icon="solar:calendar-date-line-duotone" class="text-base" />
						Đặt Phòng Gần Đây
					</div>
					<a href="/admin/bookings" class="text-xs font-bold text-primary hover:underline"
						>Xem tất cả →</a
					>
				</div>
				<div class="overflow-x-auto">
					<table class="table table-sm">
						<thead>
							<tr class="bg-base-200/30 text-[10px] tracking-widest text-base-content/30 uppercase">
								<th class="font-bold">Mã</th>
								<th class="font-bold">Khách Hàng</th>
								<th class="font-bold">Phòng</th>
								<th class="font-bold">Thời Gian</th>
								<th class="text-right font-bold">Tổng</th>
								<th class="text-center font-bold">Trạng Thái</th>
							</tr>
						</thead>
						<tbody>
							{#if recentBookings.length === 0}
								<tr
									><td colspan="6" class="py-12 text-center font-medium text-base-content/30"
										>Chưa có đơn đặt phòng nào.</td
									></tr
								>
							{:else}
								{#each recentBookings as bk}
									{@const st = statusMap[bk.status] || { text: bk.status, cls: 'badge-ghost' }}
									<tr class="hover">
										<td class="font-mono text-xs font-bold text-base-content/30">#{bk.id}</td>
										<td>
											<span class="text-sm font-semibold">{bk.userName || '—'}</span>
										</td>
										<td class="text-sm font-medium text-primary">{bk.roomName || '—'}</td>
										<td class="text-xs font-medium text-base-content/50">{fmtTime(bk.startTime)}</td
										>
										<td class="text-right font-mono text-sm font-bold"
											>{fmtVND(bk.totalCost ?? 0)}</td
										>
										<td class="text-center"
											><span class="badge {st.cls} rounded-md badge-xs font-bold">{st.text}</span
											></td
										>
									</tr>
								{/each}
							{/if}
						</tbody>
					</table>
				</div>
			</div>

			<div class="flex flex-col overflow-hidden rounded-xl border border-base-300/50 bg-base-100">
				<div class="border-b border-base-200 px-5 py-4">
					<div class="flex items-center gap-2 text-sm font-bold text-base-content/60">
						<Icon icon="solar:chart-2-line-duotone" class="text-base" />
						Trạng Thái Hệ Thống
					</div>
				</div>
				<div class="flex flex-1 flex-col gap-3 p-4">
					{#if occupancy}
						<div class="rounded-lg border border-primary/15 bg-primary/5 p-4">
							<div class="mb-2 flex items-center justify-between">
								<span class="text-xs font-bold tracking-widest text-base-content/50 uppercase"
									>Tỷ Lệ Lấp Đầy Hôm Nay</span
								>
								<span class="text-lg font-black text-primary">{occupancy.rate}%</span>
							</div>
							<div class="h-2 w-full rounded-full bg-base-200">
								<div
									class="h-2 rounded-full bg-primary transition-all"
									style="width: {occupancy.rate}%"
								></div>
							</div>
							<p class="mt-2 text-[11px] font-medium text-base-content/40">
								{occupancy.occupied}/{occupancy.total} phòng có booking
							</p>
						</div>
					{/if}

					{#if stats.pendingBookings > 0}
						<div class="rounded-lg border border-amber-500/15 bg-amber-500/5 p-4">
							<div class="mb-1 flex items-center gap-2">
								<Icon icon="solar:bell-bing-bold-duotone" class="text-amber-500" />
								<span class="text-sm font-bold text-amber-600"
									>{stats.pendingBookings} Yêu Cầu Mới</span
								>
							</div>
							<p class="text-xs font-medium text-base-content/40">Đang chờ phê duyệt từ quản lý.</p>
							<a href="/admin/bookings" class="btn mt-3 rounded-md font-bold btn-xs btn-warning"
								>Xử Lý Ngay</a
							>
						</div>
					{:else}
						<div class="rounded-lg border border-emerald-500/15 bg-emerald-500/5 p-4">
							<div class="mb-1 flex items-center gap-2">
								<Icon icon="solar:check-circle-bold-duotone" class="text-emerald-500" />
								<span class="text-sm font-bold text-emerald-600">Tất Cả Đã Xử Lý</span>
							</div>
							<p class="text-xs font-medium text-base-content/40">
								Không có đơn nào đang chờ duyệt.
							</p>
						</div>
					{/if}

					<div class="flex-1 rounded-lg bg-base-200/40 p-4">
						<p class="mb-3 text-xs font-bold tracking-widest text-base-content/50 uppercase">
							Tổng Quan Cơ Sở
						</p>
						<div class="flex flex-col gap-2.5">
							<div class="flex justify-between text-sm">
								<span class="font-medium text-base-content/50">Phòng Hoạt Động</span>
								<span class="font-bold">{stats.totalRooms}</span>
							</div>
							<div class="flex justify-between text-sm">
								<span class="font-medium text-base-content/50">Dịch Vụ Trong Menu</span>
								<span class="font-bold">{stats.totalServices}</span>
							</div>
							<div class="flex justify-between text-sm">
								<span class="font-medium text-base-content/50">Tài Khoản Thành Viên</span>
								<span class="font-bold">{stats.totalUsers}</span>
							</div>
							<div class="flex justify-between text-sm">
								<span class="font-medium text-base-content/50">Đơn Đã Xác Nhận</span>
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
			<div class="overflow-hidden rounded-xl border border-base-300/50 bg-base-100">
				<div
					class="flex items-center gap-2 border-b border-base-200 px-5 py-4 text-sm font-bold text-base-content/60"
				>
					<Icon icon="solar:fire-bold-duotone" class="text-base" />
					Giờ Cao Điểm (30 Ngày Gần Nhất)
				</div>
				<div class="overflow-x-auto p-5">
					<div class="flex min-w-[600px] gap-0.5">
						<div class="flex flex-col gap-0.5 pr-2">
							<div class="h-5"></div>
							{#each dayLabels as day}
								<div class="flex h-6 items-center text-[10px] font-bold text-base-content/40">
									{day}
								</div>
							{/each}
						</div>
						<div class="flex flex-1 flex-col gap-0.5">
							<div class="flex gap-0.5">
								{#each hours as h}
									<div
										class="flex h-5 flex-1 items-center justify-center text-center text-[9px] font-bold text-base-content/30"
									>
										{h}
									</div>
								{/each}
							</div>
							{#each heatmapData as row}
								<div class="flex gap-0.5">
									{#each hours as _, hi}
										{@const val = row[hi + 6] || 0}
										{@const intensity = val / maxVal}
										<div
											class="h-6 flex-1 rounded-sm transition-colors"
											style="background-color: oklch(0.65 0.2 270 / {Math.max(
												intensity * 0.9,
												0.05
											)})"
											title="{val} booking(s)"
										></div>
									{/each}
								</div>
							{/each}
						</div>
					</div>
					<div class="mt-3 flex items-center justify-end gap-2">
						<span class="text-[10px] font-medium text-base-content/30">Ít</span>
						<div class="flex gap-0.5">
							{#each [0.1, 0.3, 0.5, 0.7, 0.9] as op}
								<div
									class="h-4 w-4 rounded-sm"
									style="background-color: oklch(0.65 0.2 270 / {op})"
								></div>
							{/each}
						</div>
						<span class="text-[10px] font-medium text-base-content/30">Nhiều</span>
					</div>
				</div>
			</div>
		{/if}
		<div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
			{#if topRooms.length > 0}
				<div class="overflow-hidden rounded-xl border border-base-300/50 bg-base-100">
					<div
						class="flex items-center gap-2 border-b border-base-200 px-5 py-4 text-sm font-bold text-base-content/60"
					>
						<Icon icon="solar:crown-star-bold-duotone" class="text-base text-amber-500" />
						Top Phòng Được Đặt Nhiều Nhất
					</div>
					<div class="p-4">
						<div class="flex flex-col gap-2">
							{#each topRooms as rm, i}
								<div
									class="flex items-center gap-3 rounded-lg p-2 {i === 0 ? 'bg-amber-500/5' : ''}"
								>
									<span
										class="h-6 w-6 rounded-full {i === 0
											? 'bg-amber-500 text-white'
											: i === 1
												? 'bg-base-300 text-base-content/60'
												: 'bg-base-200 text-base-content/40'} flex items-center justify-center text-[10px] font-black"
										>{i + 1}</span
									>
									<div class="min-w-0 flex-1">
										<p class="truncate text-sm font-bold">{rm.roomName}</p>
										<p class="text-[10px] font-medium text-base-content/40 uppercase">
											{rm.roomType}
										</p>
									</div>
									<div class="text-right">
										<p class="text-sm font-black">{rm.bookingCount} đơn</p>
										<p class="text-[10px] font-medium text-base-content/40">
											{fmtVND(rm.totalRevenue)}
										</p>
									</div>
								</div>
							{/each}
						</div>
					</div>
				</div>
			{/if}

			{#if topCustomers.length > 0}
				<div class="overflow-hidden rounded-xl border border-base-300/50 bg-base-100">
					<div
						class="flex items-center gap-2 border-b border-base-200 px-5 py-4 text-sm font-bold text-base-content/60"
					>
						<Icon icon="solar:users-group-rounded-bold-duotone" class="text-base text-primary" />
						Top Khách Hàng Chi Tiêu Cao
					</div>
					<div class="p-4">
						<div class="flex flex-col gap-2">
							{#each topCustomers as cust, i}
								<div class="flex items-center gap-3 rounded-lg p-2 {i === 0 ? 'bg-primary/5' : ''}">
									<span
										class="h-6 w-6 rounded-full {i === 0
											? 'bg-primary text-white'
											: i === 1
												? 'bg-base-300 text-base-content/60'
												: 'bg-base-200 text-base-content/40'} flex items-center justify-center text-[10px] font-black"
										>{i + 1}</span
									>
									<div class="min-w-0 flex-1">
										<p class="truncate text-sm font-bold">{cust.userName || 'N/A'}</p>
										<p class="truncate text-[10px] font-medium text-base-content/40">
											{cust.userEmail}
										</p>
									</div>
									<div class="text-right">
										<p class="text-sm font-black text-primary">{fmtVND(cust.totalSpent)}</p>
										<p class="text-[10px] font-medium text-base-content/40">
											{cust.bookingCount} đơn
										</p>
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
