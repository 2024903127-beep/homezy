import { IsBoolean } from 'class-validator';

export class SetDutyDto {
  @IsBoolean()
  isOnDuty: boolean;
}
