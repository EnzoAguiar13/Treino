import { IsIn, IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export const PLATFORMS = [
  'FACEBOOK_ADS',
  'GOOGLE_ADS',
  'TIKTOK_ADS',
  'META_ADS',
  'KWAI_ADS',
] as const;

export class TrafficDto {
  @IsIn(PLATFORMS as unknown as string[])
  platform!: (typeof PLATFORMS)[number];

  @IsOptional() @IsString() affiliateId?: string;
  @IsOptional() @IsNumber() @Min(0) investment?: number;
  @IsOptional() @IsInt() @Min(0) clicks?: number;
  @IsOptional() @IsInt() @Min(0) leads?: number;
  @IsOptional() @IsInt() @Min(0) registrations?: number;
  @IsOptional() @IsInt() @Min(0) ftd?: number;
  @IsOptional() @IsNumber() @Min(0) revenue?: number;
  @IsOptional() @IsString() date?: string;
}

export class UpdateTrafficDto {
  @IsOptional() @IsIn(PLATFORMS as unknown as string[]) platform?: (typeof PLATFORMS)[number];
  @IsOptional() @IsString() affiliateId?: string;
  @IsOptional() @IsNumber() @Min(0) investment?: number;
  @IsOptional() @IsInt() @Min(0) clicks?: number;
  @IsOptional() @IsInt() @Min(0) leads?: number;
  @IsOptional() @IsInt() @Min(0) registrations?: number;
  @IsOptional() @IsInt() @Min(0) ftd?: number;
  @IsOptional() @IsNumber() @Min(0) revenue?: number;
  @IsOptional() @IsString() date?: string;
}
