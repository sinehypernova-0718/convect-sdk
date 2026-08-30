import { describe, expect, it } from 'vitest';
import {
	DeviceReachability,
	DeviceStatus,
	InvalidDeviceStatusError,
	isDeviceReachability,
	isDeviceStatus,
	isValidTransition,
	parseDeviceStatus,
} from '../../index.js';

describe('DeviceStatus', () => {
	it('should define expected status values', () => {
		expect(DeviceStatus.IDLE).toBe('idle');
		expect(DeviceStatus.CONNECTING).toBe('connecting');
		expect(DeviceStatus.CONNECTED).toBe('connected');
		expect(DeviceStatus.DISCONNECTING).toBe('disconnecting');
		expect(DeviceStatus.DISCONNECTED).toBe('disconnected');
		expect(DeviceStatus.ERROR).toBe('error');
	});

	it('should have exactly 6 status values', () => {
		const values = Object.values(DeviceStatus);
		expect(values).toHaveLength(6);
	});
});

describe('isDeviceStatus', () => {
	it('should return true for valid DeviceStatus values', () => {
		for (const status of Object.values(DeviceStatus)) {
			expect(isDeviceStatus(status)).toBe(true);
		}
	});

	it('should return false for invalid status values', () => {
		expect(isDeviceStatus('unknown')).toBe(false);
		expect(isDeviceStatus('constructor')).toBe(false);
		expect(isDeviceStatus('__proto__')).toBe(false);
		expect(isDeviceStatus(123)).toBe(false);
		expect(isDeviceStatus(null)).toBe(false);
		expect(isDeviceStatus(undefined)).toBe(false);
	});
});

describe('parseDeviceStatus', () => {
	it('should parse valid DeviceStatus values', () => {
		expect(parseDeviceStatus('idle')).toBe(DeviceStatus.IDLE);
		expect(parseDeviceStatus('connected')).toBe(DeviceStatus.CONNECTED);
	});

	it('should throw InvalidDeviceStatusError for invalid status values', () => {
		expect(() => parseDeviceStatus('invalid_status')).toThrow(InvalidDeviceStatusError);
		expect(() => parseDeviceStatus('constructor')).toThrow(InvalidDeviceStatusError);
	});

	it('should throw InvalidDeviceStatusError for inputs that cannot be coerced with String()', () => {
		const noProtoObj = Object.create(null);
		expect(() => parseDeviceStatus(noProtoObj)).toThrow(InvalidDeviceStatusError);

		const throwingToString = {
			toString() {
				throw new Error('Custom toString error');
			},
		};
		expect(() => parseDeviceStatus(throwingToString)).toThrow(InvalidDeviceStatusError);

		const throwingToPrimitive = {
			[Symbol.toPrimitive]() {
				throw new Error('Custom toPrimitive error');
			},
		};
		expect(() => parseDeviceStatus(throwingToPrimitive)).toThrow(InvalidDeviceStatusError);
	});

	it('should safely format non-string primitives and objects without throwing', () => {
		expect(() => parseDeviceStatus(null)).toThrow(InvalidDeviceStatusError);
		expect(() => parseDeviceStatus(undefined)).toThrow(InvalidDeviceStatusError);
		expect(() => parseDeviceStatus(123)).toThrow(InvalidDeviceStatusError);
		expect(() => parseDeviceStatus(Symbol('test'))).toThrow(InvalidDeviceStatusError);
		expect(() => parseDeviceStatus({})).toThrow(InvalidDeviceStatusError);
	});
});

describe('Public entry point exports', () => {
	it('should export reachability API from public device index', () => {
		expect(DeviceReachability).toBeDefined();
		expect(isDeviceReachability('online')).toBe(true);
	});
});

describe('isValidTransition', () => {
	describe('valid transitions from IDLE', () => {
		it('should allow IDLE -> CONNECTING', () => {
			expect(isValidTransition(DeviceStatus.IDLE, DeviceStatus.CONNECTING)).toBe(true);
		});

		it('should allow IDLE -> ERROR', () => {
			expect(isValidTransition(DeviceStatus.IDLE, DeviceStatus.ERROR)).toBe(true);
		});
	});

	describe('valid transitions from CONNECTING', () => {
		it('should allow CONNECTING -> CONNECTED', () => {
			expect(isValidTransition(DeviceStatus.CONNECTING, DeviceStatus.CONNECTED)).toBe(true);
		});

		it('should allow CONNECTING -> DISCONNECTED', () => {
			expect(isValidTransition(DeviceStatus.CONNECTING, DeviceStatus.DISCONNECTED)).toBe(true);
		});

		it('should allow CONNECTING -> ERROR', () => {
			expect(isValidTransition(DeviceStatus.CONNECTING, DeviceStatus.ERROR)).toBe(true);
		});
	});

	describe('valid transitions from CONNECTED', () => {
		it('should allow CONNECTED -> DISCONNECTING', () => {
			expect(isValidTransition(DeviceStatus.CONNECTED, DeviceStatus.DISCONNECTING)).toBe(true);
		});

		it('should allow CONNECTED -> ERROR', () => {
			expect(isValidTransition(DeviceStatus.CONNECTED, DeviceStatus.ERROR)).toBe(true);
		});
	});

	describe('valid transitions from DISCONNECTING', () => {
		it('should allow DISCONNECTING -> DISCONNECTED', () => {
			expect(isValidTransition(DeviceStatus.DISCONNECTING, DeviceStatus.DISCONNECTED)).toBe(true);
		});

		it('should allow DISCONNECTING -> ERROR', () => {
			expect(isValidTransition(DeviceStatus.DISCONNECTING, DeviceStatus.ERROR)).toBe(true);
		});
	});

	describe('valid transitions from DISCONNECTED', () => {
		it('should allow DISCONNECTED -> IDLE', () => {
			expect(isValidTransition(DeviceStatus.DISCONNECTED, DeviceStatus.IDLE)).toBe(true);
		});

		it('should allow DISCONNECTED -> ERROR', () => {
			expect(isValidTransition(DeviceStatus.DISCONNECTED, DeviceStatus.ERROR)).toBe(true);
		});
	});

	describe('valid transitions from ERROR', () => {
		it('should allow ERROR -> IDLE', () => {
			expect(isValidTransition(DeviceStatus.ERROR, DeviceStatus.IDLE)).toBe(true);
		});

		it('should allow ERROR -> DISCONNECTED', () => {
			expect(isValidTransition(DeviceStatus.ERROR, DeviceStatus.DISCONNECTED)).toBe(true);
		});
	});

	describe('invalid transitions', () => {
		it('should reject IDLE -> CONNECTED (skip CONNECTING)', () => {
			expect(isValidTransition(DeviceStatus.IDLE, DeviceStatus.CONNECTED)).toBe(false);
		});

		it('should reject IDLE -> DISCONNECTING', () => {
			expect(isValidTransition(DeviceStatus.IDLE, DeviceStatus.DISCONNECTING)).toBe(false);
		});

		it('should reject IDLE -> DISCONNECTED', () => {
			expect(isValidTransition(DeviceStatus.IDLE, DeviceStatus.DISCONNECTED)).toBe(false);
		});

		it('should reject CONNECTED -> IDLE (skip DISCONNECTING)', () => {
			expect(isValidTransition(DeviceStatus.CONNECTED, DeviceStatus.IDLE)).toBe(false);
		});

		it('should reject CONNECTED -> CONNECTING', () => {
			expect(isValidTransition(DeviceStatus.CONNECTED, DeviceStatus.CONNECTING)).toBe(false);
		});

		it('should reject self-transitions', () => {
			for (const status of Object.values(DeviceStatus)) {
				expect(isValidTransition(status, status)).toBe(false);
			}
		});

		it('should reject malformed status values targeting prototype properties', () => {
			const malformedStatuses = [
				'constructor',
				'__proto__',
				'toString',
				'valueOf',
				'hasOwnProperty',
			] as unknown as DeviceStatus[];
			for (const status of malformedStatuses) {
				expect(isValidTransition(status, DeviceStatus.CONNECTED)).toBe(false);
				expect(isValidTransition(DeviceStatus.IDLE, status)).toBe(false);
			}
		});
	});
});
