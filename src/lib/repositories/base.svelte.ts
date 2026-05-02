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
		get loading() {
			return loading;
		},
		get error() {
			return error;
		},
		load,
		getById,
		insert,
		update,
		remove,
	};
}
