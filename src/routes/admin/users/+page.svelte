<script lang="ts">
	import { trpc } from '$lib/trpc/client';
	import Icon from '@iconify/svelte';
	import { addToast } from '$lib/stores/toast';

	let users = $state<any[]>([]);
	let isReady = $state(false);
	let totalPages = $state(1);
	let currentPage = $state(1);
	let totalUsers = $state(0);

	let searchQuery = $state('');
	let filterRole = $state('');
	let filterTier = $state('');

	let roleTarget = $state<{ id: string; name: string; currentRole: string } | null>(null);
	let selectedRole = $state('');
	let isSavingRole = $state(false);

	$effect(() => {
		loadData();
	});

	async function loadData() {
		try {
			const result = await trpc().user.list.query({
				page: currentPage,
				limit: 10,
				search: searchQuery || undefined,
				role: filterRole || undefined,
				tier: filterTier || undefined
			});
			users = result.data;
			totalPages = result.totalPages;
			totalUsers = result.total;
		} catch (e) {
			console.error(e);
		} finally {
			isReady = true;
		}
	}

	function handleSearch() {
		currentPage = 1;
		loadData();
	}

	function goToPage(page: number) {
		if (page < 1 || page > totalPages) return;
		currentPage = page;
		loadData();
	}

	function openRoleModal(u: any) {
		roleTarget = { id: u.id, name: u.name, currentRole: u.role };
		selectedRole = u.role;
		(document.getElementById('role_modal') as HTMLDialogElement)?.showModal();
	}

	async function handleRoleChange() {
		if (!roleTarget) return;
		isSavingRole = true;
		try {
			await trpc().user.updateRole.mutate({ id: roleTarget.id, role: selectedRole as any });
			addToast(`Đã cập nhật quyền cho "${roleTarget.name}".`, 'success');
			(document.getElementById('role_modal') as HTMLDialogElement)?.close();
			roleTarget = null;
			await loadData();
		} catch (e: any) {
			addToast(e?.message || 'Có lỗi xảy ra.', 'error');
		} finally {
			isSavingRole = false;
		}
	}

	async function handleBan(u: any) {
		try {
			await trpc().user.ban.mutate(u.id);
			addToast(`Đã khóa tài khoản "${u.name}".`, 'success');
			await loadData();
		} catch (e: any) {
			addToast(e?.message || 'Không thể khóa.', 'error');
		}
	}

	async function handleUnban(u: any) {
		try {
			await trpc().user.unban.mutate(u.id);
			addToast(`Đã mở khóa tài khoản "${u.name}".`, 'success');
			await loadData();
		} catch (e: any) {
			addToast(e?.message || 'Không thể mở khóa.', 'error');
		}
	}

	function fmtDate(d: string | Date | null) {
		if (!d) return '—';
		return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(d));
	}

	function fmtVND(v: number) {
		return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);
	}

	const roleLabel: Record<string, { text: string; cls: string }> = {
		admin: { text: 'Admin', cls: 'badge-primary' },
		manager: { text: 'Quản Lý', cls: 'badge-secondary' },
		staff: { text: 'Nhân Viên', cls: 'badge-accent' },
		user: { text: 'Thành Viên', cls: 'badge-ghost' },
		banned: { text: 'Đã Khóa', cls: 'badge-error text-white' }
	};

	const tierLabel: Record<string, { text: string; cls: string }> = {
		bronze: { text: 'Đồng', cls: 'text-orange-700 bg-orange-500/10' },
		silver: { text: 'Bạc', cls: 'text-slate-600 bg-slate-500/10' },
		gold: { text: 'Vàng', cls: 'text-amber-600 bg-amber-500/10' },
		diamond: { text: 'Kim Cương', cls: 'text-cyan-600 bg-cyan-500/10' }
	};
</script>

<svelte:head><title>Thành Viên | KaraSystem Admin</title></svelte:head>

{#if !isReady}
	<div class="flex items-center justify-center min-h-[50vh]">
		<span class="loading loading-spinner loading-lg text-primary"></span>
	</div>
{:else}
	<div class="flex flex-col gap-6">
		<div class="flex items-center justify-between">
			<div>
				<h2 class="text-xl font-bold">Quản Lý Thành Viên</h2>
				<p class="text-sm text-base-content/40 font-medium mt-0.5">Tổng cộng {totalUsers} tài khoản trong hệ thống</p>
			</div>
		</div>

		<div class="flex flex-col md:flex-row gap-3">
			<div class="flex-1 relative">
				<input
					type="text"
					bind:value={searchQuery}
					onkeydown={(e) => { if (e.key === 'Enter') handleSearch(); }}
					placeholder="Tìm theo tên hoặc email..."
					class="input input-bordered w-full rounded-lg text-sm pl-10"
				/>
				<Icon icon="solar:magnifer-line-duotone" class="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/30 text-lg" />
			</div>
			<select bind:value={filterRole} onchange={handleSearch} class="select select-bordered rounded-lg text-sm font-medium w-full md:w-40">
				<option value="">Tất Cả Role</option>
				<option value="admin">Admin</option>
				<option value="manager">Quản Lý</option>
				<option value="staff">Nhân Viên</option>
				<option value="user">Thành Viên</option>
				<option value="banned">Đã Khóa</option>
			</select>
			<select bind:value={filterTier} onchange={handleSearch} class="select select-bordered rounded-lg text-sm font-medium w-full md:w-40">
				<option value="">Tất Cả Hạng</option>
				<option value="bronze">Đồng</option>
				<option value="silver">Bạc</option>
				<option value="gold">Vàng</option>
				<option value="diamond">Kim Cương</option>
			</select>
			<button onclick={handleSearch} class="btn btn-primary btn-sm rounded-lg font-bold md:px-6">
				<Icon icon="solar:magnifer-line-duotone" class="text-lg"/>
				Tìm
			</button>
		</div>

		<div class="bg-base-100 rounded-xl border border-base-300/50 overflow-hidden">
			<div class="overflow-x-auto">
				<table class="table table-sm">
					<thead>
						<tr class="text-[10px] uppercase tracking-widest text-base-content/30 bg-base-200/30">
							<th class="font-bold">Thành Viên</th>
							<th class="font-bold">Quyền</th>
							<th class="font-bold text-center">Hạng</th>
							<th class="font-bold text-right">Điểm</th>
							<th class="font-bold text-right">Tổng Chi Tiêu</th>
							<th class="font-bold">Ngày Tham Gia</th>
							<th class="font-bold text-right">Thao Tác</th>
						</tr>
					</thead>
					<tbody>
						{#if users.length === 0}
							<tr><td colspan="7" class="text-center py-12 text-base-content/30 font-medium">Không tìm thấy thành viên nào.</td></tr>
						{:else}
							{#each users as u}
								{@const role = roleLabel[u.role] || { text: u.role, cls: 'badge-ghost' }}
								{@const tier = tierLabel[u.tier] || { text: u.tier, cls: '' }}
								<tr class="hover">
									<td>
										<div class="flex items-center gap-3">
											<div class="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
												<Icon icon="solar:user-bold-duotone" class="text-primary text-lg" />
											</div>
											<div class="min-w-0">
												<p class="font-semibold text-sm truncate max-w-[180px]">{u.name}</p>
												<p class="text-xs text-base-content/40 truncate max-w-[180px]">{u.email}</p>
											</div>
										</div>
									</td>
									<td><span class="badge {role.cls} badge-xs rounded-md font-bold">{role.text}</span></td>
									<td class="text-center"><span class="text-[11px] font-bold px-2 py-0.5 rounded-md {tier.cls}">{tier.text}</span></td>
									<td class="text-right font-mono text-sm font-bold">{u.points.toLocaleString('vi-VN')}</td>
									<td class="text-right font-mono text-xs font-medium text-base-content/50">{fmtVND(u.totalSpent)}</td>
									<td class="text-xs font-medium text-base-content/50">{fmtDate(u.createdAt)}</td>
									<td class="text-right">
										<div class="flex items-center justify-end gap-1">
											<button onclick={() => openRoleModal(u)} class="btn btn-xs btn-ghost btn-square text-blue-500 hover:bg-blue-500/10" title="Đổi quyền">
												<Icon icon="solar:shield-user-line-duotone" class="text-lg"/>
											</button>
											{#if u.role === 'banned'}
												<button onclick={() => handleUnban(u)} class="btn btn-xs btn-ghost btn-square text-emerald-500 hover:bg-emerald-500/10" title="Mở khóa">
													<Icon icon="solar:lock-unlocked-line-duotone" class="text-lg"/>
												</button>
											{:else if u.role !== 'admin'}
												<button onclick={() => handleBan(u)} class="btn btn-xs btn-ghost btn-square text-red-500 hover:bg-red-500/10" title="Khóa tài khoản">
													<Icon icon="solar:lock-line-duotone" class="text-lg"/>
												</button>
											{/if}
										</div>
									</td>
								</tr>
							{/each}
						{/if}
					</tbody>
				</table>
			</div>
		</div>

		{#if totalPages > 1}
			<div class="flex items-center justify-center gap-2">
				<button onclick={() => goToPage(currentPage - 1)} class="btn btn-ghost btn-sm rounded-lg" disabled={currentPage <= 1}>
					<Icon icon="solar:arrow-left-line-duotone" class="text-lg"/>
				</button>
				{#each Array.from({ length: totalPages }, (_, i) => i + 1) as p}
					{#if p === currentPage || p === 1 || p === totalPages || (p >= currentPage - 1 && p <= currentPage + 1)}
						<button onclick={() => goToPage(p)} class="btn btn-sm rounded-lg min-w-[36px] {p === currentPage ? 'btn-primary' : 'btn-ghost'} font-bold">
							{p}
						</button>
					{:else if p === currentPage - 2 || p === currentPage + 2}
						<span class="text-base-content/30 text-sm">...</span>
					{/if}
				{/each}
				<button onclick={() => goToPage(currentPage + 1)} class="btn btn-ghost btn-sm rounded-lg" disabled={currentPage >= totalPages}>
					<Icon icon="solar:arrow-right-line-duotone" class="text-lg"/>
				</button>
			</div>
		{/if}
	</div>
{/if}

<dialog id="role_modal" class="modal">
	<div class="modal-box rounded-xl max-w-sm">
		<h3 class="font-bold text-lg mb-4 flex items-center gap-2">
			<Icon icon="solar:shield-user-line-duotone" class="text-xl text-blue-500"/>
			Phân Quyền
		</h3>
		{#if roleTarget}
			<p class="text-sm text-base-content/50 mb-4">Thay đổi quyền cho <span class="font-bold text-base-content">{roleTarget.name}</span></p>
			<select bind:value={selectedRole} class="select select-bordered w-full rounded-lg text-sm font-medium">
				<option value="admin">Admin (Toàn quyền)</option>
				<option value="manager">Quản Lý (Duyệt đơn, quản lý phòng/dịch vụ)</option>
				<option value="staff">Nhân Viên (Xem đơn, lịch phòng)</option>
				<option value="user">Thành Viên (Mặc định)</option>
				<option value="banned">Khóa Tài Khoản</option>
			</select>
			<div class="modal-action border-t border-base-200 pt-4">
				<form method="dialog"><button class="btn btn-ghost rounded-lg font-medium" disabled={isSavingRole}>Hủy</button></form>
				<button onclick={handleRoleChange} class="btn btn-primary rounded-lg font-bold px-8" disabled={isSavingRole}>
					{#if isSavingRole}<span class="loading loading-spinner loading-sm"></span>{:else}Xác Nhận{/if}
				</button>
			</div>
		{/if}
	</div>
	<form method="dialog" class="modal-backdrop"><button>close</button></form>
</dialog>
