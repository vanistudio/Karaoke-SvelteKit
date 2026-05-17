<script lang="ts">
	import { trpc } from '$lib/trpc/client';
	import Icon from '@iconify/svelte';
	import { addToast } from '$lib/stores/toast';

	type SettingEntry = { key: string; value: string; group: string };

	let activeTab = $state('general');
	let isReady = $state(false);
	let isSaving = $state(false);

	let generalSettings = $state<SettingEntry[]>([]);
	let loyaltySettings = $state<SettingEntry[]>([]);
	let bookingSettings = $state<SettingEntry[]>([]);

	const tabs = [
		{ id: 'general', label: 'Thông Tin Chung', icon: 'solar:buildings-line-duotone' },
		{ id: 'loyalty', label: 'Cấu Hình Tích Điểm', icon: 'solar:star-fall-line-duotone' },
		{ id: 'booking', label: 'Cấu Hình Đặt Phòng', icon: 'solar:calendar-mark-line-duotone' }
	];

	const labelMap: Record<string, string> = {
		site_name: 'Tên Hệ Thống',
		site_slogan: 'Slogan',
		site_phone: 'Số Điện Thoại',
		site_address: 'Địa Chỉ',
		site_email: 'Email Liên Hệ',
		site_open_time: 'Giờ Mở Cửa',
		site_close_time: 'Giờ Đóng Cửa',
		loyalty_bronze_threshold: 'Ngưỡng Hạng Đồng (VNĐ)',
		loyalty_silver_threshold: 'Ngưỡng Hạng Bạc (VNĐ)',
		loyalty_gold_threshold: 'Ngưỡng Hạng Vàng (VNĐ)',
		loyalty_diamond_threshold: 'Ngưỡng Hạng Kim Cương (VNĐ)',
		loyalty_bronze_rate: 'Tỷ Lệ Thưởng Đồng (0-1)',
		loyalty_silver_rate: 'Tỷ Lệ Thưởng Bạc (0-1)',
		loyalty_gold_rate: 'Tỷ Lệ Thưởng Vàng (0-1)',
		loyalty_diamond_rate: 'Tỷ Lệ Thưởng Kim Cương (0-1)',
		booking_min_hours: 'Thời Gian Tối Thiểu (Giờ)',
		booking_max_hours: 'Thời Gian Tối Đa (Giờ)',
		booking_cancel_policy: 'Chính Sách Hủy',
		booking_advance_days: 'Đặt Trước Tối Đa (Ngày)'
	};

	$effect(() => {
		loadData();
	});

	async function loadData() {
		try {
			const [g, l, b] = await Promise.all([
				trpc().setting.getByGroup.query('general'),
				trpc().setting.getByGroup.query('loyalty'),
				trpc().setting.getByGroup.query('booking')
			]);
			generalSettings = g;
			loyaltySettings = l;
			bookingSettings = b;
		} catch (e) {
			console.error(e);
		} finally {
			isReady = true;
		}
	}

	function getCurrentSettings(): SettingEntry[] {
		if (activeTab === 'general') return generalSettings;
		if (activeTab === 'loyalty') return loyaltySettings;
		return bookingSettings;
	}

	function updateValue(key: string, value: string) {
		if (activeTab === 'general') {
			generalSettings = generalSettings.map(s => s.key === key ? { ...s, value } : s);
		} else if (activeTab === 'loyalty') {
			loyaltySettings = loyaltySettings.map(s => s.key === key ? { ...s, value } : s);
		} else {
			bookingSettings = bookingSettings.map(s => s.key === key ? { ...s, value } : s);
		}
	}

	async function handleSave() {
		isSaving = true;
		try {
			const entries = getCurrentSettings();
			await trpc().setting.update.mutate(entries);
			window.dispatchEvent(new CustomEvent('site-settings-updated'));
			addToast('Lưu cài đặt thành công!', 'success');
		} catch (e: any) {
			addToast(e?.message || 'Có lỗi xảy ra.', 'error');
		} finally {
			isSaving = false;
		}
	}

	function getInputType(key: string): string {
		if (key.includes('time') && !key.includes('threshold')) return 'time';
		if (key.includes('threshold') || key.includes('hours') || key.includes('days')) return 'number';
		if (key.includes('rate')) return 'number';
		return 'text';
	}

	function getStep(key: string): string {
		if (key.includes('rate')) return '0.01';
		return '1';
	}
</script>

<svelte:head><title>Cài Đặt Hệ Thống | KaraSystem Admin</title></svelte:head>

{#if !isReady}
	<div class="flex items-center justify-center min-h-[50vh]">
		<span class="loading loading-spinner loading-lg text-primary"></span>
	</div>
{:else}
	<div class="flex flex-col gap-6">
		<div class="flex items-center justify-between">
			<div>
				<h2 class="text-xl font-bold">Cài Đặt Hệ Thống</h2>
				<p class="text-sm text-base-content/40 font-medium mt-0.5">Cấu hình thông tin quán, tích điểm, và quy tắc đặt phòng</p>
			</div>
			<button onclick={handleSave} class="btn btn-primary btn-sm rounded-lg font-bold text-xs" disabled={isSaving}>
				{#if isSaving}
					<span class="loading loading-spinner loading-sm"></span>
				{:else}
					<Icon icon="solar:diskette-line-duotone" class="text-lg"/>
				{/if}
				Lưu Thay Đổi
			</button>
		</div>

		<div class="flex gap-2 flex-wrap">
			{#each tabs as tab}
				<button
					onclick={() => activeTab = tab.id}
					class="btn btn-sm rounded-lg font-bold {activeTab === tab.id ? 'btn-primary' : 'btn-ghost'}"
				>
					<Icon icon={tab.icon} class="text-base"/>
					{tab.label}
				</button>
			{/each}
		</div>

		<div class="bg-base-100 rounded-xl border border-base-300/50 overflow-hidden">
			<div class="px-5 py-4 border-b border-base-200 flex items-center gap-2 text-sm font-bold text-base-content/60">
				<Icon icon={tabs.find(t => t.id === activeTab)?.icon || ''} class="text-base"/>
				{tabs.find(t => t.id === activeTab)?.label}
			</div>
			<div class="p-5">
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					{#each getCurrentSettings() as entry (entry.key)}
						<label class="form-control w-full {entry.key.includes('policy') ? 'md:col-span-2' : ''}">
							<div class="label">
								<span class="label-text font-bold text-xs uppercase tracking-widest text-base-content/50">
									{labelMap[entry.key] || entry.key}
								</span>
							</div>
							{#if entry.key.includes('policy')}
								<textarea
									value={entry.value}
									oninput={(e) => updateValue(entry.key, (e.target as HTMLTextAreaElement).value)}
									class="textarea textarea-bordered w-full rounded-lg text-sm font-medium"
									rows="3"
								></textarea>
							{:else}
								<input
									type={getInputType(entry.key)}
									value={entry.value}
									oninput={(e) => updateValue(entry.key, (e.target as HTMLInputElement).value)}
									step={getStep(entry.key)}
									class="input input-bordered w-full rounded-lg text-sm font-medium"
								/>
							{/if}
						</label>
					{/each}
				</div>
			</div>
		</div>

		{#if activeTab === 'loyalty'}
			<div class="bg-base-200/30 rounded-xl p-5 border border-base-300/30">
				<div class="flex items-center gap-2 text-sm font-bold text-base-content/50 mb-3">
					<Icon icon="solar:info-circle-line-duotone" class="text-base"/>
					Hướng Dẫn
				</div>
				<ul class="text-xs text-base-content/40 font-medium flex flex-col gap-1.5 list-disc list-inside">
					<li><span class="font-bold text-base-content/60">Ngưỡng hạng:</span> Tổng chi tiêu tích lũy để thăng hạng (VNĐ)</li>
					<li><span class="font-bold text-base-content/60">Tỷ lệ thưởng:</span> Phần trăm hoàn điểm trên mỗi đơn (0.02 = 2%, 0.12 = 12%)</li>
					<li>Thay đổi sẽ áp dụng cho các đơn hàng mới, không ảnh hưởng đơn cũ</li>
				</ul>
			</div>
		{/if}
	</div>
{/if}

