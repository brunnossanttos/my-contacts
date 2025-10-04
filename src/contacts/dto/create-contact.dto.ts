import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches } from 'class-validator';

export class CreateContactDto {
  @ApiProperty({ example: 'Bruno Santos' })
  @IsString()
  @Matches(/^[A-Za-zÀ-ÖØ-öø-ÿ]{3,}\s[A-Za-zÀ-ÖØ-öø-ÿ]{3,}$/, {
    message:
      'Name should be two words with at least 3 characters each, separated by a space',
  })
  name: string;

  @ApiProperty({ example: '11999999999' })
  @IsString()
  cellphone: string;
}
