import { Injectable } from "@nestjs/common";
import { PromptVersionRepository } from "../../assistant/repositories/PromptVersionRepository";
import { SettingsService } from "../../settings/services/SettingsService";
import { AgentNotPublishedException } from "../exceptions/AgentNotPublishedException";
import type { PublishedAgentResponse } from "../responses/PublishedAgentResponse";

@Injectable()
export class PublishedAgentService {
  constructor(
    private readonly promptVersionRepository: PromptVersionRepository,
    private readonly settingsService: SettingsService,
  ) {}

  async getPublishedAgent(): Promise<PublishedAgentResponse> {
    const [promptVersion, settings] = await Promise.all([this.promptVersionRepository.findCurrent(), this.settingsService.getAll()]);
    if (!promptVersion) throw new AgentNotPublishedException();
    return { promptContent: promptVersion.content, settings };
  }
}
