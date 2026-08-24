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

  /** Envia o e-mail de redefinição de senha com botão e link. */
  async sendPasswordResetEmail(
    to: string,
    name: string,
    link: string,
  ): Promise<void> {
    const subject = 'Redefina sua senha';
    const firstName = name.trim().split(/\s+/)[0] || 'aluno(a)';
    const html = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Redefina sua senha</title>
      </head>
      <body style="margin:0; padding:0; background-color:#f4f4f5; font-family:Arial, Helvetica, sans-serif;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5; padding:32px 16px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px; background-color:#ffffff; border-radius:12px; overflow:hidden; border:1px solid #e5e5e5;">
                <!-- Cabeçalho -->
                <tr>
                  <td style="background-color:#b91c1c; padding:28px 32px; text-align:center;">
                    <span style="font-size:34px; color:#ffffff; font-weight:bold; letter-spacing:2px;">功夫</span>
                    <p style="margin:6px 0 0; color:#fecaca; font-size:13px; letter-spacing:2px; text-transform:uppercase;">Kung Fu Cuiabá</p>
                  </td>
                </tr>
                <!-- Corpo -->
                <tr>
                  <td style="padding:32px 36px; color:#1f2937;">
                    <h1 style="margin:0 0 16px; font-size:22px; color:#111827;">Redefinição de senha</h1>
                    <p style="margin:0 0 12px; font-size:15px; line-height:1.6;">Olá, <strong>${firstName}</strong>!</p>
                    <p style="margin:0 0 20px; font-size:15px; line-height:1.6;">
                      Recebemos um pedido para redefinir a senha da sua conta no
                      <strong>Kung Fu Manager</strong>. Para criar uma nova senha,
                      clique no botão abaixo:
                    </p>
                    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 24px;">
                      <tr>
                        <td style="border-radius:8px; background-color:#b91c1c;">
                          <a href="${link}" style="display:inline-block; padding:14px 32px; background-color:#b91c1c; color:#ffffff; font-size:15px; font-weight:bold; text-decoration:none; border-radius:8px;">
                            Redefinir minha senha
                          </a>
                        </td>
                      </tr>
                    </table>
                    <p style="margin:0 0 8px; font-size:13px; color:#6b7280;">
                      Se o botão não funcionar, copie e cole o link abaixo no seu navegador:
                    </p>
                    <p style="margin:0 0 24px; font-size:13px; word-break:break-all;">
                      <a href="${link}" style="color:#b91c1c;">${link}</a>
                    </p>
                    <p style="margin:0; font-size:13px; line-height:1.6; color:#6b7280;">
                      <strong>Importante:</strong> este link é válido por <strong>1 hora</strong>.
                      Se você não solicitou a redefinição de senha, ignore este e-mail —
                      sua senha continuará a mesma.
                    </p>
                  </td>
                </tr>
                <!-- Rodapé -->
                <tr>
                  <td style="padding:20px 36px; background-color:#fafafa; border-top:1px solid #e5e5e5; text-align:center;">
                    <p style="margin:0; font-size:12px; color:#9ca3af;">
                      Kung Fu Manager · Disciplina no tatame, organização na secretaria
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    if (!this.transporter) {
      // Fallback de desenvolvimento: SMTP não configurado.
      console.log(`[mail] SMTP não configurado. Reset de senha para ${to}: ${link}`);
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
