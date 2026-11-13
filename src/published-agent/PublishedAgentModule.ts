import { Module } from "@nestjs/common";
import { AssistantModule } from "../assistant/AssistantModule";
import { SettingsModule } from "../settings/SettingsModule";
import { PublishedAgentController } from "./controllers/PublishedAgentController";
import { PublishedAgentService } from "./services/PublishedAgentService";

@Module({
  imports: [AssistantModule, SettingsModule],
  controllers: [PublishedAgentController],
  providers: [PublishedAgentService],
})
export class PublishedAgentModule {}
