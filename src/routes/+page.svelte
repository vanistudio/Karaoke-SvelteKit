<script lang="ts">
	import Icon from '@iconify/svelte';
	import { trpc } from '$lib/trpc/client';

	let healthMessage = $state('Kiểm tra kết nối...');
	let isReady = $state(false);

	$effect(() => {
		trpc()
			.healthcheck.query()
			.then((res: string) => {
				healthMessage = 'Hệ thống trực tuyến';
				isReady = true;
			})
			.catch(() => {
				healthMessage = 'Mất kết nối máy chủ';
			});
	});
</script>

<div class="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 py-10 md:py-16">
	<!-- Hero Section -->
	<section class="flex flex-col items-center text-center">
		<h1 class="mb-4 max-w-3xl text-4xl font-bold tracking-tight text-base-content md:text-5xl lg:text-6xl">
			Hệ Thống Đặt Phòng Karaoke <br/>
			<span class="text-primary">Chuyên Nghiệp</span>
		</h1>
		
		<p class="mb-10 max-w-2xl text-base text-base-content/70 md:text-lg">
			Tối ưu hóa thời gian đặt phòng. Trải nghiệm dịch vụ giải trí đẳng cấp với hệ thống âm thanh tiêu chuẩn 5 sao và quản lý tự động hoàn toàn.
		</p>
		
		<!-- Booking Action Container -->
		<div class="flex w-full max-w-4xl flex-col gap-4 rounded-xl border border-base-300 bg-base-100 p-4 shadow-sm sm:flex-row sm:items-center">
			
            <div class="flex flex-1 items-center gap-3 rounded-lg border border-base-200 bg-base-200/50 px-4 py-3">
				<Icon icon="solar:calendar-date-line-duotone" class="text-2xl text-base-content/50" />
				<div class="flex flex-col text-left">
					<span class="text-xs font-semibold text-base-content/60 uppercase tracking-wide">Ngày Hát</span>
					<span class="text-sm font-medium text-base-content">Hôm nay, 19:00</span>
				</div>
			</div>
            
			<div class="flex flex-1 items-center gap-3 rounded-lg border border-base-200 bg-base-200/50 px-4 py-3">
				<Icon icon="solar:users-group-two-rounded-line-duotone" class="text-2xl text-base-content/50" />
				<div class="flex flex-col text-left">
					<span class="text-xs font-semibold text-base-content/60 uppercase tracking-wide">Số Lượng Khách</span>
					<span class="text-sm font-medium text-base-content">5 - 10 Người</span>
				</div>
			</div>
            
			<button class="btn btn-primary px-8 h-full min-h-[3rem] w-full sm:w-auto shadow-sm">
				Tìm Phòng Trống
			</button>
		</div>
	</section>

	<div class="divider"></div> 

	<!-- Services Section -->
	<section class="space-y-8">
		<div class="flex items-center justify-between">
			<h2 class="text-2xl font-bold text-base-content">Dịch Vụ Tiêu Chuẩn</h2>
			<div class="flex items-center gap-2 text-sm">
				{#if isReady}
					<div class="badge badge-success gap-1 font-semibold p-3 text-success-content">
						<Icon icon="solar:check-circle-bold" />
						{healthMessage}
					</div>
				{:else}
					<div class="badge badge-error gap-1 font-semibold p-3 text-error-content">
						<Icon icon="solar:danger-triangle-bold" />
						{healthMessage}
					</div>
				{/if}
			</div>
		</div>

		<div class="grid grid-cols-1 gap-6 md:grid-cols-3">
			<!-- DaisyUI Card 1 -->
			<div class="card bg-base-100 border border-base-200 transition-all hover:shadow-md hover:border-primary/30">
                <div class="card-body">
                    <div class="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-base-200 text-base-content">
                        <Icon icon="solar:star-fall-2-line-duotone" class="text-2xl" />
                    </div>
                    <h3 class="card-title text-lg">Phòng Hát Đẳng Cấp</h3>
                    <p class="text-sm text-base-content/70">
                        Đa dạng sức chứa từ 5 đến 40 khách. Thiết kế thanh lịch, trang bị hệ thống âm thanh nội địa và cách âm kỹ thuật số.
                    </p>
                </div>
			</div>

			<!-- DaisyUI Card 2 -->
			<div class="card bg-base-100 border border-base-200 transition-all hover:shadow-md hover:border-primary/30">
                <div class="card-body">
                    <div class="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-base-200 text-base-content">
                        <Icon icon="solar:cup-stars-line-duotone" class="text-2xl" />
                    </div>
                    <h3 class="card-title text-lg">Thực Đơn Phong Phú</h3>
                    <p class="text-sm text-base-content/70">
                        Bao gồm các gói combo tiệc nhẹ, bia và đồ uống pha chế tươi. Hỗ trợ đặt món trước khi đến để không làm gián đoạn cuộc vui.
                    </p>
                </div>
			</div>

			<!-- DaisyUI Card 3 -->
			<div class="card bg-base-100 border border-base-200 transition-all hover:shadow-md hover:border-primary/30">
                <div class="card-body">
                    <div class="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-base-200 text-base-content">
                        <Icon icon="solar:ticket-sale-line-duotone" class="text-2xl" />
                    </div>
                    <h3 class="card-title text-lg">Chính Sách Ưu Đãi</h3>
                    <p class="text-sm text-base-content/70">
                        Tích lũy điểm thưởng qua mỗi hóa đơn. Quy đổi hạng thành viên và áp dụng chiết khấu tự động trên nền tảng.
                    </p>
                </div>
			</div>
		</div>
	</section>
</div>
