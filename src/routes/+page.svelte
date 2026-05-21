<script lang="ts">
	import { trpc } from '$lib/trpc/client';
	import Icon from '@iconify/svelte';
	import DatePicker from '$lib/components/ui/DatePicker.svelte';
	import TimePicker from '$lib/components/ui/TimePicker.svelte';

	let selectedDate = $state(new Date());
	let selectedTime = $state('19:00');
	let selectedGroup = $state('');
	let isSearching = $state(false);
	let searchResults = $state<any[] | null>(null);

	async function searchRooms() {
		isSearching = true;
		const year = selectedDate.getFullYear();
		const month = selectedDate.getMonth();
		const day = selectedDate.getDate();
		const [hours, minutes] = selectedTime.split(':').map(Number);
		const startTime = new Date(year, month, day, hours, minutes);
		const endTime = new Date(startTime.getTime() + 3 * 60 * 60 * 1000);
		const minCapacity =
			selectedGroup === 'small'
				? 1
				: selectedGroup === 'medium'
					? 5
					: selectedGroup === 'large'
						? 15
						: undefined;

		try {
			searchResults = await trpc().room.findAvailable.query({
				startTime: startTime.toISOString(),
				endTime: endTime.toISOString(),
				minCapacity
			});
		} catch (error) {
			console.error('Lỗi tìm kiếm phòng:', error);
		} finally {
			isSearching = false;
		}
	}

	function formatVND(value: number) {
		return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
	}
</script>

<svelte:head>
	<title>KaraSystem — Hệ Thống Đặt Phòng Karaoke Cao Cấp</title>
	<meta
		name="description"
		content="Đặt phòng karaoke trực tuyến chỉ 30 giây. Hệ thống âm thanh đẳng cấp, phòng VIP sang trọng, dịch vụ ẩm thực đa dạng."
	/>
</svelte:head>

<div class="flex flex-col gap-10 lg:gap-14">
	<div class="relative overflow-hidden rounded-2xl">
		<img
			src="https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1400&q=80"
			alt="Karaoke atmosphere"
			class="h-[320px] w-full object-cover lg:h-[460px]"
		/>
		<div class="absolute inset-0 bg-black/60"></div>

		<div class="absolute inset-0 flex flex-col justify-center px-6 lg:px-12">
			<div class="max-w-xl">
				<span
					class="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold tracking-widest text-white/80 uppercase backdrop-blur-sm"
				>
					<span class="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400"></span>
					Đang Hoạt Động
				</span>

				<h1 class="mb-4 text-2xl leading-tight font-black text-white lg:text-4xl xl:text-5xl">
					Trải Nghiệm Karaoke<br />Đẳng Cấp Nhất
				</h1>

				<p class="mb-6 max-w-md text-sm leading-relaxed text-white/50 lg:text-base">
					Phòng hát cao cấp, âm thanh JBL chuyên nghiệp, dịch vụ 5 sao. Đặt phòng trực tuyến — xác
					nhận tức thì.
				</p>

				<div class="flex items-center gap-3">
					<a href="#booking" class="btn rounded-xl px-6 text-sm font-bold btn-primary">
						<Icon icon="solar:calendar-search-bold-duotone" class="text-lg" />
						Đặt Phòng
					</a>
					<a
						href="/rooms"
						class="btn rounded-xl px-5 text-sm font-bold text-white/60 btn-ghost hover:text-white"
					>
						Xem Phòng →
					</a>
				</div>
			</div>
		</div>
	</div>
	<div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
		<div class="rounded-xl border border-base-300/50 bg-base-100 p-4 text-center">
			<Icon icon="solar:microphone-3-bold-duotone" class="mx-auto mb-1.5 text-2xl text-primary" />
			<p class="text-xl font-black">20+</p>
			<p class="mt-0.5 text-[10px] font-bold tracking-widest text-base-content/40 uppercase">
				Phòng Hát
			</p>
		</div>
		<div class="rounded-xl border border-base-300/50 bg-base-100 p-4 text-center">
			<Icon
				icon="solar:users-group-rounded-bold-duotone"
				class="mx-auto mb-1.5 text-2xl text-secondary"
			/>
			<p class="text-xl font-black">500+</p>
			<p class="mt-0.5 text-[10px] font-bold tracking-widest text-base-content/40 uppercase">
				Khách / Tháng
			</p>
		</div>
		<div class="rounded-xl border border-base-300/50 bg-base-100 p-4 text-center">
			<Icon icon="solar:star-bold-duotone" class="mx-auto mb-1.5 text-2xl text-amber-500" />
			<p class="text-xl font-black">4.8</p>
			<p class="mt-0.5 text-[10px] font-bold tracking-widest text-base-content/40 uppercase">
				Đánh Giá
			</p>
		</div>
		<div class="rounded-xl border border-base-300/50 bg-base-100 p-4 text-center">
			<Icon icon="solar:cup-hot-bold-duotone" class="mx-auto mb-1.5 text-2xl text-accent" />
			<p class="text-xl font-black">50+</p>
			<p class="mt-0.5 text-[10px] font-bold tracking-widest text-base-content/40 uppercase">
				Dịch Vụ
			</p>
		</div>
	</div>
	<div id="booking" class="rounded-2xl border border-base-300/50 bg-base-100 p-5 lg:p-8">
		<div class="mb-5 flex items-center gap-3">
			<div class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
				<Icon icon="solar:calendar-search-bold-duotone" class="text-xl text-primary" />
			</div>
			<div>
				<h2 class="text-base font-bold">Tìm Phòng Trống</h2>
				<p class="text-xs font-medium text-base-content/40">Chọn ngày giờ và quy mô nhóm</p>
			</div>
		</div>

		<div class="grid grid-cols-1 gap-3 md:grid-cols-3">
			<div class="form-control w-full">
				<div class="label">
					<span class="label-text text-xs font-bold tracking-widest text-base-content/50 uppercase"
						>Ngày Đến</span
					>
				</div>
				<DatePicker bind:value={selectedDate} />
			</div>
			<div class="form-control w-full">
				<div class="label">
					<span class="label-text text-xs font-bold tracking-widest text-base-content/50 uppercase"
						>Giờ Tới</span
					>
				</div>
				<TimePicker bind:value={selectedTime} />
			</div>
			<div class="form-control w-full">
				<div class="label">
					<span class="label-text text-xs font-bold tracking-widest text-base-content/50 uppercase"
						>Quy Mô</span
					>
				</div>
				<select bind:value={selectedGroup} class="select-bordered select w-full rounded-xl">
					<option value="">Tất cả</option>
					<option value="small">Nhỏ (1-5 khách)</option>
					<option value="medium">Trung (5-12 khách)</option>
					<option value="large">Lớn (15+ khách)</option>
				</select>
			</div>
		</div>

		<button
			class="btn mt-5 w-full rounded-xl text-sm font-bold btn-primary"
			disabled={isSearching}
			onclick={searchRooms}
		>
			{#if isSearching}
				<span class="loading loading-sm loading-spinner"></span>
			{:else}
				<Icon icon="solar:magnifer-bold-duotone" class="text-lg" />
			{/if}
			Tìm Phòng Trống
		</button>
	</div>
	{#if searchResults}
		<div>
			<h3 class="mb-4 flex items-center gap-2 text-base font-bold">
				<Icon icon="solar:list-check-bold-duotone" class="text-lg text-primary" />
				{searchResults.length} phòng khả dụng
			</h3>
			{#if searchResults.length === 0}
				<div class="rounded-xl border border-base-300/50 bg-base-100 p-8 text-center">
					<Icon
						icon="solar:sad-circle-line-duotone"
						class="mx-auto mb-3 text-4xl text-base-content/15"
					/>
					<p class="font-bold">Không tìm thấy phòng trống</p>
					<p class="mt-1 text-xs font-medium text-base-content/40">
						Thử khung giờ khác hoặc giảm quy mô nhóm.
					</p>
				</div>
			{:else}
				<div class="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
					{#each searchResults as room}
						<div
							class="group rounded-xl border border-base-300/50 bg-base-100 p-4 transition-colors hover:border-primary/40"
						>
							<div class="mb-2 flex items-start justify-between">
								<div
									class="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 transition-transform group-hover:scale-105"
								>
									<Icon icon="solar:microphone-3-bold-duotone" class="text-xl text-primary" />
								</div>
								<span
									class="badge rounded-md bg-base-200 badge-sm font-bold text-base-content/60 uppercase"
									>{room.type}</span
								>
							</div>
							<h3 class="font-bold">{room.name}</h3>
							<p class="mt-0.5 text-xs font-medium text-base-content/40">
								Tối đa {room.capacity} khách
							</p>
							<div class="mt-3 flex items-center justify-between border-t border-base-200 pt-3">
								<span class="text-lg font-black text-primary"
									>{formatVND(room.pricePerHour)}<span
										class="text-[10px] font-medium text-base-content/30">/giờ</span
									></span
								>
								<a
									href="/booking/{room.id}"
									class="btn rounded-lg text-xs font-bold btn-sm btn-primary">Đặt Ngay</a
								>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	{/if}
	<div>
		<div class="mb-5 flex items-center justify-between">
			<div>
				<h2 class="text-xl font-black">Không Gian Phòng Hát</h2>
				<p class="mt-1 text-xs font-medium text-base-content/40">
					Đa dạng từ Standard đến Super VIP
				</p>
			</div>
			<a href="/rooms" class="btn rounded-lg text-xs font-bold text-primary btn-ghost btn-sm"
				>Xem tất cả →</a
			>
		</div>

		<div class="grid grid-cols-1 gap-3 md:grid-cols-3">
			<div class="group relative aspect-4/3 overflow-hidden rounded-xl">
				<img
					src="https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=600&q=80"
					alt="Standard Room"
					class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
				/>
				<div class="absolute inset-0 bg-black/50"></div>
				<div class="absolute right-0 bottom-0 left-0 p-4">
					<span class="mb-1.5 badge rounded-md border-0 bg-white/20 badge-xs font-bold text-white"
						>Standard</span
					>
					<h3 class="font-bold text-white">Phòng Tiêu Chuẩn</h3>
					<p class="mt-0.5 text-[11px] font-medium text-white/50">2-5 khách • Từ 150.000đ/giờ</p>
				</div>
			</div>
			<div class="group relative aspect-4/3 overflow-hidden rounded-xl">
				<img
					src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&q=80"
					alt="VIP Room"
					class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
				/>
				<div class="absolute inset-0 bg-black/50"></div>
				<div class="absolute right-0 bottom-0 left-0 p-4">
					<span
						class="mb-1.5 badge rounded-md border-0 bg-secondary/70 badge-xs font-bold text-white"
						>VIP</span
					>
					<h3 class="font-bold text-white">Phòng VIP</h3>
					<p class="mt-0.5 text-[11px] font-medium text-white/50">5-12 khách • Từ 300.000đ/giờ</p>
				</div>
			</div>
			<div class="group relative aspect-4/3 overflow-hidden rounded-xl">
				<img
					src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&q=80"
					alt="Super VIP Room"
					class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
				/>
				<div class="absolute inset-0 bg-black/50"></div>
				<div class="absolute right-0 bottom-0 left-0 p-4">
					<span class="mb-1.5 badge rounded-md border-0 bg-primary/70 badge-xs font-bold text-white"
						>Super VIP</span
					>
					<h3 class="font-bold text-white">Phòng Super VIP</h3>
					<p class="mt-0.5 text-[11px] font-medium text-white/50">15-30 khách • Từ 500.000đ/giờ</p>
				</div>
			</div>
		</div>
	</div>
	<div>
		<div class="mb-6 text-center">
			<h2 class="text-xl font-black">Tại Sao Chọn KaraSystem?</h2>
			<p class="mt-1 text-xs font-medium text-base-content/40">Tiêu chuẩn dịch vụ 5 sao</p>
		</div>

		<div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
			<div class="group rounded-xl border border-base-300/50 bg-base-100 p-4">
				<div
					class="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10 transition-transform group-hover:scale-105"
				>
					<Icon icon="solar:soundwave-bold-duotone" class="text-xl text-violet-500" />
				</div>
				<h3 class="mb-1 text-sm font-bold">Âm Thanh JBL</h3>
				<p class="text-[11px] leading-relaxed font-medium text-base-content/40">
					Loa JBL Professional + micro Shure không dây
				</p>
			</div>
			<div class="group rounded-xl border border-base-300/50 bg-base-100 p-4">
				<div
					class="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-pink-500/10 transition-transform group-hover:scale-105"
				>
					<Icon icon="solar:tv-bold-duotone" class="text-xl text-pink-500" />
				</div>
				<h3 class="mb-1 text-sm font-bold">Màn Hình 65"</h3>
				<p class="text-[11px] leading-relaxed font-medium text-base-content/40">
					TV 4K, kho nhạc 100.000+ bài Việt/Quốc tế
				</p>
			</div>
			<div class="group rounded-xl border border-base-300/50 bg-base-100 p-4">
				<div
					class="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10 transition-transform group-hover:scale-105"
				>
					<Icon icon="solar:chef-hat-bold-duotone" class="text-xl text-cyan-500" />
				</div>
				<h3 class="mb-1 text-sm font-bold">Ẩm Thực & Bar</h3>
				<p class="text-[11px] leading-relaxed font-medium text-base-content/40">
					50+ món, cocktail bar, phục vụ tận phòng
				</p>
			</div>
			<div class="group rounded-xl border border-base-300/50 bg-base-100 p-4">
				<div
					class="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 transition-transform group-hover:scale-105"
				>
					<Icon icon="solar:shield-star-bold-duotone" class="text-xl text-emerald-500" />
				</div>
				<h3 class="mb-1 text-sm font-bold">Đặt Phòng An Toàn</h3>
				<p class="text-[11px] leading-relaxed font-medium text-base-content/40">
					Xác nhận tức thì, hủy miễn phí trước 2h
				</p>
			</div>
		</div>
	</div>
	<div>
		<div class="mb-6 text-center">
			<h2 class="text-xl font-black">Đặt Phòng Trong 3 Bước</h2>
			<p class="mt-1 text-xs font-medium text-base-content/40">
				Đơn giản, nhanh chóng, không cần gọi điện
			</p>
		</div>

		<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
			<div class="rounded-xl border border-base-300/50 bg-base-100 p-5 text-center">
				<div
					class="relative mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10"
				>
					<Icon icon="solar:calendar-search-bold-duotone" class="text-2xl text-primary" />
					<span
						class="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-black text-white"
						>1</span
					>
				</div>
				<h3 class="mb-1 text-sm font-bold">Chọn Ngày & Giờ</h3>
				<p class="text-[11px] font-medium text-base-content/40">
					Hệ thống tự động tìm phòng trống cho bạn
				</p>
			</div>
			<div class="rounded-xl border border-base-300/50 bg-base-100 p-5 text-center">
				<div
					class="relative mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/10"
				>
					<Icon icon="solar:microphone-3-bold-duotone" class="text-2xl text-secondary" />
					<span
						class="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-[10px] font-black text-white"
						>2</span
					>
				</div>
				<h3 class="mb-1 text-sm font-bold">Chọn Phòng & Dịch Vụ</h3>
				<p class="text-[11px] font-medium text-base-content/40">
					Chọn loại phòng, thêm đồ ăn/uống nếu muốn
				</p>
			</div>
			<div class="rounded-xl border border-base-300/50 bg-base-100 p-5 text-center">
				<div
					class="relative mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10"
				>
					<Icon icon="solar:check-circle-bold-duotone" class="text-2xl text-accent" />
					<span
						class="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-black text-white"
						>3</span
					>
				</div>
				<h3 class="mb-1 text-sm font-bold">Xác Nhận & Đến</h3>
				<p class="text-[11px] font-medium text-base-content/40">
					Nhận xác nhận qua email, đến quán tận hưởng
				</p>
			</div>
		</div>
	</div>
	<div
		class="flex flex-col items-center gap-5 rounded-2xl bg-neutral p-6 text-neutral-content lg:flex-row lg:p-8"
	>
		<div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/10">
			<Icon icon="solar:star-bold-duotone" class="text-3xl text-amber-300" />
		</div>
		<div class="flex-1 text-center lg:text-left">
			<h3 class="text-lg font-bold">Tích Điểm Mỗi Lần Đặt Phòng</h3>
			<p class="mt-1 text-sm font-medium text-neutral-content/50">
				Đăng ký thành viên miễn phí — hoàn điểm lên đến 12% trên mỗi đơn. Đổi điểm lấy giảm giá.
			</p>
		</div>
		<a href="/register" class="btn shrink-0 rounded-xl px-6 font-bold btn-primary">
			<Icon icon="solar:user-plus-bold-duotone" class="text-lg" />
			Đăng Ký
		</a>
	</div>
	<div class="pb-2 text-center">
		<h2 class="mb-2 text-lg font-black">Sẵn Sàng Hát Karaoke?</h2>
		<p class="mb-4 text-xs font-medium text-base-content/40">Đặt phòng ngay — chỉ mất 30 giây</p>
		<a href="#booking" class="btn rounded-xl px-8 font-bold btn-primary">
			<Icon icon="solar:microphone-3-bold-duotone" class="text-xl" />
			Đặt Phòng Ngay
		</a>
	</div>
</div>
