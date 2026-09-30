import type { ConnectionErrorDetails } from './connection-error.js';
import { ConnectionError } from './connection-error.js';

/**
 * The peer or transport actively rejected the connection attempt.
 *
 * A transport constructs this when the remote end refuses the link outright
 * (for example a refused socket or a rejection frame), as opposed to timing
 * out or closing mid-session. Core never throws this itself; it is part of
 * the stable failure vocabulary transports and the SDK construct.
 */
export class ConnectionRefusedError extends ConnectionError {
	constructor(message: string, details?: ConnectionErrorDetails) {
		const context = { ...details?.context };
		super(
			message,
			'CONNECTION_REFUSED',
			Object.keys(context).length > 0 ? context : undefined,
			details && Object.hasOwn(details, 'cause') ? { cause: details.cause } : undefined,
		);
		this.name = 'ConnectionRefusedError';
		Object.setPrototypeOf(this, new.target.prototype);
	}
}
