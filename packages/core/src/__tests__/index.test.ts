import { describe, expect, it } from 'vitest';
import {
	DeviceError,
	DeviceId,
	DeviceReachability,
	DeviceStatus,
	DeviceType,
	InvalidDeviceIdError,
	InvalidDeviceStatusError,
	InvalidDeviceStatusTransitionError,
	isDeviceReachability,
	isDeviceStatus,
	isDeviceType,
	isValidTransition,
	parseDeviceStatus,
	type DeviceStatusTransition,
} from '../index.js';

describe('Root package exports (@convect/core)', () => {
	it('should export all device error classes', () => {
		expect(DeviceError).toBeDefined();
		expect(InvalidDeviceIdError).toBeDefined();
		expect(InvalidDeviceStatusError).toBeDefined();
		expect(InvalidDeviceStatusTransitionError).toBeDefined();

		const error = new InvalidDeviceIdError('Invalid ID');
		expect(error).toBeInstanceOf(DeviceError);
	});

	it('should export device vocabulary types and enum values', () => {
		expect(DeviceId).toBeDefined();
		expect(DeviceStatus.IDLE).toBe('idle');
		expect(DeviceReachability.ONLINE).toBe('online');
		expect(DeviceType.SENSOR).toBe('sensor');
	});

	it('should export device utility functions', () => {
		expect(typeof isDeviceType).toBe('function');
		expect(typeof isDeviceStatus).toBe('function');
		expect(typeof parseDeviceStatus).toBe('function');
		expect(typeof isValidTransition).toBe('function');
		expect(typeof isDeviceReachability).toBe('function');

		expect(isDeviceStatus('idle')).toBe(true);
		expect(parseDeviceStatus('connected')).toBe(DeviceStatus.CONNECTED);
		expect(isValidTransition(DeviceStatus.IDLE, DeviceStatus.CONNECTING)).toBe(true);
		expect(isDeviceReachability('online')).toBe(true);
		expect(isDeviceType('sensor')).toBe(true);
	});

	it('should correctly type DeviceStatusTransition context', () => {
		const transition: DeviceStatusTransition = {
			from: DeviceStatus.IDLE,
			to: DeviceStatus.CONNECTING,
		};
		expect(transition.from).toBe(DeviceStatus.IDLE);
		expect(transition.to).toBe(DeviceStatus.CONNECTING);
	});
});
