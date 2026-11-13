import { Module } from "@nestjs/common";
import { ActivityModule } from "../activity/ActivityModule";
import { CallAnalysisModule } from "../call-analysis/CallAnalysisModule";
import { CallsModule } from "../calls/CallsModule";
import { FaqsModule } from "../faqs/FaqsModule";
import { GuardrailsModule } from "../guardrails/GuardrailsModule";
import { ReviewModule } from "../review/ReviewModule";
import { ReportedLineMasker } from "./clients/ReportedLineMasker";
import { UnmaskedReportController } from "./controllers/UnmaskedReportController";
import { MaskingMissRepository } from "./repositories/MaskingMissRepository";
import { CallReanalysisService } from "./services/CallReanalysisService";
import { ReportDecider } from "./services/ReportDecider";
import { UnmaskedReportService } from "./services/UnmaskedReportService";

@Module({
  imports: [ActivityModule, CallAnalysisModule, CallsModule, FaqsModule, GuardrailsModule, ReviewModule],
  controllers: [UnmaskedReportController],
  providers: [CallReanalysisService, MaskingMissRepository, ReportDecider, ReportedLineMasker, UnmaskedReportService],
})
export class ReportsModule {}
