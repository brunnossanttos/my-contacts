import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity('contacts')
@Unique(['cellphone'])
export class Contact {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  cellphone: string;

  /* @Column()
  favorite: boolean; */
}
