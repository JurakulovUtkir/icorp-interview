import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import axios from 'axios';
import * as dotenv from 'dotenv';
dotenv.config();

const TEST_API_URL =
  process.env.TEST_API_URL ?? 'https://test.icorp.uz/interview.php';
const CALLBACK_URL =
  process.env.CALLBACK_URL ?? 'https://icorp.genix.uz/interview/callback'; // override in .env
const MESSAGE = process.env.MESSAGE ?? 'Salom test';

@Injectable()
export class InterviewService {
  private readonly logger = new Logger(InterviewService.name);

  private firstPart: string | null = null;
  private secondPart: string | null = null;

  async startProcess() {
    if (!TEST_API_URL) {
      throw new InternalServerErrorException('TEST_API_URL is not configured');
    }

    try {
      const res = await axios.post(TEST_API_URL, {
        msg: MESSAGE,
        url: CALLBACK_URL,
      });

      this.firstPart = this.extractFirstPart(res.data);
      this.logger.log(`First code part: ${this.firstPart}`);

      // sababi server avval web callbackni yuboradi, shuning uchun serverimiz avval callbackni qabul qiladi
      if (!this.secondPart) {
        this.logger.warn('Callback received before startProcess was called');
        return {
          message: 'First part not received yet. Call /interview/start first.',
        };
      }

      const combinedCode = `${this.firstPart}${this.secondPart}`;
      this.logger.log(`Combined code: ${combinedCode}`);

      const response = await axios.get(TEST_API_URL, {
        params: { code: combinedCode },
      });

      const originalMessage = response.data;
      this.logger.log(`Original message from test API: ${originalMessage}`);

      return {
        finalMessage: originalMessage,
        combinedCode,
      };
    } catch (error) {
      this.logger.error(
        'Error while requesting first part from test API',
        error as any,
      );
      throw new InternalServerErrorException(
        'Failed to start interview process',
      );
    }
  }

  async handleCallback(body: any) {
    if (!TEST_API_URL) {
      throw new InternalServerErrorException('TEST_API_URL is not configured');
    }

    try {
      this.secondPart = this.extractSecondPart(body);
      this.logger.log(`Second code part: ${this.secondPart}`);

      return {
        message: 'Second part received, waiting for first part...',
        secondPart: this.secondPart,
      };
    } catch (error) {
      this.logger.error(
        'Error while handling callback / final GET',
        error as any,
      );
      throw new InternalServerErrorException(
        'Failed to complete interview process',
      );
    }
  }

  private extractFirstPart(data: any): string {
    const part =
      typeof data === 'string'
        ? data
        : (data?.code ?? data?.part1 ?? data?.first ?? data?.part ?? null);

    if (!part) {
      this.logger.error(
        `Cannot extract first code part from response: ${JSON.stringify(data)}`,
      );
      throw new InternalServerErrorException(
        'Invalid response from test API (first part)',
      );
    }

    return String(part).trim();
  }

  private extractSecondPart(body: any): string {
    const part =
      typeof body === 'string'
        ? body
        : (body?.code ?? body?.part2 ?? body?.second ?? body?.part ?? null);

    if (!part) {
      this.logger.error(
        `Cannot extract second code part from callback body: ${JSON.stringify(body)}`,
      );
      throw new InternalServerErrorException(
        'Invalid callback payload (second part)',
      );
    }

    return String(part).trim();
  }
}
