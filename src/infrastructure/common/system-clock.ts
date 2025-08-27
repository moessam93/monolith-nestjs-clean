import { Injectable } from '@nestjs/common';
import { ClockPort } from '../../application/ports/clock.port';

@Injectable()
export class SystemClock implements ClockPort {
  now(): Date {
    return new Date();
  }

  addDuration(date: Date, duration: string): Date {
    const durationRegex = /^(\d+)([smhd])$/;
    const match = duration.match(durationRegex);

    if (!match) {
      throw new Error(`Invalid duration format: ${duration}`);
    }

    const value = parseInt(match[1], 10);
    const unit = match[2];
    const baseTime = date.getTime();

    switch (unit) {
      case 's':
        return new Date(baseTime + value * 1000);
      case 'm':
        return new Date(baseTime + value * 60 * 1000);
      case 'h':
        return new Date(baseTime + value * 60 * 60 * 1000);
      case 'd':
        return new Date(baseTime + value * 24 * 60 * 60 * 1000);
      default:
        throw new Error(`Unsupported time unit: ${unit}`);
    }
  }
}
