import { describe, expect, it } from 'vitest';
import { DeviceError } from '../../errors/device-error.js';
import { InvalidDeviceIdError } from '../../errors/device-id-error.js';

describe('InvalidDeviceIdError', () => {
	it('should be an instance of DeviceError and Error', () => {
		const error = new InvalidDeviceIdError('Invalid device ID provided');
		expect(error).toBeInstanceOf(DeviceError);
		expect(error).toBeInstanceOf(Error);
		expect(error).toBeInstanceOf(InvalidDeviceIdError);
	});

	it('should have the correct error name', () => {
		const error = new InvalidDeviceIdError('Invalid device ID provided');
		expect(error.name).toBe('InvalidDeviceIdError');
	});

	it('should have the INVALID_DEVICE_ID error code', () => {
		const error = new InvalidDeviceIdError('Invalid device ID provided');
		expect(error.code).toBe('INVALID_DEVICE_ID');
	});

	it('should store and preserve the error message', () => {
		const message = 'Device ID "abc!@#" contains invalid characters';
		const error = new InvalidDeviceIdError(message);
		expect(error.message).toBe(message);
	});

	it('should contain a stack trace', () => {
		const error = new InvalidDeviceIdError('Invalid device ID');
		expect(error.stack).toBeDefined();
	});

	it('should maintain prototype chain for instanceof checks', () => {
		const error = new InvalidDeviceIdError('Invalid device ID');
		expect(Object.getPrototypeOf(error)).toBe(InvalidDeviceIdError.prototype);
	});
});
