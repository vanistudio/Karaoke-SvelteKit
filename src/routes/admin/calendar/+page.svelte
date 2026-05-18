<script lang="ts">
	import { trpc } from '$lib/trpc/client';
	import Icon from '@iconify/svelte';

	let selectedDate = $state(new Date().toISOString().slice(0, 10));
	let rooms = $state<any[]>([]);
	let bookings = $state<any[]>([]);
	let isReady = $state(false);

	const hours = Array.from({ length: 18 }, (_, i) => i + 6);

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
		return bookings.filter((b) => b.roomId === roomId);
	}

	function getBlockStyle(bk: any): { left: string; width: string } {
		const start = new Date(bk.startTime);
		const end = new Date(bk.endTime);
		const startHour = start.getHours() + start.getMinutes() / 60;
		const endHour = end.getHours() + end.getMinutes() / 60;

		const gridStart = 6;
		const gridEnd = 24;
		const totalHours = gridEnd - gridStart;

		const leftPercent = Math.max(0, ((startHour - gridStart) / totalHours) * 100);
		const widthPercent = Math.min(100 - leftPercent, ((endHour - startHour) / totalHours) * 100);

		return {
			left: `${leftPercent}%`,
			width: `${Math.max(widthPercent, 2)}%`
		};
	}

	function fmtTime(d: string | Date) {
		return new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit' }).format(
			new Date(d)
		);
	}

	function fmtDateFull(d: string) {
		return new Intl.DateTimeFormat('vi-VN', {
			weekday: 'long',
			day: '2-digit',
			month: '2-digit',
			year: 'numeric'
		}).format(new Date(d));
	}

	function getBookingBlockClass(bk: any) {
		const now = new Date();
		const start = new Date(bk.startTime);
		const end = new Date(bk.endTime);
		const isPast = end.getTime() < now.getTime();
		const isOngoing = start.getTime() <= now.getTime() && end.getTime() >= now.getTime();

		if (bk.status === 'cancelled') return 'bg-rose-400/80 border-rose-500';
		if (bk.status === 'checked_in') return 'bg-sky-500/80 border-sky-600';
		if (bk.status === 'confirmed') {
			if (isPast) return 'bg-slate-400/80 border-slate-500';
			if (isOngoing) return 'bg-cyan-500/80 border-cyan-600';
			return 'bg-emerald-400/80 border-emerald-500';
		}
		if (bk.status === 'pending') {
			if (isPast) return 'bg-orange-500/80 border-orange-600';
			return 'bg-amber-400/80 border-amber-500';
		}

		return 'border-base-400 bg-base-300';
	}
</script>

<svelte:head><title>Lịch Phòng | KaraSystem Admin</title></svelte:head>

{#if !isReady}
	<div class="flex min-h-[50vh] items-center justify-center">
		<span class="loading loading-lg loading-spinner text-primary"></span>
	</div>
{:else}
	<div class="flex flex-col gap-6">
		<div class="flex items-center justify-between">
			<div>
				<h2 class="text-xl font-bold">Lịch Phòng</h2>
				<p class="mt-0.5 text-sm font-medium text-base-content/40">
					Tổng quan booking theo ngày — {rooms.length} phòng
				</p>
			</div>
		</div>

		<div class="flex items-center gap-3">
			<button onclick={() => changeDate(-1)} class="btn btn-square rounded-lg btn-ghost btn-sm">
				<Icon icon="solar:arrow-left-line-duotone" class="text-lg" />
			</button>
			<input
				type="date"
				bind:value={selectedDate}
				onchange={loadData}
				class="input-bordered input input-sm rounded-lg text-sm font-medium"
			/>
			<button onclick={() => changeDate(1)} class="btn btn-square rounded-lg btn-ghost btn-sm">
				<Icon icon="solar:arrow-right-line-duotone" class="text-lg" />
			</button>
			<button
				onclick={() => {
					selectedDate = new Date().toISOString().slice(0, 10);
					loadData();
				}}
				class="btn rounded-lg text-xs font-bold text-primary btn-ghost btn-sm"
			>
				Hôm Nay
			</button>
			<span class="ml-2 text-sm font-medium text-base-content/50 capitalize"
				>{fmtDateFull(selectedDate)}</span
			>
		</div>

		<div class="flex items-center gap-4 text-xs font-bold">
			<span class="flex items-center gap-1.5"
				><span class="h-3 w-3 rounded-sm border border-amber-500 bg-amber-400/80"></span> Chờ Duyệt</span
			>
			<span class="flex items-center gap-1.5"
				><span class="h-3 w-3 rounded-sm border border-emerald-500 bg-emerald-400/80"></span> Đã Xác Nhận</span
			>
			<span class="flex items-center gap-1.5"
				><span class="h-3 w-3 rounded-sm border border-cyan-600 bg-cyan-500/80"></span> Đang Sử Dụng</span
			>
			<span class="flex items-center gap-1.5"
				><span class="h-3 w-3 rounded-sm border border-sky-600 bg-sky-500/80"></span> Checked-in</span
			>
			<span class="flex items-center gap-1.5"
				><span class="h-3 w-3 rounded-sm border border-slate-500 bg-slate-400/80"></span> Đã Quá Giờ</span
			>
			<span class="flex items-center gap-1.5"
				><span class="h-3 w-3 rounded-sm border border-orange-600 bg-orange-500/80"></span> Chờ Duyệt
				Quá Giờ</span
			>
			<span class="flex items-center gap-1.5"
				><span class="h-3 w-3 rounded-sm border border-rose-500 bg-rose-400/80"></span> Đã Hủy</span
			>
		</div>

		<div class="overflow-hidden rounded-xl border border-base-300/50 bg-base-100">
			<div class="flex border-b border-base-200">
				<div
					class="flex w-32 shrink-0 items-center bg-base-200/30 px-3 py-2 text-[10px] font-bold tracking-widest text-base-content/40 uppercase lg:w-40"
				>
					Phòng
				</div>
				<div class="relative flex flex-1">
					{#each hours as hour}
						<div
							class="flex-1 border-l border-base-200/50 py-2 text-center text-[10px] font-bold text-base-content/30"
						>
							{hour}:00
						</div>
					{/each}
				</div>
			</div>
			{#if rooms.length === 0}
				<div class="p-12 text-center text-sm font-medium text-base-content/30">
					Chưa có phòng nào trong hệ thống.
				</div>
			{:else}
				{#each rooms as rm}
					{@const roomBookings = getBookingsForRoom(rm.id)}
					<div
						class="flex min-h-[48px] border-b border-base-200/50 transition-colors hover:bg-base-200/20"
					>
						<div
							class="flex w-32 shrink-0 items-center gap-2 border-r border-base-200/50 px-3 py-2 lg:w-40"
						>
							<span class="truncate text-xs font-bold">{rm.name}</span>
							<span class="badge shrink-0 rounded-md badge-ghost badge-xs font-bold uppercase"
								>{rm.type}</span
							>
						</div>
						<div class="relative flex-1">
							{#each roomBookings as bk}
								{@const style = getBlockStyle(bk)}
								<div
									class="absolute top-1 bottom-1 rounded-md border {getBookingBlockClass(
										bk
									)} group flex cursor-default items-center overflow-hidden px-2"
									style="left: {style.left}; width: {style.width};"
									title="{bk.userName || '—'} • {fmtTime(bk.startTime)} - {fmtTime(bk.endTime)}"
								>
									<span class="truncate text-[10px] font-bold text-white drop-shadow-sm">
										{bk.userName || '—'}
									</span>
								</div>
							{/each}
							<div class="pointer-events-none absolute inset-0 flex">
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
