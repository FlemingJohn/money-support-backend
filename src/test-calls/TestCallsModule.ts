import { Module } from "@nestjs/common";
import { LiveKitTokenIssuer } from "./clients/LiveKitTokenIssuer";
import { TestCallController } from "./controllers/TestCallController";
import { TestCallService } from "./services/TestCallService";

@Module({
  controllers: [TestCallController],
  providers: [LiveKitTokenIssuer, TestCallService],
})
export class TestCallsModule {}
