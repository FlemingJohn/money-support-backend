import { CallReportReader } from "../../../src/call-intake/services/CallReportReader";
import { CallChannel, Speaker } from "../../../src/generated/prisma/client";

describe("CallReportReader", () => {
  const reader = new CallReportReader();
  const finished = {
    callId: "web-1",
    channel: CallChannel.web,
    customerNumber: null,
    startedAt: new Date("2026-11-13T10:00:00Z"),
    endedAt: new Date("2026-11-13T10:01:00Z"),
    endReason: "agentEndedCall" as const,
    handOffReason: null,
    lines: [
      { position: 0, speaker: Speaker.agent, text: "Hi there", secondsFromStart: 1 },
      { position: 1, speaker: Speaker.caller, text: "   ", secondsFromStart: 2 },
      { position: 2, speaker: Speaker.caller, text: "Where is my money?", secondsFromStart: 4 },
    ],
  };

  it("keeps the end reason the worker gave", () => {
    expect(reader.read(finished).endedReason).toBe("agentEndedCall");
  });

  it("drops empty lines", () => {
    expect(reader.read(finished).lines.map((line) => line.text)).toEqual(["Hi there", "Where is my money?"]);
  });
});
