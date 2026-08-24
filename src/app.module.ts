import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './database/prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { StudentsModule } from './students/students.module';
import { EnrollmentsModule } from './enrollments/enrollments.module';
import { ClassesModule } from './classes/classes.module';
import { AttendanceModule } from './attendance/attendance.module';
import { PaymentsModule } from './payments/payments.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PublicModule } from './public/public.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    // Carrega o .env no runtime (sem sobrescrever variáveis já existentes),
    // garantindo que DOMAIN_WEB/APP_URL etc. estejam disponíveis no `npm run start`.
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    UsersModule,
    AuthModule,
    StudentsModule,
    EnrollmentsModule,
    ClassesModule,
    AttendanceModule,
    PaymentsModule,
    NotificationsModule,
    PublicModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}