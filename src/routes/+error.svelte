<script lang="ts">
	import Icon from '@iconify/svelte';
</script>

<svelte:head><title>404 — Không Tìm Thấy | KaraSystem</title></svelte:head>

<div class="flex min-h-[60vh] items-center justify-center">
	<div class="max-w-md px-6 text-center">
		<div class="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
			<Icon icon="solar:ghost-bold-duotone" class="text-4xl text-primary" />
		</div>
		<h1 class="mb-2 text-6xl font-black text-base-content/10">404</h1>
		<h2 class="mb-2 text-xl font-bold">Trang Không Tồn Tại</h2>
		<p class="mb-6 text-sm font-medium text-base-content/40">
			Trang bạn tìm kiếm không tồn tại hoặc đã bị di chuyển.
		</p>
		<div class="flex items-center justify-center gap-3">
			<a href="/" class="btn rounded-lg px-6 font-bold btn-primary">
				<Icon icon="solar:home-2-bold-duotone" class="text-lg" />
				Về Trang Chủ
			</a>
			<button onclick={() => history.back()} class="btn rounded-lg font-bold btn-ghost">
				<Icon icon="solar:arrow-left-line-duotone" class="text-lg" />
				Quay Lại
			</button>
		</div>
	</div>
</div>
