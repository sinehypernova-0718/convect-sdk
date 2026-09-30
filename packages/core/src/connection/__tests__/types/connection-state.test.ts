import { describe, expect, it } from 'vitest';
import {
	ConnectionState,
	InvalidConnectionStateError,
	isConnectionState,
	isValidConnectionStateTransition,
	parseConnectionState,
} from '../../index.js';

/**
 * Expected legal transitions, written independently of the source table so a
 * typo in either side fails the matrix test. Self-transitions are illegal.
 */
const expectedTransitions: Readonly<Record<ConnectionState, ReadonlySet<ConnectionState>>> = {
	[ConnectionState.DISCONNECTED]: new Set([ConnectionState.CONNECTING]),
	[ConnectionState.CONNECTING]: new Set([
		ConnectionState.CONNECTED,
		ConnectionState.FAILED,
		ConnectionState.DISCONNECTING,
	]),
	[ConnectionState.CONNECTED]: new Set([
		ConnectionState.DISCONNECTING,
		ConnectionState.RECONNECTING,
		ConnectionState.DISCONNECTED,
		ConnectionState.FAILED,
	]),
	[ConnectionState.RECONNECTING]: new Set([
		ConnectionState.CONNECTED,
		ConnectionState.FAILED,
		ConnectionState.DISCONNECTING,
	]),
	[ConnectionState.DISCONNECTING]: new Set([ConnectionState.DISCONNECTED]),
	[ConnectionState.FAILED]: new Set([ConnectionState.CONNECTING, ConnectionState.DISCONNECTED]),
};

const allStates = Object.values(ConnectionState);

function expectedLegalCount(): number {
	let total = 0;
	for (const state of allStates) {
		total += expectedTransitions[state].size;
	}
	return total;
}

describe('ConnectionState', () => {
	it('should define expected state values', () => {
		expect(ConnectionState.DISCONNECTED).toBe('disconnected');
		expect(ConnectionState.CONNECTING).toBe('connecting');
		expect(ConnectionState.CONNECTED).toBe('connected');
		expect(ConnectionState.RECONNECTING).toBe('reconnecting');
		expect(ConnectionState.DISCONNECTING).toBe('disconnecting');
		expect(ConnectionState.FAILED).toBe('failed');
	});

	it('should have exactly 6 state values', () => {
		const values = Object.values(ConnectionState);
		expect(values).toHaveLength(6);
	});
});

describe('isConnectionState', () => {
	it('should return true for valid ConnectionState values', () => {
		for (const state of allStates) {
			expect(isConnectionState(state)).toBe(true);
		}
	});

	it('should return false for invalid state values', () => {
		expect(isConnectionState('unknown')).toBe(false);
		expect(isConnectionState(null)).toBe(false);
		expect(isConnectionState(undefined)).toBe(false);
		expect(isConnectionState(123)).toBe(false);
		expect(isConnectionState(true)).toBe(false);
		expect(isConnectionState({})).toBe(false);
		expect(isConnectionState([])).toBe(false);
		expect(isConnectionState('')).toBe(false);
	});

	it('should return false for wrong-case and padded strings', () => {
		expect(isConnectionState('CONNECTED')).toBe(false);
		expect(isConnectionState(' connected')).toBe(false);
		expect(isConnectionState('connected ')).toBe(false);
	});

	it('should return false for prototype keys', () => {
		expect(isConnectionState('constructor')).toBe(false);
		expect(isConnectionState('__proto__')).toBe(false);
		expect(isConnectionState('toString')).toBe(false);
		expect(isConnectionState('hasOwnProperty')).toBe(false);
	});
});

describe('parseConnectionState', () => {
	it('should parse valid ConnectionState values', () => {
		for (const state of allStates) {
			expect(parseConnectionState(state)).toBe(state);
		}
	});

	it('should throw InvalidConnectionStateError for invalid state values', () => {
		expect(() => parseConnectionState('invalid_state')).toThrow(InvalidConnectionStateError);
		expect(() => parseConnectionState('invalid_state')).toThrow(
			"Invalid connection state: 'invalid_state'",
		);
		expect(() => parseConnectionState('constructor')).toThrow(InvalidConnectionStateError);
	});

	it('should throw InvalidConnectionStateError for inputs that cannot be coerced with String()', () => {
		const noProtoObj = Object.create(null);
		expect(() => parseConnectionState(noProtoObj)).toThrow(InvalidConnectionStateError);

		const throwingToString = {
			toString() {
				throw new Error('Custom toString error');
			},
		};
		expect(() => parseConnectionState(throwingToString)).toThrow(InvalidConnectionStateError);

		const throwingValueOf = {
			valueOf() {
				throw new Error('Custom valueOf error');
			},
		};
		expect(() => parseConnectionState(throwingValueOf)).toThrow(InvalidConnectionStateError);

		const throwingToPrimitive = {
			[Symbol.toPrimitive]() {
				throw new Error('Custom toPrimitive error');
			},
		};
		expect(() => parseConnectionState(throwingToPrimitive)).toThrow(InvalidConnectionStateError);
	});

	it('should format non-string values using typeof without throwing', () => {
		expect(() => parseConnectionState({})).toThrow("Invalid connection state: 'object'");
		expect(() => parseConnectionState(null)).toThrow("Invalid connection state: 'null'");
		expect(() => parseConnectionState(undefined)).toThrow("Invalid connection state: 'undefined'");
		expect(() => parseConnectionState(123)).toThrow("Invalid connection state: '123'");
		expect(() => parseConnectionState(true)).toThrow("Invalid connection state: 'true'");
	});
});

describe('isValidConnectionStateTransition', () => {
	it('should match the expected transition matrix for all 36 pairs', () => {
		let legalCount = 0;
		for (const from of allStates) {
			for (const to of allStates) {
				const expected = expectedTransitions[from].has(to);
				expect(isValidConnectionStateTransition(from, to)).toBe(expected);
				if (expected) {
					legalCount++;
				}
			}
		}
		expect(legalCount).toBe(expectedLegalCount());
	});

	it('should reject all self-transitions', () => {
		for (const state of allStates) {
			expect(isValidConnectionStateTransition(state, state)).toBe(false);
		}
	});

	it('should allow CONNECTED -> RECONNECTING (auto-reconnect)', () => {
		expect(
			isValidConnectionStateTransition(ConnectionState.CONNECTED, ConnectionState.RECONNECTING),
		).toBe(true);
	});

	it('should allow FAILED -> CONNECTING (explicit reconnect, FAILED is not terminal)', () => {
		expect(
			isValidConnectionStateTransition(ConnectionState.FAILED, ConnectionState.CONNECTING),
		).toBe(true);
	});

	it('should allow FAILED -> DISCONNECTED (acknowledge or reset)', () => {
		expect(
			isValidConnectionStateTransition(ConnectionState.FAILED, ConnectionState.DISCONNECTED),
		).toBe(true);
	});

	it('should reject DISCONNECTING -> FAILED (teardown only ends normally)', () => {
		expect(
			isValidConnectionStateTransition(ConnectionState.DISCONNECTING, ConnectionState.FAILED),
		).toBe(false);
	});

	it('should reject DISCONNECTED -> CONNECTED (must go through CONNECTING)', () => {
		expect(
			isValidConnectionStateTransition(ConnectionState.DISCONNECTED, ConnectionState.CONNECTED),
		).toBe(false);
	});

	it('should reject DISCONNECTED -> RECONNECTING (reconnect implies CONNECTING)', () => {
		expect(
			isValidConnectionStateTransition(ConnectionState.DISCONNECTED, ConnectionState.RECONNECTING),
		).toBe(false);
	});

	it('should give every state at least one outgoing transition (no dead ends)', () => {
		for (const from of allStates) {
			expect(expectedTransitions[from].size).toBeGreaterThan(0);
			const hasAny = allStates.some((to) => isValidConnectionStateTransition(from, to));
			expect(hasAny).toBe(true);
		}
	});

	it('should make every state reachable from DISCONNECTED', () => {
		const visited = new Set<ConnectionState>([ConnectionState.DISCONNECTED]);
		const queue: ConnectionState[] = [ConnectionState.DISCONNECTED];
		while (queue.length > 0) {
			const current = queue.shift() as ConnectionState;
			for (const next of expectedTransitions[current]) {
				if (!visited.has(next)) {
					visited.add(next);
					queue.push(next);
				}
			}
		}
		expect(visited.size).toBe(allStates.length);
		for (const state of allStates) {
			expect(visited.has(state)).toBe(true);
		}
	});

	it('should reject malformed state values targeting prototype properties', () => {
		const malformedStates = [
			'constructor',
			'__proto__',
			'toString',
			'hasOwnProperty',
		] as unknown as ConnectionState[];
		for (const state of malformedStates) {
			expect(isValidConnectionStateTransition(state, ConnectionState.CONNECTED)).toBe(false);
			expect(isValidConnectionStateTransition(ConnectionState.DISCONNECTED, state)).toBe(false);
		}
	});
});
