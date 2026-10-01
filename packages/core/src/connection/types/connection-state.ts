/**
 * ConnectionState: Enum of transport-link states for a single connection.
 *
 * DISCONNECTED means the link ended normally (it was requested, or the peer
 * closed cleanly). FAILED means it ended abnormally (a transport or protocol
 * error, or retries were exhausted). FAILED is not terminal: an explicit
 * reconnect goes FAILED -> CONNECTING, and FAILED -> DISCONNECTED acknowledges
 * or resets the failure.
 *
 * ConnectionState is NOT DeviceStatus. They are separate Core vocabularies:
 * one describes the link, the other the device's lifecycle role. The mapping
 * between them belongs to the SDK layer, not Core.
 *
 * State Machine:
 *   DISCONNECTED -> CONNECTING -> CONNECTED -> DISCONNECTING -> DISCONNECTED
 *   CONNECTING / CONNECTED / RECONNECTING can go to FAILED on abnormal loss
 *   CONNECTED -> RECONNECTING -> CONNECTED (auto-reconnect)
 *   FAILED -> CONNECTING (explicit reconnect) or FAILED -> DISCONNECTED (reset)
 *   Self-transitions are illegal.
 */
import { InvalidConnectionStateError } from '../errors/connection-state-error.js';

export enum ConnectionState {
	DISCONNECTED = 'disconnected',
	CONNECTING = 'connecting',
	CONNECTED = 'connected',
	RECONNECTING = 'reconnecting',
	DISCONNECTING = 'disconnecting',
	FAILED = 'failed',
}

const VALID_CONNECTION_STATES: ReadonlySet<string> = new Set(Object.values(ConnectionState));

/**
 * Check whether a value is a valid connection state.
 */
export function isConnectionState(value: unknown): value is ConnectionState {
	return typeof value === 'string' && VALID_CONNECTION_STATES.has(value);
}

/**
 * Formats an invalid state for diagnostics without coercing arbitrary objects.
 *
 * Object coercion can execute user-defined `toString()` / `valueOf()` hooks,
 * which would violate parseConnectionState()'s error contract by allowing
 * malformed input to throw an unrelated error.
 */
function formatStateValue(value: unknown): string {
	if (typeof value === 'string') {
		return value;
	}
	if (
		typeof value === 'number' ||
		typeof value === 'boolean' ||
		typeof value === 'bigint' ||
		typeof value === 'symbol'
	) {
		return String(value);
	}
	if (value === null) {
		return 'null';
	}
	if (value === undefined) {
		return 'undefined';
	}
	return typeof value;
}

/**
 * Parse and validate a connection state from external input.
 *
 * @param value - the value to parse
 * @returns a valid ConnectionState
 * @throws InvalidConnectionStateError if validation fails
 */
export function parseConnectionState(value: unknown): ConnectionState {
	if (!isConnectionState(value)) {
		throw new InvalidConnectionStateError(`Invalid connection state: '${formatStateValue(value)}'`);
	}
	return value;
}

/**
 * Represents a valid state transition.
 * Used for transition validation and logging.
 */
export type ConnectionStateTransition = Readonly<{
	from: ConnectionState;
	to: ConnectionState;
}>;

/**
 * Valid transitions from each ConnectionState.
 *
 * Defined as a module-level constant to avoid re-allocation on every call.
 */
const validTransitions: Readonly<Record<ConnectionState, ReadonlySet<ConnectionState>>> = {
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

/**
 * Check if a transition between two connection states is valid.
 *
 * Encapsulates state machine rules in one place.
 */
export function isValidConnectionStateTransition(
	from: ConnectionState,
	to: ConnectionState,
): boolean {
	if (!Object.hasOwn(validTransitions, from)) {
		return false;
	}
	return validTransitions[from]?.has(to) ?? false;
}
