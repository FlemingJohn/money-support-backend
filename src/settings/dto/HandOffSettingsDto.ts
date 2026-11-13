import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export class HandOffSettingsDto extends createZodDto(
  z.object({
    handOffSentence: z
      .string()
      .trim()
      .min(1)
      .max(300)
      .default("Please contact the Wise support team through the Help section of the Wise app or website."),
    emailTeam: z.boolean().default(true),
    teamEmail: z.union([z.email(), z.literal("")]).default(""),
  }),
) {}
