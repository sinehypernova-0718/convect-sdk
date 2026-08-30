import { describe, expect, it } from 'vitest';
import { DeviceReachability, isDeviceReachability } from '../../types/device-reachability.js';

describe('DeviceReachability', () => {
	it('defines the expected reachability values', () => {
		expect(DeviceReachability.ONLINE).toBe('online');
		expect(DeviceReachability.OFFLINE).toBe('offline');
	});

	it('has exactly two reachability values', () => {
		expect(Object.values(DeviceReachability)).toEqual(['online', 'offline']);
	});

	it('supports strict comparison and switch statements', () => {
		const labelFor = (reachability: DeviceReachability): string => {
			switch (reachability) {
				case DeviceReachability.ONLINE:
					return 'online';
				case DeviceReachability.OFFLINE:
					return 'offline';
			}
		};

		const online = DeviceReachability.ONLINE;
		expect(online === DeviceReachability.ONLINE).toBe(true);
		expect(labelFor(DeviceReachability.ONLINE)).toBe('online');
		expect(labelFor(DeviceReachability.OFFLINE)).toBe('offline');
	});
});

describe('isDeviceReachability', () => {
	it('accepts string literals matching enum values', () => {
		expect(isDeviceReachability('online')).toBe(true);
		expect(isDeviceReachability('offline')).toBe(true);
	});

	it('accepts DeviceReachability values', () => {
		expect(isDeviceReachability(DeviceReachability.ONLINE)).toBe(true);
		expect(isDeviceReachability(DeviceReachability.OFFLINE)).toBe(true);
	});

	it('rejects invalid strings without normalizing them', () => {
		expect(isDeviceReachability('ONLINE')).toBe(false);
		expect(isDeviceReachability(' online')).toBe(false);
		expect(isDeviceReachability('online ')).toBe(false);
		expect(isDeviceReachability('unknown')).toBe(false);
		expect(isDeviceReachability('')).toBe(false);
	});

	it('rejects non-string values', () => {
		expect(isDeviceReachability(123)).toBe(false);
		expect(isDeviceReachability(null)).toBe(false);
		expect(isDeviceReachability(undefined)).toBe(false);
		expect(isDeviceReachability({})).toBe(false);
	});

	it('narrows unknown values to DeviceReachability', () => {
		const value: unknown = DeviceReachability.ONLINE;

		if (isDeviceReachability(value)) {
			const typed: DeviceReachability = value;
			expect(typed).toBe(DeviceReachability.ONLINE);
			return;
		}

		expect.unreachable('A valid DeviceReachability value should pass the guard');
	});
});
