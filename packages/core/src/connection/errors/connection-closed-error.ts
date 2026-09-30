import type { DisconnectReason } from '../types/disconnect-reason.js';
import type { ConnectionErrorDetails } from './connection-error.js';
import { ConnectionError } from './connection-error.js';

/**
 * An operation needed the link, but it had closed or was closed unexpectedly.
 *
 * A transport or the SDK constructs this when work is attempted on a link
 * that is no longer available. `reason` carries why, when known, using the
 * same {@link DisconnectReason} vocabulary the close events use. Core never
 * throws this itself; it is part of the stable failure vocabulary.
 */
export class ConnectionClosedError extends ConnectionError {
	readonly reason: DisconnectReason | undefined;

	constructor(
		message: string,
		details?: ConnectionErrorDetails & Readonly<{ reason?: DisconnectReason }>,
	) {
		const ownContext = details?.reason !== undefined ? { reason: details.reason } : {};
		const context = { ...details?.context, ...ownContext };
		super(
			message,
			'CONNECTION_CLOSED',
			Object.keys(context).length > 0 ? context : undefined,
			details && Object.hasOwn(details, 'cause') ? { cause: details.cause } : undefined,
		);
		this.name = 'ConnectionClosedError';
		this.reason = details?.reason;
		Object.setPrototypeOf(this, new.target.prototype);
	}
}
