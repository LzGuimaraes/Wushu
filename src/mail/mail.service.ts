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
    const html = this.renderLayout({
      name,
      headline: 'Confirmação de e-mail',
      messageHtml: `
        <p style="margin:0 0 20px; font-size:15px; line-height:1.6;">
          Você criou uma conta no <strong>Kung Fu Wushu</strong>. Para ativar o
          seu acesso, confirme o seu e-mail clicando no botão abaixo:
        </p>
      `,
      buttonLabel: 'Confirmar e-mail',
      link,
      footnote:
        'Este link é válido por <strong>24 horas</strong>. Se você não criou esta conta, pode ignorar este e-mail.',
    });

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
    const html = this.renderLayout({
      name,
      headline: 'Redefinição de senha',
      messageHtml: `
        <p style="margin:0 0 20px; font-size:15px; line-height:1.6;">
          Recebemos um pedido para redefinir a senha da sua conta no
          <strong>Kung Fu Wushu</strong>. Para criar uma nova senha,
          clique no botão abaixo:
        </p>
      `,
      buttonLabel: 'Redefinir minha senha',
      link,
      footnote:
        '<strong>Importante:</strong> este link é válido por <strong>1 hora</strong>. Se você não solicitou a redefinição de senha, ignore este e-mail — sua senha continuará a mesma.',
    });

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

  /**
   * Layout padrão dos e-mails transacionais: cabeçalho da marca, saudação,
   * texto, botão de ação, link de fallback e rodapé.
   */
  private renderLayout(options: {
    name: string;
    headline: string;
    messageHtml: string;
    buttonLabel: string;
    link: string;
    footnote: string;
  }): string {
    const firstName = options.name.trim().split(/\s+/)[0] || 'aluno(a)';
    return `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="x-apple-disable-message-reformatting" />
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <title>${options.headline}</title>
      </head>
      <body style="margin:0; padding:0; background-color:#f4efe6; font-family:'Helvetica Neue', Helvetica, Arial, sans-serif;">
        <!-- Pré-cabeçalho (oculto nos clientes de e-mail) -->
        <div style="display:none; max-height:0; overflow:hidden; opacity:0; font-size:1px; line-height:1px; color:#f4efe6;">
          ${options.headline} — Kung Fu Cuiabá
        </div>

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4efe6; padding:32px 16px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; background-color:#ffffff; border-radius:16px; overflow:hidden; border:1px solid #e7dfd2; box-shadow:0 12px 40px rgba(11,10,9,0.10);">

                <!-- Cabeçalho da marca -->
                <tr>
                  <td style="background:linear-gradient(135deg, #b91c1c 0%, #8f1414 100%); padding:36px 40px 30px; text-align:center;">
                    <div style="width:64px; height:64px; margin:0 auto 14px; border:2px solid #d9a441; border-radius:50%; line-height:60px; font-size:30px; color:#d9a441; font-weight:bold;">功夫</div>
                    <p style="margin:0 0 4px; color:#fecaca; font-size:12px; letter-spacing:3px; text-transform:uppercase; font-weight:600;">Kung Fu Cuiabá</p>
                    <p style="margin:0; color:#fdeceb; font-size:13px; opacity:.92;">Disciplina no tatame, organização na secretaria</p>
                  </td>
                </tr>

                <!-- Corpo -->
                <tr>
                  <td style="padding:34px 44px 26px; color:#1e1917;">
                    <h1 style="margin:0 0 8px; font-size:24px; color:#0b0a09; line-height:1.25;">${options.headline}</h1>
                    <div style="width:44px; height:3px; margin:0 0 22px; background:#d9a441; border-radius:2px;"></div>
                    <p style="margin:0 0 14px; font-size:15px; line-height:1.7; color:#3a332c;">Olá, <strong>${firstName}</strong>!</p>
                    ${options.messageHtml}
                    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:26px 0 6px;">
                      <tr>
                        <td style="border-radius:10px;">
                          <a href="${options.link}" style="display:inline-block; padding:16px 40px; background-color:#c81e1e; color:#ffffff; font-size:16px; font-weight:bold; text-decoration:none; border-radius:10px; letter-spacing:.4px; box-shadow:0 6px 18px rgba(200,30,30,0.35);">
                            ${options.buttonLabel}
                          </a>
                        </td>
                      </tr>
                    </table>
                    <p style="margin:16px 0 4px; font-size:12.5px; color:#8b827a;">Se o botão não funcionar, copie e cole o link abaixo no seu navegador:</p>
                    <p style="margin:0 0 22px; font-size:12.5px; word-break:break-all; background:#faf7f1; border:1px solid #eee6d8; border-radius:8px; padding:10px 12px;">
                      <a href="${options.link}" style="color:#b91c1c;">${options.link}</a>
                    </p>
                  </td>
                </tr>

                <!-- Aviso -->
                <tr>
                  <td style="padding:0 44px 30px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fbf1dc; border-left:3px solid #d9a441; border-radius:6px;">
                      <tr>
                        <td style="padding:12px 16px; font-size:13px; line-height:1.6; color:#7a5a12;">
                          ${options.footnote}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Rodapé -->
                <tr>
                  <td style="padding:22px 44px; background:#faf7f1; border-top:1px solid #eee6d8; text-align:center;">
                    <p style="margin:0 0 6px; font-family:Georgia, 'Times New Roman', serif; font-size:16px; color:#0b0a09;">功夫 · Kung Fu Manager</p>
                    <p style="margin:0; font-size:12px; color:#8b827a;">Este é um e-mail automático. Por favor, não responda a esta mensagem.</p>
                  </td>
                </tr>
              </table>

              <p style="margin:18px 0 0; font-size:11px; color:#a89e93;">© 2026 Kung Fu Cuiabá · Todos os direitos reservados</p>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  }
}
