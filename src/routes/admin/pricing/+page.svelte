<script lang="ts">
	import { trpc } from '$lib/trpc/client';
	import Icon from '@iconify/svelte';
	import { addToast } from '$lib/stores/toast';

	let rules = $state<any[]>([]);
	let isReady = $state(false);
	let isSaving = $state(false);
	let isDeleting = $state(false);

	let form = $state({
		name: '',
		type: 'time_block' as 'time_block' | 'holiday',
		startTime: '18:00',
		endTime: '22:00',
		date: '',
		daysOfWeek: [] as number[],
		multiplier: 1.5,
		isActive: true
	});
	let editTarget = $state<{ id: number } | null>(null);
	let deleteTarget = $state<{ id: number; name: string } | null>(null);

	const dayLabels = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

	$effect(() => {
		loadData();
	});

	async function loadData() {
		try {
			rules = await trpc().pricing.list.query();
		} catch (e) {
			console.error(e);
		} finally {
			isReady = true;
		}
	}

	function openCreateModal() {
		editTarget = null;
		form = { name: '', type: 'time_block', startTime: '18:00', endTime: '22:00', date: '', daysOfWeek: [], multiplier: 1.5, isActive: true };
		(document.getElementById('pricing_modal') as HTMLDialogElement)?.showModal();
	}

	function openEditModal(r: any) {
		editTarget = { id: r.id };
		form = {
			name: r.name,
			type: r.type,
			startTime: r.startTime || '18:00',
			endTime: r.endTime || '22:00',
			date: r.date || '',
			daysOfWeek: r.daysOfWeek || [],
			multiplier: r.multiplier,
			isActive: r.isActive
		};
		(document.getElementById('pricing_modal') as HTMLDialogElement)?.showModal();
	}

	function closeModal() {
		editTarget = null;
		(document.getElementById('pricing_modal') as HTMLDialogElement)?.close();
	}

	async function handleSave() {
		isSaving = true;
		try {
			const payload: any = {
				name: form.name,
				type: form.type,
				multiplier: form.multiplier,
				isActive: form.isActive
			};

			if (form.type === 'time_block') {
				payload.startTime = form.startTime;
				payload.endTime = form.endTime;
				payload.daysOfWeek = form.daysOfWeek.length > 0 ? form.daysOfWeek : null;
				payload.date = null;
			} else {
				payload.date = form.date;
				payload.startTime = null;
				payload.endTime = null;
				payload.daysOfWeek = null;
			}

			if (editTarget) {
				await trpc().pricing.update.mutate({ id: editTarget.id, ...payload });
				addToast('Cập nhật quy tắc giá thành công!', 'success');
			} else {
				await trpc().pricing.create.mutate(payload);
				addToast('Tạo quy tắc giá thành công!', 'success');
			}
			closeModal();
			await loadData();
		} catch (e: any) {
			addToast(e?.message || 'Có lỗi xảy ra.', 'error');
		} finally {
			isSaving = false;
		}
	}

	function openDeleteConfirm(r: any) {
		deleteTarget = { id: r.id, name: r.name };
		(document.getElementById('del_pricing_modal') as HTMLDialogElement)?.showModal();
	}

	async function handleDelete() {
		if (!deleteTarget) return;
		isDeleting = true;
		try {
			await trpc().pricing.delete.mutate(deleteTarget.id);
			addToast(`Đã xóa quy tắc "${deleteTarget.name}".`, 'success');
			(document.getElementById('del_pricing_modal') as HTMLDialogElement)?.close();
			deleteTarget = null;
			await loadData();
		} catch (e: any) {
			addToast(e?.message || 'Không thể xóa.', 'error');
		} finally {
			isDeleting = false;
		}
	}

	function toggleDay(day: number) {
		if (form.daysOfWeek.includes(day)) {
			form.daysOfWeek = form.daysOfWeek.filter(d => d !== day);
		} else {
			form.daysOfWeek = [...form.daysOfWeek, day];
		}
	}

	function formatMultiplier(m: number) {
		if (m === 1) return 'Giá gốc';
		return `×${m.toFixed(1)}`;
	}
</script>

<svelte:head><title>Bảng Giá Nâng Cao | KaraSystem Admin</title></svelte:head>

{#if !isReady}
	<div class="flex items-center justify-center min-h-[50vh]">
		<span class="loading loading-spinner loading-lg text-primary"></span>
	</div>
{:else}
	<div class="flex flex-col gap-6">
		<div class="flex items-center justify-between">
			<div>
				<h2 class="text-xl font-bold">Bảng Giá Nâng Cao</h2>
				<p class="text-sm text-base-content/40 font-medium mt-0.5">Cấu hình giá theo khung giờ và ngày lễ</p>
			</div>
			<button onclick={openCreateModal} class="btn btn-primary btn-sm rounded-lg font-bold text-xs">
				<Icon icon="solar:add-square-line-duotone" class="text-lg"/>
				Thêm Quy Tắc
			</button>
		</div>

		<div class="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
			<div class="bg-base-100 rounded-xl border border-base-300/50 p-4 lg:p-5">
				<p class="text-[10px] font-bold text-base-content/40 uppercase tracking-widest">Tổng Quy Tắc</p>
				<p class="text-2xl font-black mt-1">{rules.length}</p>
			</div>
			<div class="bg-base-100 rounded-xl border border-base-300/50 p-4 lg:p-5">
				<p class="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Đang Hoạt Động</p>
				<p class="text-2xl font-black text-emerald-600 mt-1">{rules.filter(r => r.isActive).length}</p>
			</div>
			<div class="bg-base-100 rounded-xl border border-base-300/50 p-4 lg:p-5">
				<p class="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Khung Giờ</p>
				<p class="text-2xl font-black text-blue-500 mt-1">{rules.filter(r => r.type === 'time_block').length}</p>
			</div>
			<div class="bg-base-100 rounded-xl border border-base-300/50 p-4 lg:p-5">
				<p class="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Ngày Lễ</p>
				<p class="text-2xl font-black text-amber-600 mt-1">{rules.filter(r => r.type === 'holiday').length}</p>
			</div>
		</div>

		<div class="bg-base-100 rounded-xl border border-base-300/50 overflow-hidden">
			<div class="overflow-x-auto">
				<table class="table table-sm">
					<thead>
						<tr class="text-[10px] uppercase tracking-widest text-base-content/30 bg-base-200/30">
							<th class="font-bold">ID</th>
							<th class="font-bold">Tên Quy Tắc</th>
							<th class="font-bold">Loại</th>
							<th class="font-bold">Điều Kiện</th>
							<th class="font-bold text-center">Hệ Số Giá</th>
							<th class="font-bold text-center">Trạng Thái</th>
							<th class="font-bold text-right">Thao Tác</th>
						</tr>
					</thead>
					<tbody>
						{#if rules.length === 0}
							<tr><td colspan="7" class="text-center py-12 text-base-content/30 font-medium">Chưa có quy tắc giá nào.</td></tr>
						{:else}
							{#each rules as r}
								<tr class="hover">
									<td class="font-mono text-xs font-bold text-base-content/30">#{r.id}</td>
									<td class="font-semibold text-sm">{r.name}</td>
									<td>
										{#if r.type === 'time_block'}
											<span class="badge badge-info badge-xs rounded-md font-bold">Khung Giờ</span>
										{:else}
											<span class="badge badge-warning badge-xs rounded-md font-bold">Ngày Lễ</span>
										{/if}
									</td>
									<td class="text-xs font-medium text-base-content/50">
										{#if r.type === 'time_block'}
											{r.startTime?.slice(0, 5)} — {r.endTime?.slice(0, 5)}
											{#if r.daysOfWeek && r.daysOfWeek.length > 0}
												<span class="ml-1 text-primary">({r.daysOfWeek.map((d: number) => dayLabels[d]).join(', ')})</span>
											{/if}
										{:else}
											{r.date || '—'}
										{/if}
									</td>
									<td class="text-center">
										<span class="font-mono text-sm font-black {r.multiplier > 1 ? 'text-amber-600' : r.multiplier < 1 ? 'text-emerald-600' : 'text-base-content/50'}">
											{formatMultiplier(r.multiplier)}
										</span>
									</td>
									<td class="text-center">
										{#if r.isActive}
											<span class="badge badge-success badge-xs rounded-md font-bold">Bật</span>
										{:else}
											<span class="badge badge-ghost badge-xs rounded-md font-bold">Tắt</span>
										{/if}
									</td>
									<td class="text-right">
										<button onclick={() => openEditModal(r)} class="btn btn-xs btn-ghost btn-square text-blue-500 hover:bg-blue-500/10"><Icon icon="solar:pen-2-line-duotone" class="text-lg"/></button>
										<button onclick={() => openDeleteConfirm(r)} class="btn btn-xs btn-ghost btn-square text-red-500 hover:bg-red-500/10"><Icon icon="solar:trash-bin-trash-line-duotone" class="text-lg"/></button>
									</td>
								</tr>
							{/each}
						{/if}
					</tbody>
				</table>
			</div>
		</div>

		<div class="bg-base-200/30 rounded-xl p-5 border border-base-300/30">
			<div class="flex items-center gap-2 text-sm font-bold text-base-content/50 mb-3">
				<Icon icon="solar:info-circle-line-duotone" class="text-base"/>
				Cách Hoạt Động
			</div>
			<ul class="text-xs text-base-content/40 font-medium flex flex-col gap-1.5 list-disc list-inside">
				<li><span class="font-bold text-base-content/60">Khung Giờ:</span> Áp dụng hệ số nhân giá trong khoảng thời gian cụ thể (VD: 18:00-22:00 = Giờ Vàng ×1.5)</li>
				<li><span class="font-bold text-base-content/60">Ngày Lễ:</span> Áp dụng hệ số nhân giá cho toàn bộ ngày (VD: Tết, Noel)</li>
				<li><span class="font-bold text-base-content/60">Hệ số:</span> ×1.0 = giá gốc, ×1.5 = tăng 50%, ×0.8 = giảm 20%</li>
				<li>Nếu nhiều quy tắc trùng nhau, hệ thống lấy hệ số <span class="font-bold text-base-content/60">cao nhất</span></li>
			</ul>
		</div>
	</div>
{/if}

<dialog id="pricing_modal" class="modal">
	<div class="modal-box rounded-xl max-w-lg">
		<h3 class="font-bold text-lg mb-5 flex items-center gap-2">
			<Icon icon={editTarget ? 'solar:pen-2-line-duotone' : 'solar:dollar-minimalistic-line-duotone'} class="text-xl {editTarget ? 'text-blue-500' : 'text-primary'}"/>
			{editTarget ? 'Chỉnh Sửa Quy Tắc' : 'Thêm Quy Tắc Giá'}
		</h3>
		<div class="flex flex-col gap-4">
			<label class="form-control w-full">
				<div class="label"><span class="label-text font-bold text-xs uppercase tracking-widest text-base-content/50">Tên Quy Tắc</span></div>
				<input type="text" bind:value={form.name} placeholder="VD: Giờ Vàng, Tết Nguyên Đán..." class="input input-bordered w-full rounded-lg" />
			</label>

			<div class="grid grid-cols-2 gap-4">
				<label class="form-control w-full">
					<div class="label"><span class="label-text font-bold text-xs uppercase tracking-widest text-base-content/50">Loại</span></div>
					<select bind:value={form.type} class="select select-bordered w-full rounded-lg text-sm font-medium">
						<option value="time_block">Khung Giờ</option>
						<option value="holiday">Ngày Lễ</option>
					</select>
				</label>
				<label class="form-control w-full">
					<div class="label"><span class="label-text font-bold text-xs uppercase tracking-widest text-base-content/50">Hệ Số Nhân Giá</span></div>
					<input type="number" bind:value={form.multiplier} min="0.1" max="10" step="0.1" class="input input-bordered w-full rounded-lg font-mono" />
				</label>
			</div>

			{#if form.type === 'time_block'}
				<div class="grid grid-cols-2 gap-4">
					<label class="form-control w-full">
						<div class="label"><span class="label-text font-bold text-xs uppercase tracking-widest text-base-content/50">Giờ Bắt Đầu</span></div>
						<input type="time" bind:value={form.startTime} class="input input-bordered w-full rounded-lg text-sm font-medium" />
					</label>
					<label class="form-control w-full">
						<div class="label"><span class="label-text font-bold text-xs uppercase tracking-widest text-base-content/50">Giờ Kết Thúc</span></div>
						<input type="time" bind:value={form.endTime} class="input input-bordered w-full rounded-lg text-sm font-medium" />
					</label>
				</div>
				<div class="form-control">
					<div class="label"><span class="label-text font-bold text-xs uppercase tracking-widest text-base-content/50">Áp Dụng Ngày (Bỏ trống = Tất cả)</span></div>
					<div class="flex gap-2 flex-wrap">
						{#each dayLabels as label, i}
							<button
								type="button"
								onclick={() => toggleDay(i)}
								class="btn btn-xs rounded-lg font-bold min-w-[40px] {form.daysOfWeek.includes(i) ? 'btn-primary' : 'btn-ghost'}"
							>
								{label}
							</button>
						{/each}
					</div>
				</div>
			{:else}
				<label class="form-control w-full">
					<div class="label"><span class="label-text font-bold text-xs uppercase tracking-widest text-base-content/50">Ngày Áp Dụng</span></div>
					<input type="date" bind:value={form.date} class="input input-bordered w-full rounded-lg text-sm font-medium" />
				</label>
			{/if}

			<div class="form-control">
				<label class="label cursor-pointer justify-start gap-3">
					<input type="checkbox" bind:checked={form.isActive} class="toggle toggle-primary toggle-sm" />
					<span class="label-text font-bold text-sm">Kích hoạt ngay</span>
				</label>
			</div>

			<div class="modal-action border-t border-base-200 pt-4">
				<button onclick={closeModal} class="btn btn-ghost rounded-lg font-medium" disabled={isSaving}>Hủy</button>
				<button onclick={handleSave} class="btn {editTarget ? 'btn-info text-white' : 'btn-primary'} rounded-lg font-bold px-8" disabled={isSaving}>
					{#if isSaving}<span class="loading loading-spinner loading-sm"></span>{:else}{editTarget ? 'Cập Nhật' : 'Tạo Mới'}{/if}
				</button>
			</div>
		</div>
	</div>
	<form method="dialog" class="modal-backdrop"><button>close</button></form>
</dialog>

<dialog id="del_pricing_modal" class="modal">
	<div class="modal-box rounded-xl max-w-sm">
		<h3 class="font-bold text-lg mb-2 flex items-center gap-2 text-red-500">
			<Icon icon="solar:trash-bin-trash-line-duotone" class="text-xl"/>
			Xác Nhận Xóa
		</h3>
		{#if deleteTarget}
			<p class="text-sm text-base-content/50 leading-relaxed">Xóa quy tắc <span class="font-bold text-base-content">"{deleteTarget.name}"</span>? Hành động không thể hoàn tác.</p>
			<div class="modal-action border-t border-base-200 pt-4">
				<form method="dialog"><button class="btn btn-ghost rounded-lg font-medium" disabled={isDeleting}>Giữ Lại</button></form>
				<button onclick={handleDelete} class="btn btn-error text-white rounded-lg font-bold px-8" disabled={isDeleting}>
					{#if isDeleting}<span class="loading loading-spinner loading-sm"></span>{:else}Xóa{/if}
				</button>
			</div>
		{/if}
	</div>
	<form method="dialog" class="modal-backdrop"><button>close</button></form>
</dialog>
