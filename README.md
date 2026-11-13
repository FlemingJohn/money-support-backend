# money-support-backend

NestJS API that owns the database. It gives the LiveKit voice worker the published agent, receives its call reports, stores redacted calls, runs the review queue and call backs, issues test-call tokens, and serves the dashboard. The voice worker reads the agent once when a call starts and reports once when it ends, so a slow backend never stalls a caller mid-call.

## How it is built

- Classes only. Controllers handle HTTP, services hold the rules, repositories run queries, presenters shape responses.
- Each layer only talks to the one below it: controller → service → repository → Prisma.
- Anything with more than one implementation sits behind an abstract class, and the module picks one from the environment:

| Abstract class | Used when configured | Used otherwise |
|---|---|---|
| `CallAnalysisClient` | `AiCallAnalysisClient` (ai/ analysis graph; saves lines as waiting if ai/ fails) | `PendingCallAnalysisClient` |
| `AssistantSyncClient` | `AiAssistantSyncClient` | `SkippedAssistantSyncClient` |
| `OutboundCallClient` | `TwilioBridgeClient` | `SimulatedBridgeClient` |

## Endpoints

| Method | Path | Used by |
|---|---|---|
| POST | `/test-calls` | Test call page: a LiveKit token for a new web room with the agent in it |
| GET | `/overview` | Overview |
| GET | `/calls?outcome=&search=&page=&pageSize=` | Calls |
| GET | `/calls/:callId` | Call detail |
| POST | `/calls/:callId/unmasked-reports` | Report unmasked data |
| GET | `/reviews?status=open\|inProgress\|done` | Review queue |
| GET · PATCH | `/reviews/:callId` | Review detail, status and note |
| PUT | `/reviews/:callId/verdict` | Correct or wrong |
| POST | `/reviews/:callId/field-confirmations` | Confirm all fields |
| GET · POST | `/reviews/:callId/callbacks` | List or start a call back |
| GET | `/callbacks/:callbackId` | Call back progress |
| POST | `/callbacks/:callbackId/end` | End a call back |
| GET · POST | `/faqs` | FAQ list and create |
| PATCH · DELETE | `/faqs/:faqId` | FAQ edit and delete |
| PUT | `/faqs/order` | FAQ reorder |
| GET | `/settings` | All settings |
| PUT | `/settings/agent` · `/settings/hand-off` · `/settings/privacy` · `/settings/phone` | Settings tabs |
| GET | `/activity?limit=` | Activity tab |
| GET | `/health` | Connections tab |
| GET | `/internal/faqs` | ai/, with the `x-service-secret` header |
| GET | `/internal/settings` | ai/, with the `x-service-secret` header |
| GET | `/internal/agent/published` | Voice worker, when a call starts |
| POST | `/internal/calls/started` · `/internal/calls/finished` | Voice worker, when a call starts and ends |
| POST | `/internal/hand-offs/ring` | Voice worker, during a hand-off |
| POST | `/internal/retention/run` | Supabase Cron, with the `x-cron-secret` header |
| POST | `/masking/line` | Test call page, limited to 180 checks a minute per address |

## What happens when a call ends

1. `ServiceSecretGuard` checks the secret and `CallFinishedDto` checks the report the voice worker sent.
2. `CallReportReader` turns it into a `FinishedCallReport`. The end reason is one of `callerHungUp`, `agentEndedCall`, `handedOff`, `silenceTimeout`, `timeLimit` or `error`.
3. `ReportAnalyser` sends the transcript, the privacy toggles and the FAQs to ai/ `/analysis`, which returns masked lines, summary, topic, matched FAQ and fields. If ai/ is down, every line is saved as "[waiting for privacy check]".
4. `ReviewTriage` decides whether a person needs to look at it: hand-off, removed or unchecked data, a field under 75% confidence, or a possible mistake suggested by ai/.
5. `CallCompletionBuilder` masks the caller's number for display, and keeps the full number for call backs when that privacy setting is on. The caller's number is also sent to ai, so it stays in the transcript while any other phone number is masked.
6. `FinishedCallWriter` saves the call, messages, fields, guardrail events, review and activity in one transaction.
7. `HandOffAlertService` emails the team when the call was handed off, and rings the team phone in Settings → Phone if the agent did not already ring it during the call. It sends once per call, using only masked details, and never stops the call being saved if Gmail fails.

## Hand-off emails

A handed-off call (end reason `handedOff`, or the hand-off sentence in the transcript) gets one email whose subject starts with "Follow up a handed-off call". Emails go through Gmail SMTP with an app password (`MAIL_USER`, `MAIL_APP_PASSWORD`) to the address in Settings → Hand-off. `reviews.hand_off_emailed_at` is claimed in one update before sending, so a repeated report never sends twice; a failed send clears it and logs `handOffEmailFailed`.

## Structure

One folder per area. The module sits at the top of each area, and every other file goes in the subfolder for its kind. An area only has the subfolders it needs.

```
src/
├── main.ts · ApplicationServer.ts · AppModule.ts
├── configuration/   environment schema and typed AppConfiguration
├── prisma/          PrismaService and the transaction type
├── common/          guards, SecretMatcher, EncryptionService, Clock
├── call-intake/     the voice worker's call reports, saved as calls
├── call-analysis/   asks ai/ to analyse a call; shared with reports/
├── published-agent/ the current prompt and settings for the voice worker
├── test-calls/      LiveKit tokens for test calls
├── calls/           calls, messages, extracted fields, number protection
├── review/          review queue, triage, verdicts, unmasked reports
├── callbacks/       call backs through Twilio or the simulator
├── faqs/            FAQ editing and the internal list for ai/
├── assistant/       agent sync with ai/ and prompt versions
├── guardrails/      guardrail events and the kinds of data to mask
├── masking/         live masking of test call lines
├── hand-off/        rings and emails the team after a hand-off
├── overview/        statistics for the overview page
├── settings/        settings sections with defaults
├── activity/        activity log
├── retention/       hourly clean-up of old transcripts and numbers
└── health/          health checks
```

Inside an area, for example `calls/`:

```
calls/
├── CallsModule.ts
├── controllers/    CallController
├── services/       CallQueryService · CustomerNumberProtector
├── repositories/   CallRepository · CallMessageRepository · ExtractedFieldRepository
├── queries/        callDetailInclude
├── presenters/     CallPresenter
├── dto/            CallFilterDto
├── responses/      CallSummaryResponse · CallDetailResponse · CallPageResponse · …
├── types/          CallCompletion · CallRows · CallWithDetails · LocatedField · ProtectedCustomerNumber
└── exceptions/     CallNotFoundException
```

| Subfolder | Holds |
|---|---|
| `controllers/` | HTTP routes |
| `services/` | Business rules |
| `repositories/` | Database queries |
| `queries/` | Prisma include shapes used by repositories |
| `presenters/` | Turn database rows into API responses |
| `clients/` | Outside services: an abstract class and its implementations |
| `catalogs/` | Fixed lists and wordings |
| `jobs/` | Scheduled tasks |
| `guards/` | Request checks |
| `dto/` | Request validation with Zod |
| `responses/` | Shapes the API returns to the frontend |
| `types/` | Data passed between classes inside the backend |
| `exceptions/` | Named errors |

Tests mirror the source layout: `test/review/services/ReviewTriage.test.ts` tests `src/review/services/ReviewTriage.ts`.

## Local setup

```bash
npm install
cp .env.example .env
```

Fill in `.env`:

| Variable | Value |
|---|---|
| `DATABASE_URL` | Supabase pooler in transaction mode (port 6543), with no `sslmode` in the URL, or a local database |
| `DATABASE_CA_CERTIFICATE` | Text of `certs/supabase-ca.crt`, so the connection to Supabase is verified. Leave empty for a local database. |
| `DIRECT_URL` | Supabase pooler in session mode (port 5432) with `?sslmode=verify-full&sslrootcert=certs/supabase-ca.crt`, used for migrations |
| `SERVICE_SECRET`, `CRON_SECRET` | Long random strings. The voice worker and ai/ use the same `SERVICE_SECRET`. |
| `AI_SERVICE_URL` | Leave empty until ai/ runs |
| `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET` | The LiveKit project, for test-call tokens |
| `LIVEKIT_AGENT_NAME` | The voice worker's name, `money-support` by default |
| `TWILIO_*` | Needed for real call backs and for ringing the team phone after a hand-off. Leave empty to use the call back simulator and skip the ring. |

Without Supabase, `npx prisma dev` runs a local Postgres and prints a connection string to use for both database variables.

```bash
npx prisma migrate dev
npm run dev
```

The API listens on http://localhost:4000. A voice worker running on LiveKit Cloud needs a public URL for it, so expose the port with a tunnel such as ngrok or cloudflared when testing real calls against a local backend.

| Command | What it does |
|---|---|
| `npm run dev` | Starts the API and restarts on changes |
| `npm run build` | Compiles to `dist/` |
| `npm start` | Runs the compiled API |
| `npm test` | Runs the unit tests |
| `npm run typecheck` | Checks types |
| `npm run prisma:migrate` | Creates and applies a migration |

## Retention on Supabase

The hourly clean-up runs inside the backend when it runs as one process. On Vercel nothing stays running, so Supabase Cron calls `POST /internal/retention/run` every hour instead. [supabase/schedule-retention.sql](supabase/schedule-retention.sql) turns on `pg_cron` and `pg_net` and schedules the call. It reads two secrets from Supabase Vault, which are added once by hand and never committed:

| Vault secret | Value |
|---|---|
| `retention_url` | `https://<backend>.vercel.app/internal/retention/run` |
| `cron_secret` | Same as `CRON_SECRET` |
