import { IsIn, IsISO8601, IsOptional, IsString } from 'class-validator';

export class UpdateBookingDto {
  @IsOptional()
  @IsISO8601()
  scheduledAt?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  // Matches homezy-consumer's updateBooking() which can also pass
  // status: 'CANCELLED' for the cancel flow through the same PATCH endpoint.
  @IsOptional()
  @IsIn(['CANCELLED'])
  status?: 'CANCELLED';
}
