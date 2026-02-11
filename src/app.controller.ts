import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service'
import { HealthService } from './modules/health/health.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly healthService: HealthService,
  ) { }
  @Get()
  home() {
    return this.appService.getHomeStatus();
  }

  @Get('health')
  health() {
    return this.healthService.getHealthStatus();
  }
}
