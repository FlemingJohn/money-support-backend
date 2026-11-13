import type { SettingsResponse } from "../../settings/responses/SettingsResponse";

export interface PublishedAgentResponse {
  promptContent: string;
  settings: SettingsResponse;
}
