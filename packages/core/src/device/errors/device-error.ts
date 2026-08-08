/**
 * Base class for all device-domain errors.
 */
export class DeviceError extends Error {
	readonly code: string;

	constructor(message: string, code: string) {
		super(message);
		this.name = 'DeviceError';
		this.code = code;
		Object.setPrototypeOf(this, DeviceError.prototype);
	}
}
