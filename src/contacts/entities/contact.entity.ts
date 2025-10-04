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

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
