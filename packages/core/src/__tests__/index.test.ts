import { describe, expect, it } from 'vitest';
import {
	BackoffStrategy,
	ConnectionClosedError,
	ConnectionError,
	type ConnectionErrorDetails,
	ConnectionRefusedError,
	ConnectionState,
	type ConnectionStateTransition,
	ConnectionTimeoutError,
	type ConnectionTimeouts,
	DeviceError,
	DeviceId,
	DeviceReachability,
	DeviceStatus,
	type DeviceStatusTransition,
	DeviceType,
	DisconnectReason,
	InvalidConnectionStateError,
	InvalidConnectionStateTransitionError,
	InvalidDeviceIdError,
	InvalidDeviceStatusError,
	InvalidDeviceStatusTransitionError,
	isBackoffStrategy,
	isConnectionState,
	isDeviceReachability,
	isDeviceStatus,
	isDeviceType,
	isDisconnectReason,
	isValidConnectionStateTransition,
	isValidTransition,
	parseConnectionState,
	parseDeviceStatus,
	ReconnectExhaustedError,
	type ReconnectPolicy,
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

	it('should export disconnect reason and backoff vocabulary', () => {
		expect(DisconnectReason.USER_REQUESTED).toBe('user_requested');
		expect(DisconnectReason.TIMEOUT).toBe('timeout');
		expect(DisconnectReason.PEER_CLOSED).toBe('peer_closed');
		expect(DisconnectReason.TRANSPORT_ERROR).toBe('transport_error');
		expect(DisconnectReason.PROTOCOL_ERROR).toBe('protocol_error');
		expect(DisconnectReason.RETRIES_EXHAUSTED).toBe('retries_exhausted');
		expect(BackoffStrategy.FIXED).toBe('fixed');
		expect(BackoffStrategy.LINEAR).toBe('linear');
		expect(BackoffStrategy.EXPONENTIAL).toBe('exponential');

		expect(isDisconnectReason('timeout')).toBe(true);
		expect(isDisconnectReason('TIMEOUT')).toBe(false);
		expect(isBackoffStrategy('exponential')).toBe(true);
		expect(isBackoffStrategy('FIXED')).toBe(false);
	});

	it('should export connection option types usable through the root import', () => {
		const policy: ReconnectPolicy = {
			enabled: true,
			initialDelayMs: 1000,
			maxDelayMs: 30000,
			backoff: BackoffStrategy.EXPONENTIAL,
			jitter: true,
		};
		const timeouts: ConnectionTimeouts = { connectMs: 5000 };

		expect(policy.backoff).toBe(BackoffStrategy.EXPONENTIAL);
		expect(timeouts.connectMs).toBe(5000);
	});

	it('should export all connection failure error classes', () => {
		expect(ConnectionTimeoutError).toBeDefined();
		expect(ConnectionRefusedError).toBeDefined();
		expect(ConnectionClosedError).toBeDefined();
		expect(ReconnectExhaustedError).toBeDefined();

		const timeout = new ConnectionTimeoutError('timed out', { timeoutMs: 5000 });
		const refused = new ConnectionRefusedError('refused');
		const closed = new ConnectionClosedError('closed', { reason: DisconnectReason.PEER_CLOSED });
		const exhausted = new ReconnectExhaustedError('exhausted', 3);

		expect(timeout).toBeInstanceOf(ConnectionError);
		expect(refused).toBeInstanceOf(ConnectionError);
		expect(closed).toBeInstanceOf(ConnectionError);
		expect(exhausted).toBeInstanceOf(ConnectionError);

		expect(timeout.code).toBe('CONNECTION_TIMEOUT');
		expect(refused.code).toBe('CONNECTION_REFUSED');
		expect(closed.code).toBe('CONNECTION_CLOSED');
		expect(exhausted.code).toBe('RECONNECT_EXHAUSTED');

		expect(timeout.timeoutMs).toBe(5000);
		expect(closed.reason).toBe(DisconnectReason.PEER_CLOSED);
		expect(exhausted.attempts).toBe(3);
	});

	it('should carry cause and context details typed through the root import', () => {
		const original = new Error('native failure');
		const details: ConnectionErrorDetails = {
			context: { nativeCode: 'ECONNRESET' },
			cause: original,
		};
		const error = new ConnectionRefusedError('wrapped', details);

		expect(error.cause).toBe(original);
		expect(error.context).toEqual({ nativeCode: 'ECONNRESET' });
	});
});
