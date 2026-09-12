import { BadRequestException, Body, Controller, Get, Param, Patch, Post, Put, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProvidersService } from './providers.service';
import { R2StorageService } from '@/storage/r2-storage.service';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { JwtPayload } from '@/auth/jwt-payload.type';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { SetDutyDto } from './dto/set-duty.dto';
import { BankDetailsDto } from './dto/bank-details.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { KycDocType } from '@prisma/client';

// Matches homezy-partner/src/services/authService.ts and kycService.ts
@Roles('provider')
@Controller('provider')
export class ProvidersController {
  constructor(
    private providersService: ProvidersService,
    private storage: R2StorageService,
  ) {}

  @Get('me')
  getProfile(@CurrentUser() user: JwtPayload) {
    return this.providersService.getProfile(user.sub);
  }

  @Patch('me')
  updateProfile(@CurrentUser() user: JwtPayload, @Body() dto: UpdateProviderDto) {
    return this.providersService.updateProfile(user.sub, dto);
  }

  @Patch('me/duty')
  setDuty(@CurrentUser() user: JwtPayload, @Body() dto: SetDutyDto) {
    return this.providersService.setDuty(user.sub, dto.isOnDuty);
  }

  @Get('me/kyc')
  getKyc(@CurrentUser() user: JwtPayload) {
    return this.providersService.getKycDocuments(user.sub);
  }

  @Post('me/kyc')
  @UseInterceptors(FileInterceptor('file'))
  async uploadKyc(
    @CurrentUser() user: JwtPayload,
    @UploadedFile() file: any,
    @Body('type') type: KycDocType,
  ) {
    if (!type) {
      throw new BadRequestException('Document type is required');
    }

    let fileUrl = `https://storage.homezy.example.com/kyc/${user.sub}/${type}.jpg`;
    if (file && file.buffer) {
      const uploaded = await this.storage.uploadBuffer(
        file.buffer,
        file.originalname || `${type}.jpg`,
        file.mimetype || 'image/jpeg',
        `kyc/${user.sub}`,
      );
      fileUrl = uploaded.fileUrl;
    }

    return this.providersService.uploadKycDocument(user.sub, type, fileUrl);
  }

  @Get('me/bank-details')
  getBankDetails(@CurrentUser() user: JwtPayload) {
    return this.providersService.getBankDetails(user.sub);
  }

  @Put('me/bank-details')
  saveBankDetails(@CurrentUser() user: JwtPayload, @Body() dto: BankDetailsDto) {
    return this.providersService.saveBankDetails(user.sub, dto);
  }

  @Get('earnings/summary')
  getEarningsSummary(@CurrentUser() user: JwtPayload) {
    return this.providersService.getEarningsSummary(user.sub);
  }

  @Get('earnings/history')
  getEarningsHistory(@CurrentUser() user: JwtPayload) {
    return this.providersService.getEarningsHistory(user.sub);
  }

  @Patch('me/location')
  updateLocation(@CurrentUser() user: JwtPayload, @Body() dto: UpdateLocationDto) {
    return this.providersService.updateLocation(user.sub, dto.latitude, dto.longitude);
  }

  @Roles('customer', 'provider', 'admin')
  @Get(':id/location')
  getLiveLocation(@Param('id') id: string) {
    return this.providersService.getLiveLocation(id);
  }
}