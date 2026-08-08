import { describe, expect, it } from 'vitest';
import { InvalidDeviceIdError } from '../../errors/device-id-error.js';
import { DeviceId } from '../../types/device-id.js';

describe('DeviceId', () => {
	describe('generate', () => {
		it('should create a DeviceId with a non-empty value', () => {
			const id = DeviceId.generate();
			expect(id.value).toBeTruthy();
			expect(typeof id.value).toBe('string');
		});

		it('should generate unique identifiers', () => {
			const id1 = DeviceId.generate();
			const id2 = DeviceId.generate();
			expect(id1.value).not.toBe(id2.value);
		});

		it('should generate UUID-formatted values', () => {
			const id = DeviceId.generate();
			expect(id.value).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
		});
	});

	describe('parse', () => {
		it('should parse a valid string', () => {
			const id = DeviceId.parse('device-123');
			expect(id.value).toBe('device-123');
		});

		it('should parse a UUID string', () => {
			const uuid = '550e8400-e29b-41d4-a716-446655440000';
			const id = DeviceId.parse(uuid);
			expect(id.value).toBe(uuid);
		});

		it('should throw InvalidDeviceIdError for empty string', () => {
			expect(() => DeviceId.parse('')).toThrow(InvalidDeviceIdError);
		});

		it('should throw InvalidDeviceIdError for whitespace-only string', () => {
			expect(() => DeviceId.parse('   ')).toThrow(InvalidDeviceIdError);
			expect(() => DeviceId.parse('\t\n')).toThrow(InvalidDeviceIdError);
		});

		it('should throw InvalidDeviceIdError for null', () => {
			expect(() => DeviceId.parse(null)).toThrow(InvalidDeviceIdError);
		});

		it('should throw InvalidDeviceIdError for undefined', () => {
			expect(() => DeviceId.parse(undefined)).toThrow(InvalidDeviceIdError);
		});

		it('should throw InvalidDeviceIdError for number', () => {
			expect(() => DeviceId.parse(42)).toThrow(InvalidDeviceIdError);
		});

		it('should throw InvalidDeviceIdError for object', () => {
			expect(() => DeviceId.parse({})).toThrow(InvalidDeviceIdError);
		});

		it('should throw InvalidDeviceIdError for malformed null-prototype objects whose toString throws', () => {
			const bomb = Object.create(null);
			(bomb as { toString: () => unknown }).toString = (): never => {
				throw new Error('toString should not be called');
			};
			expect(() => DeviceId.parse(bomb)).toThrow(InvalidDeviceIdError);
		});

		it('should throw InvalidDeviceIdError for objects whose toString returns a non-string', () => {
			const bomb = Object.create(null);
			(bomb as { toString: () => unknown }).toString = (): unknown => ({ polluted: true });
			expect(() => DeviceId.parse(bomb)).toThrow(InvalidDeviceIdError);
		});

		it('should throw InvalidDeviceIdError for symbols', () => {
			expect(() => DeviceId.parse(Symbol('x'))).toThrow(InvalidDeviceIdError);
		});

		it('should use a generic message for non-string values', () => {
			expect(() => DeviceId.parse(42)).toThrow(
				'Invalid device ID: value must be a non-empty string',
			);
			expect(() => DeviceId.parse(null)).toThrow(
				'Invalid device ID: value must be a non-empty string',
			);
		});

		it('should echo the offending string for empty/whitespace strings', () => {
			expect(() => DeviceId.parse('')).toThrow("Invalid device ID: ''");
			expect(() => DeviceId.parse('   ')).toThrow("Invalid device ID: '   '");
		});
	});

	describe('isValid', () => {
		it('should return true for non-empty strings', () => {
			expect(DeviceId.isValid('abc')).toBe(true);
			expect(DeviceId.isValid('device-123')).toBe(true);
		});

		it('should return false for empty string', () => {
			expect(DeviceId.isValid('')).toBe(false);
		});

		it('should return false for whitespace-only string', () => {
			expect(DeviceId.isValid('   ')).toBe(false);
		});

		it('should return false for non-string values', () => {
			expect(DeviceId.isValid(null)).toBe(false);
			expect(DeviceId.isValid(undefined)).toBe(false);
			expect(DeviceId.isValid(42)).toBe(false);
			expect(DeviceId.isValid({})).toBe(false);
			expect(DeviceId.isValid([])).toBe(false);
		});
	});

	describe('equals', () => {
		it('should return true for DeviceIds with the same value', () => {
			const id1 = DeviceId.parse('device-abc');
			const id2 = DeviceId.parse('device-abc');
			expect(id1.equals(id2)).toBe(true);
		});

		it('should return false for DeviceIds with different values', () => {
			const id1 = DeviceId.parse('device-abc');
			const id2 = DeviceId.parse('device-xyz');
			expect(id1.equals(id2)).toBe(false);
		});

		it('should return false when compared against non-DeviceId objects or invalid types', () => {
			const id = DeviceId.parse('device-abc');
			expect(id.equals(null as unknown as DeviceId)).toBe(false);
			expect(id.equals(undefined as unknown as DeviceId)).toBe(false);
			expect(id.equals({ value: 'device-abc' } as unknown as DeviceId)).toBe(false);
		});
	});

	describe('toString', () => {
		it('should return the underlying value', () => {
			const id = DeviceId.parse('device-abc');
			expect(id.toString()).toBe('device-abc');
		});

		it('should work in template literals', () => {
			const id = DeviceId.parse('device-abc');
			expect(`id: ${id}`).toBe('id: device-abc');
		});
	});

	describe('toJSON', () => {
		it('should return the underlying value', () => {
			const id = DeviceId.parse('device-abc');
			expect(id.toJSON()).toBe('device-abc');
		});

		it('should serialize correctly with JSON.stringify', () => {
			const id = DeviceId.parse('device-abc');
			expect(JSON.stringify({ id })).toBe('{"id":"device-abc"}');
		});

		it('should serialize correctly when nested in an array', () => {
			const id = DeviceId.parse('device-abc');
			expect(JSON.stringify([id])).toBe('["device-abc"]');
		});
	});

	describe('immutability', () => {
		it('should have a readonly value property', () => {
			const id = DeviceId.parse('device-abc');
			// TypeScript enforces readonly at compile time.
			// At runtime, verify the value is what we set.
			expect(id.value).toBe('device-abc');
		});
	});
});
