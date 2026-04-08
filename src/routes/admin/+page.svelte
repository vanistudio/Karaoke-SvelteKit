<script lang="ts">
	import Icon from '@iconify/svelte';
</script>

<svelte:head>
	<title>Tổng Quan Hệ Thống | KaraSystem Admin</title>
</svelte:head>

<div class="flex flex-col gap-8">
	<!-- Summary Statistics -->
	<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
		<div class="card bg-base-100 rounded-md border border-base-300 shadow-sm relative overflow-hidden">
			<div class="absolute -right-4 -top-4 text-primary/10">
				<Icon icon="solar:wallet-line-duotone" class="text-9xl" />
			</div>
			<div class="card-body p-6 z-10">
				<div class="flex flex-col gap-1">
					<p class="text-xs font-bold text-base-content/60 uppercase tracking-widest">Doanh Thu Trong Ngày</p>
					<h3 class="text-3xl font-black text-primary">12,500,000₫</h3>
				</div>
				<div class="mt-4 flex items-center gap-2 text-sm font-medium">
					<div class="badge badge-success rounded-md badge-sm">+15%</div>
					<span class="text-base-content/60">so với hôm qua</span>
				</div>
			</div>
		</div>

		<div class="card bg-base-100 rounded-md border border-base-300 shadow-sm relative overflow-hidden">
			<div class="absolute -right-4 -top-4 text-secondary/10">
				<Icon icon="solar:ticket-bold-duotone" class="text-9xl" />
			</div>
			<div class="card-body p-6 z-10">
				<div class="flex flex-col gap-1">
					<p class="text-xs font-bold text-base-content/60 uppercase tracking-widest">Lịch Đặt Chỗ (Tương Lai)</p>
					<h3 class="text-3xl font-black text-secondary">24</h3>
				</div>
				<div class="mt-4 flex items-center gap-2 text-sm font-medium">
					<div class="badge badge-warning rounded-md badge-sm">8 Chưa Xác Nhận</div>
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
					<h3 class="text-3xl font-black text-accent">15</h3>
				</div>
				<div class="mt-4 flex items-center gap-2 text-sm font-medium">
					<div class="badge badge-info rounded-md badge-sm">5 VIP</div>
					<span class="text-base-content/60">Đang Vận Hành Tốt</span>
				</div>
			</div>
		</div>

		<div class="card bg-base-100 rounded-md border border-base-300 shadow-sm relative overflow-hidden">
			<div class="absolute -right-4 -top-4 text-base-content/5">
				<Icon icon="solar:users-group-two-rounded-bold-duotone" class="text-9xl" />
			</div>
			<div class="card-body p-6 z-10">
				<div class="flex flex-col gap-1">
					<p class="text-xs font-bold text-base-content/60 uppercase tracking-widest">Thành Viên Hội Viên</p>
					<h3 class="text-3xl font-black text-base-content">482</h3>
				</div>
				<div class="mt-4 flex items-center gap-2 text-sm font-medium">
					<div class="badge badge-success rounded-md badge-sm">+12</div>
					<span class="text-base-content/60">Thành viên mới tuần này</span>
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
					<!-- Fake Data for Overview Blueprinting -->
					<table class="table table-sm xs:table-sm w-full">
						<thead>
							<tr class="uppercase text-[10px] tracking-widest border-b border-base-200">
								<th>Mã Booking</th>
								<th>Phòng</th>
								<th>Thời Gian Đoán</th>
								<th>Tổng Tiền Tiền</th>
								<th class="text-right">Trạng Thái</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td class="font-mono text-xs font-bold text-base-content/60">#BKG-889</td>
								<td class="font-bold">Phòng VIP 1</td>
								<td class="text-xs font-medium">19:00 - 22:00 Hôm nay</td>
								<td class="font-mono font-medium">450.000₫</td>
								<td class="text-right"><div class="badge badge-success badge-sm rounded-md">Đã Xác Nhận</div></td>
							</tr>
							<tr>
								<td class="font-mono text-xs font-bold text-base-content/60">#BKG-890</td>
								<td class="font-bold">Phòng Cơ Bản 2</td>
								<td class="text-xs font-medium">20:30 - 23:30 Hôm nay</td>
								<td class="font-mono font-medium">210.000₫</td>
								<td class="text-right"><div class="badge badge-warning badge-sm rounded-md">Chờ Duyệt</div></td>
							</tr>
							<tr>
								<td class="font-mono text-xs font-bold text-base-content/60">#BKG-891</td>
								<td class="font-bold">Phòng VIP 3</td>
								<td class="text-xs font-medium">14:00 - 17:00 Ngày Mai</td>
								<td class="font-mono font-medium">450.000₫</td>
								<td class="text-right"><div class="badge badge-warning badge-sm rounded-md">Chờ Duyệt</div></td>
							</tr>
						</tbody>
					</table>
				</div>
                <div class="mt-4 border-t border-base-200 pt-4 flex justify-center">
                    <a href="/admin/bookings" class="btn btn-sm btn-ghost rounded-md font-bold tracking-widest uppercase text-xs">Xem Tải Tất Cả</a>
                </div>
			</div>
		</div>

		<div class="card bg-base-100 rounded-md border border-base-300 shadow-sm">
			<div class="card-body p-6">
				<h2 class="card-title text-base font-bold tracking-widest uppercase mb-4 text-base-content/80 flex items-center gap-2">
					<Icon icon="solar:bell-bing-line-duotone" class="text-xl"/>
					Hành Động Khẩn Cấp
				</h2>
				<div class="flex flex-col gap-3">
					<div class="bg-warning/10 border border-warning/20 rounded-md p-4">
						<h4 class="font-bold text-warning text-sm mb-1">8 Yêu Cầu Đặt Chỗ Mới!</h4>
						<p class="text-xs font-medium text-base-content/60">Cần xác nhận lịch đặt chỗ cho tối nay để chốt công nợ.</p>
						<a href="/admin/bookings" class="btn btn-xs rounded-md btn-warning mt-3 font-bold tracking-widest">Xử Lý Ngay</a>
					</div>
					<div class="bg-base-200 border border-base-300 rounded-md p-4">
						<h4 class="font-bold text-base-content text-sm mb-1">Cập nhật Menu</h4>
						<p class="text-xs font-medium text-base-content/60">Bạn chưa nhập giá bán Trái Cây Đĩa Mới.</p>
						<button class="btn btn-xs rounded-md btn-outline mt-3 font-bold tracking-widest">Thiết Lập</button>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
