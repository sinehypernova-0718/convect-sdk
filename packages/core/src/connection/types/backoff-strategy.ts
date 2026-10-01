/**
 * The delay-growth curve used between reconnection attempts.
 *
 * BackoffStrategy names only the shape of the curve. The actual delay
 * computation, including bounds and jitter, lives in the SDK, not Core.
 */
export enum BackoffStrategy {
	/** Every attempt waits the same amount of time. */
	FIXED = 'fixed',

	/** Delay grows by a constant step per attempt. */
	LINEAR = 'linear',

	/** Delay multiplies per attempt. */
	EXPONENTIAL = 'exponential',
}

// Construct once because boundary validators may be called for every external signal.
const validBackoffStrategies: ReadonlySet<BackoffStrategy> = new Set(
	Object.values(BackoffStrategy),
);

/**
 * Determines whether an external signal is valid Core backoff vocabulary.
 *
 * Use this at configuration or transport boundaries before ingesting an
 * unknown value into Core. The comparison is strict: values are neither
 * normalized nor transformed.
 *
 * @example
 * ```ts
 * const signal: unknown = config.backoff;
 * if (isBackoffStrategy(signal)) {
 *   const backoff: BackoffStrategy = signal;
 * }
 * ```
 */
export function isBackoffStrategy(value: unknown): value is BackoffStrategy {
	return typeof value === 'string' && validBackoffStrategies.has(value as BackoffStrategy);
}
