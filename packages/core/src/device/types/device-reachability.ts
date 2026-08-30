/**
 * Evidence-based condition of a device's responsiveness through its communication path.
 *
 * Reachability is independent of {@link DeviceStatus}, which describes lifecycle state.
 * For example, a device can be `DeviceStatus.CONNECTED` while
 * `DeviceReachability.OFFLINE` when its session is established but it no longer responds.
 *
 * These values describe observed conditions, not behavior. Protocol and transport layers
 * determine the evidence, while SDK and application layers own any resulting policy.
 */
export enum DeviceReachability {
	/** The device is currently evidenced as reachable and responsive. */
	ONLINE = 'online',

	/** The device is not currently evidenced as reachable or responsive. */
	OFFLINE = 'offline',
}

// Construct once because boundary validators may be called for every external signal.
const validDeviceReachabilities: ReadonlySet<DeviceReachability> = new Set(
	Object.values(DeviceReachability),
);

/**
 * Determines whether an external reachability signal is valid Core vocabulary.
 *
 * Use this at protocol or transport boundaries before ingesting an unknown value into Core.
 * The comparison is strict: values are neither normalized nor transformed.
 *
 * @example
 * ```ts
 * const signal: unknown = received.reachability;
 * if (isDeviceReachability(signal)) {
 *   const reachability: DeviceReachability = signal;
 * }
 * ```
 */
export function isDeviceReachability(value: unknown): value is DeviceReachability {
	return typeof value === 'string' && validDeviceReachabilities.has(value as DeviceReachability);
}
