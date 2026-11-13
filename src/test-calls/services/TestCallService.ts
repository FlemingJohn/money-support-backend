import { randomUUID } from "node:crypto";
import { Injectable } from "@nestjs/common";
import { AppConfiguration } from "../../configuration/services/AppConfiguration";
import { LiveKitTokenIssuer } from "../clients/LiveKitTokenIssuer";
import { VoiceNotConfiguredException } from "../exceptions/VoiceNotConfiguredException";
import type { TestCallTokenResponse } from "../responses/TestCallTokenResponse";

@Injectable()
export class TestCallService {
  constructor(
    private readonly appConfiguration: AppConfiguration,
    private readonly liveKitTokenIssuer: LiveKitTokenIssuer,
  ) {}

  async startTestCall(): Promise<TestCallTokenResponse> {
    if (!this.appConfiguration.isLiveKitConfigured) throw new VoiceNotConfiguredException();
    const roomName = `web-${randomUUID()}`;
    const token = await this.liveKitTokenIssuer.issue(roomName, `tester-${randomUUID()}`);
    return { serverUrl: this.appConfiguration.liveKitUrl, roomName, token };
  }
}
