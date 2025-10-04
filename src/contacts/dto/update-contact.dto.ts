import { PartialType } from '@nestjs/mapped-types';
import { CreateContactDto } from './create-contact.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateContactDto extends PartialType(CreateContactDto) {
  @ApiPropertyOptional({ example: 'Novo Nome' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: '11998887777' })
  @IsOptional()
  @IsString()
  cellphone?: string;
}
