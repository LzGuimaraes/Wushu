import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

@Injectable()
export class MailService {
  private readonly transporter: Transporter | null;

  constructor() {
    const host = process.env.SMTP_HOST;
    if (host) {
      this.transporter = nodemailer.createTransport({
        host,
        port: Number(process.env.SMTP_PORT ?? 587),
        secure: Number(process.env.SMTP_PORT ?? 587) === 465,
        auth: process.env.SMTP_USER
          ? {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS,
            }
          : undefined,
      });
    } else {
      this.transporter = null;
    }
  }

  async sendConfirmationEmail(
    to: string,
    name: string,
    link: string,
  ): Promise<void> {
    const subject = 'Confirme seu e-mail';
    const html = `
      <div style="font-family: Arial, Helvetica, sans-serif; line-height:1.6; color:#111">
        <p>Olá, ${name}!</p>
        <p>Confirme seu e-mail clicando no botão abaixo:</p>
        <p>
          <a href="${link}" style="display:inline-block;padding:12px 20px;background:#1a73e8;color:#fff;border-radius:6px;text-decoration:none;">Confirmar e-mail</a>
        </p>
        <p>Se o botão não funcionar, copie e cole este link no navegador:</p>
        <p><a href="${link}">${link}</a></p>
      </div>
    `;

    if (!this.transporter) {
      // Fallback de desenvolvimento: SMTP não configurado.
      console.log(`[mail] SMTP não configurado. Confirmação para ${to}: ${link}`);
      return;
    }

    await this.transporter.sendMail({
      from:
        process.env.MAIL_FROM ??
        process.env.SMTP_USER ??
        'no-reply@kungfu.local',
      to,
      subject,
      html,
    });
  }
}
