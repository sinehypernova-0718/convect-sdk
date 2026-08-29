/**
 * DeviceStatus: Enum of device lifecycle states.
 *
 * State Machine:
 *   IDLE -> CONNECTING -> CONNECTED -> DISCONNECTING -> DISCONNECTED
 *   Any state can transition to ERROR
 *   DISCONNECTED can loop back to IDLE (reconnect)
 */
export enum DeviceStatus {
	IDLE = 'idle',
	CONNECTING = 'connecting',
	CONNECTED = 'connected',
	DISCONNECTING = 'disconnecting',
	DISCONNECTED = 'disconnected',
	ERROR = 'error',
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
	return validTransitions[from]?.has(to) ?? false;
}
