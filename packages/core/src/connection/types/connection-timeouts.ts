/**
 * Time budgets for establishing and tearing down a connection, in
 * milliseconds.
 *
 * - `connectMs` is the maximum time allowed to establish a link.
 * - `disconnectMs` is the maximum time allowed for a graceful teardown.
 *
 * All fields are optional: an omitted field means Core has no opinion, and
 * the SDK or transport decides. Because `exactOptionalPropertyTypes` is
 * enabled, a field must be omitted rather than set to `undefined`.
 *
 * There is deliberately no keep-alive field: keep-alive is transport- and
 * protocol-specific (MQTT has it, serial does not), so it belongs in the
 * transport packages. Adding it later would be purely additive.
 */
export type ConnectionTimeouts = Readonly<{
	connectMs?: number;
	disconnectMs?: number;
}>;
