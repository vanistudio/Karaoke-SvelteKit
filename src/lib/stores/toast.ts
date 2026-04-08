import { writable } from 'svelte/store';

export type ToastType = 'info' | 'success' | 'warning' | 'error';

export interface Toast {
	id: number;
	type: ToastType;
	message: string;
}

export const toasts = writable<Toast[]>([]);

export const addToast = (message: string, type: ToastType = 'info', duration = 3000) => {
	const id = Date.now();
	toasts.update((all) => [{ id, type, message }, ...all]);
	setTimeout(() => dismissToast(id), duration);
};

export const dismissToast = (id: number) => {
	toasts.update((all) => all.filter((t) => t.id !== id));
};
