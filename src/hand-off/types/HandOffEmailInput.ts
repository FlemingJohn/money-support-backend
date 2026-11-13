import type { RedactedLine } from "../../guardrails/types/RedactedLine";

export interface HandOffEmailInput {
  to: string;
  callId: string;
  startedAt: Date | null;
  endedAt: Date;
  maskedCustomerNumber: string | null;
  topic: string | null;
  summary: string | null;
  lines: RedactedLine[];
  handOffReason: string | null;
  callUrl: string;
}
