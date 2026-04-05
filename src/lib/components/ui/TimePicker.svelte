<script lang="ts">
	import Icon from '@iconify/svelte';

	let { 
		value = $bindable(), 
		placeholder = 'Chọn giờ tới...' 
	} = $props<{ value?: string, placeholder?: string }>();

	let isOpen = $state(false);

	let hours = Array.from({length: 24}, (_, i) => i.toString().padStart(2, '0'));
	let minutes = ['00', '15', '30', '45'];
	let currentHour = $derived(value ? value.split(':')[0] : '19');
	let currentMin = $derived(value ? value.split(':')[1] : '00');

	function selectTime(h: string, m: string) {
		value = `${h}:${m}`;
		isOpen = false;
        if(document.activeElement instanceof HTMLElement) {
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
		class="input input-bordered rounded-md border-base-300 w-full flex items-center justify-between"
		onclick={() => isOpen = true}
        onkeydown={(e) => e.key === 'Enter' && (isOpen = true)}
	>
		<div class="flex items-center gap-2 {value ? 'text-base-content' : 'text-base-content/50'}">
			<Icon icon="solar:clock-circle-line-duotone" class="text-xl" />
			<span class="font-mono tracking-wide mt-0.5">{value || placeholder}</span>
		</div>
		<Icon icon="solar:alt-arrow-down-line-duotone" class="text-base-content/50" />
	</div>
	<div 
		tabindex="-1" 
		class="dropdown-content z-50 bg-base-100 shadow-xl border border-base-300 rounded-md w-80 p-4 mt-2 focus:outline-none"
	>
		<div class="text-xs font-bold text-base-content/50 uppercase tracking-widest mb-3 px-1">Chọn Giờ</div>
		<div class="grid grid-cols-6 gap-1 mb-5">
			{#each hours as h}
				<button 
					class="btn btn-sm btn-ghost rounded-md font-mono transition-transform active:scale-95 {currentHour === h ? 'bg-primary text-primary-content hover:bg-primary shadow-sm' : 'hover:bg-base-200 text-base-content/80'}"
					onclick={() => setHour(h)}
				>
					{h}
				</button>
			{/each}
		</div>
		<div class="text-xs font-bold text-base-content/50 uppercase tracking-widest mb-3 px-1">Chọn Phút</div>
		<div class="grid grid-cols-4 gap-2 mb-5">
			{#each minutes as m}
				<button 
					class="btn btn-sm btn-ghost rounded-md font-mono transition-transform active:scale-95 {currentMin === m ? 'bg-primary text-primary-content hover:bg-primary shadow-sm' : 'hover:bg-base-200 text-base-content/80'}"
					onclick={() => setMin(m)}
				>
					{m}
				</button>
			{/each}
		</div>
        <div class="border-t border-base-200 pt-3 flex justify-between items-center">
			<div class="text-2xl font-black font-mono tracking-widest text-primary pl-2">{currentHour}:{currentMin}</div>
            <button class="btn btn-primary btn-sm rounded-md px-6 transition-transform active:scale-95 shadow-sm" onclick={() => {
				selectTime(currentHour, currentMin);
                if(document.activeElement instanceof HTMLElement) document.activeElement.blur();
            }}>
                Xong
            </button>
        </div>
	</div>
</div>