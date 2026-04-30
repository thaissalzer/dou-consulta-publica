import { ENV } from "./env";

export interface EmailPayload {
  to: string;
  subject: string;
  htmlContent: string;
}

/**
 * Envia email usando a API de email do Manus (Forge)
 * Suporta envio de HTML emails
 */
export async function sendEmail(payload: EmailPayload): Promise<boolean> {
  try {
    if (!ENV.forgeApiUrl || !ENV.forgeApiKey) {
      console.warn("[Email] Serviço de email não configurado");
      return false;
    }

    const endpoint = new URL(
      "webdevtoken.v1.WebDevService/SendEmail",
      ENV.forgeApiUrl
    ).toString();

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "content-type": "application/json",
        "connect-protocol-version": "1",
      },
      body: JSON.stringify({
        to: payload.to,
        subject: payload.subject,
        html_content: payload.htmlContent,
      }),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(
        `[Email] Falha ao enviar email (${response.status} ${response.statusText})${
          detail ? `: ${detail}` : ""
        }`
      );
      return false;
    }

    console.log(`[Email] Email enviado com sucesso para ${payload.to}`);
    return true;
  } catch (error) {
    console.error("[Email] Erro ao enviar email:", error);
    return false;
  }
}

/**
 * Envia email de relatório diário
 */
export async function sendDailyReportEmail(
  to: string,
  subject: string,
  htmlContent: string
): Promise<boolean> {
  return sendEmail({
    to,
    subject,
    htmlContent,
  });
}
