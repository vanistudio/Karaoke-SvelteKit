<script lang="ts">
	import { trpc } from '$lib/trpc/client';
	import Icon from '@iconify/svelte';
	import { addToast } from '$lib/stores/toast';

	let rooms = $state<any[]>([]);
	let isReady = $state(false);
	let isSaving = $state(false);
	let isDeleting = $state(false);

	let form = $state({ name: '', capacity: 5, type: 'standard', pricePerHour: 100000 });
	let editTarget = $state<{ id: number; name: string; capacity: number; type: string; pricePerHour: number } | null>(null);
	let deleteTarget = $state<{ id: number; name: string } | null>(null);

	$effect(() => {
		loadData();
	});

	async function loadData() {
		try {
			rooms = await trpc().room.list.query();
		} catch (e) {
			console.error(e);
		} finally {
			isReady = true;
		}
	}

	function openCreateModal() {
		form = { name: '', capacity: 5, type: 'standard', pricePerHour: 100000 };
		(document.getElementById('room_modal') as HTMLDialogElement)?.showModal();
	}

	function openEditModal(r: any) {
		editTarget = { id: r.id, name: r.name, capacity: r.capacity, type: r.type, pricePerHour: r.pricePerHour };
		form = { name: r.name, capacity: r.capacity, type: r.type, pricePerHour: r.pricePerHour };
		(document.getElementById('room_modal') as HTMLDialogElement)?.showModal();
	}

	function closeModal() {
		editTarget = null;
		(document.getElementById('room_modal') as HTMLDialogElement)?.close();
	}

	async function handleSave() {
		isSaving = true;
		try {
			if (editTarget) {
				await trpc().room.update.mutate({ id: editTarget.id, name: form.name, capacity: form.capacity, type: form.type as any, pricePerHour: form.pricePerHour });
				addToast('Cập nhật phòng thành công!', 'success');
			} else {
				await trpc().room.create.mutate({ name: form.name, capacity: form.capacity, type: form.type as any, pricePerHour: form.pricePerHour });
				addToast('Tạo phòng mới thành công!', 'success');
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
		(document.getElementById('delete_modal') as HTMLDialogElement)?.showModal();
	}

	async function handleDelete() {
		if (!deleteTarget) return;
		isDeleting = true;
		try {
			await trpc().room.delete.mutate(deleteTarget.id);
			addToast(`Đã xóa phòng "${deleteTarget.name}".`, 'success');
			(document.getElementById('delete_modal') as HTMLDialogElement)?.close();
			deleteTarget = null;
			await loadData();
		} catch (e: any) {
			addToast(e?.message || 'Không thể xóa — phòng có thể còn đơn đặt.', 'error');
		} finally {
			isDeleting = false;
		}
	}

	const typeLabel: Record<string, string> = { standard: 'Standard', vip: 'VIP', super_vip: 'Super VIP' };
	const typeCls: Record<string, string> = { standard: 'badge-ghost', vip: 'badge-secondary', super_vip: 'badge-accent' };

	function fmtVND(v: number) {
		return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);
	}
</script>

<svelte:head><title>Quản Lý Phòng | KaraSystem Admin</title></svelte:head>

<div class="flex flex-col gap-6">
	<div class="flex items-center justify-between">
		<div>
			<h2 class="text-xl font-bold">Hệ Thống Phòng</h2>
			<p class="text-sm text-base-content/40 font-medium mt-0.5">{rooms.length} phòng đang hoạt động</p>
		</div>
		<button onclick={openCreateModal} class="btn btn-primary btn-sm rounded-lg font-bold text-xs">
			<Icon icon="solar:add-square-line-duotone" class="text-lg"/>
			Thêm Phòng
		</button>
	</div>

	<div class="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
		<div class="bg-base-100 rounded-xl border border-base-300/50 p-4 lg:p-5">
			<p class="text-[10px] font-bold text-base-content/40 uppercase tracking-widest">Tổng Phòng</p>
			<p class="text-2xl font-black mt-1">{rooms.length}</p>
		</div>
		<div class="bg-base-100 rounded-xl border border-base-300/50 p-4 lg:p-5">
			<p class="text-[10px] font-bold text-base-content/40 uppercase tracking-widest">Standard</p>
			<p class="text-2xl font-black mt-1">{rooms.filter(r => r.type === 'standard').length}</p>
		</div>
		<div class="bg-base-100 rounded-xl border border-base-300/50 p-4 lg:p-5">
			<p class="text-[10px] font-bold text-violet-500 uppercase tracking-widest">VIP</p>
			<p class="text-2xl font-black text-violet-500 mt-1">{rooms.filter(r => r.type === 'vip').length}</p>
		</div>
		<div class="bg-base-100 rounded-xl border border-base-300/50 p-4 lg:p-5">
			<p class="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Super VIP</p>
			<p class="text-2xl font-black text-amber-600 mt-1">{rooms.filter(r => r.type === 'super_vip').length}</p>
		</div>
	</div>

	<div class="bg-base-100 rounded-xl border border-base-300/50 overflow-hidden">
		<div class="overflow-x-auto">
			<table class="table table-sm">
				<thead>
					<tr class="text-[10px] uppercase tracking-widest text-base-content/30 bg-base-200/30">
						<th class="font-bold">ID</th>
						<th class="font-bold">Tên Phòng</th>
						<th class="font-bold">Loại</th>
						<th class="font-bold text-center">Sức Chứa</th>
						<th class="font-bold text-right">Đơn Giá / Giờ</th>
						<th class="font-bold text-right">Thao Tác</th>
					</tr>
				</thead>
				<tbody>
					{#if !isReady}
						<tr><td colspan="6" class="text-center py-12"><span class="loading loading-spinner text-primary"></span></td></tr>
					{:else if rooms.length === 0}
						<tr><td colspan="6" class="text-center py-12 text-base-content/30 font-medium">Chưa thiết lập phòng nào.</td></tr>
					{:else}
						{#each rooms as r}
							<tr class="hover">
								<td class="font-mono text-xs font-bold text-base-content/30">#{r.id}</td>
								<td class="font-bold text-sm">{r.name}</td>
								<td><span class="badge badge-xs rounded-md font-bold uppercase {typeCls[r.type] || 'badge-ghost'}">{typeLabel[r.type] || r.type}</span></td>
								<td class="text-center font-medium">{r.capacity} người</td>
								<td class="text-right font-mono text-sm font-bold text-primary">{fmtVND(r.pricePerHour)}</td>
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
</div>

<dialog id="room_modal" class="modal">
	<div class="modal-box rounded-xl max-w-lg">
		<h3 class="font-bold text-lg mb-5 flex items-center gap-2">
			<Icon icon={editTarget ? 'solar:pen-2-line-duotone' : 'solar:home-smile-angle-line-duotone'} class="text-xl {editTarget ? 'text-blue-500' : 'text-primary'}"/>
			{editTarget ? 'Chỉnh Sửa Phòng' : 'Thêm Phòng Mới'}
		</h3>
		<div class="flex flex-col gap-4">
			<label class="form-control w-full">
				<div class="label"><span class="label-text font-bold text-xs uppercase tracking-widest text-base-content/50">Tên Phòng</span></div>
				<input type="text" bind:value={form.name} placeholder="VD: Phòng VIP 01" class="input input-bordered w-full rounded-lg" />
			</label>
			<div class="grid grid-cols-2 gap-4">
				<label class="form-control w-full">
					<div class="label"><span class="label-text font-bold text-xs uppercase tracking-widest text-base-content/50">Loại Phòng</span></div>
					<select bind:value={form.type} class="select select-bordered w-full rounded-lg text-sm font-medium">
						<option value="standard">Standard</option>
						<option value="vip">VIP</option>
						<option value="super_vip">Super VIP</option>
					</select>
				</label>
				<label class="form-control w-full">
					<div class="label"><span class="label-text font-bold text-xs uppercase tracking-widest text-base-content/50">Sức Chứa</span></div>
					<input type="number" bind:value={form.capacity} min="1" max="100" class="input input-bordered w-full rounded-lg" />
				</label>
			</div>
			<label class="form-control w-full">
				<div class="label"><span class="label-text font-bold text-xs uppercase tracking-widest text-base-content/50">Đơn Giá (VNĐ / Giờ)</span></div>
				<input type="number" bind:value={form.pricePerHour} min="1000" class="input input-bordered w-full rounded-lg font-mono" />
			</label>
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

<dialog id="delete_modal" class="modal">
	<div class="modal-box rounded-xl max-w-sm">
		<h3 class="font-bold text-lg mb-2 flex items-center gap-2 text-red-500">
			<Icon icon="solar:trash-bin-trash-line-duotone" class="text-xl"/>
			Xác Nhận Xóa
		</h3>
		{#if deleteTarget}
			<p class="text-sm text-base-content/50 leading-relaxed">Xóa phòng <span class="font-bold text-base-content">"{deleteTarget.name}"</span>? Hành động không thể hoàn tác.</p>
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
