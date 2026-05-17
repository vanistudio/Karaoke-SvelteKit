<script lang="ts">
	import { trpc } from '$lib/trpc/client';
	import Icon from '@iconify/svelte';
	import DatePicker from '$lib/components/ui/DatePicker.svelte';
	import TimePicker from '$lib/components/ui/TimePicker.svelte';
	let isReady = $state(false);
	let selectedDate = $state(new Date());
	let selectedTime = $state('19:00');
	let selectedGroup = $state('');
	let isSearching = $state(false);
	let searchResults = $state<any[] | null>(null);

	$effect(() => {
		trpc().healthcheck.query().then(() => isReady = true).catch(() => isReady = false);
	});

	async function searchRooms() {
		isSearching = true;
		const year = selectedDate.getFullYear();
		const month = selectedDate.getMonth();
		const day = selectedDate.getDate();
		const [hours, minutes] = selectedTime.split(':').map(Number);
		const startTime = new Date(year, month, day, hours, minutes);
		const endTime = new Date(startTime.getTime() + 3 * 60 * 60 * 1000);

		const minCapacity = selectedGroup === 'small' ? 1 : selectedGroup === 'medium' ? 5 : selectedGroup === 'large' ? 15 : undefined;

		try {
			searchResults = await trpc().room.findAvailable.query({
				startTime: startTime.toISOString(),
				endTime: endTime.toISOString(),
				minCapacity
			});
		} catch (error) {
			console.error("Lỗi tìm kiếm phòng:", error);
		} finally {
			isSearching = false;
		}
	}

	function formatVND(value: number) {
		return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
	}
</script>

<div class="flex flex-col gap-10">
	<!-- Hero Section -->
	<div class="gradient-karaoke rounded-2xl p-8 lg:p-12 relative overflow-hidden">
		<!-- Decorative elements -->
		<div class="absolute top-4 right-8 opacity-10">
			<Icon icon="solar:music-notes-bold-duotone" class="text-[120px] text-white" />
		</div>
		<div class="absolute bottom-4 left-8 opacity-10">
			<Icon icon="solar:microphone-3-bold-duotone" class="text-[80px] text-white" />
		</div>

		<div class="relative z-10 text-center max-w-3xl mx-auto">
			<div class="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 mb-6">
				<span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
				<span class="text-[11px] font-bold text-white/80 uppercase tracking-widest">Đang Hoạt Động</span>
			</div>

			<h1 class="text-3xl lg:text-5xl font-black text-white uppercase tracking-tight leading-tight mb-4">
				Đặt Phòng Karaoke<br/>
				<span class="text-violet-300">Chỉ 30 Giây</span>
			</h1>

			<p class="text-white/60 font-medium text-sm lg:text-base max-w-lg mx-auto mb-8">
				Hệ thống đặt phòng trực tuyến — chọn giờ, chọn phòng, xác nhận ngay. Không cần gọi điện.
			</p>

			<div class="flex items-center justify-center gap-3 flex-wrap">
				<a href="#search" class="btn btn-primary rounded-lg font-bold tracking-wider px-6 pulse-glow">
					<Icon icon="solar:calendar-search-line-duotone" class="text-xl"/>
					Tìm Phòng Trống
				</a>
				<a href="/rooms" class="btn btn-ghost text-white/70 hover:text-white rounded-lg font-bold tracking-wider px-6">
					<Icon icon="solar:eye-line-duotone" class="text-xl"/>
					Xem Tất Cả Phòng
				</a>
			</div>
		</div>
	</div>

	<!-- Stats Bar -->
	<div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
		<div class="bg-base-100 rounded-xl border border-base-300/50 p-4 text-center">
			<Icon icon="solar:microphone-3-bold-duotone" class="text-2xl text-primary mx-auto mb-1" />
			<p class="text-lg font-black">20+</p>
			<p class="text-[10px] font-bold text-base-content/40 uppercase tracking-widest">Phòng Hát</p>
		</div>
		<div class="bg-base-100 rounded-xl border border-base-300/50 p-4 text-center">
			<Icon icon="solar:users-group-rounded-bold-duotone" class="text-2xl text-secondary mx-auto mb-1" />
			<p class="text-lg font-black">500+</p>
			<p class="text-[10px] font-bold text-base-content/40 uppercase tracking-widest">Khách / Tháng</p>
		</div>
		<div class="bg-base-100 rounded-xl border border-base-300/50 p-4 text-center">
			<Icon icon="solar:star-bold-duotone" class="text-2xl text-amber-500 mx-auto mb-1" />
			<p class="text-lg font-black">4.8</p>
			<p class="text-[10px] font-bold text-base-content/40 uppercase tracking-widest">Đánh Giá</p>
		</div>
		<div class="bg-base-100 rounded-xl border border-base-300/50 p-4 text-center">
			<Icon icon="solar:cup-hot-bold-duotone" class="text-2xl text-accent mx-auto mb-1" />
			<p class="text-lg font-black">50+</p>
			<p class="text-[10px] font-bold text-base-content/40 uppercase tracking-widest">Dịch Vụ</p>
		</div>
	</div>

	<!-- Search Section -->
	<div id="search" class="card bg-base-100 rounded-xl neon-border">
		<div class="card-body p-6 lg:p-8">
			<div class="flex items-center gap-3 mb-6">
				<div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
					<Icon icon="solar:calendar-search-bold-duotone" class="text-xl text-primary"/>
				</div>
				<div>
					<h2 class="text-lg font-bold">Tra Cứu Phòng Trống</h2>
					<p class="text-xs text-base-content/40 font-medium">Chọn ngày, giờ và quy mô nhóm để tìm phòng phù hợp</p>
				</div>
			</div>

			<div class="flex flex-col xl:flex-row gap-4">
				<div class="form-control w-full">
					<div class="label"><span class="label-text font-bold text-xs uppercase tracking-widest text-base-content/50">Ngày Phục Vụ</span></div>
					<DatePicker bind:value={selectedDate} />
				</div>
				<div class="form-control w-full">
					<div class="label"><span class="label-text font-bold text-xs uppercase tracking-widest text-base-content/50">Giờ Tới</span></div>
					<TimePicker bind:value={selectedTime} />
				</div>
				<div class="form-control w-full">
					<div class="label"><span class="label-text font-bold text-xs uppercase tracking-widest text-base-content/50">Quy Mô Nhóm</span></div>
					<select bind:value={selectedGroup} class="select select-bordered rounded-lg border-base-300 w-full">
						<option value="">-- Tất cả --</option>
						<option value="small">Nhỏ (1-5 Khách)</option>
						<option value="medium">Trung (5-12 Khách)</option>
						<option value="large">Lớn (15+ Khách)</option>
					</select>
				</div>
			</div>

			<div class="card-actions justify-end mt-6 pt-5 border-t border-base-200">
				<button class="btn btn-primary rounded-lg font-bold tracking-wider uppercase px-8" disabled={isSearching} onclick={searchRooms}>
					{#if isSearching}
						<span class="loading loading-spinner loading-sm"></span>
					{:else}
						<Icon icon="solar:magnifer-line-duotone" class="text-xl" />
					{/if}
					Tìm Phòng
				</button>
			</div>
		</div>
	</div>

	<!-- Search Results -->
	{#if searchResults}
		<div class="w-full">
			<div class="flex items-center gap-2 mb-6">
				<Icon icon="solar:list-check-bold-duotone" class="text-xl text-primary"/>
				<h2 class="text-lg font-bold">Kết Quả: {searchResults.length} phòng khả dụng</h2>
			</div>
			{#if searchResults.length === 0}
				<div class="bg-base-100 rounded-xl neon-border p-8 text-center">
					<Icon icon="solar:sad-circle-line-duotone" class="text-5xl text-base-content/20 mx-auto mb-4" />
					<h3 class="font-bold text-lg mb-1">Không tìm thấy phòng trống</h3>
					<p class="text-sm text-base-content/40 font-medium">Vui lòng thử khung giờ khác hoặc giảm quy mô nhóm.</p>
				</div>
			{:else}
				<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
					{#each searchResults as room}
						<div class="card bg-base-100 rounded-xl neon-border group">
							<div class="card-body p-5">
								<div class="flex items-start justify-between mb-3">
									<div class="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
										<Icon icon="solar:microphone-3-bold-duotone" class="text-2xl text-primary"/>
									</div>
									<span class="badge badge-sm rounded-md font-bold uppercase bg-primary/10 text-primary border-primary/20">{room.type}</span>
								</div>
								<h3 class="text-lg font-bold">{room.name}</h3>
								<div class="flex flex-col gap-2 mt-2 text-sm">
									<div class="flex justify-between font-medium">
										<span class="text-base-content/50">Sức chứa</span>
										<span>Tối đa {room.capacity} khách</span>
									</div>
									<div class="flex justify-between font-medium pt-1 border-t border-base-200">
										<span class="text-base-content/50">Giá / Giờ</span>
										<span class="text-xl font-black text-primary">{formatVND(room.pricePerHour)}</span>
									</div>
								</div>
								<div class="card-actions mt-4">
									<a href="/booking/{room.id}" class="btn btn-primary btn-outline rounded-lg w-full font-bold tracking-wider uppercase text-xs">
										<Icon icon="solar:calendar-add-line-duotone" class="text-lg"/>
										Đặt Ngay
									</a>
								</div>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	{/if}

	<!-- Features -->
	<div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
		<div class="card bg-base-100 rounded-xl neon-border group">
			<div class="card-body p-6">
				<div class="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform float-animation">
					<Icon icon="solar:soundwave-bold-duotone" class="text-2xl text-primary" />
				</div>
				<h3 class="text-base font-bold tracking-wide">Âm Thanh Đỉnh Cao</h3>
				<p class="text-base-content/50 text-sm mt-2 leading-relaxed">Hệ thống loa JBL + micro không dây, kết nối Youtube/Spotify không giới hạn.</p>
			</div>
		</div>
		<div class="card bg-base-100 rounded-xl neon-border group">
			<div class="card-body p-6">
				<div class="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform float-animation" style="animation-delay: 0.5s">
					<Icon icon="solar:chef-hat-bold-duotone" class="text-2xl text-secondary" />
				</div>
				<h3 class="text-base font-bold tracking-wide">Ẩm Thực & Đồ Uống</h3>
				<p class="text-base-content/50 text-sm mt-2 leading-relaxed">Menu đa dạng từ snack đến tiệc nướng, quầy bar pha chế cocktail tại chỗ.</p>
			</div>
		</div>
		<div class="card bg-base-100 rounded-xl neon-border group">
			<div class="card-body p-6">
				<div class="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform float-animation" style="animation-delay: 1s">
					<Icon icon="solar:shield-star-bold-duotone" class="text-2xl text-accent" />
				</div>
				<h3 class="text-base font-bold tracking-wide">Đặt Phòng An Toàn</h3>
				<p class="text-base-content/50 text-sm mt-2 leading-relaxed">Xác nhận tức thì, tích điểm thành viên, hủy miễn phí trước 2 giờ.</p>
			</div>
		</div>
	</div>
</div>