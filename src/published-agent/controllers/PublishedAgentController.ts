import { Controller, Get, UseGuards } from "@nestjs/common";
import { ServiceSecretGuard } from "../../common/guards/ServiceSecretGuard";
import type { PublishedAgentResponse } from "../responses/PublishedAgentResponse";
import { PublishedAgentService } from "../services/PublishedAgentService";

@Controller("internal/agent")
@UseGuards(ServiceSecretGuard)
export class PublishedAgentController {
  constructor(private readonly publishedAgentService: PublishedAgentService) {}

  @Get("published")
  getPublished(): Promise<PublishedAgentResponse> {
    return this.publishedAgentService.getPublishedAgent();
  }
}
