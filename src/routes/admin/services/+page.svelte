<script lang="ts">
	import { trpc } from '$lib/trpc/client';
	import Icon from '@iconify/svelte';
	import { addToast } from '$lib/stores/toast';

	let services = $state<any[]>([]);
	let isReady = $state(false);
	let isSaving = $state(false);
	let isDeleting = $state(false);
	let filterCategory = $state('all');

	let form = $state({ name: '', category: 'food', price: 10000, description: '', isAvailable: true });
	let editTarget = $state<{ id: number } | null>(null);
	let deleteTarget = $state<{ id: number; name: string } | null>(null);

	$effect(() => {
		loadData();
	});

	async function loadData() {
		try {
			services = await trpc().service.list.query();
		} catch (e) {
			console.error(e);
		} finally {
			isReady = true;
		}
	}

	let filtered = $derived(
		filterCategory === 'all' ? services : services.filter(s => s.category === filterCategory)
	);

	function openCreateModal() {
		editTarget = null;
		form = { name: '', category: 'food', price: 10000, description: '', isAvailable: true };
		(document.getElementById('svc_modal') as HTMLDialogElement)?.showModal();
	}

	function openEditModal(s: any) {
		editTarget = { id: s.id };
		form = { name: s.name, category: s.category, price: s.price, description: s.description || '', isAvailable: s.isAvailable };
		(document.getElementById('svc_modal') as HTMLDialogElement)?.showModal();
	}

	function closeModal() {
		editTarget = null;
		(document.getElementById('svc_modal') as HTMLDialogElement)?.close();
	}

	async function handleSave() {
		isSaving = true;
		try {
			if (editTarget) {
				await trpc().service.update.mutate({ id: editTarget.id, name: form.name, category: form.category as any, price: form.price, description: form.description || undefined, isAvailable: form.isAvailable });
				addToast('Cập nhật dịch vụ thành công!', 'success');
			} else {
				await trpc().service.create.mutate({ name: form.name, category: form.category as any, price: form.price, description: form.description || undefined, isAvailable: form.isAvailable });
				addToast('Thêm dịch vụ thành công!', 'success');
			}
			closeModal();
			await loadData();
		} catch (e: any) {
			addToast(e?.message || 'Có lỗi xảy ra.', 'error');
		} finally {
			isSaving = false;
		}
	}

	function openDeleteConfirm(s: any) {
		deleteTarget = { id: s.id, name: s.name };
		(document.getElementById('del_modal') as HTMLDialogElement)?.showModal();
	}

	async function handleDelete() {
		if (!deleteTarget) return;
		isDeleting = true;
		try {
			await trpc().service.delete.mutate(deleteTarget.id);
			addToast(`Đã xóa "${deleteTarget.name}".`, 'success');
			(document.getElementById('del_modal') as HTMLDialogElement)?.close();
			deleteTarget = null;
			await loadData();
		} catch (e: any) {
			addToast(e?.message || 'Không thể xóa dịch vụ.', 'error');
		} finally {
			isDeleting = false;
		}
	}

	const catLabel: Record<string, string> = { food: 'Đồ Ăn', drink: 'Thức Uống', decoration: 'Trang Trí', other: 'Khác' };
	const catIcon: Record<string, string> = { food: 'solar:chef-hat-heart-line-duotone', drink: 'solar:wineglass-triangle-line-duotone', decoration: 'solar:star-shine-line-duotone', other: 'solar:box-line-duotone' };
	const catCls: Record<string, string> = { food: 'badge-warning', drink: 'badge-info', decoration: 'badge-secondary', other: 'badge-ghost' };

	function fmtVND(v: number) {
		return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);
	}
</script>

<svelte:head><title>Menu Dịch Vụ | KaraSystem Admin</title></svelte:head>

<div class="flex flex-col gap-6">
	<div class="flex items-center justify-between">
		<div>
			<h2 class="text-xl font-bold">Menu Dịch Vụ</h2>
			<p class="text-sm text-base-content/40 font-medium mt-0.5">{services.length} mục trong hệ thống</p>
		</div>
		<button onclick={openCreateModal} class="btn btn-primary btn-sm rounded-lg font-bold text-xs">
			<Icon icon="solar:add-square-line-duotone" class="text-lg"/>
			Thêm Dịch Vụ
		</button>
	</div>

	<div class="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
		<div class="bg-base-100 rounded-xl border border-base-300/50 p-4 lg:p-5">
			<p class="text-[10px] font-bold text-base-content/40 uppercase tracking-widest">Tổng Mục</p>
			<p class="text-2xl font-black mt-1">{services.length}</p>
		</div>
		<div class="bg-base-100 rounded-xl border border-base-300/50 p-4 lg:p-5">
			<p class="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Đang Bán</p>
			<p class="text-2xl font-black text-emerald-600 mt-1">{services.filter(s => s.isAvailable).length}</p>
		</div>
		<div class="bg-base-100 rounded-xl border border-base-300/50 p-4 lg:p-5">
			<p class="text-[10px] font-bold text-red-500 uppercase tracking-widest">Ngừng Bán</p>
			<p class="text-2xl font-black text-red-500 mt-1">{services.filter(s => !s.isAvailable).length}</p>
		</div>
		<div class="bg-base-100 rounded-xl border border-base-300/50 p-4 lg:p-5">
			<p class="text-[10px] font-bold text-base-content/40 uppercase tracking-widest">Danh Mục</p>
			<p class="text-2xl font-black mt-1">{new Set(services.map(s => s.category)).size}</p>
		</div>
	</div>

	<div class="flex gap-2 flex-wrap">
		<button onclick={() => filterCategory = 'all'} class="btn btn-xs rounded-lg font-bold {filterCategory === 'all' ? 'btn-primary' : 'btn-ghost'}">Tất Cả ({services.length})</button>
		{#each Object.entries(catLabel) as [key, label]}
			{@const cnt = services.filter(s => s.category === key).length}
			<button onclick={() => filterCategory = key} class="btn btn-xs rounded-lg font-bold {filterCategory === key ? 'btn-primary' : 'btn-ghost'}">
				<Icon icon={catIcon[key]} class="text-sm"/>
				{label} ({cnt})
			</button>
		{/each}
	</div>

	<div class="bg-base-100 rounded-xl border border-base-300/50 overflow-hidden">
		<div class="overflow-x-auto">
			<table class="table table-sm">
				<thead>
					<tr class="text-[10px] uppercase tracking-widest text-base-content/30 bg-base-200/30">
						<th class="font-bold">ID</th>
						<th class="font-bold">Tên Dịch Vụ</th>
						<th class="font-bold">Danh Mục</th>
						<th class="font-bold text-right">Đơn Giá</th>
						<th class="font-bold text-center">Trạng Thái</th>
						<th class="font-bold text-right">Thao Tác</th>
					</tr>
				</thead>
				<tbody>
					{#if !isReady}
						<tr><td colspan="6" class="text-center py-12"><span class="loading loading-spinner text-primary"></span></td></tr>
					{:else if filtered.length === 0}
						<tr><td colspan="6" class="text-center py-12 text-base-content/30 font-medium">Không có dịch vụ nào.</td></tr>
					{:else}
						{#each filtered as s}
							<tr class="hover">
								<td class="font-mono text-xs font-bold text-base-content/30">#{s.id}</td>
								<td>
									<div class="flex flex-col">
										<span class="font-bold text-sm">{s.name}</span>
										{#if s.description}
											<span class="text-[11px] text-base-content/30 max-w-[200px] truncate">{s.description}</span>
										{/if}
									</div>
								</td>
								<td><span class="badge badge-xs rounded-md font-bold uppercase {catCls[s.category] || 'badge-ghost'}">{catLabel[s.category] || s.category}</span></td>
								<td class="text-right font-mono text-sm font-bold text-primary">{fmtVND(s.price)}</td>
								<td class="text-center">
									{#if s.isAvailable}
										<span class="badge badge-success badge-xs rounded-md font-bold">Đang Bán</span>
									{:else}
										<span class="badge badge-error badge-xs rounded-md font-bold text-white">Ngừng</span>
									{/if}
								</td>
								<td class="text-right">
									<button onclick={() => openEditModal(s)} class="btn btn-xs btn-ghost btn-square text-blue-500 hover:bg-blue-500/10"><Icon icon="solar:pen-2-line-duotone" class="text-lg"/></button>
									<button onclick={() => openDeleteConfirm(s)} class="btn btn-xs btn-ghost btn-square text-red-500 hover:bg-red-500/10"><Icon icon="solar:trash-bin-trash-line-duotone" class="text-lg"/></button>
								</td>
							</tr>
						{/each}
					{/if}
				</tbody>
			</table>
		</div>
	</div>
</div>

<dialog id="svc_modal" class="modal">
	<div class="modal-box rounded-xl max-w-lg">
		<h3 class="font-bold text-lg mb-5 flex items-center gap-2">
			<Icon icon={editTarget ? 'solar:pen-2-line-duotone' : 'solar:wineglass-triangle-line-duotone'} class="text-xl {editTarget ? 'text-blue-500' : 'text-primary'}"/>
			{editTarget ? 'Chỉnh Sửa Dịch Vụ' : 'Thêm Dịch Vụ Mới'}
		</h3>
		<div class="flex flex-col gap-4">
			<label class="form-control w-full">
				<div class="label"><span class="label-text font-bold text-xs uppercase tracking-widest text-base-content/50">Tên Dịch Vụ</span></div>
				<input type="text" bind:value={form.name} placeholder="VD: Bia Tiger, Trái Cây..." class="input input-bordered w-full rounded-lg" />
			</label>
			<div class="grid grid-cols-2 gap-4">
				<label class="form-control w-full">
					<div class="label"><span class="label-text font-bold text-xs uppercase tracking-widest text-base-content/50">Danh Mục</span></div>
					<select bind:value={form.category} class="select select-bordered w-full rounded-lg text-sm font-medium">
						<option value="food">Đồ Ăn</option>
						<option value="drink">Thức Uống</option>
						<option value="decoration">Trang Trí</option>
						<option value="other">Khác</option>
					</select>
				</label>
				<label class="form-control w-full">
					<div class="label"><span class="label-text font-bold text-xs uppercase tracking-widest text-base-content/50">Đơn Giá (VNĐ)</span></div>
					<input type="number" bind:value={form.price} min="1000" class="input input-bordered w-full rounded-lg font-mono" />
				</label>
			</div>
			<label class="form-control w-full">
				<div class="label"><span class="label-text font-bold text-xs uppercase tracking-widest text-base-content/50">Mô Tả</span></div>
				<textarea bind:value={form.description} placeholder="Mô tả ngắn (tùy chọn)..." class="textarea textarea-bordered w-full rounded-lg" rows="2"></textarea>
			</label>
			<div class="form-control">
				<label class="label cursor-pointer justify-start gap-3">
					<input type="checkbox" bind:checked={form.isAvailable} class="toggle toggle-primary toggle-sm" />
					<span class="label-text font-bold text-sm">Đang mở bán</span>
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
			<p class="text-sm text-base-content/50 leading-relaxed">Xóa dịch vụ <span class="font-bold text-base-content">"{deleteTarget.name}"</span>? Hành động không thể hoàn tác.</p>
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
