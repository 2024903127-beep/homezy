import { IsOptional, IsEmail, IsString } from 'class-validator';

export class RequestOtpDto {
  @IsString()
  phone: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}
