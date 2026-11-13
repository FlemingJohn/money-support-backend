import { Module } from "@nestjs/common";
import { AppConfiguration } from "../configuration/services/AppConfiguration";
import { FaqsModule } from "../faqs/FaqsModule";
import { GuardrailsModule } from "../guardrails/GuardrailsModule";
import { SettingsModule } from "../settings/SettingsModule";
import { AiCallAnalysisClient } from "./clients/AiCallAnalysisClient";
import { CallAnalysisClient } from "./clients/CallAnalysisClient";
import { PendingCallAnalysisClient } from "./clients/PendingCallAnalysisClient";
import { FieldLocator } from "./services/FieldLocator";
import { PendingAnalysisBuilder } from "./services/PendingAnalysisBuilder";
import { ReportAnalyser } from "./services/ReportAnalyser";

@Module({
  imports: [FaqsModule, GuardrailsModule, SettingsModule],
  providers: [
    FieldLocator,
    PendingAnalysisBuilder,
    ReportAnalyser,
    {
      provide: CallAnalysisClient,
      inject: [AppConfiguration, PendingAnalysisBuilder],
      useFactory: (appConfiguration: AppConfiguration, pendingAnalysisBuilder: PendingAnalysisBuilder) =>
        appConfiguration.isAiServiceConfigured
          ? new AiCallAnalysisClient(appConfiguration, pendingAnalysisBuilder)
          : new PendingCallAnalysisClient(pendingAnalysisBuilder),
    },
  ],
  exports: [FieldLocator, ReportAnalyser],
})
export class CallAnalysisModule {}
