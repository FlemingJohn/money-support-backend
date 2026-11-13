import type { callEndReasons } from "../catalogs/callEndReasons";

export type CallEndReason = (typeof callEndReasons)[number];
