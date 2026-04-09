<script lang="ts">
	import { trpc } from '$lib/trpc/client';
	import Icon from '@iconify/svelte';
	import { addToast } from '$lib/stores/toast';

	let rooms = $state<any[]>([]);
	let isReady = $state(false);

	let newRoom = $state({ name: '', capacity: 5, type: 'standard', pricePerHour: 100000 });
	let editRoom = $state<{ id: number; name: string; capacity: number; type: string; pricePerHour: number } | null>(null);
	let isSaving = $state(false);
	let deleteTarget = $state<{ id: number; name: string } | null>(null);
	let isDeleting = $state(false);

	async function fetchRooms() {
		try {
			rooms = await trpc().room.list.query();
		} catch (error) {
			console.error(error);
		} finally {
			isReady = true;
		}
	}

	$effect(() => {
		fetchRooms();
	});

	async function handleCreateRoom() {
		isSaving = true;
		try {
			await trpc().room.create.mutate({
				name: newRoom.name,
				capacity: newRoom.capacity,
				type: newRoom.type as any,
				pricePerHour: newRoom.pricePerHour
			});
			(document.getElementById('create_room_modal') as HTMLDialogElement)?.close();
			addToast('Tạo phòng mới thành công!', 'success');
			await fetchRooms();
			newRoom = { name: '', capacity: 5, type: 'standard', pricePerHour: 100000 };
		} catch (error) {
			addToast('Có lỗi xảy ra khi tạo phòng.', 'error');
		} finally {
			isSaving = false;
		}
	}

	function openEditModal(room: any) {
		editRoom = { id: room.id, name: room.name, capacity: room.capacity, type: room.type, pricePerHour: room.pricePerHour };
		(document.getElementById('edit_room_modal') as HTMLDialogElement)?.showModal();
	}

	async function handleUpdateRoom() {
		if (!editRoom) return;
		isSaving = true;
		try {
			await trpc().room.update.mutate({
				id: editRoom.id,
				name: editRoom.name,
				capacity: editRoom.capacity,
				type: editRoom.type as any,
				pricePerHour: editRoom.pricePerHour
			});
			(document.getElementById('edit_room_modal') as HTMLDialogElement)?.close();
			addToast('Cập nhật phòng thành công!', 'success');
			await fetchRooms();
			editRoom = null;
		} catch (error) {
			addToast('Có lỗi xảy ra khi cập nhật phòng.', 'error');
		} finally {
			isSaving = false;
		}
	}

	function openDeleteConfirm(room: any) {
		deleteTarget = { id: room.id, name: room.name };
		(document.getElementById('delete_room_modal') as HTMLDialogElement)?.showModal();
	}

	async function handleDeleteRoom() {
		if (!deleteTarget) return;
		isDeleting = true;
		try {
			await trpc().room.delete.mutate(deleteTarget.id);
			(document.getElementById('delete_room_modal') as HTMLDialogElement)?.close();
			addToast(`Đã xóa phòng "${deleteTarget.name}" khỏi hệ thống.`, 'success');
			await fetchRooms();
			deleteTarget = null;
		} catch (error) {
			addToast('Có lỗi xảy ra khi xóa phòng.', 'error');
		} finally {
			isDeleting = false;
		}
	}

	const typeLabel: Record<string, string> = { standard: 'Cơ Bản', vip: 'VIP', super_vip: 'Super VIP' };
	const typeBadge: Record<string, string> = { standard: 'badge-ghost', vip: 'badge-secondary', super_vip: 'badge-accent' };

	function formatVND(value: number) {
		return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
	}
</script>

<svelte:head>
	<title>Quản Lý Phòng Hát | KaraSystem Admin</title>
</svelte:head>

<div class="flex flex-col gap-6">
	<div class="flex justify-between items-center bg-base-100 p-6 rounded-md border border-base-300 shadow-sm">
		<div>
			<h2 class="text-xl font-bold tracking-widest uppercase">Danh Sách Cơ Sở Phòng</h2>
			<p class="text-sm font-medium text-base-content/60 mt-1">Hệ thống đang sở hữu {rooms.length} phòng đang hoạt động.</p>
		</div>
		<button class="btn btn-primary rounded-md font-bold tracking-widest uppercase" onclick={() => (document.getElementById('create_room_modal') as HTMLDialogElement)?.showModal()}>
			<Icon icon="solar:add-square-line-duotone" class="text-xl"/>
			Thêm Phòng Mới
		</button>
	</div>
	<div class="card bg-base-100 border border-base-300 shadow-sm rounded-md">
		<div class="overflow-x-auto w-full min-h-[400px]">
			<table class="table table-zebra w-full">
				<thead class="bg-base-200/50 uppercase tracking-widest text-[#888] text-[10px] sm:text-xs border-b border-base-300">
					<tr>
						<th>ID</th>
						<th>Tên Phòng</th>
						<th>Kiểu Phòng</th>
						<th class="text-center">Sức Chứa</th>
						<th class="text-right">Đơn Giá / Giờ</th>
						<th class="text-right w-32">Thao Tác</th>
					</tr>
				</thead>
				<tbody>
					{#if !isReady}
						<tr>
							<td colspan="6" class="text-center py-10">
								<span class="loading loading-spinner text-primary"></span>
							</td>
						</tr>
					{:else if rooms.length === 0}
						<tr>
							<td colspan="6" class="text-center py-10 font-medium text-base-content/60">
								Chưa có phòng nào được thiết lập.
							</td>
						</tr>
					{:else}
						{#each rooms as room}
							<tr class="hover">
								<td class="font-mono text-xs font-bold text-base-content/50">#{room.id}</td>
								<td class="font-bold">{room.name}</td>
								<td>
									<div class={`badge badge-sm rounded-md font-bold uppercase ${typeBadge[room.type] || 'badge-ghost'}`}>
										{typeLabel[room.type] || room.type}
									</div>
								</td>
								<td class="text-center font-medium">{room.capacity} Khách</td>
								<td class="text-right font-mono font-bold text-primary">
									{formatVND(room.pricePerHour)}
								</td>
								<td class="text-right gap-2">
									<button onclick={() => openEditModal(room)} class="btn btn-xs btn-ghost btn-square text-info hover:bg-info/10">
										<Icon icon="solar:pen-2-line-duotone" class="text-lg"/>
									</button>
									<button onclick={() => openDeleteConfirm(room)} class="btn btn-xs btn-ghost btn-square text-error hover:bg-error/10">
										<Icon icon="solar:trash-bin-trash-line-duotone" class="text-lg"/>
									</button>
								</td>
							</tr>
						{/each}
					{/if}
				</tbody>
			</table>
		</div>
	</div>
</div>

<dialog id="create_room_modal" class="modal">
	<div class="modal-box bg-base-100 rounded-md border border-base-300 max-w-lg">
		<h3 class="font-bold text-lg tracking-widest uppercase mb-4 flex items-center gap-2">
			<Icon icon="solar:home-smile-angle-line-duotone" class="text-xl text-primary"/>
			Thêm Phòng Karaoke
		</h3>
		<div class="flex flex-col gap-4">
			<label class="form-control w-full">
				<div class="label"><span class="label-text font-bold">Tên Phòng</span></div>
				<input type="text" bind:value={newRoom.name} placeholder="VD: Phòng Trà VIP 1" class="input input-bordered w-full rounded-md" required />
			</label>
			<div class="grid grid-cols-2 gap-4">
				<label class="form-control w-full">
					<div class="label"><span class="label-text font-bold">Loại Phòng</span></div>
					<select bind:value={newRoom.type} class="select select-bordered w-full rounded-md font-medium uppercase tracking-wider text-sm">
						<option value="standard">Standard (Thường)</option>
						<option value="vip">VIP (Thương Gia)</option>
						<option value="super_vip">Super VIP</option>
					</select>
				</label>
				<label class="form-control w-full">
					<div class="label"><span class="label-text font-bold">Sức Chứa (Người)</span></div>
					<input type="number" bind:value={newRoom.capacity} min="1" max="100" class="input input-bordered w-full rounded-md" required />
				</label>
			</div>
			<label class="form-control w-full">
				<div class="label"><span class="label-text font-bold">Đơn Giá Mặc Định (VNĐ / Giờ)</span></div>
				<label class="input input-bordered flex items-center gap-2 font-mono rounded-md">
					<span class="text-base-content/50 font-bold">₫</span>
					<input type="number" bind:value={newRoom.pricePerHour} min="1000" class="grow" required />
				</label>
			</label>
			<div class="modal-action border-t border-base-200 mt-6 pt-4">
				<form method="dialog">
					<button class="btn btn-ghost rounded-md font-medium tracking-widest uppercase" disabled={isSaving}>Hủy Bỏ</button>
				</form>
				<button onclick={handleCreateRoom} class="btn btn-primary rounded-md font-bold tracking-widest uppercase px-8" disabled={isSaving}>
					{#if isSaving}
						<span class="loading loading-spinner loading-sm"></span>
					{:else}
						Lưu Phòng Mới
					{/if}
				</button>
			</div>
		</div>
	</div>
	<form method="dialog" class="modal-backdrop">
		<button>close</button>
	</form>
</dialog>

<dialog id="edit_room_modal" class="modal">
	<div class="modal-box bg-base-100 rounded-md border border-base-300 max-w-lg">
		<h3 class="font-bold text-lg tracking-widest uppercase mb-4 flex items-center gap-2">
			<Icon icon="solar:pen-2-line-duotone" class="text-xl text-info"/>
			Chỉnh Sửa Phòng
		</h3>
		{#if editRoom}
			<div class="flex flex-col gap-4">
				<label class="form-control w-full">
					<div class="label"><span class="label-text font-bold">Tên Phòng</span></div>
					<input type="text" bind:value={editRoom.name} class="input input-bordered w-full rounded-md" required />
				</label>
				<div class="grid grid-cols-2 gap-4">
					<label class="form-control w-full">
						<div class="label"><span class="label-text font-bold">Loại Phòng</span></div>
						<select bind:value={editRoom.type} class="select select-bordered w-full rounded-md font-medium uppercase tracking-wider text-sm">
							<option value="standard">Standard (Thường)</option>
							<option value="vip">VIP (Thương Gia)</option>
							<option value="super_vip">Super VIP</option>
						</select>
					</label>
					<label class="form-control w-full">
						<div class="label"><span class="label-text font-bold">Sức Chứa (Người)</span></div>
						<input type="number" bind:value={editRoom.capacity} min="1" max="100" class="input input-bordered w-full rounded-md" required />
					</label>
				</div>
				<label class="form-control w-full">
					<div class="label"><span class="label-text font-bold">Đơn Giá Mặc Định (VNĐ / Giờ)</span></div>
					<label class="input input-bordered flex items-center gap-2 font-mono rounded-md">
						<span class="text-base-content/50 font-bold">₫</span>
						<input type="number" bind:value={editRoom.pricePerHour} min="1000" class="grow" required />
					</label>
				</label>
				<div class="modal-action border-t border-base-200 mt-6 pt-4">
					<form method="dialog">
						<button class="btn btn-ghost rounded-md font-medium tracking-widest uppercase" disabled={isSaving}>Hủy Bỏ</button>
					</form>
					<button onclick={handleUpdateRoom} class="btn btn-info text-white rounded-md font-bold tracking-widest uppercase px-8" disabled={isSaving}>
						{#if isSaving}
							<span class="loading loading-spinner loading-sm"></span>
						{:else}
							Lưu Thay Đổi
						{/if}
					</button>
				</div>
			</div>
		{/if}
	</div>
	<form method="dialog" class="modal-backdrop">
		<button>close</button>
	</form>
</dialog>

<dialog id="delete_room_modal" class="modal">
	<div class="modal-box bg-base-100 rounded-md border border-base-300 max-w-sm">
		<h3 class="font-bold text-lg tracking-widest uppercase mb-2 flex items-center gap-2 text-error">
			<Icon icon="solar:trash-bin-trash-line-duotone" class="text-xl"/>
			Xác Nhận Xóa
		</h3>
		{#if deleteTarget}
			<p class="text-sm font-medium text-base-content/70 leading-relaxed">
				Bạn có chắc chắn muốn xóa phòng <span class="font-bold text-base-content">"{deleteTarget.name}"</span> khỏi hệ thống? Hành động này không thể hoàn tác.
			</p>
			<div class="modal-action border-t border-base-200 mt-6 pt-4">
				<form method="dialog">
					<button class="btn btn-ghost rounded-md font-medium tracking-widest uppercase" disabled={isDeleting}>Giữ Lại</button>
				</form>
				<button onclick={handleDeleteRoom} class="btn btn-error text-white rounded-md font-bold tracking-widest uppercase px-8" disabled={isDeleting}>
					{#if isDeleting}
						<span class="loading loading-spinner loading-sm"></span>
					{:else}
						Xóa Vĩnh Viễn
					{/if}
				</button>
			</div>
		{/if}
	</div>
	<form method="dialog" class="modal-backdrop">
		<button>close</button>
	</form>
</dialog>
