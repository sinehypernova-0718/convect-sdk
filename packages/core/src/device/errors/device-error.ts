/**
 * Base class for all device-domain errors.
 */
export class DeviceError extends Error {
	readonly code: string;
	readonly context: Readonly<Record<string, unknown>> | undefined;

	constructor(
		message: string,
		code: string,
		context?: Readonly<Record<string, unknown>>,
	) {
		super(message);
		this.name = 'DeviceError';
		this.code = code;
		this.context = context;
		Object.setPrototypeOf(this, DeviceError.prototype);
	}
}
