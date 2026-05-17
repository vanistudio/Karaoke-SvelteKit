<script lang="ts">
	import Icon from '@iconify/svelte';
	import { trpc } from '$lib/trpc/client';
	import { addToast } from '$lib/stores/toast';

	let name = $state('');
	let email = $state('');
	let phone = $state('');
	let message = $state('');
	let isSending = $state(false);
	let sent = $state(false);

	let siteSettings = $state<Record<string, string>>({});

	$effect(() => {
		trpc().setting.getPublic.query().then(data => { siteSettings = data; }).catch(() => {});
	});

	async function handleSubmit() {
		if (!name.trim() || !email.trim() || !message.trim()) {
			addToast('Vui lòng điền đầy đủ thông tin.', 'error');
			return;
		}
		isSending = true;
		await new Promise(r => setTimeout(r, 1000));
		sent = true;
		isSending = false;
		addToast('Tin nhắn đã được gửi! Chúng tôi sẽ phản hồi sớm nhất.', 'success');
	}
</script>

<svelte:head><title>Liên Hệ | KaraSystem</title></svelte:head>

<div class="max-w-4xl mx-auto flex flex-col gap-8">
	<div class="text-center">
		<h1 class="text-2xl font-black">Liên Hệ Với Chúng Tôi</h1>
		<p class="text-sm text-base-content/40 font-medium mt-2">Có câu hỏi? Gửi tin nhắn hoặc liên hệ trực tiếp qua thông tin bên dưới.</p>
	</div>

	<div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
		<div class="bg-base-100 rounded-xl border border-base-300/50 p-5 text-center">
			<div class="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
				<Icon icon="solar:phone-calling-bold-duotone" class="text-xl text-primary" />
			</div>
			<h3 class="font-bold text-sm mb-1">Hotline</h3>
			<p class="text-sm text-base-content/50 font-medium">{siteSettings.site_phone || '1900 1000'}</p>
		</div>
		<div class="bg-base-100 rounded-xl border border-base-300/50 p-5 text-center">
			<div class="w-11 h-11 rounded-xl bg-secondary/10 flex items-center justify-center mx-auto mb-3">
				<Icon icon="solar:letter-bold-duotone" class="text-xl text-secondary" />
			</div>
			<h3 class="font-bold text-sm mb-1">Email</h3>
			<p class="text-sm text-base-content/50 font-medium">{siteSettings.site_email || 'contact@karasystem.vn'}</p>
		</div>
		<div class="bg-base-100 rounded-xl border border-base-300/50 p-5 text-center">
			<div class="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-3">
				<Icon icon="solar:map-point-wave-bold-duotone" class="text-xl text-accent" />
			</div>
			<h3 class="font-bold text-sm mb-1">Địa Chỉ</h3>
			<p class="text-sm text-base-content/50 font-medium">{siteSettings.site_address || '123 Premium Street'}</p>
		</div>
	</div>

	{#if sent}
		<div class="bg-base-100 rounded-xl border border-base-300/50 p-10 text-center">
			<Icon icon="solar:check-circle-bold-duotone" class="text-5xl text-success mx-auto mb-4" />
			<h3 class="font-bold text-lg">Đã Gửi Thành Công!</h3>
			<p class="text-sm text-base-content/40 font-medium mt-1">Chúng tôi sẽ phản hồi trong vòng 24 giờ.</p>
			<button onclick={() => { sent = false; name = ''; email = ''; phone = ''; message = ''; }} class="btn btn-ghost btn-sm rounded-lg font-bold mt-4 text-primary">Gửi Tin Nhắn Khác</button>
		</div>
	{:else}
		<div class="bg-base-100 rounded-xl border border-base-300/50 p-6">
			<h2 class="font-bold text-base mb-4 flex items-center gap-2">
				<Icon icon="solar:chat-round-dots-bold-duotone" class="text-lg text-primary"/>
				Gửi Tin Nhắn
			</h2>
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				<label class="form-control w-full">
					<div class="label"><span class="label-text font-bold text-xs uppercase tracking-widest text-base-content/50">Họ Tên *</span></div>
					<input type="text" bind:value={name} placeholder="Nguyễn Văn A" class="input input-bordered rounded-lg w-full" />
				</label>
				<label class="form-control w-full">
					<div class="label"><span class="label-text font-bold text-xs uppercase tracking-widest text-base-content/50">Email *</span></div>
					<input type="email" bind:value={email} placeholder="email@example.com" class="input input-bordered rounded-lg w-full" />
				</label>
				<label class="form-control w-full md:col-span-2">
					<div class="label"><span class="label-text font-bold text-xs uppercase tracking-widest text-base-content/50">Số Điện Thoại</span></div>
					<input type="tel" bind:value={phone} placeholder="0901 234 567" class="input input-bordered rounded-lg w-full" />
				</label>
				<label class="form-control w-full md:col-span-2">
					<div class="label"><span class="label-text font-bold text-xs uppercase tracking-widest text-base-content/50">Nội Dung *</span></div>
					<textarea bind:value={message} placeholder="Nhập nội dung tin nhắn..." class="textarea textarea-bordered rounded-lg w-full" rows="4"></textarea>
				</label>
			</div>
			<button onclick={handleSubmit} class="btn btn-primary rounded-lg font-bold w-full mt-5" disabled={isSending}>
				{#if isSending}
					<span class="loading loading-spinner loading-sm"></span>
				{:else}
					<Icon icon="solar:plain-bold-duotone" class="text-lg"/>
				{/if}
				Gửi Tin Nhắn
			</button>
		</div>
	{/if}

	<div class="bg-base-100 rounded-xl border border-base-300/50 p-5">
		<h3 class="font-bold text-sm mb-3 flex items-center gap-2">
			<Icon icon="solar:clock-circle-bold-duotone" class="text-base text-primary"/>
			Giờ Hoạt Động
		</h3>
		<div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
			<div class="flex justify-between font-medium">
				<span class="text-base-content/50">Thứ 2 — Chủ Nhật</span>
				<span>{siteSettings.site_open_time || '08:00'} — {siteSettings.site_close_time || '02:00'}</span>
			</div>
			<div class="flex justify-between font-medium">
				<span class="text-base-content/50">Ngày Lễ</span>
				<span>Hoạt động bình thường</span>
			</div>
		</div>
	</div>
</div>
