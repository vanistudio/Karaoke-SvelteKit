<script lang="ts">
	import Icon from '@iconify/svelte';

	let { value = $bindable(), placeholder = 'Chọn giờ tới...' } = $props<{
		value?: string;
		placeholder?: string;
	}>();

	let isOpen = $state(false);

	let hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
	let minutes = ['00', '15', '30', '45'];
	let currentHour = $derived(value ? value.split(':')[0] : '19');
	let currentMin = $derived(value ? value.split(':')[1] : '00');

	function selectTime(h: string, m: string) {
		value = `${h}:${m}`;
		isOpen = false;
		if (document.activeElement instanceof HTMLElement) {
			document.activeElement.blur();
		}
	}

	function setHour(h: string) {
		value = `${h}:${currentMin}`;
	}

	function setMin(m: string) {
		value = `${currentHour}:${m}`;
	}
</script>

<div class="dropdown w-full">
	<div
		tabindex="0"
		role="button"
		class="input-bordered input flex w-full items-center justify-between rounded-md border-base-300"
		onclick={() => (isOpen = true)}
		onkeydown={(e) => e.key === 'Enter' && (isOpen = true)}
	>
		<div class="flex items-center gap-2 {value ? 'text-base-content' : 'text-base-content/50'}">
			<Icon icon="solar:clock-circle-line-duotone" class="text-xl" />
			<span class="mt-0.5 font-mono tracking-wide">{value || placeholder}</span>
		</div>
		<Icon icon="solar:alt-arrow-down-line-duotone" class="text-base-content/50" />
	</div>
	<div
		tabindex="-1"
		class="dropdown-content z-50 mt-2 w-80 rounded-md border border-base-300 bg-base-100 p-4 shadow-xl focus:outline-none"
	>
		<div class="mb-3 px-1 text-xs font-bold tracking-widest text-base-content/50 uppercase">
			Chọn Giờ
		</div>
		<div class="mb-5 grid grid-cols-6 gap-1">
			{#each hours as h}
				<button
					class="btn rounded-md font-mono btn-ghost transition-transform btn-sm active:scale-95 {currentHour ===
					h
						? 'bg-primary text-primary-content shadow-sm hover:bg-primary'
						: 'text-base-content/80 hover:bg-base-200'}"
					onclick={() => setHour(h)}
				>
					{h}
				</button>
			{/each}
		</div>
		<div class="mb-3 px-1 text-xs font-bold tracking-widest text-base-content/50 uppercase">
			Chọn Phút
		</div>
		<div class="mb-5 grid grid-cols-4 gap-2">
			{#each minutes as m}
				<button
					class="btn rounded-md font-mono btn-ghost transition-transform btn-sm active:scale-95 {currentMin ===
					m
						? 'bg-primary text-primary-content shadow-sm hover:bg-primary'
						: 'text-base-content/80 hover:bg-base-200'}"
					onclick={() => setMin(m)}
				>
					{m}
				</button>
			{/each}
		</div>
		<div class="flex items-center justify-between border-t border-base-200 pt-3">
			<div class="pl-2 font-mono text-2xl font-black tracking-widest text-primary">
				{currentHour}:{currentMin}
			</div>
			<button
				class="btn rounded-md px-6 shadow-sm transition-transform btn-sm btn-primary active:scale-95"
				onclick={() => {
					selectTime(currentHour, currentMin);
					if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
				}}
			>
				Xong
			</button>
		</div>
	</div>
</div>
