import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export const CATEGORIES = [
  'CREATOR',
  'CASSINO',
  'SPORTSBOOK',
  'INFLUENCER',
  'STREAMER',
  'TIPSTER',
  'TRADER',
] as const;

export const NETWORKS = [
  'INSTAGRAM',
  'TIKTOK',
  'YOUTUBE',
  'TELEGRAM',
  'WHATSAPP',
  'DISCORD',
  'FACEBOOK',
  'TWITTER',
  'KWAI',
  'SITE',
  'LINKTREE',
] as const;

export class SocialAccountDto {
  @IsIn(NETWORKS as unknown as string[])
  network!: (typeof NETWORKS)[number];

  @IsString()
  handle!: string;

  @IsOptional()
  @IsString()
  url?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  followers?: number;

  @IsOptional()
  @IsBoolean()
  connected?: boolean;
}

export class CreateAffiliateDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  externalId!: string;

  @IsArray()
  @IsIn(CATEGORIES as unknown as string[], { each: true })
  categories!: (typeof CATEGORIES)[number][];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SocialAccountDto)
  socialAccounts?: SocialAccountDto[];
}

export class UpdateAffiliateDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() externalId?: string;
  @IsOptional() @IsIn(["ATIVO", "INATIVO"]) status?: 'ATIVO' | 'INATIVO';
  @IsOptional() @IsArray() @IsIn(CATEGORIES as unknown as string[], { each: true })
  categories?: (typeof CATEGORIES)[number][];
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => SocialAccountDto)
  socialAccounts?: SocialAccountDto[];
  // Financeiro — qualquer alteração dispara recálculo automático dos indicadores
  @IsOptional() @IsInt() @Min(0) registrations?: number;
  @IsOptional() @IsInt() @Min(0) ftd?: number;
  @IsOptional() @IsNumber() deposits?: number;
  @IsOptional() @IsNumber() volume?: number;
  @IsOptional() @IsNumber() netPl?: number;
  @IsOptional() @IsNumber() ggr?: number;
  @IsOptional() @IsNumber() @Min(0) cpa?: number;
  @IsOptional() @IsNumber() @Min(0) revShare?: number;
  @IsOptional() @IsNumber() @Min(0) fixedCost?: number;
  @IsOptional() @IsNumber() @Min(0) otherCosts?: number;
  @IsOptional() @IsNumber() @Min(0) trafficInvestment?: number;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsString() agreement?: string;
}

export class QueryAffiliatesDto {
  @IsOptional() @IsString() search?: string;
  @IsOptional() @IsString() category?: string;
  @IsOptional() @IsString() status?: string;
  @IsOptional() @IsString() period?: string;
  @IsOptional() @IsString() from?: string;
  @IsOptional() @IsString() to?: string;
}
