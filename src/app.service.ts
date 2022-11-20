import { Injectable } from '@nestjs/common';
import { ChallengeMessage } from './interface/challenge-message.structure';

@Injectable()
export class AppService {
  getChallengeMessage(): ChallengeMessage {
    return {
      message: 'Fullstack Challenge 🏅 - Space X API',
    };
  }
}
