import { ServiceUnavailableException } from "@nestjs/common";

export class VoiceNotConfiguredException extends ServiceUnavailableException {
  constructor() {
    super("Test calls need LIVEKIT_URL, LIVEKIT_API_KEY and LIVEKIT_API_SECRET in the backend environment");
  }
}
