import {
  Body,
  Controller,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RecordingsService } from './recordings.service';
import { UploadRecordingDto } from './dto/upload-recording.dto';

@ApiTags('Recordings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('recordings')
export class RecordingsController {
  constructor(private readonly recordingsService: RecordingsService) {}

  @Post()
  @ApiOperation({ summary: 'Upload a new recording for processing' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  upload(
    @Req() req: Request,
    @Body() dto: UploadRecordingDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 100 * 1024 * 1024 }), // 100 MB
          new FileTypeValidator({ fileType: /^video\/(webm|mp4|x-matroska)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const { id } = req.user as { id: string };
    return this.recordingsService.processUpload(id, file, dto);
  }
}
