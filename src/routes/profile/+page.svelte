<script lang="ts">
	import { authClient } from '$lib/auth-client';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import Icon from '@iconify/svelte';
	import { trpc } from '$lib/trpc/client';
	import { addToast } from '$lib/stores/toast';
	import { invalidateAll } from '$app/navigation';

	const session = authClient.useSession();
	let user = $derived($session.data?.user);

	let editingName = $state(false);
	let nameInput = $state('');
	let isSavingName = $state(false);

	let showPasswordForm = $state(false);
	let currentPassword = $state('');
	let newPassword = $state('');
	let confirmPassword = $state('');
	let isSavingPassword = $state(false);

	let loyaltyInfo = $state<any>(null);
	let pointHistory = $state<any[]>([]);

	$effect(() => {
		if (browser) {
			if (!$session.data?.user && !$session.isPending) {
				goto('/login');
			}
			if ($session.data?.user) {
				nameInput = $session.data.user.name || '';
				loadLoyalty();
			}
		}
	});

	async function loadLoyalty() {
		try {
			loyaltyInfo = await trpc().loyalty.getInfo.query();
			pointHistory = await trpc().loyalty.getHistory.query();
		} catch (e) {
			console.error('Error load loyalty', e);
		}
	}

	function startEditName() {
		nameInput = user?.name || '';
		editingName = true;
	}

	async function saveName() {
		if (!nameInput.trim()) return;
		isSavingName = true;
		try {
			await authClient.updateUser({ name: nameInput.trim() });
			addToast('Cập nhật tên thành công!', 'success');
			editingName = false;
			await invalidateAll();
		} catch (e: any) {
			addToast(e?.message || 'Có lỗi xảy ra.', 'error');
		} finally {
			isSavingName = false;
		}
	}

	async function savePassword() {
		if (newPassword.length < 8) {
			addToast('Mật khẩu mới phải ít nhất 8 ký tự.', 'error');
			return;
		}
		if (newPassword !== confirmPassword) {
			addToast('Mật khẩu xác nhận không khớp.', 'error');
			return;
		}
		isSavingPassword = true;
		try {
			await authClient.changePassword({
				currentPassword,
				newPassword,
				revokeOtherSessions: false
			});
			addToast('Đổi mật khẩu thành công!', 'success');
			showPasswordForm = false;
			currentPassword = '';
			newPassword = '';
			confirmPassword = '';
		} catch (e: any) {
			addToast(e?.message || 'Mật khẩu hiện tại không đúng.', 'error');
		} finally {
			isSavingPassword = false;
		}
	}

	function fmtDate(d: Date) {
		return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(d);
	}

	function fmtVND(v: number) {
		return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);
	}

	const roleLabel: Record<string, string> = { admin: 'Quản Trị Viên', user: 'Thành Viên' };
</script>

<svelte:head><title>Hồ Sơ Cá Nhân | KaraSystem</title></svelte:head>

{#if !user}
	<div class="flex items-center justify-center min-h-[50vh]">
		<span class="loading loading-spinner loading-lg text-primary"></span>
	</div>
{:else}
	<div class="max-w-2xl mx-auto flex flex-col gap-6">
		<div>
			<h2 class="text-xl font-bold">Hồ Sơ Cá Nhân</h2>
			<p class="text-sm text-base-content/40 font-medium mt-0.5">Quản lý thông tin tài khoản của bạn</p>
		</div>

		<div class="bg-base-100 rounded-xl border border-base-300/50 overflow-hidden">
			<div class="p-6 flex items-center gap-5 border-b border-base-200">
				<div class="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
					<Icon icon="solar:user-bold-duotone" class="text-primary text-3xl" />
				</div>
				<div class="flex-1 min-w-0">
					<p class="text-lg font-bold truncate">{user.name}</p>
					<p class="text-sm text-base-content/40 font-medium truncate">{user.email}</p>
					<div class="flex items-center gap-2 mt-1.5">
						<span class="badge badge-primary badge-xs rounded-md font-bold uppercase">{roleLabel[(user as any).role] || (user as any).role}</span>
						<span class="text-[11px] text-base-content/30 font-medium">Tham gia {fmtDate(user.createdAt)}</span>
					</div>
				</div>
			</div>
			{#if loyaltyInfo}
				<div class="p-6 border-b border-base-200">
					<div class="flex flex-col md:flex-row gap-6">
						<div class="flex-1">
							<div class="flex items-center gap-2 text-sm font-bold text-base-content/60 mb-2">
								<Icon icon="solar:star-fall-line-duotone" class="text-base text-warning"/>
								Hạng Thành Viên
							</div>
							<div class="flex items-center gap-3">
								<div class="badge badge-outline border-warning text-warning capitalize font-black text-lg p-4">{loyaltyInfo.tier}</div>
								{#if loyaltyInfo.nextTier}
									<p class="text-xs text-base-content/40 font-medium">
										Chi tiêu thêm <span class="font-bold text-primary">{fmtVND(loyaltyInfo.pointsNeeded)}</span> để lên hạng <span class="capitalize">{loyaltyInfo.nextTier}</span>
									</p>
								{/if}
							</div>
						</div>
						<div class="flex-1">
							<div class="flex items-center gap-2 text-sm font-bold text-base-content/60 mb-2">
								<Icon icon="solar:wallet-money-bold-duotone" class="text-base text-success"/>
								Điểm Kara Tích Lũy
							</div>
							<div class="flex items-end gap-2">
								<span class="text-3xl font-black text-success">{loyaltyInfo.points.toLocaleString('vi-VN')}</span>
								<span class="text-sm font-bold text-base-content/40 mb-1">Điểm</span>
							</div>
							<p class="text-[11px] mt-1 text-base-content/40 font-medium whitespace-nowrap">Tổng đã chi tiêu: {fmtVND(loyaltyInfo.totalSpent)}</p>
						</div>
					</div>
				</div>
			{/if}

			<div class="divide-y divide-base-200">
				<div class="p-6">
					<div class="flex items-center justify-between mb-4">
						<div class="flex items-center gap-2 text-sm font-bold text-base-content/60">
							<Icon icon="solar:user-id-line-duotone" class="text-base"/>
							Tên Hiển Thị
						</div>
						{#if !editingName}
							<button onclick={startEditName} class="btn btn-ghost btn-xs rounded-lg text-primary font-bold">
								<Icon icon="solar:pen-2-line-duotone" class="text-sm"/> Sửa
							</button>
						{/if}
					</div>
					{#if editingName}
						<div class="flex gap-2">
							<input type="text" bind:value={nameInput} class="input input-bordered input-sm flex-1 rounded-lg" placeholder="Nhập tên mới..." />
							<button onclick={saveName} class="btn btn-primary btn-sm rounded-lg font-bold px-4" disabled={isSavingName}>
								{#if isSavingName}<span class="loading loading-spinner loading-xs"></span>{:else}Lưu{/if}
							</button>
							<button onclick={() => editingName = false} class="btn btn-ghost btn-sm rounded-lg font-medium" disabled={isSavingName}>Hủy</button>
						</div>
					{:else}
						<p class="text-base font-medium">{user.name}</p>
					{/if}
				</div>

				<div class="p-6">
					<div class="flex items-center gap-2 text-sm font-bold text-base-content/60 mb-4">
						<Icon icon="solar:letter-line-duotone" class="text-base"/>
						Email
					</div>
					<p class="text-base font-medium text-base-content/70">{user.email}</p>
					<p class="text-xs text-base-content/30 font-medium mt-1">Email không thể thay đổi.</p>
				</div>

				<div class="p-6">
					<div class="flex items-center justify-between mb-4">
						<div class="flex items-center gap-2 text-sm font-bold text-base-content/60">
							<Icon icon="solar:lock-keyhole-line-duotone" class="text-base"/>
							Mật Khẩu
						</div>
						{#if !showPasswordForm}
							<button onclick={() => showPasswordForm = true} class="btn btn-ghost btn-xs rounded-lg text-primary font-bold">
								<Icon icon="solar:pen-2-line-duotone" class="text-sm"/> Đổi
							</button>
						{/if}
					</div>
					{#if showPasswordForm}
						<div class="flex flex-col gap-3">
							<input type="password" bind:value={currentPassword} class="input input-bordered input-sm rounded-lg" placeholder="Mật khẩu hiện tại" />
							<input type="password" bind:value={newPassword} class="input input-bordered input-sm rounded-lg" placeholder="Mật khẩu mới (tối thiểu 8 ký tự)" />
							<input type="password" bind:value={confirmPassword} class="input input-bordered input-sm rounded-lg" placeholder="Xác nhận mật khẩu mới" />
							<div class="flex gap-2 mt-1">
								<button onclick={savePassword} class="btn btn-primary btn-sm rounded-lg font-bold px-6" disabled={isSavingPassword}>
									{#if isSavingPassword}<span class="loading loading-spinner loading-xs"></span>{:else}Lưu Mật Khẩu{/if}
								</button>
								<button onclick={() => { showPasswordForm = false; currentPassword = ''; newPassword = ''; confirmPassword = ''; }} class="btn btn-ghost btn-sm rounded-lg font-medium" disabled={isSavingPassword}>Hủy</button>
							</div>
						</div>
					{:else}
						<p class="text-base font-medium text-base-content/40">••••••••</p>
					{/if}
				</div>
			</div>
		</div>
	</div>
{/if}
