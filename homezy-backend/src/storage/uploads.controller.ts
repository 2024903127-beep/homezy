import { Controller, Post, UseInterceptors, UploadedFile, Body, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { R2StorageService } from './r2-storage.service';
import { Public } from '@/common/decorators/public.decorator';

@Controller('uploads')
export class UploadsController {
  constructor(private storage: R2StorageService) {}

  @Public()
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('folder') folder?: string,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    return this.storage.uploadBuffer(file.buffer, file.originalname, file.mimetype, folder || 'uploads');
  }

  @Public()
  @Post('presigned-url')
  async getPresignedUrl(
    @Body('filename') filename: string,
    @Body('mimeType') mimeType: string,
    @Body('folder') folder?: string,
  ) {
    if (!filename || !mimeType) {
      throw new BadRequestException('filename and mimeType are required');
    }
    return this.storage.getPresignedUploadUrl(filename, mimeType, folder || 'uploads');
  }
}
