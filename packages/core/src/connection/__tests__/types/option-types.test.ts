import { describe, expect, expectTypeOf, it } from 'vitest';
import { BackoffStrategy } from '../../types/backoff-strategy.js';
import type { ConnectionTimeouts } from '../../types/connection-timeouts.js';
import type { ReconnectPolicy } from '../../types/reconnect-policy.js';

describe('ReconnectPolicy', () => {
	it('accepts a fully populated literal', () => {
		const policy = {
			enabled: true,
			maxAttempts: 5,
			initialDelayMs: 1000,
			maxDelayMs: 30000,
			backoff: BackoffStrategy.EXPONENTIAL,
			jitter: true,
		} satisfies ReconnectPolicy;

		expect(policy.maxAttempts).toBe(5);
	});

	it('accepts a literal with maxAttempts omitted (unlimited)', () => {
		const policy = {
			enabled: true,
			initialDelayMs: 500,
			maxDelayMs: 60000,
			backoff: BackoffStrategy.FIXED,
			jitter: false,
		} satisfies ReconnectPolicy;

		expect('maxAttempts' in policy).toBe(false);
	});

	it('rejects assignment to a readonly field', () => {
		const policy: ReconnectPolicy = {
			enabled: true,
			initialDelayMs: 1000,
			maxDelayMs: 30000,
			backoff: BackoffStrategy.LINEAR,
			jitter: false,
		};

		// @ts-expect-error - ReconnectPolicy fields are readonly
		policy.enabled = false;
		// `readonly` is compile-time only, so the runtime write succeeds.
		expect(policy.enabled).toBe(false);
	});

	it('rejects maxAttempts set to undefined under exactOptionalPropertyTypes', () => {
		// @ts-expect-error - optional properties must be omitted, not set to undefined
		const policy: ReconnectPolicy = {
			enabled: true,
			maxAttempts: undefined,
			initialDelayMs: 1000,
			maxDelayMs: 30000,
			backoff: BackoffStrategy.EXPONENTIAL,
			jitter: true,
		};

		expect(policy).toBeDefined();
	});

	it('rejects an invalid backoff string', () => {
		const policy = {
			enabled: true,
			initialDelayMs: 1000,
			maxDelayMs: 30000,
			// @ts-expect-error - 'quadratic' is not a BackoffStrategy value
			backoff: 'quadratic',
			jitter: true,
		} satisfies ReconnectPolicy;

		expect(policy.backoff).toBe('quadratic');
	});

	it('rejects a missing required field', () => {
		// @ts-expect-error - initialDelayMs is required
		const policy: ReconnectPolicy = {
			enabled: true,
			maxDelayMs: 30000,
			backoff: BackoffStrategy.FIXED,
			jitter: false,
		};

		expect(policy).toBeDefined();
	});

	it('exposes the declared property types', () => {
		expectTypeOf<ReconnectPolicy['enabled']>().toEqualTypeOf<boolean>();
		expectTypeOf<ReconnectPolicy['initialDelayMs']>().toEqualTypeOf<number>();
		expectTypeOf<ReconnectPolicy['maxDelayMs']>().toEqualTypeOf<number>();
		expectTypeOf<ReconnectPolicy['backoff']>().toEqualTypeOf<BackoffStrategy>();
		expectTypeOf<ReconnectPolicy['jitter']>().toEqualTypeOf<boolean>();
		// With exactOptionalPropertyTypes, the non-undefined part of an optional prop is number.
		expectTypeOf<Required<ReconnectPolicy>['maxAttempts']>().toEqualTypeOf<number>();
	});
});

describe('ConnectionTimeouts', () => {
	it('accepts an empty object', () => {
		const timeouts = {} satisfies ConnectionTimeouts;
		expect(timeouts).toEqual({});
	});

	it('accepts a populated literal', () => {
		const timeouts = { connectMs: 5000, disconnectMs: 2000 } satisfies ConnectionTimeouts;
		expect(timeouts.connectMs).toBe(5000);
		expect(timeouts.disconnectMs).toBe(2000);
	});

	it('rejects assignment to a readonly field', () => {
		const timeouts: ConnectionTimeouts = { connectMs: 5000 };

		// @ts-expect-error - ConnectionTimeouts fields are readonly
		timeouts.connectMs = 1000;
		// `readonly` is compile-time only, so the runtime write succeeds.
		expect(timeouts.connectMs).toBe(1000);
	});

	it('rejects connectMs set to undefined under exactOptionalPropertyTypes', () => {
		// @ts-expect-error - optional properties must be omitted, not set to undefined
		const timeouts: ConnectionTimeouts = { connectMs: undefined };

		expect(timeouts).toBeDefined();
	});

	it('rejects unknown extra properties in object literals', () => {
		// @ts-expect-error - keepAliveMs is not part of ConnectionTimeouts
		const timeouts: ConnectionTimeouts = { connectMs: 1000, keepAliveMs: 30000 };

		expect(timeouts).toBeDefined();
	});

	it('exposes the declared property types', () => {
		expectTypeOf<Required<ConnectionTimeouts>['connectMs']>().toEqualTypeOf<number>();
		expectTypeOf<Required<ConnectionTimeouts>['disconnectMs']>().toEqualTypeOf<number>();
	});
});
