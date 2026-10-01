import type { ConnectionErrorDetails } from './connection-error.js';
import { ConnectionError } from './connection-error.js';

/**
 * The SDK stopped retrying after exhausting the active reconnect policy.
 *
 * The SDK constructs this when a reconnect loop gives up after `attempts`
 * attempts under the resolved ReconnectPolicy. Transports do not construct
 * it: retry accounting lives in the SDK. Core never throws this itself; it
 * is part of the stable failure vocabulary.
 */
export class ReconnectExhaustedError extends ConnectionError {
	readonly attempts: number;

	constructor(message: string, attempts: number, details?: ConnectionErrorDetails) {
		const context = { ...details?.context, attempts };
		super(
			message,
			'RECONNECT_EXHAUSTED',
			context,
			details && Object.hasOwn(details, 'cause') ? { cause: details.cause } : undefined,
		);
		this.name = 'ReconnectExhaustedError';
		this.attempts = attempts;
		Object.setPrototypeOf(this, new.target.prototype);
	}
}
