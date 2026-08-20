import {
  enrollmentChargeAnchor,
  generatePendingMonthlyPayments,
  resolveMonthlyDueDate,
  shouldGenerateChargeForMonth,
} from './monthly-payments.util';

describe('monthly payments recurrence', () => {
  it('uses the earliest defined enrollment date as the recurring billing anchor', () => {
    const anchor = enrollmentChargeAnchor({
      registrationDate: new Date('2026-08-05T00:00:00.000Z'),
      startDate: new Date('2026-08-15T00:00:00.000Z'),
    });

    expect(anchor.toISOString()).toBe('2026-08-05T00:00:00.000Z');
  });

  it('repeats monthly from that anchor month, without a fixed day of month', () => {
    const anchor = new Date('2026-08-05T00:00:00.000Z');

    expect(shouldGenerateChargeForMonth(anchor, '2026-08')).toBe(true);
    expect(shouldGenerateChargeForMonth(anchor, '2026-09')).toBe(true);
    expect(shouldGenerateChargeForMonth(anchor, '2026-07')).toBe(false);
  });

  it('keeps the day of the first billing date for future months', () => {
    const anchor = new Date('2026-08-05T00:00:00.000Z');

    expect(resolveMonthlyDueDate(anchor, '2026-09').toISOString()).toBe(
      '2026-09-05T00:00:00.000Z',
    );
  });

  it('creates a monthly charge based on the billing anchor instead of the month only', async () => {
    const prisma = {
      enrollment: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'enrollment-1',
            registrationDate: new Date('2026-08-05T00:00:00.000Z'),
            startDate: new Date('2026-08-15T00:00:00.000Z'),
          },
        ]),
      },
      payment: {
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({ id: 'payment-1' }),
      },
    } as any;

    await generatePendingMonthlyPayments(prisma, '2026-09');

    expect(prisma.payment.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        enrollmentId: 'enrollment-1',
        competence: new Date(Date.UTC(2026, 8, 1)),
        dueDate: new Date(Date.UTC(2026, 8, 5)),
        status: 'PENDING',
      }),
    });
  });
});
