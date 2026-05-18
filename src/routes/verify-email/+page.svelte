<script lang="ts">
	import Icon from '@iconify/svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { authClient, sendVerificationEmail } from '$lib/auth-client';
	import { addToast } from '$lib/stores/toast';

	const session = authClient.useSession();

	let resendEmail = $state('');
	let isSending = $state(false);

	let user = $derived($session.data?.user ?? $page.data.user);
	let errorCode = $derived($page.url.searchParams.get('error'));
	let sent = $derived($page.url.searchParams.get('sent') === '1');
	let isVerified = $derived(Boolean(user?.emailVerified));
	let hasUserEmail = $derived(Boolean(user?.email));
	let status = $derived.by(() => {
		if (errorCode) return 'error';
		if (isVerified) return 'verified';
		return 'pending';
	});

	$effect(() => {
		if (user?.email && resendEmail !== user.email) {
			resendEmail = user.email;
		}
	});

	function getErrorMessage(error: string | null) {
		if (error === 'token_expired') return 'Liên kết xác thực đã hết hạn.';
		if (error === 'invalid_token') return 'Liên kết xác thực không hợp lệ.';
		if (error === 'user_not_found') return 'Không tìm thấy tài khoản để xác thực.';
		return 'Xác thực email không thành công.';
	}

	async function handleResend() {
		if (!resendEmail.trim()) {
			addToast('Vui lòng nhập email để gửi lại liên kết xác thực.', 'error');
			return;
		}

		isSending = true;
		try {
			const { error } = await sendVerificationEmail({
				email: resendEmail.trim(),
				callbackURL: '/verify-email'
			});

			if (error) {
				throw new Error(error.message || 'Không thể gửi email xác thực.');
			}

			addToast('Đã gửi lại email xác thực.', 'success');
			await goto('/verify-email?sent=1', { invalidateAll: true });
		} catch (e: any) {
			addToast(e?.message || 'Không thể gửi email xác thực.', 'error');
		} finally {
			isSending = false;
		}
	}
</script>

<svelte:head>
	<title>Xác Thực Email | KaraSystem</title>
</svelte:head>

<div class="mx-auto flex min-h-[70vh] max-w-2xl items-center justify-center px-4 py-10">
	<div class="w-full rounded-2xl border border-base-300 bg-base-100 shadow-sm">
		<div class="border-b border-base-200 px-6 py-6 text-center lg:px-8">
			<div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
				<Icon
					icon={status === 'verified'
						? 'solar:shield-check-line-duotone'
						: status === 'error'
							? 'solar:shield-warning-line-duotone'
							: 'solar:letter-opened-line-duotone'}
					class="text-3xl {status === 'verified'
						? 'text-success'
						: status === 'error'
							? 'text-error'
							: 'text-primary'}"
				/>
			</div>
			<h1 class="text-2xl font-black tracking-wide text-base-content uppercase">
				Xác thực email
			</h1>
			<p class="mt-2 text-sm font-medium text-base-content/60">
				Hoàn tất xác thực để đảm bảo tài khoản KaraSystem của bạn luôn khớp với hộp thư sở hữu.
			</p>
		</div>

		<div class="px-6 py-6 lg:px-8">
			{#if status === 'verified'}
				<div class="rounded-xl border border-success/20 bg-success/10 p-5">
					<div class="flex items-start gap-3">
						<Icon icon="solar:verified-check-line-duotone" class="mt-0.5 text-2xl text-success" />
						<div>
							<h2 class="text-base font-bold text-success">Email đã được xác thực</h2>
							<p class="mt-1 text-sm font-medium text-base-content/70">
								{user?.email || 'Tài khoản của bạn'} đã được xác thực thành công.
							</p>
						</div>
					</div>
				</div>
			{:else if status === 'error'}
				<div class="rounded-xl border border-error/20 bg-error/10 p-5">
					<div class="flex items-start gap-3">
						<Icon icon="solar:danger-triangle-line-duotone" class="mt-0.5 text-2xl text-error" />
						<div>
							<h2 class="text-base font-bold text-error">Liên kết xác thực không dùng được</h2>
							<p class="mt-1 text-sm font-medium text-base-content/70">
								{getErrorMessage(errorCode)}
							</p>
						</div>
					</div>
				</div>
			{:else}
				<div class="rounded-xl border border-primary/15 bg-primary/5 p-5">
					<div class="flex items-start gap-3">
						<Icon icon="solar:mailbox-line-duotone" class="mt-0.5 text-2xl text-primary" />
						<div>
							<h2 class="text-base font-bold text-base-content">Kiểm tra hộp thư của bạn</h2>
							<p class="mt-1 text-sm font-medium text-base-content/70">
								{#if sent}
									Chúng tôi vừa gửi email xác thực mới.
								{:else}
									Email xác thực đã sẵn sàng. Hãy mở hộp thư và nhấn vào liên kết xác thực.
								{/if}
							</p>
						</div>
					</div>
				</div>
			{/if}

			<div class="mt-6 flex flex-col gap-3 rounded-xl border border-base-200 bg-base-50 p-5">
				<div>
					<p class="text-[11px] font-bold tracking-widest text-base-content/50 uppercase">
						Email xác thực
					</p>
					{#if hasUserEmail}
						<p class="mt-1 text-sm font-semibold text-base-content">{user?.email}</p>
					{:else}
						<input
							type="email"
							bind:value={resendEmail}
							placeholder="email@example.com"
							class="input input-bordered mt-2 w-full rounded-lg"
						/>
					{/if}
				</div>

				<p class="text-sm font-medium text-base-content/50">
					Không thấy email? Kiểm tra thư mục spam hoặc gửi lại một liên kết mới.
				</p>

				<div class="flex flex-col gap-3 sm:flex-row">
					<button
						onclick={handleResend}
						class="btn btn-primary rounded-lg font-bold"
						disabled={isSending || isVerified}
					>
						{#if isSending}
							<span class="loading loading-spinner loading-sm"></span>
						{:else}
							<Icon icon="solar:plain-2-line-duotone" class="text-lg" />
						{/if}
						Gửi lại email xác thực
					</button>
					<a href="/profile" class="btn btn-ghost rounded-lg font-bold">
						<Icon icon="solar:user-circle-line-duotone" class="text-lg" />
						Về hồ sơ cá nhân
					</a>
				</div>
			</div>
		</div>
	</div>
</div>
