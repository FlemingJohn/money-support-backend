import type { AppConfiguration } from "../../../src/configuration/services/AppConfiguration";
import { LiveKitTokenIssuer } from "../../../src/test-calls/clients/LiveKitTokenIssuer";
import { VoiceNotConfiguredException } from "../../../src/test-calls/exceptions/VoiceNotConfiguredException";
import { TestCallService } from "../../../src/test-calls/services/TestCallService";

describe("TestCallService", () => {
  const configuration = {
    isLiveKitConfigured: true,
    liveKitUrl: "wss://money-support.livekit.cloud",
    liveKitApiKey: "key-1",
    liveKitApiSecret: "a-secret-that-is-long-enough-to-sign-tokens",
    liveKitAgentName: "money-support",
  };

  function readPayload(token: string) {
    return JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString("utf8"));
  }

  it("opens a new web room and sends the agent into it", async () => {
    const settings = configuration as unknown as AppConfiguration;
    const testCall = await new TestCallService(settings, new LiveKitTokenIssuer(settings)).startTestCall();
    const payload = readPayload(testCall.token);
    expect(testCall.serverUrl).toBe("wss://money-support.livekit.cloud");
    expect(testCall.roomName).toMatch(/^web-/);
    expect(payload.video).toEqual(expect.objectContaining({ room: testCall.roomName, roomJoin: true }));
    expect(payload.roomConfig.agents[0].agentName).toBe("money-support");
  });

  it("refuses when LiveKit is not set up", async () => {
    const settings = { ...configuration, isLiveKitConfigured: false } as unknown as AppConfiguration;
    await expect(new TestCallService(settings, new LiveKitTokenIssuer(settings)).startTestCall()).rejects.toBeInstanceOf(VoiceNotConfiguredException);
  });
});
