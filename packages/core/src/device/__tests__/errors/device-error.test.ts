import { describe, expect, it } from 'vitest';
import { DeviceError } from '../../errors/device-error.js';

describe('DeviceError', () => {
	it('should be an instance of Error and DeviceError', () => {
		const error = new DeviceError('test', 'TEST_CODE');
		expect(error).toBeInstanceOf(Error);
		expect(error).toBeInstanceOf(DeviceError);
	});

	it('should have the correct name', () => {
		const error = new DeviceError('test', 'TEST_CODE');
		expect(error.name).toBe('DeviceError');
	});

	it('should store the message', () => {
		const error = new DeviceError('something went wrong', 'TEST_CODE');
		expect(error.message).toBe('something went wrong');
	});

	it('should store the error code', () => {
		const error = new DeviceError('test', 'MY_CODE');
		expect(error.code).toBe('MY_CODE');
	});

	it('should have a stack trace', () => {
		const error = new DeviceError('test', 'TEST_CODE');
		expect(error.stack).toBeDefined();
	});

	it('should maintain prototype chain for instanceof checks', () => {
		const error = new DeviceError('test', 'TEST_CODE');
		expect(Object.getPrototypeOf(error)).toBe(DeviceError.prototype);
	});
});
