import { RequestStatus } from '../enums/blood-request-status.enum';
import { UrgencyLevel } from '../enums/urgency-level.enum';

import { BloodRequestItemEntity } from './blood-request-item.entity';
import { BloodRequestEntity } from './blood-request.entity';
import { RequestStatusHistoryEntity } from './request-status-history.entity';

describe('BloodRequestEntity', () => {
  it('should create a BloodRequest instance with required fields', () => {
    const request = new BloodRequestEntity();
    request.id = 'req-uuid-1';
    request.requestNumber = 'BR-1234567890-ABC123';
    request.hospitalId = 'hospital-uuid-1';
    request.requiredBy = new Date('2026-03-28T14:00:00Z');
    request.status = RequestStatus.PENDING;
    request.urgencyLevel = UrgencyLevel.ROUTINE;
    request.statusUpdatedAt = new Date();

    expect(request.requestNumber).toBe('BR-1234567890-ABC123');
    expect(request.hospitalId).toBe('hospital-uuid-1');
    expect(request.status).toBe(RequestStatus.PENDING);
    expect(request.urgencyLevel).toBe(UrgencyLevel.ROUTINE);
  });

  it('should accept all RequestStatus enum values', () => {
    const request = new BloodRequestEntity();
    const statuses = [
      RequestStatus.PENDING,
      RequestStatus.MATCHED,
      RequestStatus.APPROVED,
      RequestStatus.IN_TRANSIT,
      RequestStatus.PARTIALLY_FULFILLED,
      RequestStatus.FULFILLED,
      RequestStatus.CANCELLED,
      RequestStatus.REJECTED,
      RequestStatus.EXPIRED,
    ];

    for (const status of statuses) {
      request.status = status;
      expect(request.status).toBe(status);
    }
  });

  it('should accept all UrgencyLevel enum values', () => {
    const request = new BloodRequestEntity();
    const urgencyLevels = [
      UrgencyLevel.CRITICAL,
      UrgencyLevel.URGENT,
      UrgencyLevel.ROUTINE,
      UrgencyLevel.SCHEDULED,
    ];

    for (const urgency of urgencyLevels) {
      request.urgencyLevel = urgency;
      expect(request.urgencyLevel).toBe(urgency);
    }
  });

  it('should track SLA deadline fields for critical requests', () => {
    const request = new BloodRequestEntity();
    request.urgencyLevel = UrgencyLevel.CRITICAL;
    const now = new Date();
    const slaResponseDue = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour

    request.slaResponseDueAt = slaResponseDue;
    expect(request.slaResponseDueAt).toBeDefined();
    expect(request.slaResponseDueAt?.getTime()).toBeLessThanOrEqual(
      new Date(now.getTime() + 90 * 60 * 1000).getTime(),
    );
  });

  it('should store lifecycle timestamps', () => {
    const request = new BloodRequestEntity();
    request.id = 'req-uuid-2';
    request.requestNumber = 'BR-test-001';
    request.status = RequestStatus.PENDING;
    request.statusUpdatedAt = new Date();

    expect(request.statusUpdatedAt).toBeDefined();
    expect(request.createdAt).toBeUndefined(); // Not set until persisted
  });

  it('should accept state transition timestamps', () => {
    const request = new BloodRequestEntity();
    request.id = 'req-uuid-3';
    request.status = RequestStatus.MATCHED;
    request.matchedAt = new Date('2026-03-27T10:00:00Z');

    request.status = RequestStatus.APPROVED;
    request.approvedAt = new Date('2026-03-27T11:00:00Z');

    request.status = RequestStatus.FULFILLED;
    request.fulfilledAt = new Date('2026-03-27T12:00:00Z');

    expect(request.matchedAt).toBeDefined();
    expect(request.approvedAt).toBeDefined();
    expect(request.fulfilledAt).toBeDefined();
  });

  it('should store blockchain reference fields', () => {
    const request = new BloodRequestEntity();
    request.blockchainRequestId = 'stellar-req-123';
    request.blockchainNetwork = 'stellar';
    request.blockchainTxHash = '0xabc123def456';
    request.blockchainConfirmedAt = new Date();

    expect(request.blockchainRequestId).toBe('stellar-req-123');
    expect(request.blockchainNetwork).toBe('stellar');
    expect(request.blockchainTxHash).toBe('0xabc123def456');
    expect(request.blockchainConfirmedAt).toBeDefined();
  });

  it('should store delivery details', () => {
    const request = new BloodRequestEntity();
    request.deliveryAddress = '123 Hospital Lane';
    request.deliveryContactName = 'Dr. Smith';
    request.deliveryContactPhone = '+234-8012345678';
    request.deliveryInstructions = 'Ring bell at main entrance';
    request.deliveryWindowStart = new Date('2026-03-28T08:00:00Z');
    request.deliveryWindowEnd = new Date('2026-03-28T17:00:00Z');

    expect(request.deliveryAddress).toBe('123 Hospital Lane');
    expect(request.deliveryContactName).toBe('Dr. Smith');
    expect(request.deliveryContactPhone).toBe('+234-8012345678');
    expect(request.deliveryInstructions).toBeDefined();
    expect(request.deliveryWindowStart).toBeDefined();
    expect(request.deliveryWindowEnd).toBeDefined();
  });

  it('should allow optional cancellation and rejection timestamps', () => {
    const request = new BloodRequestEntity();
    request.status = RequestStatus.CANCELLED;
    request.cancelledAt = new Date('2026-03-27T15:00:00Z');

    expect(request.cancelledAt).toBeDefined();

    const request2 = new BloodRequestEntity();
    request2.status = RequestStatus.REJECTED;
    request2.rejectedAt = new Date('2026-03-27T16:00:00Z');
    expect(request2.rejectedAt).toBeDefined();
  });

  it('should support multi-item requests with One-to-Many relationship', () => {
    const request = new BloodRequestEntity();
    request.items = [
      {
        id: 'item-1',
        requestId: 'req-uuid-1',
        bloodBankId: 'bank-1',
        bloodType: 'A+',
        quantity: 2,
        fulfilledQuantity: 0,
        request,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'item-2',
        requestId: 'req-uuid-1',
        bloodBankId: 'bank-2',
        bloodType: 'O-',
        quantity: 3,
        fulfilledQuantity: 0,
        request,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    expect(request.items).toHaveLength(2);
    expect(request.items[0].bloodType).toBe('A+');
    expect(request.items[1].bloodType).toBe('O-');
  });

  it('should extend BaseEntity with id, createdAt, updatedAt', () => {
    const request = new BloodRequestEntity();
    expect(request).toHaveProperty('id');
    expect(request).toHaveProperty('createdAt');
    expect(request).toHaveProperty('updatedAt');
  });
});

describe('BloodRequestItemEntity', () => {
  it('should create a RequestItem instance for a multi-item request', () => {
    const item = new BloodRequestItemEntity();
    item.id = 'item-uuid-1';
    item.requestId = 'req-uuid-1';
    item.bloodBankId = 'bank-1';
    item.bloodType = 'AB+';
    item.quantity = 4;
    item.fulfilledQuantity = 0;

    expect(item.bloodType).toBe('AB+');
    expect(item.quantity).toBe(4);
    expect(item.fulfilledQuantity).toBe(0);
  });

  it('should track fulfilled quantity separately from requested quantity', () => {
    const item = new BloodRequestItemEntity();
    item.quantity = 5;
    item.fulfilledQuantity = 3;

    expect(item.quantity).toBe(5);
    expect(item.fulfilledQuantity).toBe(3);
  });

  it('should link to a parent BloodRequest via ManyToOne', () => {
    const request = new BloodRequestEntity();
    request.id = 'req-uuid-1';
    request.requestNumber = 'BR-test-001';

    const item = new BloodRequestItemEntity();
    item.requestId = 'req-uuid-1';
    item.request = request;

    expect(item.request).toBe(request);
    expect(item.requestId).toBe('req-uuid-1');
  });
});

describe('RequestStatusHistoryEntity', () => {
  it('should create a status history record for state transitions', () => {
    const history = new RequestStatusHistoryEntity();
    history.id = 'history-uuid-1';
    history.requestId = 'req-uuid-1';
    history.previousStatus = RequestStatus.PENDING;
    history.newStatus = RequestStatus.MATCHED;
    history.reason = 'Blood units matched with inventory';
    history.changedByUserId = 'user-uuid-1';

    expect(history.previousStatus).toBe(RequestStatus.PENDING);
    expect(history.newStatus).toBe(RequestStatus.MATCHED);
    expect(history.reason).toBeDefined();
  });

  it('should support null previousStatus for initial creation', () => {
    const history = new RequestStatusHistoryEntity();
    history.previousStatus = null;
    history.newStatus = RequestStatus.PENDING;
    history.reason = 'Request created';

    expect(history.previousStatus).toBeNull();
    expect(history.newStatus).toBe(RequestStatus.PENDING);
  });

  it('should record who made status changes', () => {
    const history = new RequestStatusHistoryEntity();
    history.changedByUserId = 'admin-user-uuid';
    history.previousStatus = RequestStatus.MATCHED;
    history.newStatus = RequestStatus.APPROVED;

    expect(history.changedByUserId).toBe('admin-user-uuid');
  });

  it('should accept multiple state transitions in sequence', () => {
    const history1 = new RequestStatusHistoryEntity();
    history1.previousStatus = null;
    history1.newStatus = RequestStatus.PENDING;

    const history2 = new RequestStatusHistoryEntity();
    history2.previousStatus = RequestStatus.PENDING;
    history2.newStatus = RequestStatus.MATCHED;

    const history3 = new RequestStatusHistoryEntity();
    history3.previousStatus = RequestStatus.MATCHED;
    history3.newStatus = RequestStatus.APPROVED;

    expect(history1.newStatus).toBe(RequestStatus.PENDING);
    expect(history2.previousStatus).toBe(RequestStatus.PENDING);
    expect(history2.newStatus).toBe(RequestStatus.MATCHED);
    expect(history3.previousStatus).toBe(RequestStatus.MATCHED);
  });

  it('should link to a BloodRequest via ManyToOne', () => {
    const request = new BloodRequestEntity();
    request.id = 'req-uuid-1';
    request.requestNumber = 'BR-test-001';

    const history = new RequestStatusHistoryEntity();
    history.requestId = 'req-uuid-1';
    history.request = request;

    expect(history.request).toBe(request);
    expect(history.requestId).toBe('req-uuid-1');
  });

  it('should extend BaseEntity with id, createdAt, updatedAt', () => {
    const history = new RequestStatusHistoryEntity();
    expect(history).toHaveProperty('id');
    expect(history).toHaveProperty('createdAt');
    expect(history).toHaveProperty('updatedAt');
  });
});

describe('BloodRequest Workflow Integration', () => {
  it('should support complete request lifecycle with history audit trail', () => {
    const request = new BloodRequestEntity();
    request.id = 'req-uuid-complete';
    request.requestNumber = 'BR-lifecycle-001';
    request.hospitalId = 'hospital-1';
    request.status = RequestStatus.PENDING;
    request.urgencyLevel = UrgencyLevel.CRITICAL;

    const history: RequestStatusHistoryEntity[] = [];

    // Initial creation
    const h1 = new RequestStatusHistoryEntity();
    h1.requestId = request.id;
    h1.previousStatus = null;
    h1.newStatus = RequestStatus.PENDING;
    h1.reason = 'Request created';
    history.push(h1);

    request.status = RequestStatus.MATCHED;
    request.matchedAt = new Date();
    const h2 = new RequestStatusHistoryEntity();
    h2.requestId = request.id;
    h2.previousStatus = RequestStatus.PENDING;
    h2.newStatus = RequestStatus.MATCHED;
    h2.reason = 'Blood units matched';
    history.push(h2);

    request.status = RequestStatus.APPROVED;
    request.approvedAt = new Date();
    const h3 = new RequestStatusHistoryEntity();
    h3.requestId = request.id;
    h3.previousStatus = RequestStatus.MATCHED;
    h3.newStatus = RequestStatus.APPROVED;
    h3.reason = 'Request approved by admin';
    history.push(h3);

    request.status = RequestStatus.FULFILLED;
    request.fulfilledAt = new Date();
    const h4 = new RequestStatusHistoryEntity();
    h4.requestId = request.id;
    h4.previousStatus = RequestStatus.APPROVED;
    h4.newStatus = RequestStatus.FULFILLED;
    h4.reason = 'All items delivered';
    history.push(h4);

    request.statusHistory = history;

    expect(request.status).toBe(RequestStatus.FULFILLED);
    expect(request.statusHistory).toHaveLength(4);
    expect(request.statusHistory[0].newStatus).toBe(RequestStatus.PENDING);
    expect(request.statusHistory[3].newStatus).toBe(RequestStatus.FULFILLED);
  });

  it('should validate urgent request SLA expectations', () => {
    const request = new BloodRequestEntity();
    request.urgencyLevel = UrgencyLevel.URGENT;

    // URGENT = 4 hours response time
    const now = new Date();
    const slaResponseDue = new Date(now.getTime() + 4 * 60 * 60 * 1000);
    request.slaResponseDueAt = slaResponseDue;

    const timeDiffHours =
      (request.slaResponseDueAt.getTime() - now.getTime()) / (60 * 60 * 1000);
    expect(timeDiffHours).toBeGreaterThanOrEqual(3.9);
    expect(timeDiffHours).toBeLessThanOrEqual(4.1);
  });
});
