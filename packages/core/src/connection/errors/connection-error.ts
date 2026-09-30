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
		// `new.target.prototype` (not a hard-coded prototype) keeps the real
		// constructor's identity when a subclass calls super(), so
		// `instanceof Subclass` stays true even on older transpile targets.
		Object.setPrototypeOf(this, new.target.prototype);
	}
}
