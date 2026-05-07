import { supabase } from '../supabase';

export interface RepositoryConfig {
	table: string;
}

export function createRepository<T extends { id: string }>(config: RepositoryConfig) {
	let items = $state<T[]>([]);
	let loading = $state(false);
	let error = $state<string | null>(null);

	async function load(): Promise<void> {
		loading = true;
		error = null;
		try {
			const { data, error: err } = await supabase.from(config.table).select('*');
			if (err) throw err;
			items = data ?? [];
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to load';
		} finally {
			loading = false;
		}
	}

	function getById(id: string): T | null {
		return items.find((item) => item.id === id) ?? null;
	}

	async function insert(item: T): Promise<void> {
		const { error: err } = await supabase.from(config.table).insert(item);
		if (err) throw err;
		items = [...items, item];
	}

	async function update(id: string, data: Partial<T>): Promise<void> {
		const { error: err } = await supabase
			.from(config.table)
			.update(data as any)
			.eq('id', id);
		if (err) throw err;
		items = items.map((item) => (item.id === id ? { ...item, ...data } : item));
	}

	async function remove(id: string): Promise<void> {
		const { error: err } = await supabase.from(config.table).delete().eq('id', id);
		if (err) throw err;
		items = items.filter((item) => item.id !== id);
	}

	return {
		get items() {
			return items;
		},
		set items(value: T[]) {
			items = value;
		},
		get loading() {
			return loading;
		},
		set loading(value: boolean) {
			loading = value;
		},
		get error() {
			return error;
		},
		set error(value: string | null) {
			error = value;
		},
		load,
		getById,
		insert,
		update,
		remove,
	};
}

export function createProgressRepository<T extends { id: string }>(table: string) {
	let progress = $state<T[]>([]);
	let loading = $state(false);
	let error = $state<string | null>(null);

	async function loadProgress(): Promise<void> {
		loading = true;
		error = null;
		try {
			const { data, error: err } = await supabase.from(table).select('*');
			if (err) throw err;
			progress = data ?? [];
		} catch (e) {
			error = e instanceof Error ? e.message : `Failed to load ${table}`;
		} finally {
			loading = false;
		}
	}

	function addLocalProgress(record: T): void {
		progress = [...progress, record];
	}

	async function upsert(
		existing: T | undefined,
		updates: Partial<T>,
		newRecord: T,
	): Promise<void> {
		if (existing) {
			const { error: err } = await supabase
				.from(table)
				.update(updates as any)
				.eq('id', existing.id);
			if (err) throw err;
			progress = progress.map((p) => (p.id === existing.id ? { ...p, ...updates } : p));
		} else {
			const { error: err } = await supabase.from(table).insert(newRecord);
			if (err) throw err;
			addLocalProgress(newRecord);
		}
	}

	return {
		get progress() {
			return progress;
		},
		set progress(value: T[]) {
			progress = value;
		},
		get loading() {
			return loading;
		},
		get error() {
			return error;
		},
		loadProgress,
		addLocalProgress,
		upsert,
	};
}
