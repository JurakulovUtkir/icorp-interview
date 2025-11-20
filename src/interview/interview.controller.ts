import { Body, Controller, Get, Post } from '@nestjs/common';
import { InterviewService } from './interview.service';
import { ApiOperation } from '@nestjs/swagger';

@Controller('interview')
export class InterviewController {
  constructor(private readonly interviewService: InterviewService) {}

  @Get('health')
  @ApiOperation({ summary: 'Check health status' })
  health() {
    return { status: 'ok' };
  }

  // Bu endpointni sen o‘zing chaqirasan (masalan Postman bilan)
  @Post('start')
  @ApiOperation({ summary: 'Start interview process' })
  start() {
    return this.interviewService.startProcess();
  }

  // Bu endpointni test serveri (test.icorp) o‘zi chaqiradi
  @ApiOperation({ summary: 'Handle callback from test server' })
  @Post('callback')
  callback(@Body() body: any) {
    return this.interviewService.handleCallback(body);
  }
}
