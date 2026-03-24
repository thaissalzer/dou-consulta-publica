# Bug encontrado
- O título do resultado contém tags HTML de highlight (span) que não estão sendo removidas
- Exemplo: "AVISO DE <span class='highlight'...>CONSULTA</span> <span...>PÚBLICA</span> Nº 1/2026"
- Solução: aplicar strip HTML no título também, não só no abstract
