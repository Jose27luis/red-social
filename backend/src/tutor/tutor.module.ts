import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TutorController } from './tutor.controller';
import { TutorService } from './tutor.service';
import { GeminiService } from './gemini.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule, ConfigModule],
  controllers: [TutorController],
  providers: [TutorService, GeminiService],
  exports: [TutorService],
})
export class TutorModule {}
