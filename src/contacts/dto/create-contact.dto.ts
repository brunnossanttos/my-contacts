import { IsString, Matches } from 'class-validator';

export class CreateContactDto {
  @IsString()
  @Matches(/^[A-Za-zÀ-ÖØ-öø-ÿ]{3,}\s[A-Za-zÀ-ÖØ-öø-ÿ]{3,}$/, {
    message:
      'Name should be two words with at least 3 characters each, separated by a space',
  })
  name: string;

  @IsString()
  cellphone: string;
}
