import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';

import { BaseEntity } from '../../common/entities/base.entity';
import { UserEntity } from '../../users/entities/user.entity';
import { RequestStatus } from '../enums/blood-request-status.enum';
import { UrgencyLevel } from '../enums/urgency-level.enum';

import { BloodRequestItemEntity } from './blood-request-item.entity';
import { RequestStatusHistoryEntity } from './request-status-history.entity';

@Entity('blood_requests')
@Index('IDX_BLOOD_REQUESTS_REQUEST_NUMBER', ['requestNumber'], { unique: true })
@Index('IDX_BLOOD_REQUESTS_HOSPITAL_ID', ['hospitalId'])
@Index('IDX_BLOOD_REQUESTS_STATUS', ['status'])
@Index('IDX_BLOOD_REQUESTS_URGENCY_LEVEL', ['urgencyLevel'])
@Index('IDX_BLOOD_REQUESTS_REQUIRED_BY', ['requiredBy'])
export class BloodRequestEntity extends BaseEntity {
  @Column({ name: 'request_number', type: 'varchar', length: 64 })
  requestNumber: string;

  @Column({ name: 'hospital_id', type: 'varchar', length: 64 })
  hospitalId: string;

  @ManyToOne(() => UserEntity, {
    nullable: false,
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'hospital_id' })
  hospital: UserEntity;

  @Column({ name: 'required_by', type: 'timestamptz' })
  requiredBy: Date;

  @Column({
    name: 'urgency_level',
    type: 'varchar',
    length: 24,
    default: UrgencyLevel.ROUTINE,
  })
  urgencyLevel: UrgencyLevel;

  @Column({ name: 'delivery_address', type: 'text', nullable: true })
  deliveryAddress: string | null;

  @Column({
    name: 'delivery_contact_name',
    type: 'varchar',
    length: 120,
    nullable: true,
  })
  deliveryContactName: string | null;

  @Column({
    name: 'delivery_contact_phone',
    type: 'varchar',
    length: 32,
    nullable: true,
  })
  deliveryContactPhone: string | null;

  @Column({ name: 'delivery_instructions', type: 'text', nullable: true })
  deliveryInstructions: string | null;

  @Column({
    name: 'delivery_window_start',
    type: 'timestamptz',
    nullable: true,
  })
  deliveryWindowStart: Date | null;

  @Column({ name: 'delivery_window_end', type: 'timestamptz', nullable: true })
  deliveryWindowEnd: Date | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({
    type: 'varchar',
    length: 32,
    default: RequestStatus.PENDING,
  })
  status: RequestStatus;

  @Column({ name: 'matched_at', type: 'timestamptz', nullable: true })
  matchedAt: Date | null;

  @Column({ name: 'approved_at', type: 'timestamptz', nullable: true })
  approvedAt: Date | null;

  @Column({ name: 'fulfilled_at', type: 'timestamptz', nullable: true })
  fulfilledAt: Date | null;

  @Column({ name: 'cancelled_at', type: 'timestamptz', nullable: true })
  cancelledAt: Date | null;

  @Column({ name: 'rejected_at', type: 'timestamptz', nullable: true })
  rejectedAt: Date | null;

  @Column({
    name: 'status_updated_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  statusUpdatedAt: Date;

  @Column({ name: 'sla_response_due_at', type: 'timestamptz', nullable: true })
  slaResponseDueAt: Date | null;

  @Column({
    name: 'sla_fulfillment_due_at',
    type: 'timestamptz',
    nullable: true,
  })
  slaFulfillmentDueAt: Date | null;

  @Column({
    name: 'blockchain_request_id',
    type: 'varchar',
    length: 128,
    nullable: true,
  })
  blockchainRequestId: string | null;

  @Column({
    name: 'blockchain_network',
    type: 'varchar',
    length: 64,
    nullable: true,
  })
  blockchainNetwork: string | null;

  @Column({
    name: 'blockchain_tx_hash',
    type: 'varchar',
    length: 256,
    nullable: true,
  })
  blockchainTxHash: string | null;

  @Column({
    name: 'blockchain_confirmed_at',
    type: 'timestamptz',
    nullable: true,
  })
  blockchainConfirmedAt: Date | null;

  @Column({
    name: 'created_by_user_id',
    type: 'varchar',
    length: 64,
    nullable: true,
  })
  createdByUserId: string | null;

  @ManyToOne(() => UserEntity, {
    nullable: true,
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'created_by_user_id' })
  createdByUser: UserEntity | null;

  @OneToMany(() => BloodRequestItemEntity, (item) => item.request, {
    cascade: true,
  })
  items: BloodRequestItemEntity[];

  @OneToMany(() => RequestStatusHistoryEntity, (history) => history.request, {
    cascade: true,
  })
  statusHistory: RequestStatusHistoryEntity[];
}
