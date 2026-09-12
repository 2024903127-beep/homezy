import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { UsersService } from '@/users/users.service';
import { Roles } from '@/common/decorators/roles.decorator';

@Roles('admin')
@Controller('admin/users')
export class AdminUsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  findAll(@Query('search') search?: string) {
    return this.usersService.listForAdmin(search);
  }

  @Patch(':id/status')
  setActive(@Param('id') id: string, @Body('isActive') isActive: boolean) {
    return this.usersService.setActive(id, isActive);
  }
}
