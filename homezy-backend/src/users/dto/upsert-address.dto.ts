import { IsBoolean, IsIn, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpsertAddressDto {
  @IsIn(['Home', 'Office', 'Other'])
  label: 'Home' | 'Office' | 'Other';

  @IsString()
  line1: string;

  @IsOptional()
  @IsString()
  line2?: string;

  @IsString()
  city: string;

  @IsString()
  state: string;

  @IsString()
  pincode: string;

  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
