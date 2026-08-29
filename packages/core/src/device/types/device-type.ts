/**
 * Classification of a Convect device by its primary role.
 */
export enum DeviceType {
	SENSOR = 'sensor',
	ACTUATOR = 'actuator',
	GATEWAY = 'gateway',
	HYBRID = 'hybrid',
}

/**
 * Device type vocabulary and runtime validation:
 *
 *   DeviceType enum
 *        │
 *        │ Object.values()
 *        ▼
 *   ┌──────────────────────┐
 *   │ VALID_DEVICE_TYPES   │
 *   │   ReadonlySet<string>│
 *   └──────────┬───────────┘
 *              │
 *              │ .has(value)
 *              │
 *   unknown ───┴──► typeof value === "string"
 *                         │
 *                    ┌────┴────┐
 *                    │         │
 *                   false     true
 *                    │         │
 *                    ▼         ▼
 *                 invalid   Set.has()
 *                              │
 *                         ┌────┴────┐
 *                         │         │
 *                        false     true
 *                         │         │
 *                         ▼         ▼
 *                       invalid   DeviceType
 */

const VALID_DEVICE_TYPES: ReadonlySet<string> = new Set(Object.values(DeviceType));

/**
 * Check whether a value is a valid device type.
 */
export function isDeviceType(value: unknown): value is DeviceType {
	return typeof value === 'string' && VALID_DEVICE_TYPES.has(value);
}
