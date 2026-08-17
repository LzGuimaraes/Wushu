import { PrismaClient } from '@prisma/client';

export interface MonthRange {
  start: Date;
  end: Date;
}

/** Delegates mínimos necessários para gerar mensalidades (PrismaClient ou TransactionClient). */
export type MonthlyPaymentsDb = Pick<PrismaClient, 'enrollment' | 'payment'>;

/** Intervalo [início, fim) do mês "YYYY-MM" (UTC). */
export function monthRange(month: string): MonthRange {
  const [year, monthIndex] = month.split('-').map(Number);
  return {
    start: new Date(Date.UTC(year, monthIndex - 1, 1)),
    end: new Date(Date.UTC(year, monthIndex, 1)),
  };
}

/** Mês corrente no formato "YYYY-MM". */
export function currentMonth(): string {
  return new Date().toISOString().slice(0, 7);
}

/** Primeiro dia do mês "YYYY-MM" (usado como competência da mensalidade). */
export function competenceOf(month: string): Date {
  return monthRange(month).start;
}

/** Valor padrão da mensalidade (configurável por env), 0 se não definido. */
export function defaultMonthlyFee(): number {
  const value = Number(process.env.DEFAULT_MONTHLY_FEE);
  return Number.isFinite(value) && value > 0 ? value : 0;
}

/** Dia de vencimento padrão (env PAYMENT_DUE_DAY, padrão dia 10). */
export function defaultDueDate(month: string): Date {
  const day = Number(process.env.PAYMENT_DUE_DAY ?? '10') || 10;
  const { start } = monthRange(month);
  return new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), day));
}

/**
 * Gera uma mensalidade PENDING para cada matrícula ATIVA que ainda não possui
 * pagamento no mês informado. Idempotente graças a @@unique([enrollmentId, competence]).
 * O valor reutiliza a última mensalidade da matrícula; na ausência dela, usa o
 * valor padrão da escola (DEFAULT_MONTHLY_FEE).
 *
 * @returns quantidade de mensalidades criadas.
 */
export async function generatePendingMonthlyPayments(
  prisma: MonthlyPaymentsDb,
  month: string,
  options: { enrollmentId?: string } = {},
): Promise<number> {
  const { start, end } = monthRange(month);

  const enrollments = await prisma.enrollment.findMany({
    where: options.enrollmentId
      ? { status: 'ACTIVE', id: options.enrollmentId }
      : { status: 'ACTIVE' },
    select: { id: true },
  });

  const dueDate = defaultDueDate(month);
  const fallbackAmount = defaultMonthlyFee();

  let created = 0;
  for (const enrollment of enrollments) {
    const existing = await prisma.payment.findFirst({
      where: {
        enrollmentId: enrollment.id,
        competence: { gte: start, lt: end },
      },
      select: { id: true },
    });
    if (existing) continue;

    const last = await prisma.payment.findFirst({
      where: { enrollmentId: enrollment.id },
      orderBy: { competence: 'desc' },
      select: { amount: true },
    });
    const amount = last ? Number(last.amount) : fallbackAmount;

    await prisma.payment.create({
      data: {
        enrollmentId: enrollment.id,
        amount,
        competence: start,
        dueDate,
        paymentMethod: 'PIX',
        status: 'PENDING',
      },
    });
    created += 1;
  }

  return created;
}
