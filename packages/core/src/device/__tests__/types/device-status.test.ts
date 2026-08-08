import { describe, expect, it } from 'vitest';
import { DeviceStatus, isValidTransition } from '../../types/device-status.js';

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
	});
});
