import { describe, expect, it } from 'vitest';
import {
	ConnectionError,
	ConnectionState,
	type ConnectionStateTransition,
	DeviceError,
	DeviceId,
	DeviceReachability,
	DeviceStatus,
	type DeviceStatusTransition,
	DeviceType,
	InvalidConnectionStateError,
	InvalidConnectionStateTransitionError,
	InvalidDeviceIdError,
	InvalidDeviceStatusError,
	InvalidDeviceStatusTransitionError,
	isConnectionState,
	isDeviceReachability,
	isDeviceStatus,
	isDeviceType,
	isValidConnectionStateTransition,
	isValidTransition,
	parseConnectionState,
	parseDeviceStatus,
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

	it('should export all connection error classes', () => {
		expect(ConnectionError).toBeDefined();
		expect(InvalidConnectionStateError).toBeDefined();
		expect(InvalidConnectionStateTransitionError).toBeDefined();

		const error = new InvalidConnectionStateError('Invalid state');
		expect(error).toBeInstanceOf(ConnectionError);
	});

	it('should export connection vocabulary types and enum values', () => {
		expect(ConnectionState.DISCONNECTED).toBe('disconnected');
		expect(ConnectionState.CONNECTING).toBe('connecting');
		expect(ConnectionState.CONNECTED).toBe('connected');
		expect(ConnectionState.RECONNECTING).toBe('reconnecting');
		expect(ConnectionState.DISCONNECTING).toBe('disconnecting');
		expect(ConnectionState.FAILED).toBe('failed');
	});

	it('should export connection utility functions', () => {
		expect(typeof isConnectionState).toBe('function');
		expect(typeof parseConnectionState).toBe('function');
		expect(typeof isValidConnectionStateTransition).toBe('function');

		expect(isConnectionState('connected')).toBe(true);
		expect(parseConnectionState('reconnecting')).toBe(ConnectionState.RECONNECTING);
		expect(
			isValidConnectionStateTransition(ConnectionState.FAILED, ConnectionState.CONNECTING),
		).toBe(true);
	});

	it('should correctly type ConnectionStateTransition context', () => {
		const transition: ConnectionStateTransition = {
			from: ConnectionState.DISCONNECTED,
			to: ConnectionState.CONNECTING,
		};
		expect(transition.from).toBe(ConnectionState.DISCONNECTED);
		expect(transition.to).toBe(ConnectionState.CONNECTING);
	});
});
