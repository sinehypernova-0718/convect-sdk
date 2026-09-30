import type { BackoffStrategy } from './backoff-strategy.js';

/**
 * Fully resolved reconnection policy shape.
 *
 * This is the vocabulary of a resolved policy, not a validator. Applying
 * defaults, merging user-supplied partial configuration, and validating the
 * result all happen in the SDK, not Core.
 *
 * - `maxAttempts` omitted means unlimited attempts. It is deliberately not
 *   `Infinity`, so the shape survives JSON config. Because
 *   `exactOptionalPropertyTypes` is enabled, the property must be omitted
 *   rather than set to `undefined`.
 * - Delays are milliseconds. Expected invariants for consumers (not enforced
 *   here): non-negative finite numbers, `initialDelayMs <= maxDelayMs`, and
 *   `maxAttempts` a positive integer when present.
 * - `jitter` means randomization is applied to computed delays. How the
 *   randomization works is an SDK concern.
 */
export type ReconnectPolicy = Readonly<{
	enabled: boolean;
	maxAttempts?: number;
	initialDelayMs: number;
	maxDelayMs: number;
	backoff: BackoffStrategy;
	jitter: boolean;
}>;
