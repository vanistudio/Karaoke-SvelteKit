<script lang="ts">
	import Icon from '@iconify/svelte';
	let { 
		value = $bindable(), 
		placeholder = 'Chọn ngày hát...' 
	} = $props<{ value?: Date, placeholder?: string }>();
	let isOpen = $state(false);
	let dropDownRef: HTMLDivElement;
	let viewDate = $state(value ? new Date(value) : new Date());
	let currentMonth = $derived(viewDate.getMonth());
	let currentYear = $derived(viewDate.getFullYear());
	const monthNames = [
		'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
		'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
	];
	const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
	let daysInMonth = $derived(new Date(currentYear, currentMonth + 1, 0).getDate());
	let firstDayIndex = $derived(new Date(currentYear, currentMonth, 1).getDay());
	let calendarDays = $derived.by(() => {
		let days = [];
		for (let i = 0; i < firstDayIndex; i++) {
			days.push(null);
		}
		for (let i = 1; i <= daysInMonth; i++) {
			days.push(i);
		}
		return days;
	});

	function prevMonth() {
		viewDate = new Date(currentYear, currentMonth - 1, 1);
	}

	function nextMonth() {
		viewDate = new Date(currentYear, currentMonth + 1, 1);
	}
	function selectDate(day: number) {
		const newDate = new Date(currentYear, currentMonth, day);
		value = newDate;
		isOpen = false;
        if(document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
        }
	}
	function formatDate(d: Date | undefined) {
		if (!d) return placeholder;
		return d.toLocaleDateString('vi-VN', {
			day: '2-digit', month: '2-digit', year: 'numeric'
		});
	}
	let displayValue = $derived(formatDate(value));
	function isSelected(day: number) {
		if (!value) return false;
		return value.getDate() === day && value.getMonth() === currentMonth && value.getFullYear() === currentYear;
	}
	function isToday(day: number) {
		const today = new Date();
		return today.getDate() === day && today.getMonth() === currentMonth && today.getFullYear() === currentYear;
	}

	function isPast(day: number) {
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		return new Date(currentYear, currentMonth, day) < today;
	}
</script>

<div class="dropdown w-full" bind:this={dropDownRef}>
	<div 
		tabindex="0" 
		role="button" 
		class="input input-bordered rounded-md border-base-300 w-full flex items-center justify-between {isOpen ? 'border-primary outline-none' : ''}" 
		onclick={() => isOpen = true}
        onkeydown={(e) => e.key === 'Enter' && (isOpen = true)}
	>
		<div class="flex items-center gap-2 {value ? 'text-base-content' : 'text-base-content/50'}">
			<Icon icon="solar:calendar-date-line-duotone" class="text-xl" />
			<span>{displayValue}</span>
		</div>
		<Icon icon="solar:alt-arrow-down-line-duotone" class="text-base-content/50" />
	</div>
	<div 
		tabindex="-1" 
		class="dropdown-content z-50 bg-base-100 shadow-xl border border-base-300 rounded-md w-72 p-4 mt-2 focus:outline-none"
	>
		<div class="flex justify-between items-center mb-4">
			<button class="btn btn-sm btn-ghost btn-square" onclick={prevMonth}>
				<Icon icon="solar:alt-arrow-left-line-duotone" class="text-lg" />
			</button>
			<span class="font-bold text-sm tracking-wide">{monthNames[currentMonth]} {currentYear}</span>
			<button class="btn btn-sm btn-ghost btn-square" onclick={nextMonth}>
				<Icon icon="solar:alt-arrow-right-line-duotone" class="text-lg" />
			</button>
		</div>
		<div class="grid grid-cols-7 gap-1 text-center mb-2">
			{#each dayNames as day}
				<div class="text-xs font-semibold text-base-content/50">{day}</div>
			{/each}
		</div>
		<div class="grid grid-cols-7 gap-1">
			{#each calendarDays as day}
				{#if day}
					<button 
						disabled={isPast(day)}
						class="btn btn-sm btn-square w-full rounded-md transition-transform active:scale-95 {isPast(day) ? 'btn-disabled opacity-30 bg-base-200' : 'btn-ghost hover:bg-base-200'} {isSelected(day) ? 'bg-primary! text-primary-content! font-bold shadow-sm' : isToday(day) && !isSelected(day) ? 'border-primary border text-primary font-bold' : ''}"
						onclick={() => selectDate(day)}
					>
						{day}
					</button>
				{:else}
					<div></div>
				{/if}
			{/each}
		</div>
	</div>
</div>
