import { describe, expect, it } from 'vitest';
import { ConnectionError } from '../../errors/connection-error.js';
import { ConnectionRefusedError } from '../../errors/connection-refused-error.js';

describe('ConnectionRefusedError', () => {
	it('should have the correct name, code, and message', () => {
		const error = new ConnectionRefusedError('connection refused');
		expect(error.name).toBe('ConnectionRefusedError');
		expect(error.code).toBe('CONNECTION_REFUSED');
		expect(error.message).toBe('connection refused');
	});

	it('should be an instance of Error, ConnectionError, and the specific class', () => {
		const error = new ConnectionRefusedError('test');
		expect(error).toBeInstanceOf(Error);
		expect(error).toBeInstanceOf(ConnectionError);
		expect(error).toBeInstanceOf(ConnectionRefusedError);
		expect(Object.getPrototypeOf(error)).toBe(ConnectionRefusedError.prototype);
	});

	it('should preserve subclass identity through super()', () => {
		class Custom extends ConnectionRefusedError {}
		const error = new Custom('test');
		expect(error).toBeInstanceOf(Custom);
		expect(error).toBeInstanceOf(ConnectionRefusedError);
		expect(Object.getPrototypeOf(error)).toBe(Custom.prototype);
	});

	it('should default context to undefined and carry no own cause', () => {
		const error = new ConnectionRefusedError('test');
		expect(error.context).toBeUndefined();
		expect(Object.hasOwn(error, 'cause')).toBe(false);
	});

	it('should pass caller context through', () => {
		const error = new ConnectionRefusedError('test', { context: { port: 1883 } });
		expect(error.context).toEqual({ port: 1883 });
	});

	it('should keep context undefined for empty details', () => {
		const error = new ConnectionRefusedError('test', {});
		expect(error.context).toBeUndefined();
	});

	it('should forward cause by identity', () => {
		const original = new Error('ECONNREFUSED');
		const error = new ConnectionRefusedError('test', { cause: original });
		expect(error.cause).toBe(original);
	});

	it('should not create an own cause property for details without a cause key', () => {
		expect(Object.hasOwn(new ConnectionRefusedError('test', {}), 'cause')).toBe(false);
		expect(Object.hasOwn(new ConnectionRefusedError('test', { context: { a: 1 } }), 'cause')).toBe(
			false,
		);
	});

	it('should allow explicit undefined cause as the only way cause exists as undefined', () => {
		const error = new ConnectionRefusedError('test', { cause: undefined });
		expect(Object.hasOwn(error, 'cause')).toBe(true);
		expect(error.cause).toBeUndefined();
	});

	it('should reject wrong-typed context at compile time', () => {
		// @ts-expect-error context must be a record
		new ConnectionRefusedError('test', { context: 'nope' });
		expect(() => new ConnectionRefusedError('test')).not.toThrow();
	});

	it('should reject typed fields it does not own at compile time', () => {
		// ConnectionRefusedError has no typed fields; only context and cause are accepted.
		// @ts-expect-error timeoutMs is not part of ConnectionRefusedError details
		new ConnectionRefusedError('test', { timeoutMs: 5 });
		expect(() => new ConnectionRefusedError('test')).not.toThrow();
	});

	it('should reject assignment to readonly inherited fields at compile time', () => {
		const error = new ConnectionRefusedError('test');
		// @ts-expect-error code is readonly
		error.code = 'SOMETHING_ELSE';
		// readonly is compile-time only; the runtime write succeeds and the post-write value is asserted.
		expect(error.code).toBe('SOMETHING_ELSE');

		const withContext = new ConnectionRefusedError('test', { context: { address: '127.0.0.1' } });
		// @ts-expect-error context is readonly
		withContext.context = { other: 1 };
		expect(withContext.context).toEqual({ other: 1 });
	});
});
