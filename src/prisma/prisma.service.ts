// import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
// import { PrismaClient } from '@prisma/client';

// @Injectable()
// export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
//   private readonly logger = new Logger(PrismaService.name);

//   async onModuleInit() {
//     try {
//       await this.$connect();
//       this.logger.log('✅ Successfully connected to PostgreSQL database');
      
//       // Test query to verify connection
//       const result = await this.$queryRaw`SELECT current_database(), current_user, version()`;
//       this.logger.log(`📊 Database: ${result[0].current_database}`);
//       this.logger.log(`👤 User: ${result[0].current_user}`);
//     } catch (error) {
//       this.logger.error('❌ Failed to connect to database', error);
//       throw error;
//     }
//   }

//   async onModuleDestroy() {
//     await this.$disconnect();
//     this.logger.log('🔌 Disconnected from PostgreSQL database');
//   }
// }