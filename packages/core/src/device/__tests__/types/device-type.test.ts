import { describe, expect, it } from 'vitest';
import { DeviceType, isDeviceType } from '../../types/device-type.js';

describe('DeviceType', () => {
	it('should define expected type values', () => {
		expect(DeviceType.SENSOR).toBe('sensor');
		expect(DeviceType.ACTUATOR).toBe('actuator');
		expect(DeviceType.GATEWAY).toBe('gateway');
		expect(DeviceType.HYBRID).toBe('hybrid');
	});

	it('should have exactly 4 type values', () => {
		const values = Object.values(DeviceType);
		expect(values).toHaveLength(4);
	});
});

describe('isDeviceType', () => {
	it('should return true for all valid DeviceType values', () => {
		for (const value of Object.values(DeviceType)) {
			expect(isDeviceType(value)).toBe(true);
		}
	});

	it('should return true for string literals matching enum values', () => {
		expect(isDeviceType('sensor')).toBe(true);
		expect(isDeviceType('actuator')).toBe(true);
		expect(isDeviceType('gateway')).toBe(true);
		expect(isDeviceType('hybrid')).toBe(true);
	});

	it('should return false for invalid strings', () => {
		expect(isDeviceType('unknown')).toBe(false);
		expect(isDeviceType('SENSOR')).toBe(false);
		expect(isDeviceType('')).toBe(false);
	});

	it('should return false for non-string values', () => {
		expect(isDeviceType(null)).toBe(false);
		expect(isDeviceType(undefined)).toBe(false);
		expect(isDeviceType(42)).toBe(false);
		expect(isDeviceType({})).toBe(false);
		expect(isDeviceType([])).toBe(false);
		expect(isDeviceType(true)).toBe(false);
	});
});
