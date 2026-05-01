import { describe, it, expect } from 'vitest';
import { Brand } from '../src/lib/brand';

describe('Brand tokens', () => {
	it('exports all colors', () => {
		expect(Brand.colors.cream).toBe('#F6EFE2');
		expect(Brand.colors.ink).toBe('#1F2417');
		expect(Brand.colors.moss).toBe('#3F6B43');
		expect(Brand.colors.sunny).toBe('#E8B547');
		expect(Brand.colors.coral).toBe('#D86B5A');
	});

	it('exports font families', () => {
		expect(Brand.fonts.display).toContain('Fraunces');
		expect(Brand.fonts.body).toContain('Geist');
		expect(Brand.fonts.mono).toContain('Geist Mono');
	});

	it('exports brand name and tagline', () => {
		expect(Brand.name).toBe('Pawnly');
		expect(Brand.tagline).toBe('Chess, one warm move at a time.');
	});
});
