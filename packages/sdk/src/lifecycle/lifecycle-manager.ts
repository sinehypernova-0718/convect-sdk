import {
	DeviceStatus,
	type DeviceStatusTransition,
	InvalidDeviceStatusTransitionError,
	isValidTransition,
} from '../../../core/src/index.js';

/**
 * Per-instance lifecycle state manager for the SDK layer.
 *
 * Owns the current DeviceStatus for a single SDK-managed device instance
 * and enforces Core's transition rules before mutating it. This is a state
 * holder plus a validation gate — it does not perform any I/O, does not
 * schedule retries or reconnects, and does not know about transports.
 * Connection execution belongs to higher-level SDK orchestration, not here.
 */
export class LifecycleManager {
	private currentStatus: DeviceStatus;

	constructor(initialStatus: DeviceStatus = DeviceStatus.IDLE) {
		this.currentStatus = initialStatus;
	}

	/**
	 * The device's current lifecycle status.
	 */
	get status(): DeviceStatus {
		return this.currentStatus;
	}

	/**
	 * Check whether a transition to the given status would currently be
	 * valid, without performing it.
	 */
	canTransition(to: DeviceStatus): boolean {
		return isValidTransition(this.currentStatus, to);
	}

	/**
	 * Attempt to transition to the given status.
	 *
	 * Delegates validity to Core's isValidTransition(). State is only
	 * mutated on success — a rejected transition leaves `status` unchanged.
	 *
	 * @throws InvalidDeviceStatusTransitionError if the transition is not
	 * allowed from the current status.
	 */
	transition(to: DeviceStatus): DeviceStatusTransition {
		const from = this.currentStatus;

		if (!isValidTransition(from, to)) {
			throw new InvalidDeviceStatusTransitionError(
				`Cannot transition from ${from} to ${to}`,
				from,
				to,
			);
		}

		this.currentStatus = to;
		return { from, to };
	}
}
