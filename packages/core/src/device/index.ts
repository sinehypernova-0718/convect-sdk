export {
	DeviceError,
	InvalidDeviceIdError,
	InvalidDeviceStatusError,
	InvalidDeviceStatusTransitionError,
} from './errors/index.js';

export type { DeviceStatusTransition } from './types/index.js';

export {
	DeviceId,
	DeviceStatus,
	DeviceType,
	isDeviceType,
	isValidTransition,
} from './types/index.js';
