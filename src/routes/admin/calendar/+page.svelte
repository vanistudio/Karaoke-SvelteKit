<script lang="ts">
	import { trpc } from '$lib/trpc/client';
	import Icon from '@iconify/svelte';

	let selectedDate = $state(new Date().toISOString().slice(0, 10));
	let rooms = $state<any[]>([]);
	let bookings = $state<any[]>([]);
	let isReady = $state(false);

	const hours = Array.from({ length: 18 }, (_, i) => i + 6); // 6:00 - 23:00

	$effect(() => {
		loadData();
	});

	async function loadData() {
		isReady = false;
		try {
			const result = await trpc().calendar.getDay.query(selectedDate);
			rooms = result.rooms;
			bookings = result.bookings;
		} catch (e) {
			console.error(e);
		} finally {
			isReady = true;
		}
	}

	function changeDate(offset: number) {
		const d = new Date(selectedDate);
		d.setDate(d.getDate() + offset);
		selectedDate = d.toISOString().slice(0, 10);
		loadData();
	}

	function getBookingsForRoom(roomId: number) {
		return bookings.filter(b => b.roomId === roomId);
	}

	function getBlockStyle(bk: any): { left: string; width: string } {
		const start = new Date(bk.startTime);
		const end = new Date(bk.endTime);
		const startHour = start.getHours() + start.getMinutes() / 60;
		const endHour = end.getHours() + end.getMinutes() / 60;

		const gridStart = 6; // grid starts at 6:00
		const gridEnd = 24;  // grid ends at 24:00
		const totalHours = gridEnd - gridStart;

		const leftPercent = Math.max(0, ((startHour - gridStart) / totalHours) * 100);
		const widthPercent = Math.min(100 - leftPercent, ((endHour - startHour) / totalHours) * 100);

		return {
			left: `${leftPercent}%`,
			width: `${Math.max(widthPercent, 2)}%`
		};
	}

	function fmtTime(d: string | Date) {
		return new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit' }).format(new Date(d));
	}

	function fmtDateFull(d: string) {
		return new Intl.DateTimeFormat('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(d));
	}

	const statusColors: Record<string, string> = {
		pending: 'bg-amber-400/80 border-amber-500',
		confirmed: 'bg-emerald-400/80 border-emerald-500'
	};
</script>

<svelte:head><title>Lịch Phòng | KaraSystem Admin</title></svelte:head>

{#if !isReady}
	<div class="flex items-center justify-center min-h-[50vh]">
		<span class="loading loading-spinner loading-lg text-primary"></span>
	</div>
{:else}
	<div class="flex flex-col gap-6">
		<div class="flex items-center justify-between">
			<div>
				<h2 class="text-xl font-bold">Lịch Phòng</h2>
				<p class="text-sm text-base-content/40 font-medium mt-0.5">Tổng quan booking theo ngày — {rooms.length} phòng</p>
			</div>
		</div>

		<div class="flex items-center gap-3">
			<button onclick={() => changeDate(-1)} class="btn btn-ghost btn-sm btn-square rounded-lg">
				<Icon icon="solar:arrow-left-line-duotone" class="text-lg"/>
			</button>
			<input type="date" bind:value={selectedDate} onchange={loadData} class="input input-bordered input-sm rounded-lg font-medium text-sm" />
			<button onclick={() => changeDate(1)} class="btn btn-ghost btn-sm btn-square rounded-lg">
				<Icon icon="solar:arrow-right-line-duotone" class="text-lg"/>
			</button>
			<button onclick={() => { selectedDate = new Date().toISOString().slice(0, 10); loadData(); }} class="btn btn-ghost btn-sm rounded-lg font-bold text-xs text-primary">
				Hôm Nay
			</button>
			<span class="text-sm font-medium text-base-content/50 ml-2 capitalize">{fmtDateFull(selectedDate)}</span>
		</div>

		<div class="flex items-center gap-4 text-xs font-bold">
			<span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-sm bg-amber-400/80 border border-amber-500"></span> Chờ Duyệt</span>
			<span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-sm bg-emerald-400/80 border border-emerald-500"></span> Đã Xác Nhận</span>
		</div>

		<div class="bg-base-100 rounded-xl border border-base-300/50 overflow-hidden">
			<!-- Header: Hours -->
			<div class="flex border-b border-base-200">
				<div class="w-32 lg:w-40 shrink-0 px-3 py-2 bg-base-200/30 text-[10px] font-bold text-base-content/40 uppercase tracking-widest flex items-center">
					Phòng
				</div>
				<div class="flex-1 flex relative">
					{#each hours as hour}
						<div class="flex-1 text-center py-2 text-[10px] font-bold text-base-content/30 border-l border-base-200/50">
							{hour}:00
						</div>
					{/each}
				</div>
			</div>

			<!-- Rows: Rooms -->
			{#if rooms.length === 0}
				<div class="p-12 text-center text-base-content/30 font-medium text-sm">Chưa có phòng nào trong hệ thống.</div>
			{:else}
				{#each rooms as rm}
					{@const roomBookings = getBookingsForRoom(rm.id)}
					<div class="flex border-b border-base-200/50 hover:bg-base-200/20 transition-colors min-h-[48px]">
						<div class="w-32 lg:w-40 shrink-0 px-3 py-2 flex items-center gap-2 border-r border-base-200/50">
							<span class="text-xs font-bold truncate">{rm.name}</span>
							<span class="badge badge-ghost badge-xs rounded-md font-bold uppercase shrink-0">{rm.type}</span>
						</div>
						<div class="flex-1 relative">
							{#each roomBookings as bk}
								{@const style = getBlockStyle(bk)}
								<div
									class="absolute top-1 bottom-1 rounded-md border {statusColors[bk.status] || 'bg-base-300 border-base-400'} flex items-center px-2 overflow-hidden cursor-default group"
									style="left: {style.left}; width: {style.width};"
									title="{bk.userName || '—'} • {fmtTime(bk.startTime)} - {fmtTime(bk.endTime)}"
								>
									<span class="text-[10px] font-bold text-white truncate drop-shadow-sm">
										{bk.userName || '—'}
									</span>
								</div>
							{/each}
							<!-- Grid lines -->
							<div class="absolute inset-0 flex pointer-events-none">
								{#each hours as _}
									<div class="flex-1 border-l border-base-200/30"></div>
								{/each}
							</div>
						</div>
					</div>
				{/each}
			{/if}
		</div>
	</div>
{/if}
