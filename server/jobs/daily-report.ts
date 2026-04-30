import { searchDOU } from "../routers";

interface DailyReportResult {
  date: string;
  consultasPublicas: any[];
  tomadasSubsidios: any[];
  totalResults: number;
}

interface EmailReportPayload {
  to: string;
  subject: string;
  htmlContent: string;
}

/**
 * Gera um relatório completo de consultas públicas e tomadas de subsídios do dia
 */
export async function generateDailyReport(dateStr: string): Promise<DailyReportResult> {
  console.log(`[Daily Report] Gerando relatório para ${dateStr}...`);

  try {
    // Buscar ambos os tipos de documentos
    const consultasPublicas = await searchDOU(dateStr, dateStr, "consulta-publica");
    const tomadasSubsidios = await searchDOU(dateStr, dateStr, "tomada-subsidios");

    const totalResults = consultasPublicas.length + tomadasSubsidios.length;

    console.log(
      `[Daily Report] Encontrados ${consultasPublicas.length} consultas públicas e ${tomadasSubsidios.length} tomadas de subsídios`
    );

    return {
      date: dateStr,
      consultasPublicas,
      tomadasSubsidios,
      totalResults,
    };
  } catch (error) {
    console.error("[Daily Report] Erro ao gerar relatório:", error);
    throw error;
  }
}

/**
 * Formata o relatório em HTML para envio por email
 */
export function formatReportAsHTML(report: DailyReportResult): string {
  const { date, consultasPublicas, tomadasSubsidios, totalResults } = report;

  let html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Relatório DOU - ${date}</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f5f5f5;
      margin: 0;
      padding: 20px;
    }
    .container {
      max-width: 900px;
      margin: 0 auto;
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #1a5f3f 0%, #2d8659 100%);
      color: white;
      padding: 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 600;
    }
    .header p {
      margin: 10px 0 0 0;
      opacity: 0.9;
      font-size: 14px;
    }
    .content {
      padding: 30px;
    }
    .summary {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      margin-bottom: 30px;
    }
    .summary-card {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 6px;
      border-left: 4px solid #1a5f3f;
      text-align: center;
    }
    .summary-card h3 {
      margin: 0;
      color: #1a5f3f;
      font-size: 32px;
      font-weight: 700;
    }
    .summary-card p {
      margin: 8px 0 0 0;
      color: #666;
      font-size: 13px;
      font-weight: 500;
    }
    .section {
      margin-bottom: 30px;
    }
    .section h2 {
      color: #1a5f3f;
      font-size: 20px;
      border-bottom: 2px solid #1a5f3f;
      padding-bottom: 10px;
      margin-bottom: 20px;
    }
    .item {
      background: #f8f9fa;
      padding: 15px;
      margin-bottom: 15px;
      border-radius: 6px;
      border-left: 3px solid #2d8659;
    }
    .item h4 {
      margin: 0 0 8px 0;
      color: #1a5f3f;
      font-size: 15px;
      font-weight: 600;
    }
    .item-meta {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
      margin-top: 10px;
      font-size: 12px;
      color: #666;
    }
    .item-meta span {
      display: flex;
      align-items: center;
    }
    .item-meta strong {
      color: #333;
      margin-right: 5px;
    }
    .abstract {
      margin-top: 10px;
      font-size: 13px;
      color: #555;
      line-height: 1.5;
      padding: 10px;
      background: white;
      border-radius: 4px;
      border-left: 2px solid #ddd;
    }
    .empty-state {
      text-align: center;
      padding: 40px 20px;
      color: #999;
    }
    .empty-state p {
      margin: 0;
      font-size: 14px;
    }
    .footer {
      background: #f8f9fa;
      padding: 20px;
      text-align: center;
      border-top: 1px solid #eee;
      font-size: 12px;
      color: #999;
    }
    @media (max-width: 600px) {
      .summary {
        grid-template-columns: 1fr;
      }
      .item-meta {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📋 Relatório DOU</h1>
      <p>Consultas Públicas e Tomadas de Subsídios</p>
      <p style="font-size: 16px; margin-top: 15px; font-weight: 500;">${date}</p>
    </div>

    <div class="content">
      <div class="summary">
        <div class="summary-card">
          <h3>${totalResults}</h3>
          <p>Total de Publicações</p>
        </div>
        <div class="summary-card">
          <h3>${consultasPublicas.length}</h3>
          <p>Consultas Públicas</p>
        </div>
        <div class="summary-card">
          <h3>${tomadasSubsidios.length}</h3>
          <p>Tomadas de Subsídios</p>
        </div>
      </div>
  `;

  // Seção de Consultas Públicas
  if (consultasPublicas.length > 0) {
    html += `
      <div class="section">
        <h2>📢 Consultas Públicas (${consultasPublicas.length})</h2>
    `;

    consultasPublicas.forEach((item: any) => {
      html += `
        <div class="item">
          <h4>${escapeHtml(item.title)}</h4>
          <div class="item-meta">
            <span><strong>Órgão:</strong> ${escapeHtml(item.orgPrincipal || "N/A")}</span>
            <span><strong>Tipo:</strong> ${escapeHtml(item.documentType || "N/A")}</span>
            <span><strong>Seção:</strong> ${escapeHtml(item.section || "N/A")}</span>
            <span><strong>Data:</strong> ${escapeHtml(item.date || "N/A")}</span>
          </div>
          ${item.abstract ? `<div class="abstract">${escapeHtml(item.abstract.substring(0, 300))}...</div>` : ""}
        </div>
      `;
    });

    html += `</div>`;
  } else {
    html += `
      <div class="section">
        <h2>📢 Consultas Públicas</h2>
        <div class="empty-state">
          <p>Nenhuma consulta pública encontrada para este dia.</p>
        </div>
      </div>
    `;
  }

  // Seção de Tomadas de Subsídios
  if (tomadasSubsidios.length > 0) {
    html += `
      <div class="section">
        <h2>📝 Tomadas de Subsídios (${tomadasSubsidios.length})</h2>
    `;

    tomadasSubsidios.forEach((item: any) => {
      html += `
        <div class="item">
          <h4>${escapeHtml(item.title)}</h4>
          <div class="item-meta">
            <span><strong>Órgão:</strong> ${escapeHtml(item.orgPrincipal || "N/A")}</span>
            <span><strong>Tipo:</strong> ${escapeHtml(item.documentType || "N/A")}</span>
            <span><strong>Seção:</strong> ${escapeHtml(item.section || "N/A")}</span>
            <span><strong>Data:</strong> ${escapeHtml(item.date || "N/A")}</span>
          </div>
          ${item.abstract ? `<div class="abstract">${escapeHtml(item.abstract.substring(0, 300))}...</div>` : ""}
        </div>
      `;
    });

    html += `</div>`;
  } else {
    html += `
      <div class="section">
        <h2>📝 Tomadas de Subsídios</h2>
        <div class="empty-state">
          <p>Nenhuma tomada de subsídios encontrada para este dia.</p>
        </div>
      </div>
    `;
  }

  html += `
    </div>

    <div class="footer">
      <p>Relatório gerado automaticamente pelo sistema de Consultas Públicas do DOU</p>
      <p>Data de geração: ${new Date().toLocaleString("pt-BR")}</p>
    </div>
  </div>
</body>
</html>
  `;

  return html;
}

/**
 * Escapa caracteres HTML para evitar injeção
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}

/**
 * Envia o relatório por email
 */
export async function sendReportEmail(
  to: string,
  report: DailyReportResult
): Promise<boolean> {
  try {
    const { sendDailyReportEmail } = await import("../_core/email");
    
    const htmlContent = formatReportAsHTML(report);
    const subject = `📋 Relatório DOU - ${report.date} (${report.totalResults} publicações)`;

    console.log(`[Daily Report] Enviando email para ${to}...`);

    const success = await sendDailyReportEmail(to, subject, htmlContent);
    
    if (success) {
      console.log(`[Daily Report] Email enviado com sucesso para ${to}`);
    } else {
      console.warn(`[Daily Report] Falha ao enviar email para ${to}`);
    }

    return success;
  } catch (error) {
    console.error("[Daily Report] Erro ao enviar email:", error);
    return false;
  }
}
