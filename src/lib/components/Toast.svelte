<script lang="ts">
	import { toasts, dismissToast, type ToastType } from '$lib/stores/toast';
	import Icon from '@iconify/svelte';
	import { fly, scale } from 'svelte/transition';
	import { flip } from 'svelte/animate';

	const typeToClasses: Record<ToastType, string> = {
		info: 'text-blue-500',
		success: 'text-emerald-500',
		warning: 'text-amber-500',
		error: 'text-rose-500'
	};

	const typeToIcon: Record<ToastType, string> = {
		info: 'solar:info-circle-bold',
		success: 'solar:check-circle-bold',
		warning: 'solar:danger-triangle-bold',
		error: 'solar:close-circle-bold-duotone'
	};
</script>

<div
	class="pointer-events-none fixed bottom-0 left-1/2 z-9999 flex w-full max-w-[356px] -translate-x-1/2 flex-col-reverse items-center justify-start gap-3 p-4 sm:p-6 md:p-8"
>
	{#each $toasts as toast (toast.id)}
		<div
			animate:flip={{ duration: 400 }}
			in:fly={{ y: 30, duration: 300, opacity: 0 }}
			out:scale={{ start: 0.95, duration: 250, opacity: 0 }}
			class="pointer-events-auto flex w-full cursor-default items-center gap-3.5 rounded-[14px] border border-base-200/80 bg-base-100 p-3.5 pl-4 shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all"
		>
			<Icon
				icon={typeToIcon[toast.type]}
				class="shrink-0 text-[22px] {typeToClasses[toast.type]}"
			/>
			<div class="flex flex-1 items-center">
				<span
					class="font-sans text-[13px] leading-tight font-semibold tracking-wide text-base-content"
					>{toast.message}</span
				>
			</div>
			<button
				class="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-base-200/50 text-base-content/40 transition-colors hover:bg-base-200 hover:text-base-content/80"
				onclick={() => dismissToast(toast.id)}
			>
				<Icon icon="solar:close-square-line-duotone" class="text-sm" />
			</button>
		</div>
	{/each}
</div>
