<script lang="ts">
	import { trpc } from '$lib/trpc/client';
	import Icon from '@iconify/svelte';
	import DatePicker from '$lib/components/ui/DatePicker.svelte';
	import TimePicker from '$lib/components/ui/TimePicker.svelte';

	let isReady = $state(false);
	
	let selectedDate = $state(new Date());
	let selectedTime = $state('19:00');

	$effect(() => {
		trpc().healthcheck.query().then(() => isReady = true).catch(() => isReady = false);
	});
</script><div class="flex flex-col gap-8">
	<div class="bg-base-200 rounded-md py-10 px-6 border border-base-300">
		<div class="text-center w-full max-w-3xl mx-auto">
			<div class="badge badge-primary rounded-md mb-4 tracking-widest font-bold font-mono px-4 py-3">ĐẶT PHÒNG KHÁCH HÀNG</div>
			<h1 class="text-3xl lg:text-4xl font-black uppercase tracking-tight text-base-content mb-4 leading-tight">
				Hệ Thống Đặt Phòng Trực Tuyến
			</h1>
			<p class="py-2 text-base-content/70 font-medium">Lựa chọn thời gian, phân loại phòng. Hệ thống tự động ghép phòng và xác nhận đặt chỗ.</p>
		</div>
	</div>
	<div class="card bg-base-100 rounded-md border border-base-300 w-full">
		<div class="card-body p-6 lg:p-8">
			<h2 class="card-title text-2xl font-bold uppercase tracking-widest mb-1 flex items-center gap-2">
				<Icon icon="solar:calendar-search-broken" class="text-primary text-3xl"/>
				Tra Cứu Khả Dụng
			</h2>
			<p class="text-base-content/50 text-sm mb-6">Xin vui lòng điền thông tin bên dưới để kiểm tra tình trạng phòng trống.</p>
			<div class="flex flex-col xl:flex-row gap-5">
				<div class="form-control w-full">
					<div class="label"><span class="label-text font-bold uppercase tracking-widest text-xs">Ngày Phục Vụ</span></div>
					<DatePicker bind:value={selectedDate} />
				</div>
				<div class="form-control w-full">
					<div class="label"><span class="label-text font-bold uppercase tracking-widest text-xs">Giờ Tới</span></div>
					<TimePicker bind:value={selectedTime} />
				</div>
				<div class="form-control w-full">
					<div class="label"><span class="label-text font-bold uppercase tracking-widest text-xs">Phân Loại Phòng (Group)</span></div>
					<select class="select select-bordered rounded-md border-base-300 w-full">
						<option disabled selected>-- Quy mô nhóm --</option>
						<option>Phòng Tiêu Chuẩn (1-5 Khách)</option>
						<option>Phòng TrungVIP (5-12 Khách)</option>
						<option>Phòng Party Lớn (15+ Khách)</option>
					</select>
				</div>
			</div>
			<div class="card-actions justify-end mt-8 border-t border-base-200 pt-6">
				<button class="btn btn-primary rounded-md font-bold tracking-widest uppercase px-8">
					<Icon icon="solar:magic-stick-3-line-duotone" class="text-xl" />
					Tìm Phòng Trống
				</button>
			</div>
		</div>
	</div>
	<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
		<div class="card bg-base-100 rounded-md border border-base-300">
			<div class="card-body">
				<div class="w-12 h-12 rounded-md bg-base-200 flex items-center justify-center mb-4 text-primary">
					<Icon icon="solar:crown-star-line-duotone" class="text-3xl" />
				</div>
				<h3 class="card-title text-lg font-bold tracking-wide">Giải Trí Chuẩn VIP</h3>
				<p class="text-base-content/60 text-sm mt-2">Dàn âm thanh siêu trầm, kết nối nhạc Youtube/Spotify không giới hạn.</p>
			</div>
		</div>
		<div class="card bg-base-100 rounded-md border border-base-300">
			<div class="card-body">
				<div class="w-12 h-12 rounded-md bg-base-200 flex items-center justify-center mb-4 text-secondary">
					<Icon icon="solar:chef-hat-line-duotone" class="text-3xl" />
				</div>
				<h3 class="card-title text-lg font-bold tracking-wide">Ẩm Thực Đặc Sắc</h3>
				<p class="text-base-content/60 text-sm mt-2">Đa dạng từ món ăn nhẹ đến bữa tiệc nướng sành điệu, kết hợp quầy pha chế.</p>
			</div>
		</div>
		<div class="card bg-base-100 rounded-md border border-base-300">
			<div class="card-body">
				<div class="w-12 h-12 rounded-md bg-base-200 flex items-center justify-center mb-4 text-accent">
					<Icon icon="solar:map-point-wave-line-duotone" class="text-3xl" />
				</div>
				<h3 class="card-title text-lg font-bold tracking-wide">Vị Trí Trung Tâm</h3>
				<p class="text-base-content/60 text-sm mt-2">Bãi đậu xe rộng rãi an toàn, sảnh chờ sang trọng, đa dạng không gian VIP.</p>
			</div>
		</div>
	</div>
</div>