import { describe, expect, it } from 'vitest';
import { ConnectionError } from '../../errors/connection-error.js';
import { ConnectionTimeoutError } from '../../errors/connection-timeout-error.js';

describe('ConnectionTimeoutError', () => {
	it('should have the correct name, code, and message', () => {
		const error = new ConnectionTimeoutError('handshake timed out');
		expect(error.name).toBe('ConnectionTimeoutError');
		expect(error.code).toBe('CONNECTION_TIMEOUT');
		expect(error.message).toBe('handshake timed out');
	});

	it('should be an instance of Error, ConnectionError, and the specific class', () => {
		const error = new ConnectionTimeoutError('test');
		expect(error).toBeInstanceOf(Error);
		expect(error).toBeInstanceOf(ConnectionError);
		expect(error).toBeInstanceOf(ConnectionTimeoutError);
		expect(Object.getPrototypeOf(error)).toBe(ConnectionTimeoutError.prototype);
	});

	it('should preserve subclass identity through super()', () => {
		class Custom extends ConnectionTimeoutError {}
		const error = new Custom('test');
		expect(error).toBeInstanceOf(Custom);
		expect(error).toBeInstanceOf(ConnectionTimeoutError);
		expect(Object.getPrototypeOf(error)).toBe(Custom.prototype);
	});

	it('should default typed fields to undefined and context to undefined', () => {
		const error = new ConnectionTimeoutError('test');
		expect(error.timeoutMs).toBeUndefined();
		expect(error.context).toBeUndefined();
		expect(Object.hasOwn(error, 'cause')).toBe(false);
	});

	it('should expose timeoutMs on the instance and in context', () => {
		const error = new ConnectionTimeoutError('test', { timeoutMs: 5000 });
		expect(error.timeoutMs).toBe(5000);
		expect(error.context).toEqual({ timeoutMs: 5000 });
	});

	it('should merge caller context with own fields', () => {
		const error = new ConnectionTimeoutError('test', {
			context: { address: 'tcp://127.0.0.1:1883' },
			timeoutMs: 1000,
		});
		expect(error.context).toEqual({ address: 'tcp://127.0.0.1:1883', timeoutMs: 1000 });
	});

	it('should let typed fields win on key collisions', () => {
		const error = new ConnectionTimeoutError('test', {
			context: { timeoutMs: 9999 },
			timeoutMs: 1000,
		});
		expect(error.context?.timeoutMs).toBe(1000);
	});

	it('should forward cause by identity', () => {
		const original = new Error('socket hang up');
		const error = new ConnectionTimeoutError('test', { cause: original });
		expect(error.cause).toBe(original);
	});

	it('should not create an own cause property for details without a cause key', () => {
		expect(Object.hasOwn(new ConnectionTimeoutError('test', {}), 'cause')).toBe(false);
		expect(Object.hasOwn(new ConnectionTimeoutError('test', { context: { a: 1 } }), 'cause')).toBe(
			false,
		);
		expect(Object.hasOwn(new ConnectionTimeoutError('test', { timeoutMs: 10 }), 'cause')).toBe(
			false,
		);
	});

	it('should allow explicit undefined cause as the only way cause exists as undefined', () => {
		const error = new ConnectionTimeoutError('test', { cause: undefined });
		expect(Object.hasOwn(error, 'cause')).toBe(true);
		expect(error.cause).toBeUndefined();
	});

	it('should reject readonly assignment at compile time', () => {
		const error = new ConnectionTimeoutError('test', { timeoutMs: 100 });
		// @ts-expect-error timeoutMs is readonly
		error.timeoutMs = 200;
		// readonly is compile-time only: the write succeeds at runtime, and the
		// compiler error above (pinned by @ts-expect-error) is what we assert.
		expect(error.timeoutMs).toBe(200);
	});

	it('should reject wrong-typed timeout detail at compile time', () => {
		// @ts-expect-error timeoutMs must be a number
		new ConnectionTimeoutError('test', { timeoutMs: '5' });
		expect(() => new ConnectionTimeoutError('test')).not.toThrow();
	});
});
