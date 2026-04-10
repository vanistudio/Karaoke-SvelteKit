<script lang="ts">
	import { trpc } from '$lib/trpc/client';
	import Icon from '@iconify/svelte';
	import { addToast } from '$lib/stores/toast';

	let promotions = $state<any[]>([]);
	let isReady = $state(false);
	let isSaving = $state(false);
	let isDeleting = $state(false);
	let filterStatus = $state('all');

	let form = $state({
		code: '',
		type: 'percent' as 'percent' | 'fixed',
		value: 10,
		minOrderAmount: 0,
		maxUsage: 100,
		expiresAt: '',
		isActive: true
	});
	let editTarget = $state<{ id: number } | null>(null);
	let deleteTarget = $state<{ id: number; code: string } | null>(null);

	$effect(() => {
		loadData();
	});

	async function loadData() {
		try {
			promotions = await trpc().promotion.list.query();
		} catch (e) {
			console.error(e);
		} finally {
			isReady = true;
		}
	}

	let filtered = $derived(
		filterStatus === 'all' ? promotions
		: filterStatus === 'active' ? promotions.filter(p => p.isActive && (!p.expiresAt || new Date(p.expiresAt) > new Date()))
		: filterStatus === 'expired' ? promotions.filter(p => p.expiresAt && new Date(p.expiresAt) <= new Date())
		: promotions.filter(p => !p.isActive)
	);

	let activeCount = $derived(promotions.filter(p => p.isActive && (!p.expiresAt || new Date(p.expiresAt) > new Date())).length);
	let expiredCount = $derived(promotions.filter(p => p.expiresAt && new Date(p.expiresAt) <= new Date()).length);
	let inactiveCount = $derived(promotions.filter(p => !p.isActive).length);

	function openCreateModal() {
		editTarget = null;
		form = { code: '', type: 'percent', value: 10, minOrderAmount: 0, maxUsage: 100, expiresAt: '', isActive: true };
		(document.getElementById('promo_modal') as HTMLDialogElement)?.showModal();
	}

	function openEditModal(p: any) {
		editTarget = { id: p.id };
		form = {
			code: p.code,
			type: p.type,
			value: p.value,
			minOrderAmount: p.minOrderAmount,
			maxUsage: p.maxUsage,
			expiresAt: p.expiresAt ? new Date(p.expiresAt).toISOString().slice(0, 16) : '',
			isActive: p.isActive
		};
		(document.getElementById('promo_modal') as HTMLDialogElement)?.showModal();
	}

	function closeModal() {
		editTarget = null;
		(document.getElementById('promo_modal') as HTMLDialogElement)?.close();
	}

	async function handleSave() {
		isSaving = true;
		try {
			const payload: any = {
				code: form.code,
				type: form.type,
				value: form.value,
				minOrderAmount: form.minOrderAmount,
				maxUsage: form.maxUsage,
				expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
				isActive: form.isActive
			};
			if (editTarget) {
				await trpc().promotion.update.mutate({ id: editTarget.id, ...payload });
				addToast('Cập nhật voucher thành công!', 'success');
			} else {
				await trpc().promotion.create.mutate(payload);
				addToast('Tạo voucher thành công!', 'success');
			}
			closeModal();
			await loadData();
		} catch (e: any) {
			addToast(e?.message || 'Có lỗi xảy ra.', 'error');
		} finally {
			isSaving = false;
		}
	}

	function openDeleteConfirm(p: any) {
		deleteTarget = { id: p.id, code: p.code };
		(document.getElementById('del_modal') as HTMLDialogElement)?.showModal();
	}

	async function handleDelete() {
		if (!deleteTarget) return;
		isDeleting = true;
		try {
			await trpc().promotion.delete.mutate(deleteTarget.id);
			addToast(`Đã xóa voucher "${deleteTarget.code}".`, 'success');
			(document.getElementById('del_modal') as HTMLDialogElement)?.close();
			deleteTarget = null;
			await loadData();
		} catch (e: any) {
			addToast(e?.message || 'Không thể xóa.', 'error');
		} finally {
			isDeleting = false;
		}
	}

	function fmtVND(v: number) {
		return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);
	}

	function fmtDate(d: string | Date | null) {
		if (!d) return '—';
		return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(d));
	}

	function isExpired(p: any) {
		return p.expiresAt && new Date(p.expiresAt) <= new Date();
	}

	function usagePercent(p: any) {
		if (!p.maxUsage) return 0;
		return Math.round((p.currentUsage / p.maxUsage) * 100);
	}
</script>

<svelte:head><title>Khuyến Mãi | KaraSystem Admin</title></svelte:head>

<div class="flex flex-col gap-6">
	<div class="flex items-center justify-between">
		<div>
			<h2 class="text-xl font-bold">Khuyến Mãi</h2>
			<p class="text-sm text-base-content/40 font-medium mt-0.5">Quản lý mã voucher và chương trình ưu đãi</p>
		</div>
		<button onclick={openCreateModal} class="btn btn-primary btn-sm rounded-lg font-bold text-xs">
			<Icon icon="solar:add-square-line-duotone" class="text-lg"/>
			Thêm Voucher
		</button>
	</div>

	<div class="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
		<div class="bg-base-100 rounded-xl border border-base-300/50 p-4 lg:p-5">
			<p class="text-[10px] font-bold text-base-content/40 uppercase tracking-widest">Tổng Voucher</p>
			<p class="text-2xl font-black mt-1">{promotions.length}</p>
		</div>
		<div class="bg-base-100 rounded-xl border border-base-300/50 p-4 lg:p-5">
			<p class="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Đang Hoạt Động</p>
			<p class="text-2xl font-black text-emerald-600 mt-1">{activeCount}</p>
		</div>
		<div class="bg-base-100 rounded-xl border border-base-300/50 p-4 lg:p-5">
			<p class="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Đã Hết Hạn</p>
			<p class="text-2xl font-black text-amber-600 mt-1">{expiredCount}</p>
		</div>
		<div class="bg-base-100 rounded-xl border border-base-300/50 p-4 lg:p-5">
			<p class="text-[10px] font-bold text-red-500 uppercase tracking-widest">Đã Tắt</p>
			<p class="text-2xl font-black text-red-500 mt-1">{inactiveCount}</p>
		</div>
	</div>

	<div class="flex gap-2 flex-wrap">
		<button onclick={() => filterStatus = 'all'} class="btn btn-xs rounded-lg font-bold {filterStatus === 'all' ? 'btn-primary' : 'btn-ghost'}">Tất Cả ({promotions.length})</button>
		<button onclick={() => filterStatus = 'active'} class="btn btn-xs rounded-lg font-bold {filterStatus === 'active' ? 'btn-success' : 'btn-ghost'}">Đang Hoạt Động ({activeCount})</button>
		<button onclick={() => filterStatus = 'expired'} class="btn btn-xs rounded-lg font-bold {filterStatus === 'expired' ? 'btn-warning' : 'btn-ghost'}">Hết Hạn ({expiredCount})</button>
		<button onclick={() => filterStatus = 'inactive'} class="btn btn-xs rounded-lg font-bold {filterStatus === 'inactive' ? 'btn-error text-white' : 'btn-ghost'}">Đã Tắt ({inactiveCount})</button>
	</div>

	<div class="bg-base-100 rounded-xl border border-base-300/50 overflow-hidden">
		<div class="overflow-x-auto">
			<table class="table table-sm">
				<thead>
					<tr class="text-[10px] uppercase tracking-widest text-base-content/30 bg-base-200/30">
						<th class="font-bold">ID</th>
						<th class="font-bold">Mã Voucher</th>
						<th class="font-bold">Loại</th>
						<th class="font-bold text-right">Giá Trị</th>
						<th class="font-bold text-right">Đơn Tối Thiểu</th>
						<th class="font-bold text-center">Lượt Dùng</th>
						<th class="font-bold">Hạn Dùng</th>
						<th class="font-bold text-center">Trạng Thái</th>
						<th class="font-bold text-right">Thao Tác</th>
					</tr>
				</thead>
				<tbody>
					{#if !isReady}
						<tr><td colspan="9" class="text-center py-12"><span class="loading loading-spinner text-primary"></span></td></tr>
					{:else if filtered.length === 0}
						<tr><td colspan="9" class="text-center py-12 text-base-content/30 font-medium">Không có voucher nào.</td></tr>
					{:else}
						{#each filtered as p}
							<tr class="hover">
								<td class="font-mono text-xs font-bold text-base-content/30">#{p.id}</td>
								<td class="font-mono text-sm font-black text-primary tracking-wider">{p.code}</td>
								<td>
									{#if p.type === 'percent'}
										<span class="badge badge-info badge-xs rounded-md font-bold">Phần Trăm</span>
									{:else}
										<span class="badge badge-accent badge-xs rounded-md font-bold">Cố Định</span>
									{/if}
								</td>
								<td class="text-right font-mono text-sm font-bold">{p.type === 'percent' ? `${p.value}%` : fmtVND(p.value)}</td>
								<td class="text-right font-mono text-xs font-medium text-base-content/50">{p.minOrderAmount > 0 ? fmtVND(p.minOrderAmount) : '—'}</td>
								<td class="text-center">
									<span class="text-xs font-bold">{p.currentUsage}/{p.maxUsage}</span>
									<div class="w-full bg-base-200 rounded-full h-1 mt-1">
										<div class="bg-primary rounded-full h-1 transition-all" style="width: {Math.min(usagePercent(p), 100)}%"></div>
									</div>
								</td>
								<td class="text-xs font-medium text-base-content/50">{fmtDate(p.expiresAt)}</td>
								<td class="text-center">
									{#if isExpired(p)}
										<span class="badge badge-warning badge-xs rounded-md font-bold">Hết Hạn</span>
									{:else if !p.isActive}
										<span class="badge badge-error badge-xs rounded-md font-bold text-white">Đã Tắt</span>
									{:else if p.currentUsage >= p.maxUsage}
										<span class="badge badge-ghost badge-xs rounded-md font-bold">Hết Lượt</span>
									{:else}
										<span class="badge badge-success badge-xs rounded-md font-bold">Hoạt Động</span>
									{/if}
								</td>
								<td class="text-right">
									<button onclick={() => openEditModal(p)} class="btn btn-xs btn-ghost btn-square text-blue-500 hover:bg-blue-500/10"><Icon icon="solar:pen-2-line-duotone" class="text-lg"/></button>
									<button onclick={() => openDeleteConfirm(p)} class="btn btn-xs btn-ghost btn-square text-red-500 hover:bg-red-500/10"><Icon icon="solar:trash-bin-trash-line-duotone" class="text-lg"/></button>
								</td>
							</tr>
						{/each}
					{/if}
				</tbody>
			</table>
		</div>
	</div>
</div>

<dialog id="promo_modal" class="modal">
	<div class="modal-box rounded-xl max-w-lg">
		<h3 class="font-bold text-lg mb-5 flex items-center gap-2">
			<Icon icon={editTarget ? 'solar:pen-2-line-duotone' : 'solar:tag-price-line-duotone'} class="text-xl {editTarget ? 'text-blue-500' : 'text-primary'}"/>
			{editTarget ? 'Chỉnh Sửa Voucher' : 'Thêm Voucher Mới'}
		</h3>
		<div class="flex flex-col gap-4">
			<label class="form-control w-full">
				<div class="label"><span class="label-text font-bold text-xs uppercase tracking-widest text-base-content/50">Mã Voucher</span></div>
				<input type="text" bind:value={form.code} placeholder="VD: KARA20, NEWYEAR..." class="input input-bordered w-full rounded-lg font-mono uppercase" />
			</label>
			<div class="grid grid-cols-2 gap-4">
				<label class="form-control w-full">
					<div class="label"><span class="label-text font-bold text-xs uppercase tracking-widest text-base-content/50">Loại Giảm</span></div>
					<select bind:value={form.type} class="select select-bordered w-full rounded-lg text-sm font-medium">
						<option value="percent">Phần Trăm (%)</option>
						<option value="fixed">Cố Định (VNĐ)</option>
					</select>
				</label>
				<label class="form-control w-full">
					<div class="label"><span class="label-text font-bold text-xs uppercase tracking-widest text-base-content/50">{form.type === 'percent' ? 'Giá Trị (%)' : 'Giá Trị (VNĐ)'}</span></div>
					<input type="number" bind:value={form.value} min="1" class="input input-bordered w-full rounded-lg font-mono" />
				</label>
			</div>
			<div class="grid grid-cols-2 gap-4">
				<label class="form-control w-full">
					<div class="label"><span class="label-text font-bold text-xs uppercase tracking-widest text-base-content/50">Đơn Tối Thiểu (VNĐ)</span></div>
					<input type="number" bind:value={form.minOrderAmount} min="0" class="input input-bordered w-full rounded-lg font-mono" />
				</label>
				<label class="form-control w-full">
					<div class="label"><span class="label-text font-bold text-xs uppercase tracking-widest text-base-content/50">Số Lượt Dùng</span></div>
					<input type="number" bind:value={form.maxUsage} min="1" class="input input-bordered w-full rounded-lg font-mono" />
				</label>
			</div>
			<label class="form-control w-full">
				<div class="label"><span class="label-text font-bold text-xs uppercase tracking-widest text-base-content/50">Hạn Sử Dụng</span></div>
				<input type="datetime-local" bind:value={form.expiresAt} class="input input-bordered w-full rounded-lg text-sm font-medium" />
			</label>
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

<dialog id="del_modal" class="modal">
	<div class="modal-box rounded-xl max-w-sm">
		<h3 class="font-bold text-lg mb-2 flex items-center gap-2 text-red-500">
			<Icon icon="solar:trash-bin-trash-line-duotone" class="text-xl"/>
			Xác Nhận Xóa
		</h3>
		{#if deleteTarget}
			<p class="text-sm text-base-content/50 leading-relaxed">Xóa voucher <span class="font-bold font-mono text-base-content">"{deleteTarget.code}"</span>? Hành động không thể hoàn tác.</p>
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
