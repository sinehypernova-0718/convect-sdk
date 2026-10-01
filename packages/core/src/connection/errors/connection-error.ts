/**
 * Optional trailing-details object shared by connection error constructors.
 *
 * Uniform rule for the connection error vocabulary: required data is
 * positional, everything optional goes in a trailing details object.
 */
export type ConnectionErrorDetails = Readonly<{
	/** Transport-specific diagnostics (addresses, native codes, and so on). */
	context?: Readonly<Record<string, unknown>>;
	/** The underlying error being wrapped. */
	cause?: unknown;
}>;

/**
 * Base class for all connection-domain errors.
 */
export class ConnectionError extends Error {
	readonly code: string;
	readonly context: Readonly<Record<string, unknown>> | undefined;

	constructor(
		message: string,
		code: string,
		context?: Readonly<Record<string, unknown>>,
		options?: ErrorOptions,
	) {
		super(message, options);
		this.name = 'ConnectionError';
		this.code = code;
		this.context = context;
		// `new.target.prototype` (not a hard-coded prototype) keeps the real
		// constructor's identity when a subclass calls super(), so
		// `instanceof Subclass` stays true even on older transpile targets.
		Object.setPrototypeOf(this, new.target.prototype);
	}
}
