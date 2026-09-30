/**
 * Base class for all connection-domain errors.
 */
export class ConnectionError extends Error {
	readonly code: string;
	readonly context: Readonly<Record<string, unknown>> | undefined;

	constructor(message: string, code: string, context?: Readonly<Record<string, unknown>>) {
		super(message);
		this.name = 'ConnectionError';
		this.code = code;
		this.context = context;
		Object.setPrototypeOf(this, ConnectionError.prototype);
	}
}
