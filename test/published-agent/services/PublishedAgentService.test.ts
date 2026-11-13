import type { PromptVersionRepository } from "../../../src/assistant/repositories/PromptVersionRepository";
import { AgentNotPublishedException } from "../../../src/published-agent/exceptions/AgentNotPublishedException";
import { PublishedAgentService } from "../../../src/published-agent/services/PublishedAgentService";
import type { SettingsService } from "../../../src/settings/services/SettingsService";

describe("PublishedAgentService", () => {
  const settings = { agent: { greeting: "Hi" }, handOff: { handOffSentence: "Please contact the team." } };
  const settingsService = { getAll: jest.fn().mockResolvedValue(settings) };
  const promptVersionRepository = { findCurrent: jest.fn() };
  const service = new PublishedAgentService(promptVersionRepository as unknown as PromptVersionRepository, settingsService as unknown as SettingsService);

  it("gives the current prompt with the settings", async () => {
    promptVersionRepository.findCurrent.mockResolvedValue({ content: "# Role" });
    await expect(service.getPublishedAgent()).resolves.toEqual({ promptContent: "# Role", settings });
  });

  it("refuses when no prompt has been published", async () => {
    promptVersionRepository.findCurrent.mockResolvedValue(null);
    await expect(service.getPublishedAgent()).rejects.toBeInstanceOf(AgentNotPublishedException);
  });
});
