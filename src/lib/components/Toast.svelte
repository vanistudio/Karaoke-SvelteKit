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

<div class="fixed bottom-0 left-1/2 -translate-x-1/2 z-9999 p-4 sm:p-6 md:p-8 flex flex-col-reverse items-center justify-start gap-3 pointer-events-none w-full max-w-[356px]">
	{#each $toasts as toast (toast.id)}
		<div
			animate:flip={{ duration: 400 }}
			in:fly={{ y: 30, duration: 300, opacity: 0 }}
			out:scale={{ start: 0.95, duration: 250, opacity: 0 }}
			class="pointer-events-auto flex items-center gap-3.5 w-full bg-base-100 border border-base-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-[14px] p-3.5 pl-4 transition-all cursor-default"
		>
			<Icon icon={typeToIcon[toast.type]} class="text-[22px] shrink-0 {typeToClasses[toast.type]}" />
			<div class="flex flex-1 items-center">
				<span class="text-[13px] font-semibold text-base-content font-sans tracking-wide leading-tight">{toast.message}</span>
			</div>
			<button 
				class="shrink-0 w-6 h-6 flex items-center justify-center rounded-md bg-base-200/50 text-base-content/40 hover:bg-base-200 hover:text-base-content/80 transition-colors" 
				onclick={() => dismissToast(toast.id)}
			>
				<Icon icon="solar:close-square-line-duotone" class="text-sm" />
			</button>
		</div>
	{/each}
</div>
