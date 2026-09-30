import { describe, expect, it } from 'vitest';
import { DisconnectReason, isDisconnectReason } from '../../types/disconnect-reason.js';

describe('DisconnectReason', () => {
	it('defines the expected reason values', () => {
		expect(DisconnectReason.USER_REQUESTED).toBe('user_requested');
		expect(DisconnectReason.TIMEOUT).toBe('timeout');
		expect(DisconnectReason.PEER_CLOSED).toBe('peer_closed');
		expect(DisconnectReason.TRANSPORT_ERROR).toBe('transport_error');
		expect(DisconnectReason.PROTOCOL_ERROR).toBe('protocol_error');
		expect(DisconnectReason.RETRIES_EXHAUSTED).toBe('retries_exhausted');
	});

	it('has exactly six reason values', () => {
		expect(Object.values(DisconnectReason)).toHaveLength(6);
	});
});

describe('isDisconnectReason', () => {
	it('accepts every enum value', () => {
		for (const value of Object.values(DisconnectReason)) {
			expect(isDisconnectReason(value)).toBe(true);
		}
	});

	it('accepts string literals matching enum values', () => {
		expect(isDisconnectReason('user_requested')).toBe(true);
		expect(isDisconnectReason('timeout')).toBe(true);
		expect(isDisconnectReason('peer_closed')).toBe(true);
		expect(isDisconnectReason('transport_error')).toBe(true);
		expect(isDisconnectReason('protocol_error')).toBe(true);
		expect(isDisconnectReason('retries_exhausted')).toBe(true);
	});

	it('rejects invalid strings without normalizing them', () => {
		expect(isDisconnectReason('TIMEOUT')).toBe(false);
		expect(isDisconnectReason(' timeout')).toBe(false);
		expect(isDisconnectReason('timeout ')).toBe(false);
		expect(isDisconnectReason('unknown')).toBe(false);
		expect(isDisconnectReason('')).toBe(false);
	});

	it('rejects enum member names, which are not wire values', () => {
		expect(isDisconnectReason('USER_REQUESTED')).toBe(false);
		expect(isDisconnectReason('TIMEOUT')).toBe(false);
		expect(isDisconnectReason('PEER_CLOSED')).toBe(false);
		expect(isDisconnectReason('TRANSPORT_ERROR')).toBe(false);
		expect(isDisconnectReason('PROTOCOL_ERROR')).toBe(false);
		expect(isDisconnectReason('RETRIES_EXHAUSTED')).toBe(false);
	});

	it('rejects non-string values', () => {
		expect(isDisconnectReason(null)).toBe(false);
		expect(isDisconnectReason(undefined)).toBe(false);
		expect(isDisconnectReason(42)).toBe(false);
		expect(isDisconnectReason(true)).toBe(false);
		expect(isDisconnectReason({})).toBe(false);
		expect(isDisconnectReason([])).toBe(false);
	});

	it('rejects prototype keys', () => {
		expect(isDisconnectReason('constructor')).toBe(false);
		expect(isDisconnectReason('__proto__')).toBe(false);
		expect(isDisconnectReason('toString')).toBe(false);
		expect(isDisconnectReason('hasOwnProperty')).toBe(false);
	});

	it('narrows unknown values to DisconnectReason', () => {
		const value: unknown = DisconnectReason.TIMEOUT;

		if (isDisconnectReason(value)) {
			const typed: DisconnectReason = value;
			expect(typed).toBe(DisconnectReason.TIMEOUT);
			return;
		}

		expect.unreachable('A valid DisconnectReason value should pass the guard');
	});
});
