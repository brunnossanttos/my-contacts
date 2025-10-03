import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ContactsModule } from './contacts/contacts.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const dbType = (
          config.get<string>('DATABASE_TYPE') ?? 'mysql'
        ).toLowerCase();
        console.log('🚀 ~ AppModule ~ dbType:', dbType);

        if (dbType === 'mysql') {
          return {
            type: 'mysql',
            host: config.get<string>('DATABASE_HOST'),
            port: config.get<number>('DATABASE_PORT'),
            username: config.get<string>('DATABASE_USERNAME'),
            password: config.get<string>('DATABASE_PASSWORD'),
            database: config.get<string>('DATABASE_NAME'),
            entities: [__dirname + '/**/*.entity{.ts,.js}'],
            synchronize: config.get<boolean>('DATABASE_SYNCHRONIZE'),
          } as const;
        }

        return {
          type: 'mysql',
          database: 'dev.my-contacts.db',
          autoLoadEntities: true,
          synchronize: true,
        } as const;
      },
    }),
    ContactsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
