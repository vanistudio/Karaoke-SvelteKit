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

<svelte:head>
	<title>KaraSystem — Hệ Thống Đặt Phòng Karaoke Cao Cấp</title>
	<meta name="description" content="Đặt phòng karaoke trực tuyến chỉ 30 giây. Hệ thống âm thanh đẳng cấp, phòng VIP sang trọng, dịch vụ ẩm thực đa dạng." />
</svelte:head>

<div class="flex flex-col gap-10 lg:gap-14">
	<div class="relative rounded-2xl overflow-hidden">
		<img
			src="https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1400&q=80"
			alt="Karaoke atmosphere"
			class="w-full h-[320px] lg:h-[460px] object-cover"
		/>
		<div class="absolute inset-0 bg-black/60"></div>

		<div class="absolute inset-0 flex flex-col justify-center px-6 lg:px-12">
			<div class="max-w-xl">
				<span class="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1 mb-4 text-[11px] font-bold text-white/80 uppercase tracking-widest">
					<span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
					Đang Hoạt Động
				</span>

				<h1 class="text-2xl lg:text-4xl xl:text-5xl font-black text-white leading-tight mb-4">
					Trải Nghiệm Karaoke<br/>Đẳng Cấp Nhất
				</h1>

				<p class="text-white/50 text-sm lg:text-base max-w-md mb-6 leading-relaxed">
					Phòng hát cao cấp, âm thanh JBL chuyên nghiệp, dịch vụ 5 sao. Đặt phòng trực tuyến — xác nhận tức thì.
				</p>

				<div class="flex items-center gap-3">
					<a href="#booking" class="btn btn-primary rounded-xl font-bold px-6 text-sm">
						<Icon icon="solar:calendar-search-bold-duotone" class="text-lg"/>
						Đặt Phòng
					</a>
					<a href="/rooms" class="btn btn-ghost text-white/60 hover:text-white rounded-xl font-bold px-5 text-sm">
						Xem Phòng →
					</a>
				</div>
			</div>
		</div>
	</div>
	<div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
		<div class="bg-base-100 rounded-xl border border-base-300/50 p-4 text-center">
			<Icon icon="solar:microphone-3-bold-duotone" class="text-2xl text-primary mx-auto mb-1.5" />
			<p class="text-xl font-black">20+</p>
			<p class="text-[10px] font-bold text-base-content/40 uppercase tracking-widest mt-0.5">Phòng Hát</p>
		</div>
		<div class="bg-base-100 rounded-xl border border-base-300/50 p-4 text-center">
			<Icon icon="solar:users-group-rounded-bold-duotone" class="text-2xl text-secondary mx-auto mb-1.5" />
			<p class="text-xl font-black">500+</p>
			<p class="text-[10px] font-bold text-base-content/40 uppercase tracking-widest mt-0.5">Khách / Tháng</p>
		</div>
		<div class="bg-base-100 rounded-xl border border-base-300/50 p-4 text-center">
			<Icon icon="solar:star-bold-duotone" class="text-2xl text-amber-500 mx-auto mb-1.5" />
			<p class="text-xl font-black">4.8</p>
			<p class="text-[10px] font-bold text-base-content/40 uppercase tracking-widest mt-0.5">Đánh Giá</p>
		</div>
		<div class="bg-base-100 rounded-xl border border-base-300/50 p-4 text-center">
			<Icon icon="solar:cup-hot-bold-duotone" class="text-2xl text-accent mx-auto mb-1.5" />
			<p class="text-xl font-black">50+</p>
			<p class="text-[10px] font-bold text-base-content/40 uppercase tracking-widest mt-0.5">Dịch Vụ</p>
		</div>
	</div>
	<div id="booking" class="bg-base-100 rounded-2xl border border-base-300/50 p-5 lg:p-8">
		<div class="flex items-center gap-3 mb-5">
			<div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
				<Icon icon="solar:calendar-search-bold-duotone" class="text-xl text-primary"/>
			</div>
			<div>
				<h2 class="text-base font-bold">Tìm Phòng Trống</h2>
				<p class="text-xs text-base-content/40 font-medium">Chọn ngày giờ và quy mô nhóm</p>
			</div>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-3 gap-3">
			<div class="form-control w-full">
				<div class="label"><span class="label-text font-bold text-xs uppercase tracking-widest text-base-content/50">Ngày Đến</span></div>
				<DatePicker bind:value={selectedDate} />
			</div>
			<div class="form-control w-full">
				<div class="label"><span class="label-text font-bold text-xs uppercase tracking-widest text-base-content/50">Giờ Tới</span></div>
				<TimePicker bind:value={selectedTime} />
			</div>
			<div class="form-control w-full">
				<div class="label"><span class="label-text font-bold text-xs uppercase tracking-widest text-base-content/50">Quy Mô</span></div>
				<select bind:value={selectedGroup} class="select select-bordered rounded-xl w-full">
					<option value="">Tất cả</option>
					<option value="small">Nhỏ (1-5 khách)</option>
					<option value="medium">Trung (5-12 khách)</option>
					<option value="large">Lớn (15+ khách)</option>
				</select>
			</div>
		</div>

		<button class="btn btn-primary rounded-xl font-bold w-full mt-5 text-sm" disabled={isSearching} onclick={searchRooms}>
			{#if isSearching}
				<span class="loading loading-spinner loading-sm"></span>
			{:else}
				<Icon icon="solar:magnifer-bold-duotone" class="text-lg" />
			{/if}
			Tìm Phòng Trống
		</button>
	</div>
	{#if searchResults}
		<div>
			<h3 class="text-base font-bold mb-4 flex items-center gap-2">
				<Icon icon="solar:list-check-bold-duotone" class="text-lg text-primary"/>
				{searchResults.length} phòng khả dụng
			</h3>
			{#if searchResults.length === 0}
				<div class="bg-base-100 rounded-xl border border-base-300/50 p-8 text-center">
					<Icon icon="solar:sad-circle-line-duotone" class="text-4xl text-base-content/15 mx-auto mb-3" />
					<p class="font-bold">Không tìm thấy phòng trống</p>
					<p class="text-xs text-base-content/40 font-medium mt-1">Thử khung giờ khác hoặc giảm quy mô nhóm.</p>
				</div>
			{:else}
				<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
					{#each searchResults as room}
						<div class="bg-base-100 rounded-xl border border-base-300/50 p-4 hover:border-primary/40 transition-colors group">
							<div class="flex items-start justify-between mb-2">
								<div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:scale-105 transition-transform">
									<Icon icon="solar:microphone-3-bold-duotone" class="text-xl text-primary"/>
								</div>
								<span class="badge badge-sm rounded-md font-bold uppercase bg-base-200 text-base-content/60">{room.type}</span>
							</div>
							<h3 class="font-bold">{room.name}</h3>
							<p class="text-xs text-base-content/40 font-medium mt-0.5">Tối đa {room.capacity} khách</p>
							<div class="flex items-center justify-between mt-3 pt-3 border-t border-base-200">
								<span class="text-lg font-black text-primary">{formatVND(room.pricePerHour)}<span class="text-[10px] text-base-content/30 font-medium">/giờ</span></span>
								<a href="/booking/{room.id}" class="btn btn-primary btn-sm rounded-lg font-bold text-xs">Đặt Ngay</a>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	{/if}
	<div>
		<div class="flex items-center justify-between mb-5">
			<div>
				<h2 class="text-xl font-black">Không Gian Phòng Hát</h2>
				<p class="text-xs text-base-content/40 font-medium mt-1">Đa dạng từ Standard đến Super VIP</p>
			</div>
			<a href="/rooms" class="btn btn-ghost btn-sm rounded-lg font-bold text-primary text-xs">Xem tất cả →</a>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-3 gap-3">
			<div class="relative rounded-xl overflow-hidden aspect-4/3 group">
				<img src="https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=600&q=80" alt="Standard Room" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
				<div class="absolute inset-0 bg-black/50"></div>
				<div class="absolute bottom-0 left-0 right-0 p-4">
					<span class="badge badge-xs bg-white/20 text-white border-0 rounded-md font-bold mb-1.5">Standard</span>
					<h3 class="text-white font-bold">Phòng Tiêu Chuẩn</h3>
					<p class="text-white/50 text-[11px] font-medium mt-0.5">2-5 khách • Từ 150.000đ/giờ</p>
				</div>
			</div>
			<div class="relative rounded-xl overflow-hidden aspect-4/3 group">
				<img src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&q=80" alt="VIP Room" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
				<div class="absolute inset-0 bg-black/50"></div>
				<div class="absolute bottom-0 left-0 right-0 p-4">
					<span class="badge badge-xs bg-secondary/70 text-white border-0 rounded-md font-bold mb-1.5">VIP</span>
					<h3 class="text-white font-bold">Phòng VIP</h3>
					<p class="text-white/50 text-[11px] font-medium mt-0.5">5-12 khách • Từ 300.000đ/giờ</p>
				</div>
			</div>
			<div class="relative rounded-xl overflow-hidden aspect-4/3 group">
				<img src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&q=80" alt="Super VIP Room" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
				<div class="absolute inset-0 bg-black/50"></div>
				<div class="absolute bottom-0 left-0 right-0 p-4">
					<span class="badge badge-xs bg-primary/70 text-white border-0 rounded-md font-bold mb-1.5">Super VIP</span>
					<h3 class="text-white font-bold">Phòng Super VIP</h3>
					<p class="text-white/50 text-[11px] font-medium mt-0.5">15-30 khách • Từ 500.000đ/giờ</p>
				</div>
			</div>
		</div>
	</div>
	<div>
		<div class="text-center mb-6">
			<h2 class="text-xl font-black">Tại Sao Chọn KaraSystem?</h2>
			<p class="text-xs text-base-content/40 font-medium mt-1">Tiêu chuẩn dịch vụ 5 sao</p>
		</div>

		<div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
			<div class="bg-base-100 rounded-xl border border-base-300/50 p-4 group">
				<div class="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
					<Icon icon="solar:soundwave-bold-duotone" class="text-xl text-violet-500" />
				</div>
				<h3 class="font-bold text-sm mb-1">Âm Thanh JBL</h3>
				<p class="text-[11px] text-base-content/40 font-medium leading-relaxed">Loa JBL Professional + micro Shure không dây</p>
			</div>
			<div class="bg-base-100 rounded-xl border border-base-300/50 p-4 group">
				<div class="w-10 h-10 rounded-lg bg-pink-500/10 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
					<Icon icon="solar:tv-bold-duotone" class="text-xl text-pink-500" />
				</div>
				<h3 class="font-bold text-sm mb-1">Màn Hình 65"</h3>
				<p class="text-[11px] text-base-content/40 font-medium leading-relaxed">TV 4K, kho nhạc 100.000+ bài Việt/Quốc tế</p>
			</div>
			<div class="bg-base-100 rounded-xl border border-base-300/50 p-4 group">
				<div class="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
					<Icon icon="solar:chef-hat-bold-duotone" class="text-xl text-cyan-500" />
				</div>
				<h3 class="font-bold text-sm mb-1">Ẩm Thực & Bar</h3>
				<p class="text-[11px] text-base-content/40 font-medium leading-relaxed">50+ món, cocktail bar, phục vụ tận phòng</p>
			</div>
			<div class="bg-base-100 rounded-xl border border-base-300/50 p-4 group">
				<div class="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
					<Icon icon="solar:shield-star-bold-duotone" class="text-xl text-emerald-500" />
				</div>
				<h3 class="font-bold text-sm mb-1">Đặt Phòng An Toàn</h3>
				<p class="text-[11px] text-base-content/40 font-medium leading-relaxed">Xác nhận tức thì, hủy miễn phí trước 2h</p>
			</div>
		</div>
	</div>
	<div>
		<div class="text-center mb-6">
			<h2 class="text-xl font-black">Đặt Phòng Trong 3 Bước</h2>
			<p class="text-xs text-base-content/40 font-medium mt-1">Đơn giản, nhanh chóng, không cần gọi điện</p>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
			<div class="bg-base-100 rounded-xl border border-base-300/50 p-5 text-center">
				<div class="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3 relative">
					<Icon icon="solar:calendar-search-bold-duotone" class="text-2xl text-primary" />
					<span class="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-primary text-white text-[10px] font-black flex items-center justify-center">1</span>
				</div>
				<h3 class="font-bold text-sm mb-1">Chọn Ngày & Giờ</h3>
				<p class="text-[11px] text-base-content/40 font-medium">Hệ thống tự động tìm phòng trống cho bạn</p>
			</div>
			<div class="bg-base-100 rounded-xl border border-base-300/50 p-5 text-center">
				<div class="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center mx-auto mb-3 relative">
					<Icon icon="solar:microphone-3-bold-duotone" class="text-2xl text-secondary" />
					<span class="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-secondary text-white text-[10px] font-black flex items-center justify-center">2</span>
				</div>
				<h3 class="font-bold text-sm mb-1">Chọn Phòng & Dịch Vụ</h3>
				<p class="text-[11px] text-base-content/40 font-medium">Chọn loại phòng, thêm đồ ăn/uống nếu muốn</p>
			</div>
			<div class="bg-base-100 rounded-xl border border-base-300/50 p-5 text-center">
				<div class="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-3 relative">
					<Icon icon="solar:check-circle-bold-duotone" class="text-2xl text-accent" />
					<span class="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-accent text-white text-[10px] font-black flex items-center justify-center">3</span>
				</div>
				<h3 class="font-bold text-sm mb-1">Xác Nhận & Đến</h3>
				<p class="text-[11px] text-base-content/40 font-medium">Nhận xác nhận qua email, đến quán tận hưởng</p>
			</div>
		</div>
	</div>
	<div class="bg-neutral text-neutral-content rounded-2xl p-6 lg:p-8 flex flex-col lg:flex-row items-center gap-5">
		<div class="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
			<Icon icon="solar:star-bold-duotone" class="text-3xl text-amber-300" />
		</div>
		<div class="flex-1 text-center lg:text-left">
			<h3 class="text-lg font-bold">Tích Điểm Mỗi Lần Đặt Phòng</h3>
			<p class="text-neutral-content/50 text-sm font-medium mt-1">Đăng ký thành viên miễn phí — hoàn điểm lên đến 12% trên mỗi đơn. Đổi điểm lấy giảm giá.</p>
		</div>
		<a href="/register" class="btn btn-primary rounded-xl font-bold px-6 shrink-0">
			<Icon icon="solar:user-plus-bold-duotone" class="text-lg"/>
			Đăng Ký
		</a>
	</div>
	<div class="text-center pb-2">
		<h2 class="text-lg font-black mb-2">Sẵn Sàng Hát Karaoke?</h2>
		<p class="text-xs text-base-content/40 font-medium mb-4">Đặt phòng ngay — chỉ mất 30 giây</p>
		<a href="#booking" class="btn btn-primary rounded-xl font-bold px-8">
			<Icon icon="solar:microphone-3-bold-duotone" class="text-xl"/>
			Đặt Phòng Ngay
		</a>
	</div>
</div>