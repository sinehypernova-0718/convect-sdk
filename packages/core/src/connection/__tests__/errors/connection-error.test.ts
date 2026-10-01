import { describe, expect, it } from 'vitest';
import { ConnectionError } from '../../errors/connection-error.js';

describe('ConnectionError', () => {
	it('should be an instance of Error and ConnectionError', () => {
		const error = new ConnectionError('test', 'TEST_CODE');
		expect(error).toBeInstanceOf(Error);
		expect(error).toBeInstanceOf(ConnectionError);
	});

	it('should have the correct name', () => {
		const error = new ConnectionError('test', 'TEST_CODE');
		expect(error.name).toBe('ConnectionError');
	});

	it('should store the message', () => {
		const error = new ConnectionError('something went wrong', 'TEST_CODE');
		expect(error.message).toBe('something went wrong');
	});

	it('should store the error code', () => {
		const error = new ConnectionError('test', 'MY_CODE');
		expect(error.code).toBe('MY_CODE');
	});

	it('should have a stack trace', () => {
		const error = new ConnectionError('test', 'TEST_CODE');
		expect(error.stack).toBeDefined();
	});

	it('should maintain prototype chain for instanceof checks', () => {
		const error = new ConnectionError('test', 'TEST_CODE');
		expect(Object.getPrototypeOf(error)).toBe(ConnectionError.prototype);
	});

	it('should preserve subclass identity through super()', () => {
		class CustomConnectionError extends ConnectionError {}
		const error = new CustomConnectionError('test', 'CUSTOM_CODE');
		expect(error).toBeInstanceOf(CustomConnectionError);
		expect(error).toBeInstanceOf(ConnectionError);
		expect(error).toBeInstanceOf(Error);
		expect(Object.getPrototypeOf(error)).toBe(CustomConnectionError.prototype);
	});

	it('should have undefined context by default when not provided', () => {
		const error = new ConnectionError('test', 'TEST_CODE');
		expect(error.context).toBeUndefined();
	});

	it('should store and allow access to context when provided', () => {
		const context = { foo: 'bar', count: 42 };
		const error = new ConnectionError('test', 'TEST_CODE', context);
		expect(error.context).toBeDefined();
		expect(error.context).toEqual(context);
	});

	it('should round-trip context correctly', () => {
		const context = { key: 'value', nested: { id: 123 } };
		const error = new ConnectionError('test', 'TEST_CODE', context);
		expect(error.context?.key).toBe('value');
		expect(error.context?.nested).toEqual({ id: 123 });
	});

	it('should preserve cause by identity when passed via options', () => {
		const original = new Error('underlying failure');
		const error = new ConnectionError('test', 'TEST_CODE', undefined, { cause: original });
		expect(error.cause).toBe(original);
		expect(Object.hasOwn(error, 'cause')).toBe(true);
	});

	it('should have no own cause property when options are omitted', () => {
		const error = new ConnectionError('test', 'TEST_CODE');
		expect(Object.hasOwn(error, 'cause')).toBe(false);
		expect(error.cause).toBeUndefined();
	});

	it('should have no own cause property for an empty options object', () => {
		const error = new ConnectionError('test', 'TEST_CODE', undefined, {});
		expect(Object.hasOwn(error, 'cause')).toBe(false);
	});
});
