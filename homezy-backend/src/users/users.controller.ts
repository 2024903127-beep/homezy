import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { JwtPayload } from '@/auth/jwt-payload.type';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpsertAddressDto } from './dto/upsert-address.dto';

// Matches homezy-consumer/src/services/authService.ts (getProfile/updateProfile)
// and bookingService.ts (getAddresses/saveAddress/deleteAddress)
@Roles('customer')
@Controller('users/me')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  getProfile(@CurrentUser() user: JwtPayload) {
    return this.usersService.getProfile(user.sub);
  }

  @Patch()
  updateProfile(@CurrentUser() user: JwtPayload, @Body() dto: UpdateUserDto) {
    return this.usersService.updateProfile(user.sub, dto);
  }

  @Get('addresses')
  getAddresses(@CurrentUser() user: JwtPayload) {
    return this.usersService.getAddresses(user.sub);
  }

  @Post('addresses')
  createAddress(@CurrentUser() user: JwtPayload, @Body() dto: UpsertAddressDto) {
    return this.usersService.upsertAddress(user.sub, dto);
  }

  @Patch('addresses/:id')
  updateAddress(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body() dto: UpsertAddressDto) {
    return this.usersService.upsertAddress(user.sub, dto, id);
  }

  @Delete('addresses/:id')
  deleteAddress(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.usersService.deleteAddress(user.sub, id);
  }

  @Get('notifications')
  getNotifications(@CurrentUser() user: JwtPayload) {
    return this.usersService.getNotifications(user.sub);
  }
}
