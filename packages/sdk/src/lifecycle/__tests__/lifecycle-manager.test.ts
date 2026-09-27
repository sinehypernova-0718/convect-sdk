import { DeviceStatus, InvalidDeviceStatusTransitionError } from '@convect/core';
import { describe, expect, it } from 'vitest';
import { LifecycleManager } from '../lifecycle-manager.js';

describe('LifecycleManager', () => {
	it('should default to IDLE when constructed with no arguments', () => {
		const lifecycle = new LifecycleManager();
		expect(lifecycle.status).toBe(DeviceStatus.IDLE);
	});

	it('should accept an explicit initial status via the constructor', () => {
		const lifecycle = new LifecycleManager(DeviceStatus.CONNECTED);
		expect(lifecycle.status).toBe(DeviceStatus.CONNECTED);
	});

	it('should return true from canTransition() for a valid transition', () => {
		const lifecycle = new LifecycleManager();
		expect(lifecycle.canTransition(DeviceStatus.CONNECTING)).toBe(true);
	});

	it('should return false from canTransition() for an invalid transition without mutating status', () => {
		const lifecycle = new LifecycleManager();
		expect(lifecycle.canTransition(DeviceStatus.CONNECTED)).toBe(false);
		expect(lifecycle.status).toBe(DeviceStatus.IDLE);
	});

	it('should update status and return the transition pair on a valid transition', () => {
		const lifecycle = new LifecycleManager();
		const transition = lifecycle.transition(DeviceStatus.CONNECTING);
		expect(transition).toEqual({ from: DeviceStatus.IDLE, to: DeviceStatus.CONNECTING });
		expect(lifecycle.status).toBe(DeviceStatus.CONNECTING);
	});

	it('should throw InvalidDeviceStatusTransitionError on an invalid transition', () => {
		const lifecycle = new LifecycleManager();
		expect(() => lifecycle.transition(DeviceStatus.CONNECTED)).toThrow(
			InvalidDeviceStatusTransitionError,
		);
	});

	it('should leave status unchanged when a transition is rejected', () => {
		const lifecycle = new LifecycleManager();
		try {
			lifecycle.transition(DeviceStatus.CONNECTED);
		} catch {
			// Expected: the transition is invalid and must not mutate state.
		}
		expect(lifecycle.status).toBe(DeviceStatus.IDLE);
	});

	it('should report the attempted from/to pair on the thrown error', () => {
		const lifecycle = new LifecycleManager(DeviceStatus.CONNECTED);
		let caught: unknown;
		try {
			lifecycle.transition(DeviceStatus.CONNECTING);
		} catch (error) {
			caught = error;
		}
		expect(caught).toBeInstanceOf(InvalidDeviceStatusTransitionError);
		const error = caught as InvalidDeviceStatusTransitionError;
		expect(error.from).toBe(DeviceStatus.CONNECTED);
		expect(error.to).toBe(DeviceStatus.CONNECTING);
	});
});
