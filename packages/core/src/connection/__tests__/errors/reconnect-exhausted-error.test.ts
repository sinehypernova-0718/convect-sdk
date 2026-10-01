import { describe, expect, it } from 'vitest';
import { ConnectionError } from '../../errors/connection-error.js';
import { ReconnectExhaustedError } from '../../errors/reconnect-exhausted-error.js';

describe('ReconnectExhaustedError', () => {
	it('should have the correct name, code, and message', () => {
		const error = new ReconnectExhaustedError('gave up', 5);
		expect(error.name).toBe('ReconnectExhaustedError');
		expect(error.code).toBe('RECONNECT_EXHAUSTED');
		expect(error.message).toBe('gave up');
	});

	it('should be an instance of Error, ConnectionError, and the specific class', () => {
		const error = new ReconnectExhaustedError('test', 1);
		expect(error).toBeInstanceOf(Error);
		expect(error).toBeInstanceOf(ConnectionError);
		expect(error).toBeInstanceOf(ReconnectExhaustedError);
		expect(Object.getPrototypeOf(error)).toBe(ReconnectExhaustedError.prototype);
	});

	it('should preserve subclass identity through super()', () => {
		class Custom extends ReconnectExhaustedError {}
		const error = new Custom('test', 2);
		expect(error).toBeInstanceOf(Custom);
		expect(error).toBeInstanceOf(ReconnectExhaustedError);
		expect(Object.getPrototypeOf(error)).toBe(Custom.prototype);
	});

	it('should store attempts and always include it in context', () => {
		const error = new ReconnectExhaustedError('test', 3);
		expect(error.attempts).toBe(3);
		expect(error.context).toEqual({ attempts: 3 });
	});

	it('should never leave context undefined even without details', () => {
		const error = new ReconnectExhaustedError('test', 0);
		expect(error.attempts).toBe(0);
		expect(error.context).toEqual({ attempts: 0 });
	});

	it('should merge caller context with own fields', () => {
		const error = new ReconnectExhaustedError('test', 4, { context: { policy: 'exponential' } });
		expect(error.context).toEqual({ policy: 'exponential', attempts: 4 });
	});

	it('should let typed fields win on key collisions', () => {
		const error = new ReconnectExhaustedError('test', 4, { context: { attempts: 99 } });
		expect(error.context?.attempts).toBe(4);
	});

	it('should forward cause by identity', () => {
		const original = new Error('repeated transport failures');
		const error = new ReconnectExhaustedError('test', 5, { cause: original });
		expect(error.cause).toBe(original);
	});

	it('should not create an own cause property for details without a cause key', () => {
		expect(Object.hasOwn(new ReconnectExhaustedError('test', 1, {}), 'cause')).toBe(false);
		expect(
			Object.hasOwn(new ReconnectExhaustedError('test', 1, { context: { a: 1 } }), 'cause'),
		).toBe(false);
	});

	it('should allow explicit undefined cause as the only way cause exists as undefined', () => {
		const error = new ReconnectExhaustedError('test', 1, { cause: undefined });
		expect(Object.hasOwn(error, 'cause')).toBe(true);
		expect(error.cause).toBeUndefined();
	});

	it('should reject readonly assignment at compile time', () => {
		const error = new ReconnectExhaustedError('test', 2);
		// @ts-expect-error attempts is readonly
		error.attempts = 3;
		// readonly is compile-time only: the write succeeds at runtime, and the
		// compiler error above (pinned by @ts-expect-error) is what we assert.
		expect(error.attempts).toBe(3);
	});

	it('should require attempts at compile time', () => {
		// @ts-expect-error attempts is a required positional argument
		new ReconnectExhaustedError('test');
		expect(() => new ReconnectExhaustedError('test', 1)).not.toThrow();
	});
});
