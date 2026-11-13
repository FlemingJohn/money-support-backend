import { createZodDto } from "nestjs-zod";
import { z } from "zod";
import { CallChannel } from "../../generated/prisma/client";

export class CallStartedDto extends createZodDto(
  z.object({
    callId: z.string().min(1).max(200),
    channel: z.enum(CallChannel),
    startedAt: z.coerce.date(),
  }),
) {}
