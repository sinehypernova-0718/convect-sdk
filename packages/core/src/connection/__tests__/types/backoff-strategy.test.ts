import { describe, expect, it } from 'vitest';
import { BackoffStrategy, isBackoffStrategy } from '../../types/backoff-strategy.js';

describe('BackoffStrategy', () => {
	it('defines the expected strategy values', () => {
		expect(BackoffStrategy.FIXED).toBe('fixed');
		expect(BackoffStrategy.LINEAR).toBe('linear');
		expect(BackoffStrategy.EXPONENTIAL).toBe('exponential');
	});

	it('has exactly three strategy values', () => {
		expect(Object.values(BackoffStrategy)).toHaveLength(3);
	});
});

describe('isBackoffStrategy', () => {
	it('accepts every enum value', () => {
		for (const value of Object.values(BackoffStrategy)) {
			expect(isBackoffStrategy(value)).toBe(true);
		}
	});

	it('accepts string literals matching enum values', () => {
		expect(isBackoffStrategy('fixed')).toBe(true);
		expect(isBackoffStrategy('linear')).toBe(true);
		expect(isBackoffStrategy('exponential')).toBe(true);
	});

	it('rejects invalid strings without normalizing them', () => {
		expect(isBackoffStrategy('FIXED')).toBe(false);
		expect(isBackoffStrategy(' fixed')).toBe(false);
		expect(isBackoffStrategy('fixed ')).toBe(false);
		expect(isBackoffStrategy('unknown')).toBe(false);
		expect(isBackoffStrategy('')).toBe(false);
	});

	it('rejects enum member names, which are not config values', () => {
		expect(isBackoffStrategy('FIXED')).toBe(false);
		expect(isBackoffStrategy('LINEAR')).toBe(false);
		expect(isBackoffStrategy('EXPONENTIAL')).toBe(false);
	});

	it('rejects non-string values', () => {
		expect(isBackoffStrategy(null)).toBe(false);
		expect(isBackoffStrategy(undefined)).toBe(false);
		expect(isBackoffStrategy(42)).toBe(false);
		expect(isBackoffStrategy(true)).toBe(false);
		expect(isBackoffStrategy({})).toBe(false);
		expect(isBackoffStrategy([])).toBe(false);
	});

	it('rejects prototype keys', () => {
		expect(isBackoffStrategy('constructor')).toBe(false);
		expect(isBackoffStrategy('__proto__')).toBe(false);
		expect(isBackoffStrategy('toString')).toBe(false);
		expect(isBackoffStrategy('hasOwnProperty')).toBe(false);
	});

	it('narrows unknown values to BackoffStrategy', () => {
		const value: unknown = BackoffStrategy.EXPONENTIAL;

		if (isBackoffStrategy(value)) {
			const typed: BackoffStrategy = value;
			expect(typed).toBe(BackoffStrategy.EXPONENTIAL);
			return;
		}

		expect.unreachable('A valid BackoffStrategy value should pass the guard');
	});
});
