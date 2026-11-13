import { Injectable } from "@nestjs/common";
import type { FinishedCallReport } from "../../calls/types/FinishedCallReport";
import type { CallFinishedDto } from "../dto/CallFinishedDto";

@Injectable()
export class CallReportReader {
  read(finished: CallFinishedDto): FinishedCallReport {
    return {
      callId: finished.callId,
      channel: finished.channel,
      customerNumber: finished.customerNumber,
      startedAt: finished.startedAt,
      endedAt: finished.endedAt,
      endedReason: finished.endReason,
      lines: finished.lines.filter((line) => line.text.trim().length > 0),
      handOffReason: finished.handOffReason,
    };
  }
}
