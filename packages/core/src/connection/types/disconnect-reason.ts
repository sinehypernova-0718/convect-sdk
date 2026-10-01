/**
 * Why a connection left CONNECTED, or why an attempt ended.
 *
 * DisconnectReason answers "why did the link end?". It is independent of
 * {@link ConnectionState}, which answers "what is the link doing now?".
 * A reason may accompany either DISCONNECTED (the link ended normally) or
 * FAILED (the link ended abnormally). Core does not map reasons to states
 * and does not enforce any pairing: that policy belongs to the SDK layer.
 */
export enum DisconnectReason {
	/** The local side requested disconnection. */
	USER_REQUESTED = 'user_requested',

	/** An operation exceeded its allotted time. */
	TIMEOUT = 'timeout',

	/** The peer closed the connection cleanly. */
	PEER_CLOSED = 'peer_closed',

	/** The underlying transport failed. */
	TRANSPORT_ERROR = 'transport_error',

	/** A protocol-level violation or framing error occurred. */
	PROTOCOL_ERROR = 'protocol_error',

	/** Reconnection attempts were exhausted without recovery. */
	RETRIES_EXHAUSTED = 'retries_exhausted',
}

// Construct once because boundary validators may be called for every external signal.
const validDisconnectReasons: ReadonlySet<DisconnectReason> = new Set(
	Object.values(DisconnectReason),
);

/**
 * Determines whether an external signal is valid Core disconnect vocabulary.
 *
 * Use this at protocol or transport boundaries before ingesting an unknown
 * value into Core. The comparison is strict: values are neither normalized
 * nor transformed.
 *
 * @example
 * ```ts
 * const signal: unknown = received.reason;
 * if (isDisconnectReason(signal)) {
 *   const reason: DisconnectReason = signal;
 * }
 * ```
 */
export function isDisconnectReason(value: unknown): value is DisconnectReason {
	return typeof value === 'string' && validDisconnectReasons.has(value as DisconnectReason);
}
