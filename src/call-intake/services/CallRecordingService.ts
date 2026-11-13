import { Injectable } from "@nestjs/common";
import type { CallAnalysis } from "../../call-analysis/types/CallAnalysis";
import { ReportAnalyser } from "../../call-analysis/services/ReportAnalyser";
import { CallRepository } from "../../calls/repositories/CallRepository";
import type { FinishedCallReport } from "../../calls/types/FinishedCallReport";
import { HandOffAlertService } from "../../hand-off/services/HandOffAlertService";
import { ReviewTriage } from "../../review/services/ReviewTriage";
import type { TriageFacts } from "../../review/types/TriageFacts";
import type { CallStartedDto } from "../dto/CallStartedDto";
import { CallCompletionBuilder } from "./CallCompletionBuilder";
import { FinishedCallWriter } from "./FinishedCallWriter";

@Injectable()
export class CallRecordingService {
  private readonly waitingText = "[waiting for privacy check]";

  constructor(
    private readonly callRepository: CallRepository,
    private readonly reportAnalyser: ReportAnalyser,
    private readonly reviewTriage: ReviewTriage,
    private readonly callCompletionBuilder: CallCompletionBuilder,
    private readonly finishedCallWriter: FinishedCallWriter,
    private readonly handOffAlertService: HandOffAlertService,
  ) {}

  async recordCallStart(started: CallStartedDto): Promise<void> {
    await this.callRepository.recordStarted(started.callId, started.channel, started.startedAt);
  }

  async recordFinishedCall(report: FinishedCallReport): Promise<void> {
    const analysis = await this.reportAnalyser.analyse(report);
    const reviewReason = this.reviewTriage.decideReason(this.triageFacts(analysis));
    const completion = await this.callCompletionBuilder.build(report, analysis);
    const recording = { report, analysis, reviewReason, completion };
    await this.finishedCallWriter.write(recording);
    await this.handOffAlertService.alertTeamIfHandedOff(recording);
  }

  private triageFacts(analysis: CallAnalysis): TriageFacts {
    return {
      isHandedOff: analysis.isHandedOff,
      removedEntityCount: analysis.lines.reduce((count, line) => count + line.removedEntityTypes.length, 0),
      uncheckedLineCount: analysis.lines.filter((line) => line.redactedText === this.waitingText).length,
      fieldConfidences: analysis.fields.map((field) => field.confidence),
      suggestedReason: analysis.suggestedReviewReason,
    };
  }
}
