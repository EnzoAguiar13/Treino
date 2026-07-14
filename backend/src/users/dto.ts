import {
  IsBoolean,
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export const ROLE_NAMES = [
  'ADMINISTRADOR',
  'FINANCEIRO',
  'CS',
  'GESTOR',
  'MARKETING',
  'TRAFEGO',
  'VISUALIZACAO',
] as const;

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsIn(ROLE_NAMES as unknown as string[])
  role!: (typeof ROLE_NAMES)[number];
}

export class UpdateUserDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() @MinLength(8) password?: string;
  @IsOptional() @IsIn(ROLE_NAMES as unknown as string[]) role?: (typeof ROLE_NAMES)[number];
  @IsOptional() @IsBoolean() active?: boolean;
}
