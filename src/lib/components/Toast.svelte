<script lang="ts">
	import { toasts, dismissToast, type ToastType } from '$lib/stores/toast';
	import Icon from '@iconify/svelte';

	const typeToClasses: Record<ToastType, string> = {
		info: 'alert-info bg-info/25 text-info border-info/20',
		success: 'alert-success bg-success/25 text-success border-success/20',
		warning: 'alert-warning bg-warning/25 text-warning border-warning/20',
		error: 'alert-error bg-error/25 text-error border-error/20'
	};

	const typeToIcon: Record<ToastType, string> = {
		info: 'solar:info-circle-line-duotone',
		success: 'solar:check-circle-line-duotone',
		warning: 'solar:danger-triangle-line-duotone',
		error: 'solar:close-circle-line-duotone'
	};
</script>

<div class="toast toast-bottom toast-center z-9999 mb-4 sm:mb-8">
	{#each $toasts as toast (toast.id)}
		<div class="alert {typeToClasses[toast.type]} shadow-lg rounded-md border flex items-center p-3 animate-in fade-in slide-in-from-bottom-4">
			<Icon icon={typeToIcon[toast.type]} class="text-xl shrink-0" />
			<span class="text-sm font-medium">{toast.message}</span>
			<button class="btn btn-ghost btn-circle btn-xs ml-2 opacity-50 hover:opacity-100" onclick={() => dismissToast(toast.id)}>
				<Icon icon="solar:close-square-line-duotone" class="text-lg" />
			</button>
		</div>
	{/each}
</div>
