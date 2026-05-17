<script lang="ts">
	let { rows = 3, columns = 1, type = 'card' }: { rows?: number; columns?: number; type?: 'card' | 'table' | 'stat' } = $props();
</script>

{#if type === 'stat'}
	<div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
		{#each Array(4) as _}
			<div class="bg-base-100 rounded-xl border border-base-300/50 p-4 animate-pulse">
				<div class="h-3 w-16 bg-base-300/50 rounded mb-2"></div>
				<div class="h-7 w-12 bg-base-300/70 rounded"></div>
			</div>
		{/each}
	</div>
{:else if type === 'table'}
	<div class="bg-base-100 rounded-xl border border-base-300/50 overflow-hidden animate-pulse">
		<div class="h-10 bg-base-200/30 border-b border-base-200"></div>
		{#each Array(rows) as _}
			<div class="flex items-center gap-4 px-4 py-3 border-b border-base-200/50">
				<div class="h-4 w-8 bg-base-300/40 rounded"></div>
				<div class="h-4 w-32 bg-base-300/50 rounded"></div>
				<div class="h-4 w-20 bg-base-300/30 rounded ml-auto"></div>
			</div>
		{/each}
	</div>
{:else}
	<div class="grid grid-cols-1 {'md:grid-cols-' + columns} gap-4">
		{#each Array(rows) as _}
			<div class="bg-base-100 rounded-xl border border-base-300/50 p-5 animate-pulse">
				<div class="flex items-center gap-3 mb-4">
					<div class="w-10 h-10 rounded-lg bg-base-300/50"></div>
					<div class="flex-1">
						<div class="h-4 w-24 bg-base-300/50 rounded mb-1.5"></div>
						<div class="h-3 w-16 bg-base-300/30 rounded"></div>
					</div>
				</div>
				<div class="h-3 w-full bg-base-300/30 rounded mb-2"></div>
				<div class="h-3 w-3/4 bg-base-300/20 rounded"></div>
			</div>
		{/each}
	</div>
{/if}
