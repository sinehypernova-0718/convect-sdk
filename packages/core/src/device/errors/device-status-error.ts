import type { DeviceStatus } from '../types/device-status.js';
import { DeviceError } from './device-error.js';

/**
 * Attempted to parse or set an invalid device status.
 */
export class InvalidDeviceStatusError extends DeviceError {
	constructor(message: string) {
		super(message, 'INVALID_DEVICE_STATUS');
		this.name = 'InvalidDeviceStatusError';
		Object.setPrototypeOf(this, InvalidDeviceStatusError.prototype);
	}
}

/**
 * Attempted an invalid state transition.
 *
 * The state machine has rules about which transitions are allowed.
 */
export class InvalidDeviceStatusTransitionError extends DeviceError {
	readonly from: DeviceStatus;
	readonly to: DeviceStatus;

	constructor(message: string, from: DeviceStatus, to: DeviceStatus) {
		super(message, 'INVALID_DEVICE_STATUS_TRANSITION');
		this.name = 'InvalidDeviceStatusTransitionError';
		this.from = from;
		this.to = to;
		Object.setPrototypeOf(this, InvalidDeviceStatusTransitionError.prototype);
	}
}
