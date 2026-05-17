<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { trpc } from '$lib/trpc/client';
	import Icon from '@iconify/svelte';
	import { addToast } from '$lib/stores/toast';

	let bookings = $state<any[]>([]);
	let rooms = $state<any[]>([]);
	let isReady = $state(false);

	let user = $derived($page.data.user);

	let reviewTarget = $state<{ bookingId: number; roomId: number; roomName: string } | null>(null);
	let reviewRating = $state(5);
	let reviewComment = $state('');
	let isSubmittingReview = $state(false);

	$effect(() => {
		if (!user) {
			goto('/login', { invalidateAll: true });
			return;
		}
		fetchData();
	});

	async function fetchData() {
		try {
			const [bk, rm] = await Promise.all([
				trpc().booking.myBookings.query(),
				trpc().room.list.query()
			]);
			bookings = bk.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
			rooms = rm;
		} catch (error) {
			console.error(error);
		} finally {
			isReady = true;
		}
	}

	function getRoomName(roomId: number) {
		return rooms.find(r => r.id === roomId)?.name || 'N/A';
	}

	function getRoomType(roomId: number) {
		return rooms.find(r => r.id === roomId)?.type || '';
	}

	async function cancelBooking(id: number) {
		try {
			await trpc().booking.cancelMyBooking.mutate(id);
			addToast('Đã hủy đặt phòng thành công.', 'success');
			await fetchData();
		} catch (error: any) {
			addToast(error?.message || 'Hủy đặt phòng thất bại.', 'error');
		}
	}

	function openReviewModal(bk: any) {
		reviewTarget = { bookingId: bk.id, roomId: bk.roomId, roomName: getRoomName(bk.roomId) };
		reviewRating = 5;
		reviewComment = '';
		(document.getElementById('review_modal') as HTMLDialogElement)?.showModal();
	}

	async function submitReview() {
		if (!reviewTarget) return;
		isSubmittingReview = true;
		try {
			await trpc().review.create.mutate({
				bookingId: reviewTarget.bookingId,
				roomId: reviewTarget.roomId,
				rating: reviewRating,
				comment: reviewComment || undefined
			});
			addToast('Cảm ơn bạn đã đánh giá!', 'success');
			(document.getElementById('review_modal') as HTMLDialogElement)?.close();
			reviewTarget = null;
		} catch (e: any) {
			addToast(e?.message || 'Gửi đánh giá thất bại.', 'error');
		} finally {
			isSubmittingReview = false;
		}
	}

	function formatDate(dateString: string | Date | null) {
		if (!dateString) return 'N/A';
		const dateObj = typeof dateString === 'string' ? new Date(dateString) : dateString;
		return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short' }).format(dateObj);
	}

	function formatVND(value: number) {
		return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
	}

	const typeLabel: Record<string, string> = { standard: 'Cơ Bản', vip: 'VIP', super_vip: 'Super VIP' };
	let pendingCount = $derived(bookings.filter(b => b.status === 'pending').length);
	let confirmedCount = $derived(bookings.filter(b => b.status === 'confirmed').length);
</script>

<svelte:head><title>Lịch Sử Đặt Phòng | KaraSystem</title></svelte:head>

<div class="flex flex-col gap-8">
	<div class="bg-base-100 rounded-md border border-base-300 p-6">
		<h1 class="text-2xl font-black uppercase tracking-widest">Lịch Sử Đặt Phòng</h1>
		<p class="text-sm text-base-content/60 font-medium mt-1">Theo dõi trạng thái các đơn đặt chỗ của bạn.</p>
	</div>

	<div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
		<div class="bg-base-100 p-4 rounded-md border border-base-300 flex items-center gap-4">
			<div class="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
				<Icon icon="solar:ticket-line-duotone" class="text-2xl" />
			</div>
			<div>
				<p class="text-xs font-bold text-base-content/60 uppercase tracking-widest">Tổng Đơn</p>
				<h3 class="text-2xl font-black">{bookings.length}</h3>
			</div>
		</div>
		<div class="bg-base-100 p-4 rounded-md border border-base-300 flex items-center gap-4">
			<div class="h-12 w-12 rounded-full bg-warning/10 text-warning flex items-center justify-center">
				<Icon icon="solar:history-line-duotone" class="text-2xl" />
			</div>
			<div>
				<p class="text-xs font-bold text-warning uppercase tracking-widest">Đang Chờ</p>
				<h3 class="text-2xl font-black text-warning">{pendingCount}</h3>
			</div>
		</div>
		<div class="bg-base-100 p-4 rounded-md border border-base-300 flex items-center gap-4">
			<div class="h-12 w-12 rounded-full bg-success/10 text-success flex items-center justify-center">
				<Icon icon="solar:check-circle-line-duotone" class="text-2xl" />
			</div>
			<div>
				<p class="text-xs font-bold text-success uppercase tracking-widest">Đã Xác Nhận</p>
				<h3 class="text-2xl font-black text-success">{confirmedCount}</h3>
			</div>
		</div>
	</div>

	{#if !isReady}
		<div class="flex items-center justify-center min-h-[30vh]">
			<span class="loading loading-spinner loading-lg text-primary"></span>
		</div>
	{:else if bookings.length === 0}
		<div class="bg-base-100 rounded-md border border-base-300 p-10 text-center">
			<Icon icon="solar:calendar-mark-line-duotone" class="text-5xl text-base-content/20 mx-auto mb-4" />
			<h3 class="font-bold text-lg">Chưa có đơn đặt phòng nào</h3>
			<p class="text-sm text-base-content/60 mt-1 mb-4">Hãy khám phá các phòng hát và đặt chỗ ngay!</p>
			<a href="/rooms" class="btn btn-primary rounded-md font-bold tracking-widest uppercase">
				<Icon icon="solar:soundwave-circle-line-duotone" class="text-xl"/> Xem Phòng Hát
			</a>
		</div>
	{:else}
		<div class="flex flex-col gap-4">
			{#each bookings as bk}
				<div class="card bg-base-100 rounded-md border border-base-300 hover:border-primary/30 transition-colors">
					<div class="card-body p-5 flex flex-col sm:flex-row gap-4">
						<div class="flex items-center gap-4 flex-1 min-w-0">
							<div class="w-14 h-14 bg-primary/10 rounded-md flex items-center justify-center shrink-0">
								<Icon icon="solar:home-smile-angle-bold-duotone" class="text-2xl text-primary" />
							</div>
							<div class="flex-1 min-w-0">
								<div class="flex items-center gap-2 mb-1">
									<h3 class="font-bold text-lg truncate">{getRoomName(bk.roomId)}</h3>
									<div class="badge badge-sm badge-ghost rounded-md font-bold uppercase">{typeLabel[getRoomType(bk.roomId)] || getRoomType(bk.roomId)}</div>
								</div>
								<div class="flex flex-wrap gap-x-4 gap-y-1 text-sm text-base-content/60 font-medium">
									<span class="flex items-center gap-1">
										<Icon icon="solar:calendar-date-line-duotone" class="text-base"/>
										{formatDate(bk.startTime)}
									</span>
									<span class="flex items-center gap-1">
										<Icon icon="solar:arrow-right-line-duotone" class="text-base"/>
										{formatDate(bk.endTime)}
									</span>
								</div>
							</div>
						</div>
						<div class="flex items-center gap-3 shrink-0">
							<div class="text-right">
								<p class="text-xl font-black text-primary">{formatVND(bk.totalCost ?? 0)}</p>
								<div class="mt-1">
									{#if bk.status === 'pending'}
										<div class="badge badge-warning badge-sm rounded-md font-bold">CHỜ DUYỆT</div>
									{:else if bk.status === 'confirmed'}
										<div class="badge badge-success badge-sm rounded-md font-bold">THÀNH CÔNG</div>
									{:else}
										<div class="badge badge-error badge-sm rounded-md font-bold text-white">ĐÃ HỦY</div>
									{/if}
								</div>
							</div>
							<div class="flex flex-col gap-1">
								{#if bk.status === 'pending'}
									<button onclick={() => cancelBooking(bk.id)} class="btn btn-xs btn-outline btn-error rounded-md font-bold">Hủy</button>
								{/if}
								{#if bk.status === 'confirmed'}
									<a href="/booking/receipt/{bk.id}" class="btn btn-xs btn-outline btn-primary rounded-md font-bold">
										<Icon icon="solar:document-text-line-duotone" class="text-sm"/> Hóa Đơn
									</a>
									<button onclick={() => openReviewModal(bk)} class="btn btn-xs btn-ghost text-amber-500 rounded-md font-bold">
										<Icon icon="solar:star-line-duotone" class="text-sm"/> Đánh Giá
									</button>
								{/if}
							</div>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<dialog id="review_modal" class="modal">
	<div class="modal-box rounded-xl max-w-sm">
		<h3 class="font-bold text-lg mb-4 flex items-center gap-2">
			<Icon icon="solar:star-bold-duotone" class="text-xl text-amber-500"/>
			Đánh Giá Phòng
		</h3>
		{#if reviewTarget}
			<p class="text-sm text-base-content/50 mb-4">Đánh giá trải nghiệm tại <span class="font-bold text-base-content">{reviewTarget.roomName}</span></p>
			<div class="flex flex-col gap-4">
				<div class="form-control">
					<div class="label"><span class="label-text font-bold text-xs uppercase tracking-widest text-base-content/50">Số Sao</span></div>
					<div class="flex gap-1">
						{#each [1, 2, 3, 4, 5] as star}
							<button
								onclick={() => reviewRating = star}
								class="btn btn-sm btn-ghost px-1 text-2xl {star <= reviewRating ? 'text-amber-400' : 'text-base-content/20'}"
							>★</button>
						{/each}
					</div>
				</div>
				<div class="form-control">
					<div class="label"><span class="label-text font-bold text-xs uppercase tracking-widest text-base-content/50">Nhận Xét (Tùy Chọn)</span></div>
					<textarea bind:value={reviewComment} placeholder="Chia sẻ trải nghiệm của bạn..." class="textarea textarea-bordered rounded-lg text-sm" rows="3"></textarea>
				</div>
			</div>
			<div class="modal-action border-t border-base-200 pt-4">
				<form method="dialog"><button class="btn btn-ghost rounded-lg font-medium" disabled={isSubmittingReview}>Bỏ Qua</button></form>
				<button onclick={submitReview} class="btn btn-primary rounded-lg font-bold px-8" disabled={isSubmittingReview}>
					{#if isSubmittingReview}<span class="loading loading-spinner loading-sm"></span>{:else}Gửi Đánh Giá{/if}
				</button>
			</div>
		{/if}
	</div>
	<form method="dialog" class="modal-backdrop"><button>close</button></form>
</dialog>
