import { Module } from "@nestjs/common";
import { ActivityModule } from "../activity/ActivityModule";
import { AssistantModule } from "../assistant/AssistantModule";
import { CallAnalysisModule } from "../call-analysis/CallAnalysisModule";
import { CallsModule } from "../calls/CallsModule";
import { FaqsModule } from "../faqs/FaqsModule";
import { GuardrailsModule } from "../guardrails/GuardrailsModule";
import { HandOffModule } from "../hand-off/HandOffModule";
import { ReviewModule } from "../review/ReviewModule";
import { SettingsModule } from "../settings/SettingsModule";
import { CallIntakeController } from "./controllers/CallIntakeController";
import { CallCompletionBuilder } from "./services/CallCompletionBuilder";
import { CallRecordingService } from "./services/CallRecordingService";
import { CallReportReader } from "./services/CallReportReader";
import { FinishedCallWriter } from "./services/FinishedCallWriter";

@Module({
  imports: [ActivityModule, AssistantModule, CallAnalysisModule, CallsModule, FaqsModule, GuardrailsModule, HandOffModule, ReviewModule, SettingsModule],
  controllers: [CallIntakeController],
  providers: [CallCompletionBuilder, CallRecordingService, CallReportReader, FinishedCallWriter],
})
export class CallIntakeModule {}
