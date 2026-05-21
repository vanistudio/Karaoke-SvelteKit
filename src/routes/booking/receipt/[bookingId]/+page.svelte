<script lang="ts">
	import { trpc } from '$lib/trpc/client';
	import { page } from '$app/stores';
	import Icon from '@iconify/svelte';

	let booking = $state<any>(null);
	let isReady = $state(false);
	let error = $state('');

	const bookingId = Number($page.params.bookingId);

	$effect(() => {
		loadData();
	});

	async function loadData() {
		try {
			booking = await trpc().booking.getById.query(bookingId);
		} catch (e: any) {
			error = e?.message || 'Không tìm thấy hóa đơn.';
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

	function handlePrint() {
		window.print();
	}
</script>

<svelte:head>
	<title>Hóa Đơn #{bookingId} | KaraSystem</title>
	<style>
		@media print {
			nav, header, footer, .no-print { display: none !important; }
			body { background: white !important; }
			.print-container { box-shadow: none !important; border: none !important; }
		}
	</style>
</svelte:head>

{#if !isReady}
	<div class="flex items-center justify-center min-h-[50vh]">
		<span class="loading loading-spinner loading-lg text-primary"></span>
	</div>
{:else if error}
	<div class="max-w-lg mx-auto text-center py-12">
		<Icon icon="solar:danger-circle-line-duotone" class="text-5xl text-error mx-auto mb-4" />
		<p class="text-base-content/50 font-medium">{error}</p>
	</div>
{:else if booking}
	<div class="max-w-2xl mx-auto">
		<div class="no-print flex items-center justify-between mb-6">
			<a href="/my-bookings" class="btn btn-ghost btn-sm rounded-lg font-medium">
				<Icon icon="solar:arrow-left-line-duotone" class="text-lg"/> Quay Lại
			</a>
			<button onclick={handlePrint} class="btn btn-primary btn-sm rounded-lg font-bold">
				<Icon icon="solar:printer-line-duotone" class="text-lg"/> In Hóa Đơn
			</button>
		</div>

		<div class="print-container bg-base-100 rounded-xl border border-base-300/50 overflow-hidden p-8">
			<div class="flex items-start justify-between mb-8 pb-6 border-b border-base-200">
				<div>
					<div class="flex items-center gap-2 mb-1">
						<Icon icon="solar:microphone-3-line-duotone" class="text-primary text-2xl" />
						<span class="text-xl font-black uppercase tracking-[0.1em]">KARA<span class="text-primary">SYSTEM</span></span>
					</div>
					<p class="text-xs text-base-content/40 font-medium">Hệ Thống Phòng Hát Cao Cấp</p>
				</div>
				<div class="text-right">
					<p class="text-xs font-bold text-base-content/40 uppercase tracking-widest">Hóa Đơn</p>
					<p class="text-2xl font-black text-primary">#{booking.id}</p>
					<p class="text-xs text-base-content/40 font-medium mt-1">{fmtTime(booking.createdAt)}</p>
				</div>
			</div>
			<div class="mb-6">
				{#if booking.status === 'confirmed'}
					<span class="badge badge-success rounded-md font-bold px-4 py-3">✓ ĐÃ XÁC NHẬN</span>
				{:else if booking.status === 'pending'}
					<span class="badge badge-warning rounded-md font-bold px-4 py-3">⏳ CHỜ DUYỆT</span>
				{:else if booking.status === 'checked_in'}
					<span class="badge badge-info text-white rounded-md font-bold px-4 py-3">✓ ĐÃ CHECK-IN</span>
				{:else if booking.status === 'cancelled'}
					<span class="badge badge-error text-white rounded-md font-bold px-4 py-3">✕ ĐÃ HỦY</span>
				{:else}
					<span class="badge badge-ghost rounded-md font-bold px-4 py-3">{booking.status}</span>
				{/if}
			</div>
			<div class="mb-6">
				<h3 class="text-xs font-bold text-base-content/40 uppercase tracking-widest mb-3">Chi Tiết Đặt Phòng</h3>
				<div class="bg-base-200/30 rounded-lg p-4">
					<table class="w-full text-sm">
						<tbody>
							<tr class="border-b border-base-200/50">
								<td class="py-2.5 text-base-content/50 font-medium">Phòng</td>
								<td class="py-2.5 font-bold text-right">{booking.roomName || `Phòng #${booking.roomId}`}</td>
							</tr>
							<tr class="border-b border-base-200/50">
								<td class="py-2.5 text-base-content/50 font-medium">Bắt đầu</td>
								<td class="py-2.5 font-medium text-right">{fmtTime(booking.startTime)}</td>
							</tr>
							<tr class="border-b border-base-200/50">
								<td class="py-2.5 text-base-content/50 font-medium">Kết thúc</td>
								<td class="py-2.5 font-medium text-right">{fmtTime(booking.endTime)}</td>
							</tr>
							{#if booking.guestCount}
								<tr class="border-b border-base-200/50">
									<td class="py-2.5 text-base-content/50 font-medium">Số khách</td>
									<td class="py-2.5 font-medium text-right">{booking.guestCount} người</td>
								</tr>
							{/if}
							{#if booking.voucherCode}
								<tr class="border-b border-base-200/50">
									<td class="py-2.5 text-base-content/50 font-medium">Voucher</td>
									<td class="py-2.5 font-mono font-bold text-primary text-right">{booking.voucherCode}</td>
								</tr>
							{/if}
							{#if booking.discountAmount > 0}
								<tr class="border-b border-base-200/50">
									<td class="py-2.5 text-base-content/50 font-medium">Giảm giá</td>
									<td class="py-2.5 font-bold text-emerald-600 text-right">-{fmtVND(booking.discountAmount)}</td>
								</tr>
							{/if}
							{#if booking.usedPoints > 0}
								<tr class="border-b border-base-200/50">
									<td class="py-2.5 text-base-content/50 font-medium">Điểm đã dùng</td>
									<td class="py-2.5 font-bold text-blue-600 text-right">-{booking.usedPoints.toLocaleString('vi-VN')} điểm</td>
								</tr>
							{/if}
						</tbody>
					</table>
				</div>
			</div>
			<div class="flex items-center justify-between p-4 bg-primary/5 border border-primary/15 rounded-lg mb-6">
				<span class="text-sm font-bold text-base-content/60 uppercase tracking-widest">Tổng Thanh Toán</span>
				<span class="text-2xl font-black text-primary">{fmtVND(booking.totalCost ?? 0)}</span>
			</div>
			<div class="text-center pt-6 border-t border-base-200">
				<p class="text-xs text-base-content/30 font-medium">Cảm ơn quý khách đã sử dụng dịch vụ KaraSystem</p>
				<p class="text-[10px] text-base-content/20 font-medium mt-1">Hóa đơn được tạo tự động bởi hệ thống — Không cần chữ ký</p>
			</div>
		</div>
	</div>
{/if}
