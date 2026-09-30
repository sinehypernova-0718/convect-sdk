export {
	ConnectionError,
	InvalidConnectionStateError,
	InvalidConnectionStateTransitionError,
} from './errors/index.js';

export type {
	ConnectionStateTransition,
	ConnectionTimeouts,
	ReconnectPolicy,
} from './types/index.js';

export {
	BackoffStrategy,
	ConnectionState,
	DisconnectReason,
	isBackoffStrategy,
	isConnectionState,
	isDisconnectReason,
	isValidConnectionStateTransition,
	parseConnectionState,
} from './types/index.js';
