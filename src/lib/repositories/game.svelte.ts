import { supabase } from '../supabase';

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
	let games = $state<GameRecord[]>([]);
	let loading = $state(false);
	let error = $state<string | null>(null);

	async function loadGames(): Promise<void> {
		loading = true;
		error = null;
		try {
			const { data, error: err } = await supabase
				.from('games')
				.select('*')
				.order('played_at', { ascending: false });
			if (err) throw err;
			games = data ?? [];
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to load games';
		} finally {
			loading = false;
		}
	}

	async function saveGame(game: GameRecord): Promise<void> {
		const { error: err } = await supabase.from('games').insert(game);
		if (err) throw err;
		games = [game, ...games];
	}

	function addLocalGame(game: GameRecord): void {
		games = [game, ...games];
	}

	function getStats(): GameStats {
		let wins = 0;
		let losses = 0;
		let draws = 0;
		for (const g of games) {
			if (g.result === 'win') wins++;
			else if (g.result === 'loss') losses++;
			else draws++;
		}
		return { wins, losses, draws, total: games.length };
	}

	return {
		get games() {
			return games;
		},
		get loading() {
			return loading;
		},
		get error() {
			return error;
		},
		loadGames,
		saveGame,
		addLocalGame,
		getStats,
	};
}
