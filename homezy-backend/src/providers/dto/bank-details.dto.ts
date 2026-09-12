import { IsOptional, IsString } from 'class-validator';

export class BankDetailsDto {
  @IsString()
  accountHolderName: string;

  @IsString()
  accountNumber: string;

  @IsString()
  ifsc: string;

  @IsOptional()
  @IsString()
  upiId?: string;
}
