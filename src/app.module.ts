// import { Module } from '@nestjs/common';
// import { TypeOrmModule } from '@nestjs/typeorm';
// import { ConfigModule, ConfigService } from '@nestjs/config';
// import { AuthModule } from './auth/auth.module';
// import { UsersModule } from './users/users.module';
// import { SubscriptionModule } from './subscription/subscription.module';
// import { User } from './users/entities/user.entity';
// import { Subscription } from './subscription/entities/subscription.entity';

// @Module({
//   imports: [
//     ConfigModule.forRoot({ isGlobal: true }),
//     TypeOrmModule.forRootAsync({
//       imports: [ConfigModule],
//       useFactory: (configService: ConfigService) => {
//         const dbUrl = configService.get<string>('DATABASE_URL');
//         if (!dbUrl) {
//           throw new Error('DATABASE_URL is not defined in the environment variables.');
//         }
//         return {
//           type: 'postgres',
//           url: dbUrl,
//           entities: [User, Subscription],
//           synchronize: true,
//           ssl: true,
//           extra: {
//             ssl: {
//               rejectUnauthorized: false
//             }
//           }
//         };
//       },
//       inject: [ConfigService],
//     }),
//     UsersModule,
//     AuthModule,
//     SubscriptionModule,
//   ],
// })
// export class AppModule { }


import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { User } from './users/entities/user.entity';
import { Subscription } from './subscription/entities/subscription.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const host = configService.get<string>('DB_HOST');
        const port = configService.get<number>('DB_PORT');
        const username = configService.get<string>('DB_USERNAME');
        const password = configService.get<string>('DB_PASSWORD');
        const database = configService.get<string>('DB_NAME');

        if (!host || !port || !username || !password || !database) {
          throw new Error('Missing required database environment variables');
        }

        return {
          type: 'postgres',
          host,
          port,
          username,
          password,
          database,
          entities: [User, Subscription],
          synchronize: true,
          ssl: true,
          extra: {
            ssl: {
              rejectUnauthorized: false
            }
          }
        };
      },
      inject: [ConfigService],
    }),
    UsersModule,
    AuthModule,
    SubscriptionModule,
  ],
})
export class AppModule { }