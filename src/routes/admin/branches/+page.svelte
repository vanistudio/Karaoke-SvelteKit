<script lang="ts">
	import { trpc } from '$lib/trpc/client';
	import Icon from '@iconify/svelte';
	import { addToast } from '$lib/stores/toast';

	let branches = $state<any[]>([]);
	let isReady = $state(false);
	let isSaving = $state(false);
	let isDeleting = $state(false);

	let form = $state({ name: '', address: '', phone: '', isActive: true });
	let editTarget = $state<{ id: number } | null>(null);
	let deleteTarget = $state<{ id: number; name: string } | null>(null);

	$effect(() => { loadData(); });

	async function loadData() {
		try {
			branches = await trpc().branch.listAll.query();
		} catch (e) { console.error(e); }
		finally { isReady = true; }
	}

	function openCreateModal() {
		editTarget = null;
		form = { name: '', address: '', phone: '', isActive: true };
		(document.getElementById('branch_modal') as HTMLDialogElement)?.showModal();
	}

	function openEditModal(b: any) {
		editTarget = { id: b.id };
		form = { name: b.name, address: b.address, phone: b.phone, isActive: b.isActive };
		(document.getElementById('branch_modal') as HTMLDialogElement)?.showModal();
	}

	function closeModal() {
		editTarget = null;
		(document.getElementById('branch_modal') as HTMLDialogElement)?.close();
	}

	async function handleSave() {
		isSaving = true;
		try {
			if (editTarget) {
				await trpc().branch.update.mutate({ id: editTarget.id, ...form });
				addToast('Cập nhật chi nhánh thành công!', 'success');
			} else {
				await trpc().branch.create.mutate(form);
				addToast('Tạo chi nhánh thành công!', 'success');
			}
			closeModal();
			await loadData();
		} catch (e: any) {
			addToast(e?.message || 'Có lỗi xảy ra.', 'error');
		} finally { isSaving = false; }
	}

	function openDeleteConfirm(b: any) {
		deleteTarget = { id: b.id, name: b.name };
		(document.getElementById('del_branch_modal') as HTMLDialogElement)?.showModal();
	}

	async function handleDelete() {
		if (!deleteTarget) return;
		isDeleting = true;
		try {
			await trpc().branch.delete.mutate(deleteTarget.id);
			addToast(`Đã xóa chi nhánh "${deleteTarget.name}".`, 'success');
			(document.getElementById('del_branch_modal') as HTMLDialogElement)?.close();
			deleteTarget = null;
			await loadData();
		} catch (e: any) {
			addToast(e?.message || 'Không thể xóa.', 'error');
		} finally { isDeleting = false; }
	}
</script>

<svelte:head><title>Chi Nhánh | KaraSystem Admin</title></svelte:head>

{#if !isReady}
	<div class="flex items-center justify-center min-h-[50vh]">
		<span class="loading loading-spinner loading-lg text-primary"></span>
	</div>
{:else}
	<div class="flex flex-col gap-6">
		<div class="flex items-center justify-between">
			<div>
				<h2 class="text-xl font-bold">Quản Lý Chi Nhánh</h2>
				<p class="text-sm text-base-content/40 font-medium mt-0.5">{branches.length} chi nhánh trong hệ thống</p>
			</div>
			<button onclick={openCreateModal} class="btn btn-primary btn-sm rounded-lg font-bold text-xs">
				<Icon icon="solar:add-square-line-duotone" class="text-lg"/>
				Thêm Chi Nhánh
			</button>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
			{#each branches as b}
				<div class="bg-base-100 rounded-xl border border-base-300/50 p-5 hover:border-primary/30 transition-colors">
					<div class="flex items-start justify-between mb-3">
						<div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
							<Icon icon="solar:buildings-bold-duotone" class="text-xl text-primary" />
						</div>
						{#if b.isActive}
							<span class="badge badge-success badge-xs rounded-md font-bold">Hoạt Động</span>
						{:else}
							<span class="badge badge-ghost badge-xs rounded-md font-bold">Đã Tắt</span>
						{/if}
					</div>
					<h3 class="font-bold text-base mb-2">{b.name}</h3>
					<div class="flex flex-col gap-1.5 text-xs text-base-content/50 font-medium">
						<div class="flex items-center gap-1.5">
							<Icon icon="solar:map-point-wave-line-duotone" class="text-sm text-base-content/30"/>
							{b.address}
						</div>
						<div class="flex items-center gap-1.5">
							<Icon icon="solar:phone-calling-line-duotone" class="text-sm text-base-content/30"/>
							{b.phone}
						</div>
					</div>
					<div class="flex items-center gap-2 mt-4 pt-3 border-t border-base-200">
						<button onclick={() => openEditModal(b)} class="btn btn-xs btn-ghost text-blue-500 hover:bg-blue-500/10 rounded-lg font-bold">
							<Icon icon="solar:pen-2-line-duotone" class="text-sm"/> Sửa
						</button>
						<button onclick={() => openDeleteConfirm(b)} class="btn btn-xs btn-ghost text-red-500 hover:bg-red-500/10 rounded-lg font-bold">
							<Icon icon="solar:trash-bin-trash-line-duotone" class="text-sm"/> Xóa
						</button>
					</div>
				</div>
			{/each}

			{#if branches.length === 0}
				<div class="col-span-full bg-base-100 rounded-xl border border-base-300/50 p-12 text-center">
					<Icon icon="solar:buildings-line-duotone" class="text-5xl text-base-content/15 mx-auto mb-4" />
					<p class="text-sm text-base-content/40 font-medium">Chưa có chi nhánh nào. Bấm "Thêm Chi Nhánh" để bắt đầu.</p>
				</div>
			{/if}
		</div>
	</div>
{/if}

<dialog id="branch_modal" class="modal">
	<div class="modal-box rounded-xl max-w-md">
		<h3 class="font-bold text-lg mb-5 flex items-center gap-2">
			<Icon icon={editTarget ? 'solar:pen-2-line-duotone' : 'solar:buildings-line-duotone'} class="text-xl {editTarget ? 'text-blue-500' : 'text-primary'}"/>
			{editTarget ? 'Chỉnh Sửa Chi Nhánh' : 'Thêm Chi Nhánh Mới'}
		</h3>
		<div class="flex flex-col gap-4">
			<label class="form-control w-full">
				<div class="label"><span class="label-text font-bold text-xs uppercase tracking-widest text-base-content/50">Tên Chi Nhánh</span></div>
				<input type="text" bind:value={form.name} placeholder="VD: KaraSystem Quận 1" class="input input-bordered w-full rounded-lg" />
			</label>
			<label class="form-control w-full">
				<div class="label"><span class="label-text font-bold text-xs uppercase tracking-widest text-base-content/50">Địa Chỉ</span></div>
				<input type="text" bind:value={form.address} placeholder="VD: 123 Nguyễn Huệ, Q.1, TP.HCM" class="input input-bordered w-full rounded-lg" />
			</label>
			<label class="form-control w-full">
				<div class="label"><span class="label-text font-bold text-xs uppercase tracking-widest text-base-content/50">Số Điện Thoại</span></div>
				<input type="text" bind:value={form.phone} placeholder="VD: 028 1234 5678" class="input input-bordered w-full rounded-lg" />
			</label>
			<div class="form-control">
				<label class="label cursor-pointer justify-start gap-3">
					<input type="checkbox" bind:checked={form.isActive} class="toggle toggle-primary toggle-sm" />
					<span class="label-text font-bold text-sm">Đang hoạt động</span>
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

<dialog id="del_branch_modal" class="modal">
	<div class="modal-box rounded-xl max-w-sm">
		<h3 class="font-bold text-lg mb-2 flex items-center gap-2 text-red-500">
			<Icon icon="solar:trash-bin-trash-line-duotone" class="text-xl"/>
			Xác Nhận Xóa
		</h3>
		{#if deleteTarget}
			<p class="text-sm text-base-content/50 leading-relaxed">Xóa chi nhánh <span class="font-bold text-base-content">"{deleteTarget.name}"</span>? Các phòng thuộc chi nhánh này sẽ không bị xóa.</p>
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
