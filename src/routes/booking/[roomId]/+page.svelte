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

	let user = $derived($page.data.user);
	let roomId = $derived(Number($page.params.roomId));

	$effect(() => {
		fetchData();
	});

	async function fetchData() {
		try {
			const [roomData, serviceData] = await Promise.all([
				trpc().room.getById.query(roomId),
				trpc().service.list.query()
			]);
			room = roomData;
			services = serviceData.filter((s: any) => s.isAvailable);
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
			await trpc().booking.create.mutate({
				roomId,
				startTime: startTime.toISOString(),
				endTime: endTime.toISOString()
			});
			addToast('Đặt phòng thành công! Vui lòng chờ xác nhận từ quản lý.', 'success');
			await goto('/my-bookings', { invalidateAll: true });
		} catch (error) {
			addToast('Đặt phòng thất bại. Phòng có thể đã hết chỗ.', 'error');
		} finally {
			isSubmitting = false;
		}
	}

	const typeLabel: Record<string, string> = { standard: 'Cơ Bản', vip: 'VIP', super_vip: 'Super VIP' };
	const typeBadge: Record<string, string> = { standard: 'badge-ghost', vip: 'badge-secondary', super_vip: 'badge-accent' };
	const categoryLabel: Record<string, string> = { food: 'Đồ Ăn', drink: 'Thức Uống', decoration: 'Trang Trí', other: 'Khác' };

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
									<div class="flex items-center gap-3 p-3 rounded-md border transition-colors {selectedServices[svc.id] ? 'border-primary bg-primary/5' : 'border-base-300 bg-base-200/30 hover:border-base-content/20'}">
										<input type="checkbox" checked={!!selectedServices[svc.id]} onchange={() => toggleService(svc.id)} class="checkbox checkbox-primary checkbox-sm rounded" />
										<div class="flex-1 min-w-0">
											<p class="font-bold text-sm truncate">{svc.name}</p>
											<p class="text-xs text-base-content/50">{categoryLabel[svc.category] || svc.category} · {formatVND(svc.price)}</p>
										</div>
										{#if selectedServices[svc.id]}
											<div class="join">
												<button onclick={() => updateServiceQty(svc.id, (selectedServices[svc.id] || 1) - 1)} class="btn btn-xs join-item btn-ghost">−</button>
												<span class="btn btn-xs join-item btn-ghost pointer-events-none font-mono font-bold">{selectedServices[svc.id]}</span>
												<button onclick={() => updateServiceQty(svc.id, (selectedServices[svc.id] || 1) + 1)} class="btn btn-xs join-item btn-ghost">+</button>
											</div>
										{/if}
									</div>
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

							<div class="divider my-1"></div>
							<div class="flex justify-between items-center">
								<span class="font-bold tracking-widest uppercase text-sm">Tổng Cộng</span>
								<span class="text-2xl font-black text-primary">{formatVND(totalCost())}</span>
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
