<script lang="ts">
	import Icon from '@iconify/svelte';
	import { goto } from '$app/navigation';
	import { z } from 'zod';
	import { signUp } from '$lib/auth-client';
	import { addToast } from '$lib/stores/toast';
	const registerSchema = z
		.object({
			name: z.string().min(2, 'Tên hiển thị phải chứa ít nhất 2 ký tự.').trim(),
			email: z.string().email('Email không đúng định dạng.').trim(),
			password: z.string().min(8, 'Mật khẩu phải chứa ít nhất 8 ký tự.').trim(),
			passwordConfirm: z.string().min(8, 'Mật khẩu xác nhận phải chứa ít nhất 8 ký tự.').trim()
		})
		.refine((data) => data.password === data.passwordConfirm, {
			message: 'Mật khẩu xác nhận không khớp.',
			path: ['passwordConfirm']
		});

	let name = $state('');
	let email = $state('');
	let password = $state('');
	let passwordConfirm = $state('');
	let isPasswordVisible = $state(false);
	let isPasswordConfirmVisible = $state(false);

	let errorStore = $state<Record<string, string>>({});
	let globalError = $state<string | null>(null);
	let isSubmitting = $state(false);

	async function handleSubmit(e: Event) {
		e.preventDefault();
		errorStore = {};
		globalError = null;

		try {
			registerSchema.parse({ name, email, password, passwordConfirm });
		} catch (err) {
			if (err instanceof z.ZodError) {
				for (const issue of err.issues) {
					errorStore[issue.path[0] as string] = issue.message;
				}
			}
			return;
		}

		isSubmitting = true;

		const { data, error } = await signUp.email({
			name,
			email,
			password,
			callbackURL: '/verify-email'
		});

		isSubmitting = false;

		if (error) {
			globalError = error.message || 'Xảy ra lỗi trong quá trình khởi tạo tài khoản.';
		} else {
			addToast('Tạo tài khoản thành công! Khám phá phòng hát ngay.', 'success');
			await goto('/verify-email?sent=1', { invalidateAll: true });
		}
	}
</script>

<svelte:head>
	<title>Đăng Ký Tài Khoản | KaraSystem</title>
</svelte:head>

<div class="flex min-h-screen items-center justify-center bg-base-200 px-4 py-8">
	<div class="card w-full max-w-md rounded-md border border-base-300 bg-base-100 shadow-sm">
		<div class="card-body p-6 lg:p-8">
			<div class="mb-6 w-full text-center">
				<div
					class="mb-4 badge rounded-md px-4 py-3 font-mono font-bold tracking-widest badge-primary"
				>
					ĐĂNG KÝ THÀNH VIÊN
				</div>
				<h2
					class="mb-2 flex items-center justify-center gap-2 text-3xl leading-tight font-black tracking-widest text-base-content uppercase"
				>
					<Icon icon="solar:microphone-3-line-duotone" class="text-[38px] text-primary" />
					KARA<span class="text-primary">SYSTEM</span>
				</h2>
				<p class="py-2 text-sm font-medium text-base-content/70">
					Điền thông tin để đăng ký tài khoản khách hàng, tích điểm và nhận ưu đãi riêng.
				</p>
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
							>Họ và Tên</span
						>
					</div>
					<input
						type="text"
						bind:value={name}
						class="input-bordered input w-full rounded-md border-base-300 {errorStore.name
							? 'input-error focus-within:border-error'
							: 'focus:border-primary'}"
						placeholder="Nguyễn Văn A"
					/>
					{#if errorStore.name}
						<div class="label pt-2 pb-0 text-[11px] font-bold text-error">
							{errorStore.name}
						</div>
					{/if}
				</div>
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
					<div class="label items-end pt-0 pb-2">
						<span
							class="label-text text-[11px] font-bold tracking-widest text-base-content/80 uppercase"
							>Mật khẩu bảo mật</span
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
				<div class="form-control w-full">
					<div class="label items-end pt-0 pb-2">
						<span
							class="label-text text-[11px] font-bold tracking-widest text-base-content/80 uppercase"
							>Xác nhận mật khẩu</span
						>
					</div>
					<div class="relative">
						<input
							type={isPasswordConfirmVisible ? 'text' : 'password'}
							bind:value={passwordConfirm}
							class="input-bordered input w-full rounded-md border-base-300 pr-12 {errorStore.passwordConfirm
								? 'input-error focus-within:border-error'
								: 'focus:border-primary'}"
							placeholder="••••••••"
						/>
						<button
							type="button"
							class="btn absolute top-1/2 right-2 h-8 min-h-0 -translate-y-1/2 px-2 btn-ghost btn-sm"
							onclick={() => (isPasswordConfirmVisible = !isPasswordConfirmVisible)}
							aria-label={isPasswordConfirmVisible ? 'Hide password' : 'Show password'}
						>
							<Icon
								icon={isPasswordConfirmVisible
									? 'solar:eye-closed-line-duotone'
									: 'solar:eye-line-duotone'}
								class="text-lg text-base-content/70"
							/>
						</button>
					</div>
					{#if errorStore.passwordConfirm}
						<div class="label pt-2 pb-0 text-[11px] font-bold text-error">
							{errorStore.passwordConfirm}
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
							<Icon icon="solar:round-alt-arrow-right-line-duotone" class="text-xl" />
							Tạo Tài Khoản
						{/if}
					</button>
				</div>
			</form>
			<div class="divider my-6 text-[11px] font-bold text-base-content/30">ĐÃ CÓ TÀI KHOẢN?</div>
			<p class="text-center text-[12px] font-medium tracking-widest text-base-content/70 uppercase">
				Đã có tài khoản thành viên?
				<a href="/login" class="ml-1 font-bold text-primary underline-offset-4 hover:underline"
					>Đăng Nhập</a
				>
			</p>
		</div>
	</div>
</div>

