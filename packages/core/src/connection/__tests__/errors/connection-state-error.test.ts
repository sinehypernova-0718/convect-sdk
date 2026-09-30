import { describe, expect, it } from 'vitest';
import { ConnectionError } from '../../errors/connection-error.js';
import {
	InvalidConnectionStateError,
	InvalidConnectionStateTransitionError,
} from '../../errors/connection-state-error.js';
import { ConnectionState } from '../../types/connection-state.js';

describe('InvalidConnectionStateError', () => {
	it('should be an instance of ConnectionError and Error', () => {
		const error = new InvalidConnectionStateError('Invalid state value');
		expect(error).toBeInstanceOf(ConnectionError);
		expect(error).toBeInstanceOf(Error);
		expect(error).toBeInstanceOf(InvalidConnectionStateError);
	});

	it('should have the correct error name', () => {
		const error = new InvalidConnectionStateError('Invalid state value');
		expect(error.name).toBe('InvalidConnectionStateError');
	});

	it('should have the INVALID_CONNECTION_STATE error code', () => {
		const error = new InvalidConnectionStateError('Invalid state value');
		expect(error.code).toBe('INVALID_CONNECTION_STATE');
	});

	it('should store and preserve the error message', () => {
		const message = 'State "unknown_state" is not a recognized ConnectionState';
		const error = new InvalidConnectionStateError(message);
		expect(error.message).toBe(message);
	});

	it('should contain a stack trace', () => {
		const error = new InvalidConnectionStateError('Invalid state');
		expect(error.stack).toBeDefined();
	});

	it('should maintain prototype chain for instanceof checks', () => {
		const error = new InvalidConnectionStateError('Invalid state');
		expect(Object.getPrototypeOf(error)).toBe(InvalidConnectionStateError.prototype);
	});

	it('should preserve subclass identity through super()', () => {
		class CustomStateError extends InvalidConnectionStateError {}
		const error = new CustomStateError('Invalid state');
		expect(error).toBeInstanceOf(CustomStateError);
		expect(error).toBeInstanceOf(InvalidConnectionStateError);
		expect(error).toBeInstanceOf(ConnectionError);
		expect(Object.getPrototypeOf(error)).toBe(CustomStateError.prototype);
	});

	it('should have undefined context', () => {
		const error = new InvalidConnectionStateError('Invalid state');
		expect(error.context).toBeUndefined();
	});
});

describe('InvalidConnectionStateTransitionError', () => {
	it('should be an instance of ConnectionError and Error', () => {
		const error = new InvalidConnectionStateTransitionError(
			'Cannot transition from DISCONNECTED to CONNECTED',
			ConnectionState.DISCONNECTED,
			ConnectionState.CONNECTED,
		);
		expect(error).toBeInstanceOf(ConnectionError);
		expect(error).toBeInstanceOf(Error);
		expect(error).toBeInstanceOf(InvalidConnectionStateTransitionError);
	});

	it('should have the correct error name', () => {
		const error = new InvalidConnectionStateTransitionError(
			'Invalid transition',
			ConnectionState.DISCONNECTED,
			ConnectionState.CONNECTED,
		);
		expect(error.name).toBe('InvalidConnectionStateTransitionError');
	});

	it('should have the INVALID_CONNECTION_STATE_TRANSITION error code', () => {
		const error = new InvalidConnectionStateTransitionError(
			'Invalid transition',
			ConnectionState.DISCONNECTED,
			ConnectionState.CONNECTED,
		);
		expect(error.code).toBe('INVALID_CONNECTION_STATE_TRANSITION');
	});

	it('should carry the from and to states', () => {
		const error = new InvalidConnectionStateTransitionError(
			'Cannot transition from DISCONNECTED to CONNECTED',
			ConnectionState.DISCONNECTED,
			ConnectionState.CONNECTED,
		);
		expect(error.from).toBe(ConnectionState.DISCONNECTED);
		expect(error.to).toBe(ConnectionState.CONNECTED);
	});

	it('should store and preserve the error message', () => {
		const message = 'Transition from CONNECTED to CONNECTING is not allowed';
		const error = new InvalidConnectionStateTransitionError(
			message,
			ConnectionState.CONNECTED,
			ConnectionState.CONNECTING,
		);
		expect(error.message).toBe(message);
	});

	it('should contain a stack trace', () => {
		const error = new InvalidConnectionStateTransitionError(
			'Invalid transition',
			ConnectionState.FAILED,
			ConnectionState.CONNECTED,
		);
		expect(error.stack).toBeDefined();
	});

	it('should maintain prototype chain for instanceof checks', () => {
		const error = new InvalidConnectionStateTransitionError(
			'Invalid transition',
			ConnectionState.FAILED,
			ConnectionState.CONNECTED,
		);
		expect(Object.getPrototypeOf(error)).toBe(InvalidConnectionStateTransitionError.prototype);
	});

	it('should preserve subclass identity through super()', () => {
		class CustomTransitionError extends InvalidConnectionStateTransitionError {}
		const error = new CustomTransitionError(
			'Invalid transition',
			ConnectionState.FAILED,
			ConnectionState.CONNECTED,
		);
		expect(error).toBeInstanceOf(CustomTransitionError);
		expect(error).toBeInstanceOf(InvalidConnectionStateTransitionError);
		expect(error).toBeInstanceOf(ConnectionError);
		expect(Object.getPrototypeOf(error)).toBe(CustomTransitionError.prototype);
	});

	it('should store from and to in base context property', () => {
		const error = new InvalidConnectionStateTransitionError(
			'Cannot transition from DISCONNECTED to CONNECTED',
			ConnectionState.DISCONNECTED,
			ConnectionState.CONNECTED,
		);
		expect(error.context).toBeDefined();
		expect(error.context).toEqual({
			from: ConnectionState.DISCONNECTED,
			to: ConnectionState.CONNECTED,
		});
	});
});
