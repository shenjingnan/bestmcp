export type { HTTPTransportConfig, TransportConfig } from "./base";
export { BaseTransport, TransportType } from "./base";
export { HTTPTransport } from "./http";
export { StdioTransport } from "./stdio";

// 类型别名 - 为了向后兼容
import type { HTTPTransportConfig } from "./base";
export type HttpConfig = HTTPTransportConfig;
