import { Injectable } from "@nestjs/common";
import { AccessToken, RoomAgentDispatch, RoomConfiguration } from "livekit-server-sdk";
import { AppConfiguration } from "../../configuration/services/AppConfiguration";

@Injectable()
export class LiveKitTokenIssuer {
  private readonly tokenLifetime = "15m";

  constructor(private readonly appConfiguration: AppConfiguration) {}

  issue(roomName: string, identity: string): Promise<string> {
    const accessToken = new AccessToken(this.appConfiguration.liveKitApiKey, this.appConfiguration.liveKitApiSecret, { identity, ttl: this.tokenLifetime });
    accessToken.addGrant({ roomJoin: true, room: roomName, canPublish: true, canSubscribe: true, canPublishData: true });
    accessToken.roomConfig = new RoomConfiguration({ agents: [new RoomAgentDispatch({ agentName: this.appConfiguration.liveKitAgentName })] });
    return accessToken.toJwt();
  }
}
