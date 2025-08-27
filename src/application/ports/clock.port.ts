export interface ClockPort {
  now(): Date;
  addDuration(date: Date, duration: string): Date;
}
