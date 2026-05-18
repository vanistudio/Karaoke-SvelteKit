<script lang="ts">
	let {
		rows = 3,
		columns = 1,
		type = 'card'
	}: { rows?: number; columns?: number; type?: 'card' | 'table' | 'stat' } = $props();
</script>

{#if type === 'stat'}
	<div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
		{#each Array(4) as _}
			<div class="animate-pulse rounded-xl border border-base-300/50 bg-base-100 p-4">
				<div class="mb-2 h-3 w-16 rounded bg-base-300/50"></div>
				<div class="h-7 w-12 rounded bg-base-300/70"></div>
			</div>
		{/each}
	</div>
{:else if type === 'table'}
	<div class="animate-pulse overflow-hidden rounded-xl border border-base-300/50 bg-base-100">
		<div class="h-10 border-b border-base-200 bg-base-200/30"></div>
		{#each Array(rows) as _}
			<div class="flex items-center gap-4 border-b border-base-200/50 px-4 py-3">
				<div class="h-4 w-8 rounded bg-base-300/40"></div>
				<div class="h-4 w-32 rounded bg-base-300/50"></div>
				<div class="ml-auto h-4 w-20 rounded bg-base-300/30"></div>
			</div>
		{/each}
	</div>
{:else}
	<div class="grid grid-cols-1 {'md:grid-cols-' + columns} gap-4">
		{#each Array(rows) as _}
			<div class="animate-pulse rounded-xl border border-base-300/50 bg-base-100 p-5">
				<div class="mb-4 flex items-center gap-3">
					<div class="h-10 w-10 rounded-lg bg-base-300/50"></div>
					<div class="flex-1">
						<div class="mb-1.5 h-4 w-24 rounded bg-base-300/50"></div>
						<div class="h-3 w-16 rounded bg-base-300/30"></div>
					</div>
				</div>
				<div class="mb-2 h-3 w-full rounded bg-base-300/30"></div>
				<div class="h-3 w-3/4 rounded bg-base-300/20"></div>
			</div>
		{/each}
	</div>
{/if}
