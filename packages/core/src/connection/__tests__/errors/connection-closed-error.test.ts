import { describe, expect, it } from 'vitest';
import { ConnectionClosedError } from '../../errors/connection-closed-error.js';
import { ConnectionError } from '../../errors/connection-error.js';
import { DisconnectReason } from '../../types/disconnect-reason.js';

describe('ConnectionClosedError', () => {
	it('should have the correct name, code, and message', () => {
		const error = new ConnectionClosedError('link closed');
		expect(error.name).toBe('ConnectionClosedError');
		expect(error.code).toBe('CONNECTION_CLOSED');
		expect(error.message).toBe('link closed');
	});

	it('should be an instance of Error, ConnectionError, and the specific class', () => {
		const error = new ConnectionClosedError('test');
		expect(error).toBeInstanceOf(Error);
		expect(error).toBeInstanceOf(ConnectionError);
		expect(error).toBeInstanceOf(ConnectionClosedError);
		expect(Object.getPrototypeOf(error)).toBe(ConnectionClosedError.prototype);
	});

	it('should preserve subclass identity through super()', () => {
		class Custom extends ConnectionClosedError {}
		const error = new Custom('test');
		expect(error).toBeInstanceOf(Custom);
		expect(error).toBeInstanceOf(ConnectionClosedError);
		expect(Object.getPrototypeOf(error)).toBe(Custom.prototype);
	});

	it('should default reason to undefined and context to undefined', () => {
		const error = new ConnectionClosedError('test');
		expect(error.reason).toBeUndefined();
		expect(error.context).toBeUndefined();
		expect(Object.hasOwn(error, 'cause')).toBe(false);
	});

	it('should accept every DisconnectReason value', () => {
		for (const reason of Object.values(DisconnectReason)) {
			const error = new ConnectionClosedError('test', { reason });
			expect(error.reason).toBe(reason);
			expect(error.context).toEqual({ reason });
		}
	});

	it('should merge caller context with own fields', () => {
		const error = new ConnectionClosedError('test', {
			context: { endpoint: 'serial:/dev/ttyUSB0' },
			reason: DisconnectReason.PEER_CLOSED,
		});
		expect(error.context).toEqual({ endpoint: 'serial:/dev/ttyUSB0', reason: 'peer_closed' });
	});

	it('should let typed fields win on key collisions', () => {
		const error = new ConnectionClosedError('test', {
			context: { reason: 'timeout' },
			reason: DisconnectReason.PEER_CLOSED,
		});
		expect(error.context?.reason).toBe(DisconnectReason.PEER_CLOSED);
	});

	it('should forward cause by identity', () => {
		const original = new Error('socket reset');
		const error = new ConnectionClosedError('test', { cause: original });
		expect(error.cause).toBe(original);
	});

	it('should not create an own cause property for details without a cause key', () => {
		expect(Object.hasOwn(new ConnectionClosedError('test', {}), 'cause')).toBe(false);
		expect(Object.hasOwn(new ConnectionClosedError('test', { context: { a: 1 } }), 'cause')).toBe(
			false,
		);
		expect(
			Object.hasOwn(
				new ConnectionClosedError('test', { reason: DisconnectReason.TIMEOUT }),
				'cause',
			),
		).toBe(false);
	});

	it('should allow explicit undefined cause as the only way cause exists as undefined', () => {
		const error = new ConnectionClosedError('test', { cause: undefined });
		expect(Object.hasOwn(error, 'cause')).toBe(true);
		expect(error.cause).toBeUndefined();
	});

	it('should reject readonly assignment at compile time', () => {
		const error = new ConnectionClosedError('test', { reason: DisconnectReason.TIMEOUT });
		// @ts-expect-error reason is readonly
		error.reason = DisconnectReason.PEER_CLOSED;
		// readonly is compile-time only: the write succeeds at runtime, and the
		// compiler error above (pinned by @ts-expect-error) is what we assert.
		expect(error.reason).toBe(DisconnectReason.PEER_CLOSED);
	});

	it('should reject invalid reason values at compile time', () => {
		// @ts-expect-error reason must be a DisconnectReason
		new ConnectionClosedError('test', { reason: 'nope' });
		expect(() => new ConnectionClosedError('test')).not.toThrow();
	});
});
