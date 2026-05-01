export const Brand = {
	name: 'Pawnly',
	tagline: 'Chess, one warm move at a time.',

	colors: {
		cream: '#F6EFE2',
		creamSoft: '#EFE6D2',
		creamDeep: '#E5D9BE',
		ink: '#1F2417',
		inkSoft: '#3F4636',
		inkMuted: '#6B7361',
		moss: '#3F6B43',
		mossDeep: '#2C4D30',
		mossSoft: '#5C8A5F',
		sunny: '#E8B547',
		sunnyDeep: '#C8932C',
		coral: '#D86B5A',
		coralSoft: '#E89186',
		sky: '#7BA7C7',
		plum: '#8C5A89',
		boardLight: '#EBDDB9',
		boardDark: '#7A8B5A',
		boardLightAlt: '#F0E4C9',
		boardDarkAlt: '#6B7C4E',
	},

	fonts: {
		display: "'Fraunces', 'Iowan Old Style', Georgia, serif",
		body: "'Geist', -apple-system, system-ui, sans-serif",
		mono: "'Geist Mono', ui-monospace, monospace",
	},
} as const;

export type BrandColors = typeof Brand.colors;
export type BrandFonts = typeof Brand.fonts;
