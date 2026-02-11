import { Injectable } from '@nestjs/common';

@Injectable()
export class HealthService {
    getHealthStatus() {
    return {
      status: 'ok',
      message: 'API is running!',
      timestamp: new Date().toISOString(),
    };
  }
}
