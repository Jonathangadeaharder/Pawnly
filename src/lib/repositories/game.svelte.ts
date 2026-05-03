import { supabase } from '../supabase';
import { createRepository } from './base.svelte';

export interface GameRecord {
	id: string;
	user_id: string;
	opponent_type: 'ai' | 'human';
	result: 'win' | 'loss' | 'draw';
	moves: unknown[];
	time_control: string | null;
	difficulty: string | null;
	played_at: string;
}

export interface GameStats {
	wins: number;
	losses: number;
	draws: number;
	total: number;
}

export function createGameRepository() {
	const base = createRepository<GameRecord>({ table: 'games' });

	async function loadGames(): Promise<void> {
		base.loading = true;
		base.error = null;
		try {
			const { data, error: err } = await supabase
				.from('games')
				.select('*')
				.order('played_at', { ascending: false });
			if (err) throw err;
			base.items = data ?? [];
		} catch (e) {
			base.error = e instanceof Error ? e.message : 'Failed to load games';
		} finally {
			base.loading = false;
		}
	}

	async function saveGame(game: GameRecord): Promise<void> {
		await base.insert(game);
	}

	function addLocalGame(game: GameRecord): void {
		base.items = [game, ...base.items];
	}

	function getStats(): GameStats {
		let wins = 0;
		let losses = 0;
		let draws = 0;
		for (const g of base.items) {
			if (g.result === 'win') wins++;
			else if (g.result === 'loss') losses++;
			else draws++;
		}
		return { wins, losses, draws, total: base.items.length };
	}

	return {
		...base,
		loadGames,
		saveGame,
		addLocalGame,
		getStats,
		get games() {
			return base.items;
		},
	};
}
