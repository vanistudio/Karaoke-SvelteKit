<script lang="ts">
	import Icon from '@iconify/svelte';
	import { trpc } from '$lib/trpc/client';

	let healthMessage = $state('Đang kết nối Server...');

	$effect(() => {
		trpc()
			.healthcheck.query()
			.then((res: string) => {
				healthMessage = 'Hệ thống Sẵn Sàng (TRPC)';
			})
			.catch(() => {
				healthMessage = 'Mất kết nối với Server';
			});
	});
</script>

<div class="flex flex-col gap-12 py-8 pb-20">
	<!-- Hero Section -->
	<div class="card preset-filled-surface-100-800 relative overflow-hidden rounded-3xl p-10 lg:p-16 text-center shadow-sm">
		<!-- Graphic Elements -->
		<div class="absolute -top-24 -right-24 text-primary-500/10 pointer-events-none">
			<Icon icon="solar:music-notes-line-duotone" class="text-[350px]" />
		</div>
        <div class="absolute -bottom-24 -left-24 text-primary-500/5 pointer-events-none">
			<Icon icon="solar:soundwave-circle-line-duotone" class="text-[250px]" />
		</div>
		
		<div class="relative z-10 mx-auto max-w-3xl space-y-6">
			<span class="badge preset-tonal-primary font-bold tracking-widest uppercase">KaraSystem Pro</span>
			<h1 class="text-4xl md:text-5xl lg:text-6xl font-black text-surface-900 leading-tight">
				Trải Nghiệm Giải Trí Đỉnh Cao <br/>
				<span class="text-primary-600">Ngay Trong Tầm Tay</span>
			</h1>
			<p class="text-lg text-surface-600 max-w-2xl mx-auto">
				Đặt phòng hát nhanh chóng, trải nghiệm âm thanh sống động cùng kho nhạc cập nhật liên tục. Hãy trở thành khách VIP ngay hôm nay để nhận vô vàn ưu đãi đặc biệt!
			</p>
			<div class="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
				<a href="/rooms" class="btn preset-filled-primary text-lg font-bold px-8 py-3 w-full sm:w-auto">
					<Icon icon="solar:microphone-3-line-duotone" class="text-xl" />
					<span>Đặt Phòng Ngay</span>
				</a>
				<a href="/promotions" class="btn preset-tonal-surface text-lg font-bold px-8 py-3 w-full sm:w-auto">
					<Icon icon="solar:tag-price-line-duotone" class="text-xl" />
					<span>Xem Khuyến Mãi</span>
				</a>
			</div>
		</div>
	</div>

	<!-- Status Card -->
	<div class="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-surface-200 bg-white p-5 shadow-sm">
		<div class="flex items-center gap-4">
			<div class="flex h-12 w-12 items-center justify-center rounded-full bg-success-50 text-success-600">
				<Icon icon="solar:shield-check-line-duotone" class="text-3xl" />
			</div>
			<div>
				<h3 class="font-bold text-surface-900 text-lg">Trạng thái Máy Chủ Hệ Thống</h3>
				<p class="text-sm text-surface-600">Kiểm tra kết nối Database & Real-time RPC Backend</p>
			</div>
		</div>
		<span class="badge text-lg {healthMessage.includes('Sẵn Sàng') ? 'preset-tonal-success' : 'preset-tonal-error'} px-4 py-2 font-semibold">
			<Icon icon={healthMessage.includes('Sẵn Sàng') ? "solar:check-circle-line-duotone" : "solar:danger-triangle-line-duotone"} class="text-xl" />
			<span>{healthMessage}</span>
		</span>
	</div>

	<!-- Features / Services Quick Look -->
	<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
		<div class="card preset-filled-surface-50 p-8 space-y-4 hover:shadow-md transition-shadow border border-surface-100">
			<div class="text-primary-600 bg-primary-50 inline-flex p-3 rounded-2xl">
				<Icon icon="solar:star-fall-2-line-duotone" class="text-5xl" />
			</div>
			<h3 class="text-2xl font-bold text-surface-900">Phòng Hát VIP</h3>
			<p class="text-surface-600 leading-relaxed">Hệ thống phòng hát với sức chứa từ 5 đến 40 người, thiết kế theo phong cách hiện đại tích hợp hệ thống âm thanh, đèn LED cảm biến nhập khẩu mới nhất.</p>
		</div>
		
		<div class="card preset-filled-surface-50 p-8 space-y-4 hover:shadow-md transition-shadow border border-surface-100">
			<div class="text-secondary-600 bg-secondary-50 inline-flex p-3 rounded-2xl">
				<Icon icon="solar:wineglass-triangle-line-duotone" class="text-5xl" />
			</div>
			<h3 class="text-2xl font-bold text-surface-900">Menu Phong Phú</h3>
			<p class="text-surface-600 leading-relaxed">Dễ dàng chọn lựa và đặt trước combo các loại đồ ăn nhẹ, trái cây tươi tự nhiên, nước giải khát hay bia lạnh để tận hưởng cuộc vui trọn vẹn.</p>
		</div>
		
		<div class="card preset-filled-surface-50 p-8 space-y-4 hover:shadow-md transition-shadow border border-surface-100">
			<div class="text-tertiary-600 bg-tertiary-50 inline-flex p-3 rounded-2xl">
				<Icon icon="solar:ticket-sale-line-duotone" class="text-5xl" />
			</div>
			<h3 class="text-2xl font-bold text-surface-900">Tích Điểm Tự Động</h3>
			<p class="text-surface-600 leading-relaxed">Với mỗi hóa đơn thanh toán, hệ thống sẽ tự tích điểm để bạn dễ dàng thăng hạng thẻ (Bạc / Vàng / Kim Cương) với ngập tràn voucher giảm giá.</p>
		</div>
	</div>
</div>
