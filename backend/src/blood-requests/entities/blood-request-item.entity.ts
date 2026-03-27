import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';

import { BaseEntity } from '../../common/entities/base.entity';

import { BloodRequestEntity } from './blood-request.entity';

@Entity('blood_request_items')
@Index('IDX_BLOOD_REQUEST_ITEMS_REQUEST_ID', ['requestId'])
@Index('IDX_BLOOD_REQUEST_ITEMS_BLOOD_TYPE', ['bloodType'])
export class BloodRequestItemEntity extends BaseEntity {
  @Column({ name: 'request_id', type: 'uuid' })
  requestId: string;

  @ManyToOne(() => BloodRequestEntity, (request) => request.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'request_id' })
  request: BloodRequestEntity;

  @Column({ name: 'blood_bank_id', type: 'varchar', length: 64 })
  bloodBankId: string;

  @Column({ name: 'blood_type', type: 'varchar', length: 16 })
  bloodType: string;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ name: 'fulfilled_quantity', type: 'int', default: 0 })
  fulfilledQuantity: number;
}
