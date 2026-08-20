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

/** Retorna true quando a data é válida. */
function isValidDate(value: Date | null | undefined): value is Date {
  if (!value) {
    return false;
  }

  const asDate = new Date(value);
  return !Number.isNaN(asDate.getTime());
}

/** Primeira data definida da matrícula define o início do ciclo de cobrança.
 * Se houver startDate e registrationDate, considera a mais antiga como ancoragem.
 */
export function enrollmentChargeAnchor(
  enrollment: { registrationDate?: Date | null; startDate?: Date | null },
): Date {
  const candidates = [
    enrollment.registrationDate,
    enrollment.startDate,
  ].filter(isValidDate);

  if (candidates.length === 0) {
    return new Date();
  }

  return candidates.reduce((earliest, current) =>
    current.getTime() < earliest.getTime() ? current : earliest,
  );
}

/** A cobrança mensal começa no mês da primeira data definida e se repete nos meses seguintes. */
export function shouldGenerateChargeForMonth(anchor: Date, month: string): boolean {
  const { start } = monthRange(month);
  const anchorMonthStart = new Date(
    Date.UTC(anchor.getUTCFullYear(), anchor.getUTCMonth(), 1),
  );
  return start.getTime() >= anchorMonthStart.getTime();
}

/** Mantém o mesmo dia do ciclo inicial para os meses seguintes, sem fixar um dia global. */
export function resolveMonthlyDueDate(anchor: Date, month: string): Date {
  const [year, monthIndex] = month.split('-').map(Number);
  const lastDayOfMonth = new Date(Date.UTC(year, monthIndex, 0)).getUTCDate();
  const dueDay = Math.min(anchor.getUTCDate(), lastDayOfMonth);
  return new Date(Date.UTC(year, monthIndex - 1, dueDay));
}

/** Dia de vencimento padrão para o ciclo mensal caso ainda não exista data inicial. */
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
    select: {
      id: true,
      registrationDate: true,
      startDate: true,
    },
  });

  const fallbackAmount = defaultMonthlyFee();

  let created = 0;
  for (const enrollment of enrollments) {
    const anchor = enrollmentChargeAnchor(enrollment);
    if (!shouldGenerateChargeForMonth(anchor, month)) {
      continue;
    }

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
        dueDate: resolveMonthlyDueDate(anchor, month),
        paymentMethod: 'PIX',
        status: 'PENDING',
      },
    });
    created += 1;
  }

  return created;
}
