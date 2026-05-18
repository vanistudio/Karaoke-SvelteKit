<script lang="ts">
	import Icon from '@iconify/svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { z } from 'zod';
	import { signIn } from '$lib/auth-client';
	import { addToast } from '$lib/stores/toast';

	const loginSchema = z.object({
		email: z.string().email('Email không đúng định dạng.').trim(),
		password: z.string().min(8, 'Mật khẩu phải chứa ít nhất 8 ký tự.').trim()
	});

	let email = $state('');
	let password = $state('');
	let isPasswordVisible = $state(false);

	let errorStore = $state<Record<string, string>>({});
	let globalError = $state<string | null>(null);
	let isSubmitting = $state(false);
	let verifyFeedbackShown = $state(false);

	$effect(() => {
		const error = $page.url.searchParams.get('error');
		if (!error || verifyFeedbackShown) return;

		verifyFeedbackShown = true;
		addToast(
			error === 'token_expired'
				? 'Liên kết xác thực đã hết hạn. Hãy gửi lại email xác thực.'
				: 'Xác thực email không thành công. Hãy thử lại.',
			'error'
		);
	});

	async function handleSubmit(e: Event) {
		e.preventDefault();
		errorStore = {};
		globalError = null;

		try {
			loginSchema.parse({ email, password });
		} catch (err) {
			if (err instanceof z.ZodError) {
				for (const issue of err.issues) {
					errorStore[issue.path[0] as string] = issue.message;
				}
			}
			return;
		}

		isSubmitting = true;

		const { error } = await signIn.email({
			email,
			password
		});

		isSubmitting = false;

		if (error) {
			globalError = error.message || 'Mật khẩu hoặc tài khoản không hợp lệ.';
		} else {
			addToast('Đăng nhập thành công! Chào mừng trở lại.', 'success');
			await goto('/', { invalidateAll: true });
		}
	}
</script>

<svelte:head>
	<title>Đăng Nhập | KaraSystem</title>
</svelte:head>

<div class="flex min-h-[85vh] items-center justify-center bg-base-200 px-4 py-8">
	<div class="card w-full max-w-md rounded-md border border-base-300 bg-base-100 shadow-sm">
		<div class="card-body p-6 lg:p-8">
			<div class="mb-6 w-full text-center">
				<div
					class="mb-4 badge rounded-md px-4 py-3 font-mono font-bold tracking-widest badge-primary"
				>
					THÀNH VIÊN
				</div>
				<h2
					class="mb-2 flex items-center justify-center gap-2 text-3xl leading-tight font-black tracking-tight text-base-content uppercase"
				>
					<Icon icon="solar:microphone-3-line-duotone" class="text-[38px] text-primary" />
					KARA<span class="text-primary">SYSTEM</span>
				</h2>
				<p class="py-2 text-sm font-medium text-base-content/70">
					Đăng nhập tài khoản khách hàng để đặt phòng và tích điểm ưu đãi.
				</p>
			</div>

			<div class="mb-4 rounded-md border border-warning/20 bg-warning/10 p-4">
				<div class="flex items-start gap-3">
					<Icon icon="solar:shield-warning-line-duotone" class="mt-0.5 shrink-0 text-xl text-warning" />
					<div class="text-sm font-medium text-base-content/70">
						<p class="mb-1 font-bold text-base-content">Chưa xác thực email?</p>
						<p>
							Bạn vẫn có thể đăng nhập, sau đó vào
							<a href="/verify-email" class="font-bold text-primary underline-offset-4 hover:underline">
								trang xác thực email
							</a>
							để gửi lại liên kết.
						</p>
					</div>
				</div>
			</div>

			{#if globalError}
				<div class="mb-4 flex items-start gap-3 rounded-md border border-error/20 bg-error/10 p-4">
					<Icon
						icon="solar:danger-triangle-line-duotone"
						class="mt-0.5 shrink-0 text-xl text-error"
					/>
					<p class="text-sm font-medium text-error">{globalError}</p>
				</div>
			{/if}
			<form onsubmit={handleSubmit} class="flex flex-col gap-5">
				<div class="form-control w-full">
					<div class="label items-end pt-0 pb-2">
						<span
							class="label-text text-[11px] font-bold tracking-widest text-base-content/80 uppercase"
							>Địa chỉ Email</span
						>
					</div>
					<input
						type="email"
						bind:value={email}
						class="input-bordered input w-full rounded-md border-base-300 {errorStore.email
							? 'input-error focus-within:border-error'
							: 'focus:border-primary'}"
						placeholder="khachhang@example.com"
					/>
					{#if errorStore.email}
						<div class="label pt-2 pb-0 text-[11px] font-bold text-error">
							{errorStore.email}
						</div>
					{/if}
				</div>
				<div class="form-control w-full">
					<div class="label flex items-end justify-between pt-0 pb-2">
						<span
							class="label-text text-[11px] font-bold tracking-widest text-base-content/80 uppercase"
							>Mật khẩu bảo mật</span
						>
						<a
							href="/"
							class="text-[11px] font-bold tracking-widest text-primary uppercase underline-offset-4 hover:underline"
							>Quên mật khẩu?</a
						>
					</div>
					<div class="relative">
						<input
							type={isPasswordVisible ? 'text' : 'password'}
							bind:value={password}
							class="input-bordered input w-full rounded-md border-base-300 pr-12 {errorStore.password
								? 'input-error focus-within:border-error'
								: 'focus:border-primary'}"
							placeholder="••••••••"
						/>
						<button
							type="button"
							class="btn absolute top-1/2 right-2 h-8 min-h-0 -translate-y-1/2 px-2 btn-ghost btn-sm"
							onclick={() => (isPasswordVisible = !isPasswordVisible)}
							aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
						>
							<Icon
								icon={isPasswordVisible
									? 'solar:eye-closed-line-duotone'
									: 'solar:eye-line-duotone'}
								class="text-lg text-base-content/70"
							/>
						</button>
					</div>
					{#if errorStore.password}
						<div class="label pt-2 pb-0 text-[11px] font-bold text-error">
							{errorStore.password}
						</div>
					{/if}
				</div>
				<div class="mt-4 card-actions">
					<button
						type="submit"
						class="btn h-12 w-full rounded-md font-bold tracking-widest uppercase btn-primary"
						disabled={isSubmitting}
					>
						{#if isSubmitting}
							<span class="loading loading-sm loading-spinner"></span>
						{:else}
							<Icon icon="solar:login-2-line-duotone" class="text-xl" />
							Đăng Nhập
						{/if}
					</button>
				</div>
			</form>
			<div class="divider my-6 text-[11px] font-bold text-base-content/30">HOẶC</div>
			<p class="text-center text-[12px] font-medium tracking-widest text-base-content/70 uppercase">
				Chưa có tài khoản thành viên?
				<a href="/register" class="ml-1 font-bold text-primary underline-offset-4 hover:underline"
					>Đăng Ký</a
				>
			</p>
		</div>
	</div>
</div>
