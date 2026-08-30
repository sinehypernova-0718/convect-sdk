import { describe, expect, it } from 'vitest';
import { DeviceError } from '../../errors/device-error.js';
import {
	InvalidDeviceStatusError,
	InvalidDeviceStatusTransitionError,
} from '../../errors/device-status-error.js';
import { DeviceStatus } from '../../types/device-status.js';

describe('InvalidDeviceStatusError', () => {
	it('should be an instance of DeviceError and Error', () => {
		const error = new InvalidDeviceStatusError('Invalid status value');
		expect(error).toBeInstanceOf(DeviceError);
		expect(error).toBeInstanceOf(Error);
		expect(error).toBeInstanceOf(InvalidDeviceStatusError);
	});

	it('should have the correct error name', () => {
		const error = new InvalidDeviceStatusError('Invalid status value');
		expect(error.name).toBe('InvalidDeviceStatusError');
	});

	it('should have the INVALID_DEVICE_STATUS error code', () => {
		const error = new InvalidDeviceStatusError('Invalid status value');
		expect(error.code).toBe('INVALID_DEVICE_STATUS');
	});

	it('should store and preserve the error message', () => {
		const message = 'Status "unknown_status" is not a recognized DeviceStatus';
		const error = new InvalidDeviceStatusError(message);
		expect(error.message).toBe(message);
	});

	it('should contain a stack trace', () => {
		const error = new InvalidDeviceStatusError('Invalid status');
		expect(error.stack).toBeDefined();
	});

	it('should maintain prototype chain for instanceof checks', () => {
		const error = new InvalidDeviceStatusError('Invalid status');
		expect(Object.getPrototypeOf(error)).toBe(InvalidDeviceStatusError.prototype);
	});
});

describe('InvalidDeviceStatusTransitionError', () => {
	it('should be an instance of DeviceError and Error', () => {
		const error = new InvalidDeviceStatusTransitionError(
			'Cannot transition from IDLE to CONNECTED',
			DeviceStatus.IDLE,
			DeviceStatus.CONNECTED,
		);
		expect(error).toBeInstanceOf(DeviceError);
		expect(error).toBeInstanceOf(Error);
		expect(error).toBeInstanceOf(InvalidDeviceStatusTransitionError);
	});

	it('should have the correct error name', () => {
		const error = new InvalidDeviceStatusTransitionError(
			'Invalid transition',
			DeviceStatus.IDLE,
			DeviceStatus.CONNECTED,
		);
		expect(error.name).toBe('InvalidDeviceStatusTransitionError');
	});

	it('should have the INVALID_DEVICE_STATUS_TRANSITION error code', () => {
		const error = new InvalidDeviceStatusTransitionError(
			'Invalid transition',
			DeviceStatus.IDLE,
			DeviceStatus.CONNECTED,
		);
		expect(error.code).toBe('INVALID_DEVICE_STATUS_TRANSITION');
	});

	it('should carry the from and to states', () => {
		const error = new InvalidDeviceStatusTransitionError(
			'Cannot transition from IDLE to CONNECTED',
			DeviceStatus.IDLE,
			DeviceStatus.CONNECTED,
		);
		expect(error.from).toBe(DeviceStatus.IDLE);
		expect(error.to).toBe(DeviceStatus.CONNECTED);
	});

	it('should store and preserve the error message', () => {
		const message = 'Transition from CONNECTED to IDLE is not allowed';
		const error = new InvalidDeviceStatusTransitionError(
			message,
			DeviceStatus.CONNECTED,
			DeviceStatus.IDLE,
		);
		expect(error.message).toBe(message);
	});

	it('should contain a stack trace', () => {
		const error = new InvalidDeviceStatusTransitionError(
			'Invalid transition',
			DeviceStatus.IDLE,
			DeviceStatus.CONNECTED,
		);
		expect(error.stack).toBeDefined();
	});

	it('should maintain prototype chain for instanceof checks', () => {
		const error = new InvalidDeviceStatusTransitionError(
			'Invalid transition',
			DeviceStatus.IDLE,
			DeviceStatus.CONNECTED,
		);
		expect(Object.getPrototypeOf(error)).toBe(InvalidDeviceStatusTransitionError.prototype);
	});

	it('should store from and to in base context property', () => {
		const error = new InvalidDeviceStatusTransitionError(
			'Cannot transition from IDLE to CONNECTED',
			DeviceStatus.IDLE,
			DeviceStatus.CONNECTED,
		);
		expect(error.context).toBeDefined();
		expect(error.context).toEqual({
			from: DeviceStatus.IDLE,
			to: DeviceStatus.CONNECTED,
		});
	});
});
