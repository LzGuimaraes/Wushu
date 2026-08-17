import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';

import { PaymentsService } from './services/payments.service';
import { currentMonth } from '../common/utils/monthly-payments.util';

const DAY_IN_MS = 24 * 60 * 60 * 1000;

/**
 * Gera as mensalidades pendentes automaticamente (uma vez por dia + no boot),
 * garantindo que todo aluno ativo fique pendente 1x ao mês sem ação manual.
 */
@Injectable()
export class MonthlyPaymentsScheduler implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MonthlyPaymentsScheduler.name);
  private timer?: NodeJS.Timeout;

  constructor(private readonly paymentsService: PaymentsService) {}

  onModuleInit(): void {
    void this.run();
    this.timer = setInterval(() => void this.run(), DAY_IN_MS);
  }

  onModuleDestroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  private async run(): Promise<void> {
    try {
      const result =
        await this.paymentsService.generateMonthlyPayments(currentMonth());
      if (result.created > 0) {
        this.logger.log(
          `Mensalidades geradas automaticamente: ${result.created} (${result.month})`,
        );
      }
    } catch (error) {
      this.logger.error('Falha ao gerar mensalidades automáticas', error);
    }
  }
}
