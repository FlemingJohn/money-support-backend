import { Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import type { TestCallTokenResponse } from "../responses/TestCallTokenResponse";
import { TestCallService } from "../services/TestCallService";

@Controller("test-calls")
export class TestCallController {
  constructor(private readonly testCallService: TestCallService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  start(): Promise<TestCallTokenResponse> {
    return this.testCallService.startTestCall();
  }
}
