/**
 * Classification of a Convect device by its primary role.
 */
export enum DeviceType {
	SENSOR = 'sensor',
	ACTUATOR = 'actuator',
	GATEWAY = 'gateway',
	HYBRID = 'hybrid',
}

const VALID_DEVICE_TYPES: ReadonlySet<string> = new Set(Object.values(DeviceType));

/**
 * Check whether a value is a valid device type.
 */
export function isDeviceType(value: unknown): value is DeviceType {
	return typeof value === 'string' && VALID_DEVICE_TYPES.has(value);
}
