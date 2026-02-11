import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHomeStatus() {
    return {
      message: 'Server is running!',
      timestamp: new Date().toISOString(),
    };
  }
}
