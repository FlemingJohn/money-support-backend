import { createZodDto } from "nestjs-zod";
import { z } from "zod";
import { callEndReasons } from "../../calls/catalogs/callEndReasons";
import { CallChannel, Speaker } from "../../generated/prisma/client";

export class CallFinishedDto extends createZodDto(
  z.object({
    callId: z.string().min(1).max(200),
    channel: z.enum(CallChannel),
    customerNumber: z.string().nullable(),
    startedAt: z.coerce.date(),
    endedAt: z.coerce.date(),
    endReason: z.enum(callEndReasons),
    handOffReason: z.string().nullable(),
    lines: z
      .array(
        z.object({
          position: z.number().int().min(0),
          speaker: z.enum(Speaker),
          text: z.string(),
          secondsFromStart: z.number().min(0),
        }),
      )
      .max(400),
  }),
) {}
