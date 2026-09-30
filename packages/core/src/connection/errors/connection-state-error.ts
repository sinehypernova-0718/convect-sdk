import type { ConnectionState } from '../types/connection-state.js';
import { ConnectionError } from './connection-error.js';

/**
 * Attempted to parse or set an invalid connection state.
 */
export class InvalidConnectionStateError extends ConnectionError {
	constructor(message: string) {
		super(message, 'INVALID_CONNECTION_STATE');
		this.name = 'InvalidConnectionStateError';
		Object.setPrototypeOf(this, new.target.prototype);
	}
}

/**
 * Attempted an invalid state transition.
 *
 * The state machine has rules about which transitions are allowed.
 */
export class InvalidConnectionStateTransitionError extends ConnectionError {
	readonly from: ConnectionState;
	readonly to: ConnectionState;

	constructor(message: string, from: ConnectionState, to: ConnectionState) {
		super(message, 'INVALID_CONNECTION_STATE_TRANSITION', { from, to });
		this.name = 'InvalidConnectionStateTransitionError';
		this.from = from;
		this.to = to;
		Object.setPrototypeOf(this, new.target.prototype);
	}
}
