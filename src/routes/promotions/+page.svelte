<script lang="ts">
	import { trpc } from '$lib/trpc/client';
	import Icon from '@iconify/svelte';
	import { addToast } from '$lib/stores/toast';

	let promotions = $state<any[]>([]);
	let isReady = $state(false);

	$effect(() => {
		loadData();
	});

	async function loadData() {
		try {
			promotions = await trpc().promotion.listPublic.query();
		} catch (e) {
			console.error(e);
		} finally {
			isReady = true;
		}
	}

	function fmtVND(v: number) {
		return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);
	}

	function fmtDate(d: string | Date | null) {
		if (!d) return 'Không giới hạn';
		return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(d));
	}

	function copyCode(code: string) {
		navigator.clipboard.writeText(code);
		addToast(`Đã sao chép mã "${code}"!`, 'success');
	}

	function remainingUsage(p: any) {
		return p.maxUsage - p.currentUsage;
	}
</script>

<svelte:head><title>Ưu Đãi | KaraSystem</title></svelte:head>

<div class="max-w-4xl mx-auto flex flex-col gap-6">
	<div class="text-center py-8">
		<div class="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
			<Icon icon="solar:tag-price-bold-duotone" class="text-3xl text-primary" />
		</div>
		<h2 class="text-2xl font-black">Ưu Đãi & Khuyến Mãi</h2>
		<p class="text-base-content/40 font-medium mt-2 text-sm max-w-md mx-auto">Sao chép mã voucher bên dưới và nhập khi đặt phòng để nhận ưu đãi giảm giá.</p>
	</div>

	{#if !isReady}
		<div class="flex items-center justify-center min-h-[20vh]">
			<span class="loading loading-spinner loading-lg text-primary"></span>
		</div>
	{:else if promotions.length === 0}
		<div class="bg-base-200/30 rounded-xl p-8 text-center">
			<Icon icon="solar:gift-bold-duotone" class="text-5xl text-primary/30 mx-auto mb-3" />
			<p class="text-sm font-bold text-base-content/40">Hiện chưa có chương trình ưu đãi nào</p>
			<p class="text-xs text-base-content/30 font-medium mt-1">Theo dõi fanpage hoặc liên hệ quầy lễ tân để nhận mã ưu đãi mới nhất.</p>
		</div>
	{:else}
		<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
			{#each promotions as promo}
				<div class="bg-base-100 rounded-xl border border-base-300/50 overflow-hidden hover:border-primary/50 transition-colors group">
					<div class="p-5">
						<div class="flex items-start justify-between mb-3">
							<div class="flex items-center gap-2">
								{#if promo.type === 'percent'}
									<div class="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
										<span class="text-lg font-black text-blue-500">{promo.value}%</span>
									</div>
								{:else}
									<div class="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
										<Icon icon="solar:wallet-money-bold-duotone" class="text-lg text-emerald-500" />
									</div>
								{/if}
								<div>
									<p class="text-xs font-bold text-base-content/40 uppercase tracking-widest">
										{promo.type === 'percent' ? 'Giảm Phần Trăm' : 'Giảm Cố Định'}
									</p>
									<p class="text-lg font-black {promo.type === 'percent' ? 'text-blue-600' : 'text-emerald-600'}">
										{promo.type === 'percent' ? `${promo.value}%` : fmtVND(promo.value)}
									</p>
								</div>
							</div>
							<span class="text-[10px] font-bold text-base-content/30 bg-base-200 px-2 py-0.5 rounded-full">
								Còn {remainingUsage(promo)} lượt
							</span>
						</div>

						<div class="flex flex-col gap-1.5 text-xs font-medium text-base-content/50 mb-4">
							{#if promo.minOrderAmount > 0}
								<div class="flex items-center gap-1.5">
									<Icon icon="solar:tag-line-duotone" class="text-sm text-base-content/30"/>
									Đơn tối thiểu: <span class="font-bold text-base-content/70">{fmtVND(promo.minOrderAmount)}</span>
								</div>
							{/if}
							<div class="flex items-center gap-1.5">
								<Icon icon="solar:calendar-line-duotone" class="text-sm text-base-content/30"/>
								Hạn dùng: <span class="font-bold text-base-content/70">{fmtDate(promo.expiresAt)}</span>
							</div>
						</div>

						<div class="flex items-center gap-2">
							<div class="flex-1 bg-base-200/60 rounded-lg px-3 py-2 font-mono text-sm font-black tracking-widest text-primary text-center border border-dashed border-primary/30">
								{promo.code}
							</div>
							<button
								onclick={() => copyCode(promo.code)}
								class="btn btn-primary btn-sm rounded-lg font-bold px-4 group-hover:btn-primary"
							>
								<Icon icon="solar:copy-line-duotone" class="text-lg"/>
								Sao Chép
							</button>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}

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
</div>
