export {
	ConnectionError,
	InvalidConnectionStateError,
	InvalidConnectionStateTransitionError,
} from './errors/index.js';

export type { ConnectionStateTransition } from './types/index.js';

export {
	ConnectionState,
	isConnectionState,
	isValidConnectionStateTransition,
	parseConnectionState,
} from './types/index.js';
