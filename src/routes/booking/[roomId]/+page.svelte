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
	let voucherResult = $state<{ discount: number; code: string; type: string; value: number } | null>(null);
	let voucherError = $state('');
	let isApplyingVoucher = $state(false);

	let loyaltyInfo = $state<any>(null);
	let isUsingPoints = $state(false);

	let user = $derived($page.data.user);
	let roomId = $derived(Number($page.params.roomId));

	$effect(() => {
		fetchData();
	});

	$effect(() => {
		selectedDate;
		selectedStartTime;
		selectedEndTime;
		availabilityChecked = false;
		isAvailable = false;
	});

	async function fetchData() {
		try {
			const promises: Promise<any>[] = [
				trpc().room.getById.query(roomId),
				trpc().service.list.query()
			];
			if (user) {
				promises.push(trpc().loyalty.getInfo.query().catch(() => null));
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
		return { startTime, endTime };
	}

	let durationHours = $derived(() => {
		const { startTime, endTime } = buildTimeRange();
		const diff = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
		return Math.max(0, diff);
	});

	let roomCost = $derived(() => {
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
	let usedPoints = $derived(() => isUsingPoints ? availablePointsToUse() : 0);
	
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
		if (endTime <= startTime) {
			addToast('Giờ kết thúc phải sau giờ bắt đầu.', 'error');
			return;
		}
		try {
			const result = await trpc().booking.checkAvailability.query({
				roomId,
				startTime: startTime.toISOString(),
				endTime: endTime.toISOString()
			});
			isAvailable = result.isAvailable;
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
		if (endTime <= startTime) {
			addToast('Giờ kết thúc phải sau giờ bắt đầu.', 'error');
			return;
		}
		isSubmitting = true;
		try {
			const servicesToSubmit = Object.entries(selectedServices)
				.map(([id, qty]) => ({ id: Number(id), qty }))
				.filter(s => s.qty > 0);
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
				discount = Math.round(totalCost() * result.value / 100);
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

	const typeLabel: Record<string, string> = { standard: 'Cơ Bản', vip: 'VIP', super_vip: 'Super VIP' };
	const typeBadge: Record<string, string> = { standard: 'badge-ghost', vip: 'badge-secondary', super_vip: 'badge-accent' };
	const categoryLabel: Record<string, string> = { food: 'Đồ Ăn', drink: 'Thức Uống', decoration: 'Trang Trí', other: 'Khác' };
	const categoryIcon: Record<string, string> = { food: 'solar:chef-hat-heart-line-duotone', drink: 'solar:wineglass-triangle-line-duotone', decoration: 'solar:star-shine-line-duotone', other: 'solar:box-line-duotone' };

	function formatVND(value: number) {
		return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
	}
</script>

<svelte:head>
	<title>{room ? `Đặt Phòng ${room.name}` : 'Đặt Phòng'} | KaraSystem</title>
</svelte:head>

{#if isLoading}
	<div class="flex items-center justify-center min-h-[50vh]">
		<span class="loading loading-spinner loading-lg text-primary"></span>
	</div>
{:else if room}
	<div class="flex flex-col gap-8">
		<div class="flex items-center gap-3">
			<button onclick={() => history.back()} class="btn btn-ghost btn-sm rounded-md">
				<Icon icon="solar:arrow-left-line-duotone" class="text-xl"/>
			</button>
			<div>
				<h1 class="text-2xl font-black uppercase tracking-widest">{room.name}</h1>
				<p class="text-sm text-base-content/60 font-medium mt-0.5">Xác nhận thông tin để hoàn tất đặt chỗ</p>
			</div>
		</div>

		<div class="grid grid-cols-1 xl:grid-cols-3 gap-8">
			<div class="xl:col-span-2 flex flex-col gap-6">
				<div class="card bg-base-100 rounded-md border border-base-300">
					<div class="card-body p-6">
						<div class="flex items-start justify-between">
							<div class="flex items-center gap-4">
								<div class="w-16 h-16 bg-primary/10 rounded-md flex items-center justify-center">
									<Icon icon="solar:home-smile-angle-bold-duotone" class="text-3xl text-primary" />
								</div>
								<div>
									<h2 class="text-xl font-bold">{room.name}</h2>
									<div class="flex items-center gap-2 mt-1">
										<div class={`badge badge-sm rounded-md font-bold uppercase ${typeBadge[room.type] || 'badge-ghost'}`}>
											{typeLabel[room.type] || room.type}
										</div>
										<span class="text-sm text-base-content/50 font-medium">Tối đa {room.capacity} khách</span>
									</div>
								</div>
							</div>
							<div class="text-right">
								<p class="text-2xl font-black text-primary">{formatVND(room.pricePerHour)}</p>
								<p class="text-xs text-base-content/50 font-medium uppercase tracking-widest">/Giờ</p>
							</div>
						</div>
					</div>
				</div>

				<div class="card bg-base-100 rounded-md border border-base-300">
					<div class="card-body p-6">
						<h3 class="font-bold tracking-widest uppercase text-sm mb-4 flex items-center gap-2 text-base-content/80">
							<Icon icon="solar:calendar-date-line-duotone" class="text-xl" />
							Chọn Thời Gian
						</h3>
						<div class="flex flex-col gap-5">
							<div class="form-control w-full">
								<div class="label"><span class="label-text font-bold uppercase tracking-widest text-xs">Ngày Phục Vụ</span></div>
								<DatePicker bind:value={selectedDate} />
							</div>
							<div class="grid grid-cols-2 gap-4">
								<div class="form-control w-full">
									<div class="label"><span class="label-text font-bold uppercase tracking-widest text-xs">Giờ Bắt Đầu</span></div>
									<TimePicker bind:value={selectedStartTime} />
								</div>
								<div class="form-control w-full">
									<div class="label"><span class="label-text font-bold uppercase tracking-widest text-xs">Giờ Kết Thúc</span></div>
									<TimePicker bind:value={selectedEndTime} />
								</div>
							</div>
							<div class="form-control w-full">
								<div class="label"><span class="label-text font-bold uppercase tracking-widest text-xs">Số Khách</span></div>
								<input type="number" bind:value={guestCount} min="1" max={room.capacity} class="input input-bordered rounded-md w-full" />
							</div>
							<button onclick={checkAvailability} class="btn btn-outline btn-primary rounded-md font-bold tracking-widest uppercase w-full">
								<Icon icon="solar:verified-check-line-duotone" class="text-xl" />
								Kiểm Tra Phòng Trống
							</button>
							{#if availabilityChecked}
								{#if isAvailable}
									<div class="alert bg-success/10 border-success/20 rounded-md text-sm font-medium">
										<Icon icon="solar:check-circle-bold-duotone" class="text-success text-xl"/>
										Phòng trống trong khung giờ đã chọn.
									</div>
								{:else}
									<div class="alert bg-error/10 border-error/20 rounded-md text-sm font-medium">
										<Icon icon="solar:close-circle-bold-duotone" class="text-error text-xl"/>
										Phòng đã bận. Vui lòng chọn khung giờ khác.
									</div>
								{/if}
							{/if}
						</div>
					</div>
				</div>

				{#if services.length > 0}
					<div class="card bg-base-100 rounded-md border border-base-300">
						<div class="card-body p-6">
							<h3 class="font-bold tracking-widest uppercase text-sm mb-4 flex items-center gap-2 text-base-content/80">
								<Icon icon="solar:cup-hot-line-duotone" class="text-xl" />
								Dịch Vụ Đi Kèm (Tùy Chọn)
							</h3>
							<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
								{#each services as svc}
									<label class="flex items-center gap-3 p-3 rounded-md border cursor-pointer transition-colors {selectedServices[svc.id] ? 'border-primary bg-primary/5' : 'border-base-300 bg-base-200/30 hover:border-base-content/20'}">
										<input type="checkbox" checked={!!selectedServices[svc.id]} onchange={() => toggleService(svc.id)} class="checkbox checkbox-primary checkbox-sm rounded shrink-0" />
										{#if svc.imageUrl}
											<div class="w-10 h-10 rounded-md overflow-hidden shrink-0 border border-base-300/50">
												<img src={svc.imageUrl} alt={svc.name} class="w-full h-full object-cover" />
											</div>
										{:else}
											<div class="w-10 h-10 rounded-md bg-base-300/30 flex items-center justify-center shrink-0 border border-base-300/50">
												<Icon icon={categoryIcon[svc.category] || 'solar:box-line-duotone'} class="text-xl text-base-content/30" />
											</div>
										{/if}
										<div class="flex-1 min-w-0">
											<p class="font-bold text-sm truncate">{svc.name}</p>
											<p class="text-xs text-base-content/50">{categoryLabel[svc.category] || svc.category} · <span class="font-bold text-primary">{formatVND(svc.price)}</span></p>
										</div>
										{#if selectedServices[svc.id]}
											<div class="join" role="presentation" onclick={(e) => e.preventDefault()}>
												<button onclick={() => updateServiceQty(svc.id, (selectedServices[svc.id] || 1) - 1)} class="btn btn-xs join-item btn-ghost w-8">−</button>
												<span class="btn btn-xs join-item btn-ghost pointer-events-none font-mono font-bold w-6 px-0">{selectedServices[svc.id]}</span>
												<button onclick={() => updateServiceQty(svc.id, (selectedServices[svc.id] || 1) + 1)} class="btn btn-xs join-item btn-ghost w-8">+</button>
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
				<div class="card bg-base-100 rounded-md border border-base-300 sticky top-28">
					<div class="card-body p-6">
						<h3 class="font-bold tracking-widest uppercase text-sm mb-4 flex items-center gap-2 text-base-content/80">
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
								<div class="divider my-0 text-[10px] font-bold tracking-widest text-base-content/40">DỊCH VỤ</div>
								{#each Object.entries(selectedServices) as [id, qty]}
									{@const svc = services.find((s: any) => s.id === Number(id))}
									{#if svc}
										<div class="flex justify-between text-sm font-medium">
											<span class="text-base-content/60 truncate max-w-[140px]">{svc.name} × {qty}</span>
											<span>{formatVND(svc.price * qty)}</span>
										</div>
									{/if}
								{/each}
								<div class="flex justify-between text-sm font-medium">
									<span class="text-base-content/60">Tổng dịch vụ</span>
									<span class="font-bold">{formatVND(serviceCost())}</span>
								</div>
							{/if}

							<!-- Loyalty Points -->
							{#if loyaltyInfo && loyaltyInfo.points > 0}
								<div class="divider my-0 text-[10px] font-bold tracking-widest text-base-content/40">DÙNG ĐIỂM KARA</div>
								<label class="flex items-start gap-3 p-3 border border-base-300 rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
									<input type="checkbox" bind:checked={isUsingPoints} class="checkbox checkbox-primary checkbox-sm mt-0.5 rounded" />
									<div class="flex-1">
										<p class="text-sm font-bold text-primary flex items-center gap-1.5">
											<Icon icon="solar:wallet-money-bold-duotone" class="text-base"/>
											Sử dụng điểm tích lũy
										</p>
										{#if isUsingPoints}
											<p class="text-xs text-base-content/60 font-medium mt-1">Trừ <strong class="text-base-content">{usedPoints().toLocaleString('vi-VN')}</strong> điểm / {loyaltyInfo.points.toLocaleString('vi-VN')} điểm có sẵn</p>
										{:else}
											<p class="text-xs text-base-content/60 font-medium mt-1">Bạn đang có <strong class="text-base-content">{loyaltyInfo.points.toLocaleString('vi-VN')}</strong> điểm.</p>
										{/if}
									</div>
								</label>
							{/if}

							<div class="divider my-0 text-[10px] font-bold tracking-widest text-base-content/40">VOUCHER</div>
							{#if voucherResult}
								<div class="flex items-center justify-between bg-emerald-500/5 rounded-lg p-2.5 border border-emerald-500/15">
									<div class="flex items-center gap-2">
										<Icon icon="solar:tag-price-bold-duotone" class="text-emerald-500"/>
										<span class="text-xs font-bold text-emerald-600 font-mono">{voucherResult.code}</span>
										<span class="text-xs text-emerald-500 font-medium">−{formatVND(voucherResult.discount)}</span>
									</div>
									<button onclick={clearVoucher} class="btn btn-xs btn-ghost btn-circle text-base-content/30 hover:text-red-500">
										<Icon icon="solar:close-circle-bold" class="text-sm"/>
									</button>
								</div>
							{:else}
								<div class="flex gap-2">
									<input type="text" bind:value={voucherCode} placeholder="Nhập mã voucher..." class="input input-bordered input-sm flex-1 rounded-lg font-mono uppercase text-xs" />
									<button onclick={applyVoucher} class="btn btn-sm btn-primary rounded-lg font-bold text-xs px-3" disabled={isApplyingVoucher || !voucherCode.trim()}>
										{#if isApplyingVoucher}<span class="loading loading-spinner loading-xs"></span>{:else}Áp Dụng{/if}
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
							<div class="flex justify-between items-center">
								<span class="font-bold tracking-widest uppercase text-sm">Tổng Cộng</span>
								<span class="text-2xl font-black text-primary">{formatVND(finalCost())}</span>
							</div>
						</div>

						<button
							onclick={handleBooking}
							class="btn btn-primary rounded-md font-bold tracking-widest uppercase w-full mt-6"
							disabled={isSubmitting || !availabilityChecked || !isAvailable}
						>
							{#if isSubmitting}
								<span class="loading loading-spinner loading-sm"></span>
							{:else}
								<Icon icon="solar:check-circle-bold-duotone" class="text-xl" />
								Xác Nhận Đặt Phòng
							{/if}
						</button>
						{#if !user}
							<p class="text-xs text-center text-base-content/50 font-medium mt-2">
								Bạn cần <a href="/login" class="text-primary font-bold hover:underline">đăng nhập</a> để tiếp tục.
							</p>
						{/if}
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}
