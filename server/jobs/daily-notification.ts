import { getUnsentPublicacoes, markPublicacaoAsEmailSent, saveDOUPublicacao } from "../db";
import { notifyOwner } from "../_core/notification";
import { searchDOU } from "../routers";

const ORGAOS_MONITORADOS = [
  "Ministério de Minas e Energia",
  "Ministério de Minas e Energia/Agência Nacional de Energia Elétrica",
];

export async function runDailyNotificationJob() {
  console.log("[Daily Job] Iniciando busca de novas publicações...");

  try {
    // Buscar publicações de hoje
    const hoje = new Date();
    const dataStr = `${String(hoje.getDate()).padStart(2, "0")}/${String(
      hoje.getMonth() + 1
    ).padStart(2, "0")}/${hoje.getFullYear()}`;

    // Buscar ambos os tipos
    const resultados = await searchDOU(dataStr, dataStr, "ambas");

    // Filtrar apenas órgãos monitorados
    const filtrados = resultados.filter((r: any) =>
      ORGAOS_MONITORADOS.includes(r.orgPrincipal || "")
    );

    console.log(
      `[Daily Job] Encontradas ${filtrados.length} publicações para órgãos monitorados`
    );

    // Salvar no banco de dados
    for (const pub of filtrados) {
      await saveDOUPublicacao({
        douId: pub.id,
        titulo: pub.title,
        orgao: pub.orgPrincipal || "",
        tipo: pub.title.includes("CONSULTA PÚBLICA")
          ? "consulta-publica"
          : "tomada-subsidios",
        dataPublicacao: new Date(pub.date),
      });
    }

    // Buscar publicações não enviadas
    const naoEnviadas = await getUnsentPublicacoes();

    if (naoEnviadas.length > 0) {
      // Preparar email
      const emailContent = formatarEmailContent(naoEnviadas);

      // Enviar notificação
      const enviado = await notifyOwner({
        title: `🔔 Novas Publicações do DOU - ${dataStr}`,
        content: emailContent,
      });

      if (enviado) {
        // Marcar como enviadas
        for (const pub of naoEnviadas) {
          await markPublicacaoAsEmailSent(pub.id);
        }
        console.log(
          `[Daily Job] Email enviado com ${naoEnviadas.length} publicações`
        );
      }
    } else {
      console.log("[Daily Job] Nenhuma publicação nova para enviar");
    }
  } catch (error) {
    console.error("[Daily Job] Erro ao executar job:", error);
  }
}

function formatarEmailContent(publicacoes: any[]): string {
  let content = `# Novas Publicações do DOU\n\n`;
  content += `Foram encontradas **${publicacoes.length}** novas publicações:\n\n`;

  for (const pub of publicacoes) {
    content += `## ${pub.titulo}\n`;
    content += `- **Órgão**: ${pub.orgao}\n`;
    content += `- **Tipo**: ${pub.tipo === "consulta-publica" ? "Consulta Pública" : "Tomada de Subsídios"}\n`;
    content += `- **Data**: ${new Date(pub.dataPublicacao).toLocaleDateString("pt-BR")}\n\n`;
  }

  return content;
}
