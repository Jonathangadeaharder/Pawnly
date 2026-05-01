<script lang="ts">
import { Brand } from '$lib/brand';
import { fenToPieces, getSquareFromCoords, getCoordsFromSquare } from '$lib/board.svelte';
import Piece from '$lib/components/Piece.svelte';
import type { Square, Arrow, Highlight } from '$lib/game.svelte';

let {
	game,
	size = 400,
	flipped = false,
	showCoords = true,
	arrows = [],
	highlights = [],
	onMove,
}: {
	game: ReturnType<typeof import('$lib/game.svelte').createGame>;
	size?: number;
	flipped?: boolean;
	showCoords?: boolean;
	arrows?: Arrow[];
	highlights?: Highlight[];
	onMove?: (from: Square, to: Square) => void;
} = $props();

const sq = $derived(size / 8);
const files = $derived(flipped ? ['h','g','f','e','d','c','b','a'] : ['a','b','c','d','e','f','g','h']);
const ranks = $derived(flipped ? [1,2,3,4,5,6,7,8] : [8,7,6,5,4,3,2,1]);
const lightC = Brand.colors.boardLight;
const darkC = Brand.colors.boardDark;

const pieces = $derived(fenToPieces(game.fen));
const lastMove = $derived(game.moves.length > 0 ? game.moves[game.moves.length - 1] : null);

const boardSquares = $derived(
	ranks.flatMap((r, ri) =>
		files.map((f, fi) => ({
			name: `${f}${r}` as Square,
			fi,
			ri,
			isLight: (ri + fi) % 2 === 0,
		}))
	)
);

const highlightMap = $derived(new Map(highlights.map((h) => [h.square, h])));

const selectedSquare = $derived(game.selectedSquare);
const highlightedSquares = $derived(game.highlightedSquares);

const kingSquare = $derived.by(() => {
	if (!game.isCheck) return null;
	const turn = game.turn;
	for (const [sq, p] of Object.entries(pieces)) {
		if ((turn === 'w' && p === 'K') || (turn === 'b' && p === 'k')) {
			return sq as Square;
		}
	}
	return null;
});

const legalMoveTargets = $derived.by(() => {
	if (!selectedSquare) return new Set<string>();
	return new Set(
		game.getLegalMoves(selectedSquare).map((m) => {
			const to = m.includes('-') ? m.split('-')[1] : m.slice(-2);
			return to;
		})
	);
});

// Drag state
let dragSquare = $state<Square | null>(null);
let dragX = $state(0);
let dragY = $state(0);
let isDragging = $state(false);

// Promotion state
let promotionSquare = $state<Square | null>(null);
let promotionFrom = $state<Square | null>(null);

function getSquareFromEvent(e: MouseEvent | TouchEvent): Square | null {
	const board = (e.target as HTMLElement).closest('[data-board]');
	if (!board) return null;
	const rect = board.getBoundingClientRect();
	let clientX: number, clientY: number;
	if ('touches' in e) {
		if (e.touches.length === 0 && e.type === 'touchend') {
			const changed = e.changedTouches[0];
			clientX = changed.clientX;
			clientY = changed.clientY;
		} else {
			clientX = e.touches[0].clientX;
			clientY = e.touches[0].clientY;
		}
	} else {
		clientX = e.clientX;
		clientY = e.clientY;
	}
	const x = clientX - rect.left;
	const y = clientY - rect.top;
	if (x < 0 || y < 0 || x >= size || y >= size) return null;
	return getSquareFromCoords(x, y, sq, flipped);
}

function needsPromotion(from: Square, to: Square): boolean {
	const piece = pieces[from];
	if (!piece || (piece !== 'P' && piece !== 'p')) return false;
	const rank = to[1];
	return (piece === 'P' && rank === '8') || (piece === 'p' && rank === '1');
}

function handleSquareInteraction(square: Square) {
	const piece = pieces[square];

	if (selectedSquare) {
		if (highlightedSquares.includes(square)) {
			if (needsPromotion(selectedSquare, square)) {
				promotionFrom = selectedSquare;
				promotionSquare = square;
				return;
			}
			const moved = game.makeMove(selectedSquare, square);
			if (moved && onMove) onMove(selectedSquare, square);
			return;
		}
		if (piece) {
			const pieceColor = piece === piece.toUpperCase() ? 'w' : 'b';
			if (pieceColor === game.turn) {
				game.selectSquare(square);
				return;
			}
		}
		game.selectedSquare = null;
		return;
	}

	if (piece) {
		const pieceColor = piece === piece.toUpperCase() ? 'w' : 'b';
		if (pieceColor === game.turn) {
			game.selectSquare(square);
		}
	}
}

function handleBoardClick(e: MouseEvent) {
	if (isDragging) return;
	const square = getSquareFromEvent(e);
	if (square) handleSquareInteraction(square);
}

function handleMouseDown(e: MouseEvent) {
	const square = getSquareFromEvent(e);
	if (!square) return;
	const piece = pieces[square];
	if (!piece) return;
	const pieceColor = piece === piece.toUpperCase() ? 'w' : 'b';
	if (pieceColor !== game.turn) return;

	const legalMoves = game.getLegalMoves(square);
	if (legalMoves.length === 0) return;

	game.selectSquare(square);

	const board = (e.target as HTMLElement).closest('[data-board]')!;
	const rect = board.getBoundingClientRect();
	dragSquare = square;
	dragX = e.clientX - rect.left;
	dragY = e.clientY - rect.top;
	isDragging = false;
}

function handleMouseMove(e: MouseEvent) {
	if (!dragSquare) return;
	const board = (e.target as HTMLElement).closest('[data-board]');
	if (!board) return;
	const rect = board.getBoundingClientRect();
	const newX = e.clientX - rect.left;
	const newY = e.clientY - rect.top;
	const dx = newX - dragX;
	const dy = newY - dragY;
	if (!isDragging && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
		isDragging = true;
	}
	if (isDragging) {
		dragX = newX;
		dragY = newY;
	}
}

function handleMouseUp(e: MouseEvent) {
	if (!dragSquare) return;
	if (isDragging) {
		const square = getSquareFromEvent(e);
		if (square && square !== dragSquare) {
			if (needsPromotion(dragSquare, square)) {
				promotionFrom = dragSquare;
				promotionSquare = square;
			} else {
				const moved = game.makeMove(dragSquare, square);
				if (moved && onMove) onMove(dragSquare, square);
			}
		}
	}
	dragSquare = null;
	isDragging = false;
}

function handleTouchStart(e: TouchEvent) {
	const square = getSquareFromEvent(e);
	if (!square) return;
	const piece = pieces[square];
	if (!piece) return;
	const pieceColor = piece === piece.toUpperCase() ? 'w' : 'b';
	if (pieceColor !== game.turn) return;

	const legalMoves = game.getLegalMoves(square);
	if (legalMoves.length === 0) return;

	game.selectSquare(square);

	const board = (e.target as HTMLElement).closest('[data-board]')!;
	const rect = board.getBoundingClientRect();
	dragSquare = square;
	dragX = e.touches[0].clientX - rect.left;
	dragY = e.touches[0].clientY - rect.top;
	isDragging = false;
}

function handleTouchMove(e: TouchEvent) {
	if (!dragSquare) return;
	e.preventDefault();
	const board = (e.target as HTMLElement).closest('[data-board]');
	if (!board) return;
	const rect = board.getBoundingClientRect();
	const newX = e.touches[0].clientX - rect.left;
	const newY = e.touches[0].clientY - rect.top;
	const dx = newX - dragX;
	const dy = newY - dragY;
	if (!isDragging && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
		isDragging = true;
	}
	if (isDragging) {
		dragX = newX;
		dragY = newY;
	}
}

function handleTouchEnd(e: TouchEvent) {
	if (!dragSquare) return;
	if (isDragging) {
		const square = getSquareFromEvent(e);
		if (square && square !== dragSquare) {
			if (needsPromotion(dragSquare, square)) {
				promotionFrom = dragSquare;
				promotionSquare = square;
			} else {
				const moved = game.makeMove(dragSquare, square);
				if (moved && onMove) onMove(dragSquare, square);
			}
		}
	}
	dragSquare = null;
	isDragging = false;
}

function handlePromotion(pieceType: 'q' | 'r' | 'b' | 'n') {
	if (!promotionFrom || !promotionSquare) return;
	const moved = game.makeMove(promotionFrom, promotionSquare, pieceType);
	if (moved && onMove) onMove(promotionFrom, promotionSquare);
	promotionSquare = null;
	promotionFrom = null;
}

function cancelPromotion() {
	promotionSquare = null;
	promotionFrom = null;
}

function getPieceInfo(piece: string) {
	const color = piece === piece.toUpperCase() ? 'white' as const : 'black' as const;
	const type = piece.toLowerCase() as 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
	return { color, type };
}

function squareToPixel(square: Square): { x: number; y: number } {
	return getCoordsFromSquare(square, sq, flipped);
}
</script>

<div
	style:width="{size}px"
	style:height="{size}px"
	style:position="relative"
	style:border-radius="12px"
	style:overflow="hidden"
	style:box-shadow="0 8px 24px rgba(31,36,23,0.18), 0 1px 0 rgba(255,255,255,0.4) inset"
	style:user-select="none"
	style:touch-action="none"
	role="application"
	aria-label="Chessboard"
>
	<!-- SVG layer: squares, highlights, arrows, coordinates -->
	<svg
		width={size}
		height={size}
		style="position:absolute;inset:0"
		data-board
		role="grid"
		tabindex="-1"
		onclick={handleBoardClick}
		onmousedown={handleMouseDown}
		onmousemove={handleMouseMove}
		onmouseup={handleMouseUp}
		onmouseleave={handleMouseUp}
		onkeydown={() => {}}
		ontouchstart={handleTouchStart}
		ontouchmove={handleTouchMove}
		ontouchend={handleTouchEnd}
	>
		{#each boardSquares as s (s.name)}
			{@const hl = highlightMap.get(s.name)}
			{@const isLast = lastMove && (lastMove.from === s.name || lastMove.to === s.name)}
			{@const isSelected = selectedSquare === s.name}
			{@const isLegalTarget = highlightedSquares.includes(s.name)}
			{@const isKingCheck = kingSquare === s.name}
			{@const hasPiece = !!pieces[s.name]}
			<!-- Base square -->
			<rect
				x={s.fi * sq}
				y={s.ri * sq}
				width={sq}
				height={sq}
				fill={s.isLight ? lightC : darkC}
			/>
			<!-- Last move highlight -->
			{#if isLast}
				<rect
					x={s.fi * sq}
					y={s.ri * sq}
					width={sq}
					height={sq}
					fill={Brand.colors.sunny}
					opacity="0.42"
				/>
			{/if}
			<!-- Selected square highlight -->
			{#if isSelected}
				<rect
					x={s.fi * sq}
					y={s.ri * sq}
					width={sq}
					height={sq}
					fill={Brand.colors.sunny}
					opacity="0.5"
				/>
			{/if}
			<!-- Custom highlight overlay -->
			{#if hl}
				<rect
					x={s.fi * sq}
					y={s.ri * sq}
					width={sq}
					height={sq}
					fill={hl.color || Brand.colors.moss}
					opacity={hl.opacity ?? 0.4}
				/>
			{/if}
			<!-- Check indicator (red ring on king) -->
			{#if isKingCheck}
				<rect
					x={s.fi * sq}
					y={s.ri * sq}
					width={sq}
					height={sq}
					fill={Brand.colors.coral}
					opacity="0.5"
				/>
			{/if}
			<!-- Legal move indicators -->
			{#if isLegalTarget}
				{#if hasPiece}
					<!-- Ring on capture square -->
					<circle
						cx={s.fi * sq + sq / 2}
						cy={s.ri * sq + sq / 2}
						r={sq * 0.44}
						fill="none"
						stroke="rgba(0,0,0,0.25)"
						stroke-width={sq * 0.08}
					/>
				{:else}
					<!-- Dot on empty square -->
					<circle
						cx={s.fi * sq + sq / 2}
						cy={s.ri * sq + sq / 2}
						r={sq * 0.16}
						fill="rgba(0,0,0,0.25)"
					/>
				{/if}
			{/if}
			<!-- Coordinates -->
			{#if showCoords && s.fi === 0}
				<text
					x={s.fi * sq + 3}
					y={s.ri * sq + 11}
					font-size={sq * 0.18}
					fill={s.isLight ? darkC : lightC}
					font-family={Brand.fonts.mono}
					font-weight="600"
				>{s.name[1]}</text>
			{/if}
			{#if showCoords && s.ri === 7}
				<text
					x={s.fi * sq + sq - 9}
					y={s.ri * sq + sq - 4}
					font-size={sq * 0.18}
					fill={s.isLight ? darkC : lightC}
					font-family={Brand.fonts.mono}
					font-weight="600"
				>{s.name[0]}</text>
			{/if}
		{/each}
		<!-- Arrows -->
		{#each arrows as a, i (i)}
			{@const fromCoords = squareToPixel(a.from)}
			{@const toCoords = squareToPixel(a.to)}
			{@const x1 = fromCoords.x + sq / 2}
			{@const y1 = fromCoords.y + sq / 2}
			{@const x2 = toCoords.x + sq / 2}
			{@const y2 = toCoords.y + sq / 2}
			{@const dx = x2 - x1}
			{@const dy = y2 - y1}
			{@const len = Math.sqrt(dx * dx + dy * dy)}
			{@const nx = dx / len}
			{@const ny = dy / len}
			{@const ex = x2 - nx * sq * 0.3}
			{@const ey = y2 - ny * sq * 0.3}
			{@const ah = sq * 0.25}
			<g opacity={a.opacity ?? 0.85}>
				<line
					{x1}
					{y1}
					x2={ex}
					y2={ey}
					stroke={a.color || Brand.colors.moss}
					stroke-width={sq * 0.14}
					stroke-linecap="round"
				/>
				<polygon
					points="{x2},{y2} {ex - ny * ah / 1.6},{ey + nx * ah / 1.6} {ex + ny * ah / 1.6},{ey - nx * ah / 1.6}"
					fill={a.color || Brand.colors.moss}
				/>
			</g>
		{/each}
	</svg>
	<!-- Piece layer (above SVG) -->
	{#each boardSquares as s (s.name)}
		{@const piece = pieces[s.name]}
		{@const isDragged = isDragging && dragSquare === s.name}
		{#if piece && !isDragged}
			{@const info = getPieceInfo(piece)}
			<div
				style:position="absolute"
				style:left="{s.fi * sq}px"
				style:top="{s.ri * sq}px"
				style:width="{sq}px"
				style:height="{sq}px"
				style:display="flex"
				style:align-items="center"
				style:justify-content="center"
				style:pointer-events="none"
			>
				<Piece type={info.type} color={info.color} size={sq * 0.86} />
			</div>
		{/if}
	{/each}
	<!-- Dragged piece (follows cursor) -->
	{#if isDragging && dragSquare}
		{@const piece = pieces[dragSquare]}
		{#if piece}
			{@const info = getPieceInfo(piece)}
			<div
				style:position="absolute"
				style:left="{dragX - sq / 2}px"
				style:top="{dragY - sq / 2}px"
				style:width="{sq}px"
				style:height="{sq}px"
				style:display="flex"
				style:align-items="center"
				style:justify-content="center"
				style:pointer-events="none"
				style:z-index="1000"
				style:filter="drop-shadow(0 4px 8px rgba(0,0,0,0.3))"
			>
				<Piece type={info.type} color={info.color} size={sq * 0.95} />
			</div>
		{/if}
	{/if}
	<!-- Promotion dialog -->
	{#if promotionSquare}
		{@const promoColor = game.turn === 'w' ? 'white' : 'black'}
		{@const promoTypes = ['q', 'r', 'b', 'n'] as const}
		{@const promoCoords = squareToPixel(promotionSquare)}
		{@const isTopHalf = promoCoords.y < size / 2}
		{@const promoOffset = isTopHalf ? size - promoCoords.y - sq : promoCoords.y}
		{@const promoDir = isTopHalf ? 'column-reverse' : 'column'}
		{@const promoPos = isTopHalf ? 'bottom' : 'top'}
		<div
			style:position="absolute"
			style:left="0"
			style:top="0"
			style:width="{size}px"
			style:height="{size}px"
			style:z-index="2000"
			role="dialog"
			aria-label="Pawn promotion"
			tabindex="-1"
			onclick={cancelPromotion}
			onkeydown={(e) => { if (e.key === 'Escape') cancelPromotion(); }}
		>
			<div
				style:position="absolute"
				style:inset="0"
				style:background="rgba(0,0,0,0.4)"
				style:border-radius="12px"
			></div>
			<div
				style="position:absolute;left:{promoCoords.x}px;{promoPos}:{promoOffset}px;width:{sq}px;display:flex;flex-direction:{promoDir};z-index:2001"
			>
				{#each promoTypes as pt (pt)}
					<button
						type="button"
						style:width="{sq}px"
						style:height="{sq}px"
						style:display="flex"
						style:align-items="center"
						style:justify-content="center"
						style:background={Brand.colors.cream}
						style:border="2px solid {Brand.colors.ink}"
						style:cursor="pointer"
						style:padding="0"
						onclick={(e) => { e.stopPropagation(); handlePromotion(pt); }}
					>
						<Piece type={pt} color={promoColor} size={sq * 0.8} />
					</button>
				{/each}
			</div>
		</div>
	{/if}
</div>
