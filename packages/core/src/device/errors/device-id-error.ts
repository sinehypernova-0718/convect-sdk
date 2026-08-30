import { DeviceError } from './device-error.js';

/**
 * Attempted to parse or create an invalid device identifier.
 */
export class InvalidDeviceIdError extends DeviceError {
	constructor(message: string) {
		super(message, 'INVALID_DEVICE_ID');
		this.name = 'InvalidDeviceIdError';
		Object.setPrototypeOf(this, InvalidDeviceIdError.prototype);
	}
}
