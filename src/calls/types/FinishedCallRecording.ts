import type { CallCompletion } from "./CallCompletion";
import type { ReviewReason } from "../../generated/prisma/client";
import type { CallAnalysis } from "../../call-analysis/types/CallAnalysis";
import type { FinishedCallReport } from "./FinishedCallReport";

export interface FinishedCallRecording {
  report: FinishedCallReport;
  analysis: CallAnalysis;
  reviewReason: ReviewReason | null;
  completion: CallCompletion;
}
