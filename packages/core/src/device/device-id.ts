export type DeviceId = string;

export function createDeviceId(prefix: string, id: string): DeviceId {
	if (!prefix.trim()) {
		throw new Error("Device prefix cannot be empty");
	}

	if (!id.trim()) {
		throw new Error("Device id cannot be empty");
	}

	return `${prefix}:${id}`;
}

export function parseDeviceId(deviceId: DeviceId): {
	prefix: string;
	id: string;
} {
	const separatorIndex = deviceId.indexOf(":");

	if (separatorIndex === -1) {
		throw new Error("Invalid device id format");
	}

	return {
		prefix: deviceId.slice(0, separatorIndex),
		id: deviceId.slice(separatorIndex + 1),
	};
}
