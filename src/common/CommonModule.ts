import { Global, Module } from "@nestjs/common";
import { AiEventStream } from "./services/AiEventStream";
import { Clock } from "./services/Clock";
import { EventStreamWriter } from "./services/EventStreamWriter";
import { CronSecretGuard } from "./guards/CronSecretGuard";
import { SecretMatcher } from "./services/SecretMatcher";
import { ServiceSecretGuard } from "./guards/ServiceSecretGuard";

@Global()
@Module({
  providers: [AiEventStream, Clock, EventStreamWriter, SecretMatcher, CronSecretGuard, ServiceSecretGuard],
  exports: [AiEventStream, Clock, EventStreamWriter, SecretMatcher, CronSecretGuard, ServiceSecretGuard],
})
export class CommonModule {}
