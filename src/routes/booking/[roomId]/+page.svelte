<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { trpc } from '$lib/trpc/client';
	import Icon from '@iconify/svelte';
	import DatePicker from '$lib/components/ui/DatePicker.svelte';
	import TimePicker from '$lib/components/ui/TimePicker.svelte';
	import { addToast } from '$lib/stores/toast';

	let room = $state<any>(null);
	let services = $state<any[]>([]);
	let isLoading = $state(true);

	let selectedDate = $state(new Date());
	let selectedStartTime = $state('19:00');
	let selectedEndTime = $state('22:00');
	let guestCount = $state(2);
	let selectedServices = $state<Record<number, number>>({});
	let isSubmitting = $state(false);
	let availabilityChecked = $state(false);
	let isAvailable = $state(false);

	let voucherCode = $state('');
	let voucherResult = $state<{
		discount: number;
		code: string;
		type: string;
		value: number;
	} | null>(null);
	let voucherError = $state('');
	let isApplyingVoucher = $state(false);

	let loyaltyInfo = $state<any>(null);
	let isUsingPoints = $state(false);

	let user = $derived($page.data.user);
	let roomId = $derived(Number($page.params.roomId));

	$effect(() => {
		fetchData();
	});

	let serverRoomCost = $state(0);

	$effect(() => {
		selectedDate;
		selectedStartTime;
		selectedEndTime;
		availabilityChecked = false;
		isAvailable = false;
		serverRoomCost = 0;
	});

	async function fetchData() {
		try {
			const promises: Promise<any>[] = [
				trpc().room.getById.query(roomId),
				trpc().service.list.query()
			];
			if (user) {
				promises.push(
					trpc()
						.loyalty.getInfo.query()
						.catch(() => null)
				);
			}

			const [roomData, serviceData, loyaltyData] = await Promise.all(promises);
			room = roomData;
			services = serviceData.filter((s: any) => s.isAvailable);
			if (loyaltyData) {
				loyaltyInfo = loyaltyData;
			}
		} catch (error) {
			addToast('Không tìm thấy phòng yêu cầu.', 'error');
			await goto('/', { invalidateAll: true });
		} finally {
			isLoading = false;
		}
	}

	function buildTimeRange() {
		const year = selectedDate.getFullYear();
		const month = selectedDate.getMonth();
		const day = selectedDate.getDate();
		const [sh, sm] = selectedStartTime.split(':').map(Number);
		const [eh, em] = selectedEndTime.split(':').map(Number);
		const startTime = new Date(year, month, day, sh, sm);
		const endTime = new Date(year, month, day, eh, em);
		if (endTime < startTime) {
			endTime.setDate(endTime.getDate() + 1);
		}
		return { startTime, endTime };
	}

	let durationHours = $derived(() => {
		const { startTime, endTime } = buildTimeRange();
		const diff = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
		return Math.max(0, diff);
	});

	let roomCost = $derived(() => {
		if (serverRoomCost > 0) return serverRoomCost;
		if (!room) return 0;
		return durationHours() * room.pricePerHour;
	});

	let serviceCost = $derived(() => {
		let total = 0;
		for (const [id, qty] of Object.entries(selectedServices)) {
			const svc = services.find((s: any) => s.id === Number(id));
			if (svc && qty > 0) total += svc.price * qty;
		}
		return total;
	});

	let totalCost = $derived(() => roomCost() + serviceCost());
	let discountAmount = $derived(() => voucherResult?.discount ?? 0);
	let availablePointsToUse = $derived(() => {
		if (!loyaltyInfo) return 0;
		return Math.min(loyaltyInfo.points, Math.max(0, totalCost() - discountAmount()));
	});
	let usedPoints = $derived(() => (isUsingPoints ? availablePointsToUse() : 0));

	let finalCost = $derived(() => Math.max(0, totalCost() - discountAmount() - usedPoints()));

	function toggleService(id: number) {
		if (selectedServices[id]) {
			const copy = { ...selectedServices };
			delete copy[id];
			selectedServices = copy;
		} else {
			selectedServices = { ...selectedServices, [id]: 1 };
		}
	}

	function updateServiceQty(id: number, qty: number) {
		if (qty <= 0) {
			const copy = { ...selectedServices };
			delete copy[id];
			selectedServices = copy;
		} else {
			selectedServices = { ...selectedServices, [id]: qty };
		}
	}

	async function checkAvailability() {
		const { startTime, endTime } = buildTimeRange();
		if (selectedEndTime === selectedStartTime) {
			addToast('Giờ kết thúc không được trùng giờ bắt đầu.', 'error');
			return;
		}
		try {
			const result = await trpc().booking.checkAvailability.query({
				roomId,
				startTime: startTime.toISOString(),
				endTime: endTime.toISOString()
			});
			isAvailable = result.isAvailable;
			serverRoomCost = result.roomCost;
			availabilityChecked = true;
			if (isAvailable) {
				addToast('Phòng trống! Bạn có thể xác nhận đặt chỗ.', 'success');
			} else {
				addToast('Phòng đã bận trong khung giờ này. Vui lòng chọn giờ khác.', 'error');
			}
		} catch (error) {
			addToast('Kiểm tra thất bại. Vui lòng thử lại.', 'error');
		}
	}

	async function handleBooking() {
		if (!user) {
			addToast('Vui lòng đăng nhập để đặt phòng.', 'error');
			await goto('/login', { invalidateAll: true });
			return;
		}
		const { startTime, endTime } = buildTimeRange();
		if (selectedEndTime === selectedStartTime) {
			addToast('Giờ kết thúc không được trùng giờ bắt đầu.', 'error');
			return;
		}
		isSubmitting = true;
		try {
			const servicesToSubmit = Object.entries(selectedServices)
				.map(([id, qty]) => ({ id: Number(id), qty }))
				.filter((s) => s.qty > 0);
			const codeToSubmit = voucherResult ? voucherResult.code : undefined;

			await trpc().booking.create.mutate({
				roomId,
				startTime: startTime.toISOString(),
				endTime: endTime.toISOString(),
				guestCount,
				pointsToUse: usedPoints(),
				services: servicesToSubmit,
				voucherCode: codeToSubmit
			});
			addToast('Đặt phòng thành công! Vui lòng chờ xác nhận từ quản lý.', 'success');
			await goto('/my-bookings', { invalidateAll: true });
		} catch (error: any) {
			addToast(error?.message || 'Đặt phòng thất bại. Vui lòng kiểm tra lại.', 'error');
		} finally {
			isSubmitting = false;
		}
	}

	async function applyVoucher() {
		if (!voucherCode.trim()) return;
		isApplyingVoucher = true;
		voucherError = '';
		voucherResult = null;
		try {
			const result = await trpc().promotion.validate.query({
				code: voucherCode.trim().toUpperCase(),
				orderAmount: totalCost()
			});
			let discount = 0;
			if (result.type === 'percent') {
				discount = Math.round((totalCost() * result.value) / 100);
			} else {
				discount = result.value;
			}
			discount = Math.min(discount, totalCost());
			voucherResult = { discount, code: result.code, type: result.type, value: result.value };
			addToast(`Áp dụng mã ${result.code} thành công! Giảm ${formatVND(discount)}`, 'success');
		} catch (e: any) {
			voucherError = e?.message || 'Mã voucher không hợp lệ.';
			addToast(voucherError, 'error');
		} finally {
			isApplyingVoucher = false;
		}
	}

	function clearVoucher() {
		voucherCode = '';
		voucherResult = null;
		voucherError = '';
	}

	const typeLabel: Record<string, string> = {
		standard: 'Cơ Bản',
		vip: 'VIP',
		super_vip: 'Super VIP'
	};
	const typeBadge: Record<string, string> = {
		standard: 'badge-ghost',
		vip: 'badge-secondary',
		super_vip: 'badge-accent'
	};
	const categoryLabel: Record<string, string> = {
		food: 'Đồ Ăn',
		drink: 'Thức Uống',
		decoration: 'Trang Trí',
		other: 'Khác'
	};
	const categoryIcon: Record<string, string> = {
		food: 'solar:chef-hat-heart-line-duotone',
		drink: 'solar:wineglass-triangle-line-duotone',
		decoration: 'solar:star-shine-line-duotone',
		other: 'solar:box-line-duotone'
	};

	function formatVND(value: number) {
		return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
	}
</script>

<svelte:head>
	<title>{room ? `Đặt Phòng ${room.name}` : 'Đặt Phòng'} | KaraSystem</title>
</svelte:head>

{#if isLoading}
	<div class="flex min-h-[50vh] items-center justify-center">
		<span class="loading loading-lg loading-spinner text-primary"></span>
	</div>
{:else if room}
	<div class="flex flex-col gap-8">
		<div class="flex items-center gap-3">
			<button onclick={() => history.back()} class="btn rounded-md btn-ghost btn-sm">
				<Icon icon="solar:arrow-left-line-duotone" class="text-xl" />
			</button>
			<div>
				<h1 class="text-2xl font-black tracking-widest uppercase">{room.name}</h1>
				<p class="mt-0.5 text-sm font-medium text-base-content/60">
					Xác nhận thông tin để hoàn tất đặt chỗ
				</p>
			</div>
		</div>

		<div class="grid grid-cols-1 gap-8 xl:grid-cols-3">
			<div class="flex flex-col gap-6 xl:col-span-2">
				<div class="card rounded-md border border-base-300 bg-base-100">
					<div class="card-body p-6">
						<div class="flex items-start justify-between">
							<div class="flex items-center gap-4">
								<div class="flex h-16 w-16 items-center justify-center rounded-md bg-primary/10">
									<Icon icon="solar:home-smile-angle-bold-duotone" class="text-3xl text-primary" />
								</div>
								<div>
									<h2 class="text-xl font-bold">{room.name}</h2>
									<div class="mt-1 flex items-center gap-2">
										<div
											class={`badge rounded-md badge-sm font-bold uppercase ${typeBadge[room.type] || 'badge-ghost'}`}
										>
											{typeLabel[room.type] || room.type}
										</div>
										<span class="text-sm font-medium text-base-content/50"
											>Tối đa {room.capacity} khách</span
										>
									</div>
								</div>
							</div>
							<div class="text-right">
								<p class="text-2xl font-black text-primary">{formatVND(room.pricePerHour)}</p>
								<p class="text-xs font-medium tracking-widest text-base-content/50 uppercase">
									/Giờ
								</p>
							</div>
						</div>
					</div>
				</div>

				<div class="card rounded-md border border-base-300 bg-base-100">
					<div class="card-body p-6">
						<h3
							class="mb-4 flex items-center gap-2 text-sm font-bold tracking-widest text-base-content/80 uppercase"
						>
							<Icon icon="solar:calendar-date-line-duotone" class="text-xl" />
							Chọn Thời Gian
						</h3>
						<div class="flex flex-col gap-5">
							<div class="form-control w-full">
								<div class="label">
									<span class="label-text text-xs font-bold tracking-widest uppercase"
										>Ngày Phục Vụ</span
									>
								</div>
								<DatePicker bind:value={selectedDate} />
							</div>
							<div class="grid grid-cols-2 gap-4">
								<div class="form-control w-full">
									<div class="label">
										<span class="label-text text-xs font-bold tracking-widest uppercase"
											>Giờ Bắt Đầu</span
										>
									</div>
									<TimePicker bind:value={selectedStartTime} />
								</div>
								<div class="form-control w-full">
									<div class="label">
										<span class="label-text text-xs font-bold tracking-widest uppercase"
											>Giờ Kết Thúc</span
										>
									</div>
									<TimePicker bind:value={selectedEndTime} />
								</div>
							</div>
							<div class="form-control w-full">
								<div class="label">
									<span class="label-text text-xs font-bold tracking-widest uppercase"
										>Số Khách</span
									>
								</div>
								<input
									type="number"
									bind:value={guestCount}
									min="1"
									max={room.capacity}
									class="input-bordered input w-full rounded-md"
								/>
							</div>
							<button
								onclick={checkAvailability}
								class="btn w-full rounded-md font-bold tracking-widest uppercase btn-outline btn-primary"
							>
								<Icon icon="solar:verified-check-line-duotone" class="text-xl" />
								Kiểm Tra Phòng Trống
							</button>
							{#if availabilityChecked}
								{#if isAvailable}
									<div class="alert rounded-md border-success/20 bg-success/10 text-sm font-medium">
										<Icon icon="solar:check-circle-bold-duotone" class="text-xl text-success" />
										Phòng trống trong khung giờ đã chọn.
									</div>
								{:else}
									<div class="alert rounded-md border-error/20 bg-error/10 text-sm font-medium">
										<Icon icon="solar:close-circle-bold-duotone" class="text-xl text-error" />
										Phòng đã bận. Vui lòng chọn khung giờ khác.
									</div>
								{/if}
							{/if}
						</div>
					</div>
				</div>

				{#if services.length > 0}
					<div class="card rounded-md border border-base-300 bg-base-100">
						<div class="card-body p-6">
							<h3
								class="mb-4 flex items-center gap-2 text-sm font-bold tracking-widest text-base-content/80 uppercase"
							>
								<Icon icon="solar:cup-hot-line-duotone" class="text-xl" />
								Dịch Vụ Đi Kèm (Tùy Chọn)
							</h3>
							<div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
								{#each services as svc}
									<label
										class="flex cursor-pointer items-center gap-3 rounded-md border p-3 transition-colors {selectedServices[
											svc.id
										]
											? 'border-primary bg-primary/5'
											: 'border-base-300 bg-base-200/30 hover:border-base-content/20'}"
									>
										<input
											type="checkbox"
											checked={!!selectedServices[svc.id]}
											onchange={() => toggleService(svc.id)}
											class="checkbox shrink-0 rounded checkbox-sm checkbox-primary"
										/>
										{#if svc.imageUrl}
											<div
												class="h-10 w-10 shrink-0 overflow-hidden rounded-md border border-base-300/50"
											>
												<img src={svc.imageUrl} alt={svc.name} class="h-full w-full object-cover" />
											</div>
										{:else}
											<div
												class="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-base-300/50 bg-base-300/30"
											>
												<Icon
													icon={categoryIcon[svc.category] || 'solar:box-line-duotone'}
													class="text-xl text-base-content/30"
												/>
											</div>
										{/if}
										<div class="min-w-0 flex-1">
											<p class="truncate text-sm font-bold">{svc.name}</p>
											<p class="text-xs text-base-content/50">
												{categoryLabel[svc.category] || svc.category} ·
												<span class="font-bold text-primary">{formatVND(svc.price)}</span>
											</p>
										</div>
										{#if selectedServices[svc.id]}
											<div class="join" role="presentation" onclick={(e) => e.preventDefault()}>
												<button
													onclick={() =>
														updateServiceQty(svc.id, (selectedServices[svc.id] || 1) - 1)}
													class="btn join-item w-8 btn-ghost btn-xs">−</button
												>
												<span
													class="btn pointer-events-none join-item w-6 px-0 font-mono font-bold btn-ghost btn-xs"
													>{selectedServices[svc.id]}</span
												>
												<button
													onclick={() =>
														updateServiceQty(svc.id, (selectedServices[svc.id] || 1) + 1)}
													class="btn join-item w-8 btn-ghost btn-xs">+</button
												>
											</div>
										{/if}
									</label>
								{/each}
							</div>
						</div>
					</div>
				{/if}
			</div>

			<div class="flex flex-col gap-6">
				<div class="card sticky top-28 rounded-md border border-base-300 bg-base-100">
					<div class="card-body p-6">
						<h3
							class="mb-4 flex items-center gap-2 text-sm font-bold tracking-widest text-base-content/80 uppercase"
						>
							<Icon icon="solar:bill-list-line-duotone" class="text-xl" />
							Tóm Tắt Đơn Hàng
						</h3>
						<div class="flex flex-col gap-3">
							<div class="flex justify-between text-sm font-medium">
								<span class="text-base-content/60">Phòng {room.name}</span>
								<span>{durationHours()} giờ</span>
							</div>
							<div class="flex justify-between text-sm font-medium">
								<span class="text-base-content/60">Đơn giá</span>
								<span>{formatVND(room.pricePerHour)}/h</span>
							</div>
							<div class="flex justify-between text-sm font-medium">
								<span class="text-base-content/60">Tiền phòng</span>
								<span class="font-bold">{formatVND(roomCost())}</span>
							</div>

							{#if Object.keys(selectedServices).length > 0}
								<div
									class="divider my-0 text-[10px] font-bold tracking-widest text-base-content/40"
								>
									DỊCH VỤ
								</div>
								{#each Object.entries(selectedServices) as [id, qty]}
									{@const svc = services.find((s: any) => s.id === Number(id))}
									{#if svc}
										<div class="flex justify-between text-sm font-medium">
											<span class="max-w-[140px] truncate text-base-content/60"
												>{svc.name} × {qty}</span
											>
											<span>{formatVND(svc.price * qty)}</span>
										</div>
									{/if}
								{/each}
								<div class="flex justify-between text-sm font-medium">
									<span class="text-base-content/60">Tổng dịch vụ</span>
									<span class="font-bold">{formatVND(serviceCost())}</span>
								</div>
							{/if}
							{#if loyaltyInfo && loyaltyInfo.points > 0}
								<div
									class="divider my-0 text-[10px] font-bold tracking-widest text-base-content/40"
								>
									DÙNG ĐIỂM KARA
								</div>
								<label
									class="flex cursor-pointer items-start gap-3 rounded-lg border border-base-300 p-3 transition-colors hover:border-primary/50"
								>
									<input
										type="checkbox"
										bind:checked={isUsingPoints}
										class="checkbox mt-0.5 rounded checkbox-sm checkbox-primary"
									/>
									<div class="flex-1">
										<p class="flex items-center gap-1.5 text-sm font-bold text-primary">
											<Icon icon="solar:wallet-money-bold-duotone" class="text-base" />
											Sử dụng điểm tích lũy
										</p>
										{#if isUsingPoints}
											<p class="mt-1 text-xs font-medium text-base-content/60">
												Trừ <strong class="text-base-content"
													>{usedPoints().toLocaleString('vi-VN')}</strong
												>
												điểm / {loyaltyInfo.points.toLocaleString('vi-VN')} điểm có sẵn
											</p>
										{:else}
											<p class="mt-1 text-xs font-medium text-base-content/60">
												Bạn đang có <strong class="text-base-content"
													>{loyaltyInfo.points.toLocaleString('vi-VN')}</strong
												> điểm.
											</p>
										{/if}
									</div>
								</label>
							{/if}

							<div class="divider my-0 text-[10px] font-bold tracking-widest text-base-content/40">
								VOUCHER
							</div>
							{#if voucherResult}
								<div
									class="flex items-center justify-between rounded-lg border border-emerald-500/15 bg-emerald-500/5 p-2.5"
								>
									<div class="flex items-center gap-2">
										<Icon icon="solar:tag-price-bold-duotone" class="text-emerald-500" />
										<span class="font-mono text-xs font-bold text-emerald-600"
											>{voucherResult.code}</span
										>
										<span class="text-xs font-medium text-emerald-500"
											>−{formatVND(voucherResult.discount)}</span
										>
									</div>
									<button
										onclick={clearVoucher}
										class="btn btn-circle text-base-content/30 btn-ghost btn-xs hover:text-red-500"
									>
										<Icon icon="solar:close-circle-bold" class="text-sm" />
									</button>
								</div>
							{:else}
								<div class="flex gap-2">
									<input
										type="text"
										bind:value={voucherCode}
										placeholder="Nhập mã voucher..."
										class="input-bordered input input-sm flex-1 rounded-lg font-mono text-xs uppercase"
									/>
									<button
										onclick={applyVoucher}
										class="btn rounded-lg px-3 text-xs font-bold btn-sm btn-primary"
										disabled={isApplyingVoucher || !voucherCode.trim()}
									>
										{#if isApplyingVoucher}<span class="loading loading-xs loading-spinner"
											></span>{:else}Áp Dụng{/if}
									</button>
								</div>
							{/if}

							<div class="divider my-1"></div>
							{#if voucherResult}
								<div class="flex justify-between text-sm font-medium">
									<span class="text-base-content/60">Tạm tính</span>
									<span>{formatVND(totalCost())}</span>
								</div>
								<div class="flex justify-between text-sm font-medium text-emerald-600">
									<span>Voucher giảm giá</span>
									<span>−{formatVND(discountAmount())}</span>
								</div>
							{/if}
							{#if isUsingPoints && usedPoints() > 0}
								{#if !voucherResult}
									<div class="flex justify-between text-sm font-medium">
										<span class="text-base-content/60">Tạm tính</span>
										<span>{formatVND(totalCost())}</span>
									</div>
								{/if}
								<div class="flex justify-between text-sm font-medium text-emerald-600">
									<span>Khấu trừ điểm Kara</span>
									<span>−{formatVND(usedPoints())}</span>
								</div>
							{/if}
							<div class="flex items-center justify-between">
								<span class="text-sm font-bold tracking-widest uppercase">Tổng Cộng</span>
								<span class="text-2xl font-black text-primary">{formatVND(finalCost())}</span>
							</div>
						</div>

						<button
							onclick={handleBooking}
							class="btn mt-6 w-full rounded-md font-bold tracking-widest uppercase btn-primary"
							disabled={isSubmitting || !availabilityChecked || !isAvailable}
						>
							{#if isSubmitting}
								<span class="loading loading-sm loading-spinner"></span>
							{:else}
								<Icon icon="solar:check-circle-bold-duotone" class="text-xl" />
								Xác Nhận Đặt Phòng
							{/if}
						</button>
						{#if !user}
							<p class="mt-2 text-center text-xs font-medium text-base-content/50">
								Bạn cần <a href="/login" class="font-bold text-primary hover:underline">đăng nhập</a
								> để tiếp tục.
							</p>
						{/if}
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}
