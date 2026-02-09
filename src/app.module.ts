import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { UserModule } from './modules/user/user.module';
import { ConfigModule } from '@nestjs/config';
// import { PrismaModule } from './prisma/prisma.module';
// import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
     ConfigModule.forRoot({
      isGlobal: true,
    }),
   // PrismaModule,
      UserModule,
  // AuthModule,
  ],
    controllers: [AppController],
    providers: [],

})
export class AppModule {}
