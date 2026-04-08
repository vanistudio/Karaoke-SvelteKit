<script lang="ts">
	import Icon from '@iconify/svelte';
	import { goto } from '$app/navigation';
	import { z } from 'zod';
	import { createAuthClient } from 'better-auth/svelte';
	const { signUp } = createAuthClient();
	const registerSchema = z.object({
		name: z.string().min(2, 'Tên hiển thị phải chứa ít nhất 2 ký tự.').trim(),
		email: z.string().email('Email không đúng định dạng.').trim(),
		password: z.string().min(8, 'Mật khẩu phải chứa ít nhất 8 ký tự.').trim(),
		passwordConfirm: z.string().min(8, 'Mật khẩu xác nhận phải chứa ít nhất 8 ký tự.').trim()
	}).refine((data) => data.password === data.passwordConfirm, {
		message: 'Mật khẩu xác nhận không khớp.',
		path: ['passwordConfirm']
	});

	let name = $state('');
	let email = $state('');
	let password = $state('');
	let passwordConfirm = $state('');
	
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
			password
		});

		isSubmitting = false;

		if (error) {
			globalError = error.message || 'Xảy ra lỗi trong quá trình khởi tạo tài khoản.';
		} else {
			goto('/');
		}
	}
</script>

<svelte:head>
	<title>Đăng Ký Tài Khoản | KaraSystem</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center bg-base-200 px-4 py-8">
	<div class="card bg-base-100 rounded-md border border-base-300 w-full max-w-md shadow-sm">
		<div class="card-body p-6 lg:p-8">
			<div class="text-center w-full mb-6">
				<div class="badge badge-primary rounded-md mb-4 tracking-widest font-bold font-mono px-4 py-3">ĐĂNG KÝ THÀNH VIÊN</div>
				<h2 class="text-3xl font-black uppercase tracking-widest text-base-content mb-2 leading-tight flex justify-center items-center gap-2">
					<Icon icon="solar:microphone-3-line-duotone" class="text-primary text-[38px]"/>
					KARA<span class="text-primary">SYSTEM</span>
				</h2>
				<p class="py-2 text-base-content/70 font-medium text-sm">Điền thông tin để đăng ký tài khoản khách hàng, tích điểm và nhận ưu đãi riêng.</p>
			</div>

			{#if globalError}
				<div class="bg-error/10 border border-error/20 rounded-md p-4 mb-4 flex items-start gap-3">
					<Icon icon="solar:danger-triangle-line-duotone" class="text-error text-xl shrink-0 mt-0.5" />
					<p class="text-error text-sm font-medium">{globalError}</p>
				</div>
			{/if}

			<form onsubmit={handleSubmit} class="flex flex-col gap-5">
				<div class="form-control w-full">
					<div class="label pb-2 pt-0 items-end">
						<span class="label-text font-bold uppercase tracking-widest text-[11px] text-base-content/80">Họ và Tên</span>
					</div>
					<input type="text" bind:value={name} class="input input-bordered rounded-md border-base-300 w-full {errorStore.name ? 'input-error focus-within:border-error' : 'focus:border-primary'}" placeholder="Nguyễn Văn A" />
					{#if errorStore.name}
						<div class="label pb-0 pt-2 text-[11px] font-bold text-error">
							{errorStore.name}
						</div>
					{/if}
				</div>
				<div class="form-control w-full">
					<div class="label pb-2 pt-0 items-end">
						<span class="label-text font-bold uppercase tracking-widest text-[11px] text-base-content/80">Địa chỉ Email</span>
					</div>
					<input type="email" bind:value={email} class="input input-bordered rounded-md border-base-300 w-full {errorStore.email ? 'input-error focus-within:border-error' : 'focus:border-primary'}" placeholder="khachhang@example.com" />
					{#if errorStore.email}
						<div class="label pb-0 pt-2 text-[11px] font-bold text-error">
							{errorStore.email}
						</div>
					{/if}
				</div>
				<div class="form-control w-full">
					<div class="label pb-2 pt-0 items-end">
						<span class="label-text font-bold uppercase tracking-widest text-[11px] text-base-content/80">Mật khẩu bảo mật</span>
					</div>
					<input type="password" bind:value={password} class="input input-bordered rounded-md border-base-300 w-full {errorStore.password ? 'input-error focus-within:border-error' : 'focus:border-primary'}" placeholder="••••••••" />
					{#if errorStore.password}
						<div class="label pb-0 pt-2 text-[11px] font-bold text-error">
							{errorStore.password}
						</div>
					{/if}
				</div>
				<div class="form-control w-full">
					<div class="label pb-2 pt-0 items-end">
						<span class="label-text font-bold uppercase tracking-widest text-[11px] text-base-content/80">Xác nhận mật khẩu</span>
					</div>
					<input type="password" bind:value={passwordConfirm} class="input input-bordered rounded-md border-base-300 w-full {errorStore.passwordConfirm ? 'input-error focus-within:border-error' : 'focus:border-primary'}" placeholder="••••••••" />
					{#if errorStore.passwordConfirm}
						<div class="label pb-0 pt-2 text-[11px] font-bold text-error">
							{errorStore.passwordConfirm}
						</div>
					{/if}
				</div>

				<div class="card-actions mt-4">
					<button type="submit" class="btn btn-primary w-full rounded-md font-bold tracking-widest uppercase h-12" disabled={isSubmitting}>
						{#if isSubmitting}
							<span class="loading loading-spinner loading-sm"></span>
						{:else}
							<Icon icon="solar:round-alt-arrow-right-line-duotone" class="text-xl" />
							Tạo Tài Khoản
						{/if}
					</button>
				</div>
			</form>
			<div class="divider text-[11px] font-bold text-base-content/30 my-6">ĐÃ CÓ TÀI KHOẢN?</div>
            <p class="text-center text-[12px] font-medium text-base-content/70 uppercase tracking-widest">
				Đã có tài khoản thành viên? 
				<a href="/login" class="text-primary font-bold hover:underline underline-offset-4 ml-1">Đăng Nhập</a>
			</p>
		</div>
	</div>
</div>
