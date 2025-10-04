import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches } from 'class-validator';

export class CreateContactDto {
  @ApiProperty({ example: 'Bruno Santos' })
  @IsString()
  @Matches(
    /^(?=(?:.*\b[\p{L}]{3,}\b){2,})[\p{L}]+(?:\s+(?:da|de|do|das|dos|e|[\p{L}]{3,}))+$/iu,
    {
      message:
        'Name should have at least two words with 3+ letters each; short connectors are allowed.',
    },
  )
  name: string;

  @ApiProperty({ example: '11999999999' })
  @IsString()
  cellphone: string;
}
