import { CallFinishedDto } from "../../../src/call-intake/dto/CallFinishedDto";

describe("CallFinishedDto", () => {
  const sentByTheWorker = {
    callId: "call-_+447700900123_abc",
    channel: "phone",
    customerNumber: "+447700900123",
    startedAt: "2026-11-13T10:00:00Z",
    endedAt: "2026-11-13T10:02:30Z",
    endReason: "handedOff",
    handOffReason: "askedForPerson",
    lines: [{ position: 0, speaker: "agent", text: "Hi, how can I help?", secondsFromStart: 1.2 }],
  };

  it("reads the report exactly as the voice worker sends it", () => {
    const finished = CallFinishedDto.schema.parse(sentByTheWorker);
    expect(finished.endedAt).toEqual(new Date("2026-11-13T10:02:30Z"));
    expect(finished.lines[0].speaker).toBe("agent");
  });

  it("refuses an end reason it does not know", () => {
    expect(CallFinishedDto.schema.safeParse({ ...sentByTheWorker, endReason: "assistant-said-end-call-phrase" }).success).toBe(false);
  });
});
