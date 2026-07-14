import {
  BadRequestException,
  Controller,
  Get,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { createClient } from '@supabase/supabase-js';
import { Request } from 'express';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Upload para Supabase Storage. Requer SUPABASE_URL e SUPABASE_SERVICE_KEY.
 */
@Controller('uploads')
export class UploadsController {
  constructor(private prisma: PrismaService) {}

  @Get()
  list() {
    return this.prisma.upload.findMany({ orderBy: { createdAt: 'desc' }, take: 100 });
  }

  @Post()
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 20 * 1024 * 1024 } }))
  async upload(@UploadedFile() file: Express.Multer.File, @Req() req: Request) {
    if (!file) throw new BadRequestException('Arquivo ausente');
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_KEY;
    if (!url || !key) {
      throw new BadRequestException('Supabase Storage não configurado (SUPABASE_URL / SUPABASE_SERVICE_KEY)');
    }
    const bucket = process.env.SUPABASE_BUCKET ?? 'uploads';
    const supabase = createClient(url, key);
    const path = `${randomUUID()}-${file.originalname.replace(/[^\w.\-]/g, '_')}`;
    const { error } = await supabase.storage
      .from(bucket)
      .upload(path, file.buffer, { contentType: file.mimetype });
    if (error) throw new BadRequestException(`Falha no upload: ${error.message}`);
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return this.prisma.upload.create({
      data: {
        filename: file.originalname,
        url: data.publicUrl,
        mimeType: file.mimetype,
        size: file.size,
        uploadedById: (req as any).user?.sub ?? null,
      },
    });
  }
}
