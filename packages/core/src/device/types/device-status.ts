/**
 * DeviceStatus: Enum of device lifecycle states.
 *
 * State Machine:
 *   IDLE -> CONNECTING -> CONNECTED -> DISCONNECTING -> DISCONNECTED
 *   Any state can transition to ERROR
 *   DISCONNECTED can loop back to IDLE (reconnect)
 */
import { InvalidDeviceStatusError } from '../errors/device-status-error.js';

export enum DeviceStatus {
	IDLE = 'idle',
	CONNECTING = 'connecting',
	CONNECTED = 'connected',
	DISCONNECTING = 'disconnecting',
	DISCONNECTED = 'disconnected',
	ERROR = 'error',
}

const VALID_DEVICE_STATUSES: ReadonlySet<string> = new Set(Object.values(DeviceStatus));

/**
 * Check whether a value is a valid device status.
 */
export function isDeviceStatus(value: unknown): value is DeviceStatus {
	return typeof value === 'string' && VALID_DEVICE_STATUSES.has(value);
}

/**
 * Formats an invalid status for diagnostics without coercing arbitrary objects.
 *
 * Object coercion can execute user-defined `toString()` / `valueOf()` hooks,
 * which would violate parseDeviceStatus()'s error contract by allowing malformed
 * input to throw an unrelated error.
 */
function formatStatusValue(value: unknown): string {
	if (typeof value === 'string') {
		return value;
	}
	if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') {
		return String(value);
	}
	if (value === null) {
		return 'null';
	}
	if (value === undefined) {
		return 'undefined';
	}
	if (typeof value === 'symbol') {
		return value.toString();
	}
	return typeof value;
}

/**
 * Parse and validate a device status from external input.
 *
 * @param value - the value to parse
 * @returns a valid DeviceStatus
 * @throws InvalidDeviceStatusError if validation fails
 */
export function parseDeviceStatus(value: unknown): DeviceStatus {
	if (!isDeviceStatus(value)) {
		throw new InvalidDeviceStatusError(`Invalid device status: '${formatStatusValue(value)}'`);
	}
	return value;
}

/**
 * Represents a valid state transition.
 * Used for transition validation and logging.
 */
export type DeviceStatusTransition = Readonly<{
	from: DeviceStatus;
	to: DeviceStatus;
}>;

/**
 * Valid transitions from each DeviceStatus.
 *
 * Defined as a module-level constant to avoid re-allocation on every call.
 */

/*
 *            DeviceStatus
                   │
                   │ defines
                   ▼
         ┌───────────────────┐
         │ Valid states      │
         │                   │
         │ IDLE              │
         │ CONNECTING        │
         │ CONNECTED         │
         │ DISCONNECTING     │
         │ DISCONNECTED      │
         │ ERROR             │
         └─────────┬─────────┘
                   │
                   ▼
          Runtime validation
                   │
        ┌──────────┴──────────┐
        │                     │
 Is this status?       Is this transition?
        │                     │
        ▼                     ▼
 isDeviceStatus()    transition validation
*/

const validTransitions: Readonly<Record<DeviceStatus, ReadonlySet<DeviceStatus>>> = {
	[DeviceStatus.IDLE]: new Set([DeviceStatus.CONNECTING, DeviceStatus.ERROR]),
	[DeviceStatus.CONNECTING]: new Set([
		DeviceStatus.CONNECTED,
		DeviceStatus.DISCONNECTED,
		DeviceStatus.ERROR,
	]),
	[DeviceStatus.CONNECTED]: new Set([DeviceStatus.DISCONNECTING, DeviceStatus.ERROR]),
	[DeviceStatus.DISCONNECTING]: new Set([DeviceStatus.DISCONNECTED, DeviceStatus.ERROR]),
	[DeviceStatus.DISCONNECTED]: new Set([DeviceStatus.IDLE, DeviceStatus.ERROR]),
	[DeviceStatus.ERROR]: new Set([DeviceStatus.IDLE, DeviceStatus.DISCONNECTED]),
};

/**
 * Check if a transition between two device statuses is valid.
 *
 * Encapsulates state machine rules in one place.
 */
export function isValidTransition(from: DeviceStatus, to: DeviceStatus): boolean {
	if (!Object.hasOwn(validTransitions, from)) {
		return false;
	}
	return validTransitions[from]?.has(to) ?? false;
}
