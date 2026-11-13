import { NotFoundException } from "@nestjs/common";

export class AgentNotPublishedException extends NotFoundException {
  constructor() {
    super("The agent has not been published yet, so save the FAQs or settings once to publish it");
  }
}
