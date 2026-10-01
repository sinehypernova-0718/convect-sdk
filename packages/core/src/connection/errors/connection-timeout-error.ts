import type { ConnectionErrorDetails } from './connection-error.js';
import { ConnectionError } from './connection-error.js';

/**
 * An operation (connect or graceful disconnect) exceeded its time limit.
 *
 * A transport constructs this when a handshake, open, or teardown runs past
 * the deadline it was given. `timeoutMs` carries the limit that was exceeded
 * when the transport knows it. Core never throws this itself; it is part of
 * the stable failure vocabulary transports and the SDK construct.
 */
export class ConnectionTimeoutError extends ConnectionError {
	readonly timeoutMs: number | undefined;

	constructor(
		message: string,
		details?: ConnectionErrorDetails & Readonly<{ timeoutMs?: number }>,
	) {
		const ownContext = details?.timeoutMs !== undefined ? { timeoutMs: details.timeoutMs } : {};
		const context = { ...details?.context, ...ownContext };
		super(
			message,
			'CONNECTION_TIMEOUT',
			Object.keys(context).length > 0 ? context : undefined,
			details && Object.hasOwn(details, 'cause') ? { cause: details.cause } : undefined,
		);
		this.name = 'ConnectionTimeoutError';
		this.timeoutMs = details?.timeoutMs;
		Object.setPrototypeOf(this, new.target.prototype);
	}
}
