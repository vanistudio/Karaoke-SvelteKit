<script lang="ts">
	import Icon from '@iconify/svelte';
</script>

<svelte:head><title>Ưu Đãi | KaraSystem</title></svelte:head>

<div class="max-w-4xl mx-auto flex flex-col gap-6">
	<div class="text-center py-8">
		<div class="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
			<Icon icon="solar:tag-price-bold-duotone" class="text-3xl text-primary" />
		</div>
		<h2 class="text-2xl font-black">Ưu Đãi & Khuyến Mãi</h2>
		<p class="text-base-content/40 font-medium mt-2 text-sm max-w-md mx-auto">Nhập mã voucher khi đặt phòng để được giảm giá. Các ưu đãi có thể thay đổi tùy theo chương trình.</p>
	</div>

	<div class="bg-base-100 rounded-xl border border-base-300/50 overflow-hidden">
		<div class="px-5 py-4 border-b border-base-200 flex items-center gap-2 text-sm font-bold text-base-content/60">
			<Icon icon="solar:info-circle-line-duotone" class="text-base"/>
			Hướng Dẫn Sử Dụng
		</div>
		<div class="p-5">
			<div class="flex flex-col gap-3">
				<div class="flex items-start gap-3">
					<div class="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
						<span class="text-xs font-black text-primary">1</span>
					</div>
					<p class="text-sm font-medium text-base-content/60">Chọn phòng và thời gian bạn muốn đặt.</p>
				</div>
				<div class="flex items-start gap-3">
					<div class="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
						<span class="text-xs font-black text-primary">2</span>
					</div>
					<p class="text-sm font-medium text-base-content/60">Nhập mã voucher vào ô <span class="font-bold text-primary">Mã Voucher</span> trong trang đặt phòng.</p>
				</div>
				<div class="flex items-start gap-3">
					<div class="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
						<span class="text-xs font-black text-primary">3</span>
					</div>
					<p class="text-sm font-medium text-base-content/60">Bấm <span class="font-bold text-primary">Áp Dụng</span> để kiểm tra và nhận ưu đãi giảm giá.</p>
				</div>
			</div>
		</div>
	</div>

	<div class="bg-base-200/30 rounded-xl p-6 text-center">
		<Icon icon="solar:gift-bold-duotone" class="text-5xl text-primary/30 mx-auto mb-3" />
		<p class="text-sm font-bold text-base-content/40">Mã voucher do quản trị viên phát hành</p>
		<p class="text-xs text-base-content/30 font-medium mt-1">Theo dõi fanpage hoặc liên hệ quầy lễ tân để nhận mã ưu đãi mới nhất.</p>
	</div>
</div>
