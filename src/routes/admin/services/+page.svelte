<script lang="ts">
	import { trpc } from '$lib/trpc/client';
	import Icon from '@iconify/svelte';
	import { addToast } from '$lib/stores/toast';

	let services = $state<any[]>([]);
	let isReady = $state(false);
	let activeCategory = $state('all');

	let newService = $state({ name: '', category: 'food', price: 10000, description: '', isAvailable: true });
	let editService = $state<{ id: number; name: string; category: string; price: number; description: string; isAvailable: boolean } | null>(null);
	let isSaving = $state(false);
	let deleteTarget = $state<{ id: number; name: string } | null>(null);
	let isDeleting = $state(false);

	async function fetchServices() {
		try {
			services = await trpc().service.list.query();
		} catch (error) {
			console.error(error);
		} finally {
			isReady = true;
		}
	}

	$effect(() => {
		fetchServices();
	});

	let filteredServices = $derived(
		activeCategory === 'all' ? services : services.filter(s => s.category === activeCategory)
	);

	async function handleCreateService() {
		isSaving = true;
		try {
			await trpc().service.create.mutate({
				name: newService.name,
				category: newService.category as any,
				price: newService.price,
				description: newService.description || undefined,
				isAvailable: newService.isAvailable
			});
			(document.getElementById('create_service_modal') as HTMLDialogElement)?.close();
			addToast('Thêm dịch vụ thành công!', 'success');
			await fetchServices();
			newService = { name: '', category: 'food', price: 10000, description: '', isAvailable: true };
		} catch (error: any) {
			addToast(error?.message || 'Có lỗi xảy ra.', 'error');
		} finally {
			isSaving = false;
		}
	}

	function openEditModal(svc: any) {
		editService = { id: svc.id, name: svc.name, category: svc.category, price: svc.price, description: svc.description || '', isAvailable: svc.isAvailable };
		(document.getElementById('edit_service_modal') as HTMLDialogElement)?.showModal();
	}

	async function handleUpdateService() {
		if (!editService) return;
		isSaving = true;
		try {
			await trpc().service.update.mutate({
				id: editService.id,
				name: editService.name,
				category: editService.category as any,
				price: editService.price,
				description: editService.description || undefined,
				isAvailable: editService.isAvailable
			});
			(document.getElementById('edit_service_modal') as HTMLDialogElement)?.close();
			addToast('Cập nhật dịch vụ thành công!', 'success');
			await fetchServices();
			editService = null;
		} catch (error: any) {
			addToast(error?.message || 'Có lỗi xảy ra.', 'error');
		} finally {
			isSaving = false;
		}
	}

	function openDeleteConfirm(svc: any) {
		deleteTarget = { id: svc.id, name: svc.name };
		(document.getElementById('delete_service_modal') as HTMLDialogElement)?.showModal();
	}

	async function handleDeleteService() {
		if (!deleteTarget) return;
		isDeleting = true;
		try {
			await trpc().service.delete.mutate(deleteTarget.id);
			(document.getElementById('delete_service_modal') as HTMLDialogElement)?.close();
			addToast(`Đã xóa "${deleteTarget.name}".`, 'success');
			await fetchServices();
			deleteTarget = null;
		} catch (error: any) {
			addToast(error?.message || 'Không thể xóa dịch vụ.', 'error');
		} finally {
			isDeleting = false;
		}
	}

	const categoryLabel: Record<string, string> = { food: 'Đồ Ăn', drink: 'Thức Uống', decoration: 'Trang Trí', other: 'Khác' };
	const categoryIcon: Record<string, string> = { food: 'solar:chef-hat-heart-line-duotone', drink: 'solar:wineglass-triangle-line-duotone', decoration: 'solar:star-shine-line-duotone', other: 'solar:box-line-duotone' };
	const categoryBadge: Record<string, string> = { food: 'badge-warning', drink: 'badge-info', decoration: 'badge-secondary', other: 'badge-ghost' };

	function formatVND(value: number) {
		return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
	}
</script>

<svelte:head>
	<title>Menu Dịch Vụ | KaraSystem Admin</title>
</svelte:head>

<div class="flex flex-col gap-6">
	<div class="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-base-100 p-5 rounded-xl border border-base-300/60">
		<div>
			<h2 class="text-lg font-bold tracking-wide">Menu Dịch Vụ</h2>
			<p class="text-sm text-base-content/40 font-medium mt-0.5">{services.length} mục trong hệ thống</p>
		</div>
		<button class="btn btn-primary btn-sm rounded-lg font-bold tracking-wider text-xs" onclick={() => (document.getElementById('create_service_modal') as HTMLDialogElement)?.showModal()}>
			<Icon icon="solar:add-square-line-duotone" class="text-lg"/>
			Thêm Dịch Vụ
		</button>
	</div>

	<div class="flex gap-2 flex-wrap">
		<button onclick={() => activeCategory = 'all'} class="btn btn-xs rounded-lg font-bold tracking-wider {activeCategory === 'all' ? 'btn-primary' : 'btn-ghost'}">Tất Cả ({services.length})</button>
		{#each Object.entries(categoryLabel) as [key, label]}
			<button onclick={() => activeCategory = key} class="btn btn-xs rounded-lg font-bold tracking-wider {activeCategory === key ? 'btn-primary' : 'btn-ghost'}">
				<Icon icon={categoryIcon[key]} class="text-sm"/>
				{label} ({services.filter(s => s.category === key).length})
			</button>
		{/each}
	</div>

	<div class="bg-base-100 rounded-xl border border-base-300/60">
		<div class="overflow-x-auto">
			<table class="table w-full">
				<thead>
					<tr class="text-[10px] uppercase tracking-widest text-base-content/30 border-b border-base-200 bg-base-200/30">
						<th>ID</th>
						<th>Tên Dịch Vụ</th>
						<th>Danh Mục</th>
						<th class="text-right">Đơn Giá</th>
						<th class="text-center">Trạng Thái</th>
						<th class="text-right w-28">Thao Tác</th>
					</tr>
				</thead>
				<tbody>
					{#if !isReady}
						<tr><td colspan="6" class="text-center py-10"><span class="loading loading-spinner text-primary"></span></td></tr>
					{:else if filteredServices.length === 0}
						<tr><td colspan="6" class="text-center py-10 font-medium text-base-content/40">Chưa có dịch vụ trong danh mục này.</td></tr>
					{:else}
						{#each filteredServices as svc}
							<tr class="hover">
								<td class="font-mono text-xs font-bold text-base-content/30">#{svc.id}</td>
								<td>
									<div class="flex flex-col">
										<span class="font-bold">{svc.name}</span>
										{#if svc.description}
											<span class="text-xs text-base-content/30 mt-0.5 max-w-[200px] truncate">{svc.description}</span>
										{/if}
									</div>
								</td>
								<td><div class="badge badge-xs rounded-md font-bold uppercase {categoryBadge[svc.category] || 'badge-ghost'}">{categoryLabel[svc.category] || svc.category}</div></td>
								<td class="text-right font-mono font-bold text-primary">{formatVND(svc.price)}</td>
								<td class="text-center">
									{#if svc.isAvailable}
										<div class="badge badge-success badge-xs rounded-md font-bold">Đang Bán</div>
									{:else}
										<div class="badge badge-error badge-xs rounded-md font-bold text-white">Ngừng</div>
									{/if}
								</td>
								<td class="text-right">
									<button onclick={() => openEditModal(svc)} class="btn btn-xs btn-ghost btn-square text-info hover:bg-info/10"><Icon icon="solar:pen-2-line-duotone" class="text-lg"/></button>
									<button onclick={() => openDeleteConfirm(svc)} class="btn btn-xs btn-ghost btn-square text-error hover:bg-error/10"><Icon icon="solar:trash-bin-trash-line-duotone" class="text-lg"/></button>
								</td>
							</tr>
						{/each}
					{/if}
				</tbody>
			</table>
		</div>
	</div>
</div>

<dialog id="create_service_modal" class="modal">
	<div class="modal-box bg-base-100 rounded-xl border border-base-300/60 max-w-lg">
		<h3 class="font-bold text-lg mb-4 flex items-center gap-2">
			<Icon icon="solar:wineglass-triangle-line-duotone" class="text-xl text-primary"/>
			Thêm Dịch Vụ Mới
		</h3>
		<div class="flex flex-col gap-4">
			<label class="form-control w-full">
				<div class="label"><span class="label-text font-bold">Tên Dịch Vụ</span></div>
				<input type="text" bind:value={newService.name} placeholder="VD: Bia Tiger, Trái Cây..." class="input input-bordered w-full rounded-lg" required />
			</label>
			<div class="grid grid-cols-2 gap-4">
				<label class="form-control w-full">
					<div class="label"><span class="label-text font-bold">Danh Mục</span></div>
					<select bind:value={newService.category} class="select select-bordered w-full rounded-lg font-medium text-sm">
						<option value="food">Đồ Ăn</option>
						<option value="drink">Thức Uống</option>
						<option value="decoration">Trang Trí</option>
						<option value="other">Khác</option>
					</select>
				</label>
				<label class="form-control w-full">
					<div class="label"><span class="label-text font-bold">Đơn Giá (VNĐ)</span></div>
					<label class="input input-bordered flex items-center gap-2 font-mono rounded-lg">
						<span class="text-base-content/40 font-bold">₫</span>
						<input type="number" bind:value={newService.price} min="1000" class="grow" required />
					</label>
				</label>
			</div>
			<label class="form-control w-full">
				<div class="label"><span class="label-text font-bold">Mô Tả (Tùy Chọn)</span></div>
				<textarea bind:value={newService.description} placeholder="Mô tả ngắn..." class="textarea textarea-bordered w-full rounded-lg" rows="2"></textarea>
			</label>
			<div class="form-control">
				<label class="label cursor-pointer justify-start gap-3">
					<input type="checkbox" bind:checked={newService.isAvailable} class="toggle toggle-primary toggle-sm" />
					<span class="label-text font-bold">Đang mở bán</span>
				</label>
			</div>
			<div class="modal-action border-t border-base-200 mt-4 pt-4">
				<form method="dialog"><button class="btn btn-ghost rounded-lg font-medium" disabled={isSaving}>Hủy</button></form>
				<button onclick={handleCreateService} class="btn btn-primary rounded-lg font-bold px-8" disabled={isSaving}>
					{#if isSaving}<span class="loading loading-spinner loading-sm"></span>{:else}Lưu{/if}
				</button>
			</div>
		</div>
	</div>
	<form method="dialog" class="modal-backdrop"><button>close</button></form>
</dialog>

<dialog id="edit_service_modal" class="modal">
	<div class="modal-box bg-base-100 rounded-xl border border-base-300/60 max-w-lg">
		<h3 class="font-bold text-lg mb-4 flex items-center gap-2">
			<Icon icon="solar:pen-2-line-duotone" class="text-xl text-info"/>
			Chỉnh Sửa Dịch Vụ
		</h3>
		{#if editService}
			<div class="flex flex-col gap-4">
				<label class="form-control w-full">
					<div class="label"><span class="label-text font-bold">Tên Dịch Vụ</span></div>
					<input type="text" bind:value={editService.name} class="input input-bordered w-full rounded-lg" required />
				</label>
				<div class="grid grid-cols-2 gap-4">
					<label class="form-control w-full">
						<div class="label"><span class="label-text font-bold">Danh Mục</span></div>
						<select bind:value={editService.category} class="select select-bordered w-full rounded-lg font-medium text-sm">
							<option value="food">Đồ Ăn</option>
							<option value="drink">Thức Uống</option>
							<option value="decoration">Trang Trí</option>
							<option value="other">Khác</option>
						</select>
					</label>
					<label class="form-control w-full">
						<div class="label"><span class="label-text font-bold">Đơn Giá (VNĐ)</span></div>
						<label class="input input-bordered flex items-center gap-2 font-mono rounded-lg">
							<span class="text-base-content/40 font-bold">₫</span>
							<input type="number" bind:value={editService.price} min="1000" class="grow" required />
						</label>
					</label>
				</div>
				<label class="form-control w-full">
					<div class="label"><span class="label-text font-bold">Mô Tả</span></div>
					<textarea bind:value={editService.description} class="textarea textarea-bordered w-full rounded-lg" rows="2"></textarea>
				</label>
				<div class="form-control">
					<label class="label cursor-pointer justify-start gap-3">
						<input type="checkbox" bind:checked={editService.isAvailable} class="toggle toggle-primary toggle-sm" />
						<span class="label-text font-bold">Đang mở bán</span>
					</label>
				</div>
				<div class="modal-action border-t border-base-200 mt-4 pt-4">
					<form method="dialog"><button class="btn btn-ghost rounded-lg font-medium" disabled={isSaving}>Hủy</button></form>
					<button onclick={handleUpdateService} class="btn btn-info text-white rounded-lg font-bold px-8" disabled={isSaving}>
						{#if isSaving}<span class="loading loading-spinner loading-sm"></span>{:else}Lưu{/if}
					</button>
				</div>
			</div>
		{/if}
	</div>
	<form method="dialog" class="modal-backdrop"><button>close</button></form>
</dialog>

<dialog id="delete_service_modal" class="modal">
	<div class="modal-box bg-base-100 rounded-xl border border-base-300/60 max-w-sm">
		<h3 class="font-bold text-lg mb-2 flex items-center gap-2 text-error">
			<Icon icon="solar:trash-bin-trash-line-duotone" class="text-xl"/>
			Xác Nhận Xóa
		</h3>
		{#if deleteTarget}
			<p class="text-sm text-base-content/60 leading-relaxed">
				Xóa dịch vụ <span class="font-bold text-base-content">"{deleteTarget.name}"</span>? Hành động không thể hoàn tác.
			</p>
			<div class="modal-action border-t border-base-200 mt-4 pt-4">
				<form method="dialog"><button class="btn btn-ghost rounded-lg font-medium" disabled={isDeleting}>Giữ Lại</button></form>
				<button onclick={handleDeleteService} class="btn btn-error text-white rounded-lg font-bold px-8" disabled={isDeleting}>
					{#if isDeleting}<span class="loading loading-spinner loading-sm"></span>{:else}Xóa{/if}
				</button>
			</div>
		{/if}
	</div>
	<form method="dialog" class="modal-backdrop"><button>close</button></form>
</dialog>
