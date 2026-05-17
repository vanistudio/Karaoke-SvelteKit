<script lang="ts">
	import Icon from '@iconify/svelte';
</script>

<svelte:head><title>404 — Không Tìm Thấy | KaraSystem</title></svelte:head>

<div class="min-h-[60vh] flex items-center justify-center">
	<div class="text-center max-w-md px-6">
		<div class="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
			<Icon icon="solar:ghost-bold-duotone" class="text-4xl text-primary" />
		</div>
		<h1 class="text-6xl font-black text-base-content/10 mb-2">404</h1>
		<h2 class="text-xl font-bold mb-2">Trang Không Tồn Tại</h2>
		<p class="text-sm text-base-content/40 font-medium mb-6">Trang bạn tìm kiếm không tồn tại hoặc đã bị di chuyển.</p>
		<div class="flex items-center justify-center gap-3">
			<a href="/" class="btn btn-primary rounded-lg font-bold px-6">
				<Icon icon="solar:home-2-bold-duotone" class="text-lg"/>
				Về Trang Chủ
			</a>
			<button onclick={() => history.back()} class="btn btn-ghost rounded-lg font-bold">
				<Icon icon="solar:arrow-left-line-duotone" class="text-lg"/>
				Quay Lại
			</button>
		</div>
	</div>
</div>
