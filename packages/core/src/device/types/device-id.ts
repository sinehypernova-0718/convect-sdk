import { randomUUID } from 'node:crypto';
import { InvalidDeviceIdError } from '../errors/device-id-error.js';

/**
 * Immutable, opaque identifier for a Convect device.
 *
 * A DeviceId represents the unique identity of a device.
 * The format and generation strategy are not specified by Core,
 * allowing flexibility across different deployments and use cases.
 *
 * @example
 * const id = DeviceId.generate();
 * const parsed = DeviceId.parse(externalInput);
 */
export class DeviceId {
	readonly value: string;

	private constructor(value: string) {
		this.value = value;
	}

	/**
	 * Generate a new device identifier.
	 *
	 * Currently uses crypto.randomUUID() as the default generation strategy.
	 */
	static generate(): DeviceId {
		return new DeviceId(randomUUID());
	}

	/**
	 * Parse and validate a device identifier from external input.
	 *
	 * @param value - the value to parse (any type)
	 * @returns a new DeviceId
	 * @throws InvalidDeviceIdError if validation fails
	 */
	static parse(value: unknown): DeviceId {
		if (typeof value !== 'string') {
			throw new InvalidDeviceIdError('Invalid device ID: value must be a non-empty string');
		}
		if (value.trim().length === 0) {
			throw new InvalidDeviceIdError(`Invalid device ID: '${value}'`);
		}
		return new DeviceId(value);
	}

	/**
	 * Check whether a value is a valid device identifier.
	 *
	 * A valid device ID is a non-empty string.
	 */
	static isValid(value: unknown): value is string {
		return typeof value === 'string' && value.trim().length > 0;
	}

	/**
	 * Check equality with another device identifier.
	 */
	equals(other: DeviceId): boolean {
		return other instanceof DeviceId && this.value === other.value;
	}

	/**
	 * Return the identifier as a string.
	 */
	toString(): string {
		return this.value;
	}

	/**
	 * Return the identifier for JSON serialization.
	 */
	toJSON(): string {
		return this.value;
	}
}
