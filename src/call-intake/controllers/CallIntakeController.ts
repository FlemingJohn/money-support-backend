import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from "@nestjs/common";
import { ServiceSecretGuard } from "../../common/guards/ServiceSecretGuard";
import { CallFinishedDto } from "../dto/CallFinishedDto";
import { CallStartedDto } from "../dto/CallStartedDto";
import type { CallReceipt } from "../responses/CallReceipt";
import { CallRecordingService } from "../services/CallRecordingService";
import { CallReportReader } from "../services/CallReportReader";

@Controller("internal/calls")
@UseGuards(ServiceSecretGuard)
export class CallIntakeController {
  constructor(
    private readonly callRecordingService: CallRecordingService,
    private readonly callReportReader: CallReportReader,
  ) {}

  @Post("started")
  @HttpCode(HttpStatus.OK)
  async receiveStart(@Body() started: CallStartedDto): Promise<CallReceipt> {
    await this.callRecordingService.recordCallStart(started);
    return { isReceived: true };
  }

  @Post("finished")
  @HttpCode(HttpStatus.OK)
  async receiveFinish(@Body() finished: CallFinishedDto): Promise<CallReceipt> {
    await this.callRecordingService.recordFinishedCall(this.callReportReader.read(finished));
    return { isReceived: true };
  }
}
