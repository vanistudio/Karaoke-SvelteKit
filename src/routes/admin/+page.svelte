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

	const statCards = $derived([
		{ label: 'Doanh Thu Hôm Nay', value: formatVND(stats?.todayRevenue || 0), icon: 'solar:wallet-line-duotone', color: 'text-primary', bgColor: 'bg-primary/8', badge: `${stats?.confirmedBookings || 0} Xác Nhận`, badgeColor: 'badge-success' },
		{ label: 'Tổng Đặt Chỗ', value: stats?.totalBookings || 0, icon: 'solar:ticket-line-duotone', color: 'text-secondary', bgColor: 'bg-secondary/8', badge: stats?.pendingBookings > 0 ? `${stats.pendingBookings} Chờ Duyệt` : 'Không Có Đơn Chờ', badgeColor: stats?.pendingBookings > 0 ? 'badge-warning' : 'badge-success' },
		{ label: 'Hệ Thống Phòng', value: stats?.totalRooms || 0, icon: 'solar:home-smile-angle-line-duotone', color: 'text-accent', bgColor: 'bg-accent/8', badge: `${stats?.totalServices || 0} Dịch Vụ`, badgeColor: 'badge-info' },
		{ label: 'Thành Viên', value: stats?.totalUsers || 0, icon: 'solar:users-group-two-rounded-line-duotone', color: 'text-base-content', bgColor: 'bg-base-200', badge: 'Tài Khoản', badgeColor: 'badge-ghost' }
	]);

	const statusLabel: Record<string, { text: string; cls: string }> = {
		pending: { text: 'Chờ Duyệt', cls: 'badge-warning' },
		confirmed: { text: 'Xác Nhận', cls: 'badge-success' },
		cancelled: { text: 'Đã Hủy', cls: 'badge-error text-white' }
	};
</script>

<svelte:head>
	<title>Tổng Quan | KaraSystem Admin</title>
</svelte:head>

{#if !isReady}
	<div class="flex items-center justify-center min-h-[50vh]">
		<span class="loading loading-spinner loading-lg text-primary"></span>
	</div>
{:else}
	<div class="flex flex-col gap-6">
		<div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
			{#each statCards as card}
				<div class="bg-base-100 rounded-xl border border-base-300/60 p-5 flex items-start gap-4">
					<div class="w-11 h-11 rounded-lg {card.bgColor} flex items-center justify-center shrink-0">
						<Icon icon={card.icon} class="text-2xl {card.color}" />
					</div>
					<div class="flex-1 min-w-0">
						<p class="text-[10px] font-bold text-base-content/40 uppercase tracking-widest">{card.label}</p>
						<p class="text-xl font-black {card.color} mt-0.5">{card.value}</p>
						<div class="badge {card.badgeColor} badge-xs rounded-md font-semibold mt-2">{card.badge}</div>
					</div>
				</div>
			{/each}
		</div>

		<div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
			<div class="xl:col-span-2 bg-base-100 rounded-xl border border-base-300/60">
				<div class="flex items-center justify-between px-6 py-4 border-b border-base-200">
					<h2 class="text-sm font-bold tracking-widest uppercase text-base-content/60 flex items-center gap-2">
						<Icon icon="solar:calendar-date-line-duotone" class="text-lg"/>
						Đặt Phòng Gần Đây
					</h2>
					<a href="/admin/bookings" class="text-xs font-bold text-primary hover:underline tracking-wider uppercase">Xem Tất Cả</a>
				</div>
				<div class="overflow-x-auto">
					<table class="table table-sm w-full">
						<thead>
							<tr class="text-[10px] uppercase tracking-widest text-base-content/30 border-b border-base-200">
								<th>Mã</th>
								<th>Khách</th>
								<th>Phòng</th>
								<th>Thời Gian</th>
								<th class="text-right">Tổng</th>
								<th class="text-right">Trạng Thái</th>
							</tr>
						</thead>
						<tbody>
							{#if recentBookings.length === 0}
								<tr><td colspan="6" class="text-center py-10 text-base-content/40 font-medium">Chưa có đơn đặt phòng.</td></tr>
							{:else}
								{#each recentBookings as bk}
									{@const st = statusLabel[bk.status] || { text: bk.status, cls: 'badge-ghost' }}
									<tr class="hover">
										<td class="font-mono text-xs font-bold text-base-content/40">#BKG-{bk.id}</td>
										<td class="font-semibold text-sm">{bk.userName || 'N/A'}</td>
										<td class="font-medium text-primary text-sm">{bk.roomName || 'N/A'}</td>
										<td class="text-xs font-medium">
											<div>{formatDate(bk.startTime)}</div>
											<div class="text-base-content/30">đến {formatDate(bk.endTime)}</div>
										</td>
										<td class="text-right font-mono font-medium">{formatVND(bk.totalCost ?? 0)}</td>
										<td class="text-right">
											<div class="badge {st.cls} badge-xs rounded-md font-bold">{st.text}</div>
										</td>
									</tr>
								{/each}
							{/if}
						</tbody>
					</table>
				</div>
			</div>

			<div class="bg-base-100 rounded-xl border border-base-300/60">
				<div class="px-6 py-4 border-b border-base-200">
					<h2 class="text-sm font-bold tracking-widest uppercase text-base-content/60 flex items-center gap-2">
						<Icon icon="solar:bell-bing-line-duotone" class="text-lg"/>
						Trạng Thái
					</h2>
				</div>
				<div class="p-5 flex flex-col gap-4">
					{#if stats?.pendingBookings > 0}
						<div class="bg-warning/8 border border-warning/15 rounded-lg p-4">
							<p class="text-sm font-bold text-warning">{stats.pendingBookings} Yêu Cầu Mới</p>
							<p class="text-xs text-base-content/50 mt-1 font-medium">Cần xác nhận lịch đặt chỗ.</p>
							<a href="/admin/bookings" class="btn btn-xs btn-warning rounded-md mt-3 font-bold tracking-wider uppercase">Xử Lý</a>
						</div>
					{:else}
						<div class="bg-success/8 border border-success/15 rounded-lg p-4">
							<p class="text-sm font-bold text-success">Không Có Đơn Chờ</p>
							<p class="text-xs text-base-content/50 mt-1 font-medium">Tất cả đã xử lý.</p>
						</div>
					{/if}
					<div class="bg-base-200/50 border border-base-200 rounded-lg p-4">
						<p class="text-sm font-bold">Cơ Sở Dữ Liệu</p>
						<p class="text-xs text-base-content/50 mt-1 font-medium">{stats?.totalRooms} Phòng · {stats?.totalServices} Dịch Vụ · {stats?.totalUsers} Thành Viên</p>
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}
