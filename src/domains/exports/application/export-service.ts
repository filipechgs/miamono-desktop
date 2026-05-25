import type { ReceiptView } from "../../receipts/repository/receipt-repository.ts";

export interface ExportSummary {
  totalCount: number;
  totalAmountCents: number;
  averageAmountCents: number;
  monthlyAverageCents: number | null;
}

export interface ExportSection {
  label: string;
  totalCount: number;
  totalAmountCents: number;
  items: ReceiptView[];
}

export interface ExportDocument {
  title: string;
  fileNameBase: string;
  periodLabel: string;
  dateLabel: string;
  serviceLabel: string;
  payerLabel: string;
  invoiceLabel: string;
  generatedAtLabel: string;
  summary: ExportSummary;
  sections: ExportSection[];
}

const formatCurrency = (amountCents: number): string =>
  (amountCents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const formatDate = (isoDate: string): string => {
  const [year, month, day] = isoDate.split("-");
  return `${day}/${month}/${year}`;
};

const escapeCsv = (value: string): string => {
  const safe = value.replace(/"/g, '""');
  return `"${safe}"`;
};

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const renderSectionCsv = (section: ExportSection): string[] => {
  const lines: string[] = [
    `Mês;${section.label}`,
    "Data;Serviço;Pagador;Valor;Nota Fiscal;Observações",
  ];

  for (const item of section.items) {
    lines.push([
      escapeCsv(formatDate(item.receiptDate)),
      escapeCsv(item.serviceName),
      escapeCsv(item.payerFullName),
      escapeCsv(formatCurrency(item.amountCents)),
      escapeCsv(item.hasInvoice ? "Sim" : "Não"),
      escapeCsv(item.notes ?? ""),
    ].join(";"));
  }

  lines.push(`Total do mês;${section.totalCount}`);
  lines.push(`Valor do mês;${formatCurrency(section.totalAmountCents)}`);

  return lines;
};

const renderSectionHtml = (section: ExportSection): string => {
  const rows = section.items.length
    ? section.items
        .map((item) => `
          <tr>
            <td>${escapeHtml(formatDate(item.receiptDate))}</td>
            <td>${escapeHtml(item.serviceName)}</td>
            <td>${escapeHtml(item.payerFullName)}</td>
            <td class="col-right">${escapeHtml(formatCurrency(item.amountCents))}</td>
            <td class="col-center">${item.hasInvoice ? "Sim" : "Não"}</td>
            <td>${escapeHtml(item.notes ?? "")}</td>
          </tr>
        `)
        .join("")
    : `
          <tr>
            <td colspan="6" class="empty">Nenhum recebimento neste mês.</td>
          </tr>
        `;

  return `
    <section class="month-section">
      <div class="month-header">
        <h2>${escapeHtml(section.label)}</h2>
        <div class="month-summary">
          <span><strong>${section.totalCount}</strong> recebimento${section.totalCount !== 1 ? "s" : ""}</span>
          <span class="month-total">Total: <strong>${escapeHtml(formatCurrency(section.totalAmountCents))}</strong></span>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Data</th>
            <th>Serviço</th>
            <th>Pagador</th>
            <th class="col-right">Valor</th>
            <th class="col-center">NF</th>
            <th>Observações</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </section>
  `;
};

export class ExportService {
  toCsv(document: ExportDocument): string {
    const lines: string[] = [
      document.title,
      `Período;${document.periodLabel}`,
      `Data específica;${document.dateLabel}`,
      `Serviço;${document.serviceLabel}`,
      `Pagador;${document.payerLabel}`,
      `Somente com nota fiscal;${document.invoiceLabel}`,
      `Gerado em;${document.generatedAtLabel}`,
      `Total de registros;${document.summary.totalCount}`,
      `Valor total;${formatCurrency(document.summary.totalAmountCents)}`,
      `Média por recebimento;${formatCurrency(document.summary.averageAmountCents)}`,
    ];

    if (document.summary.monthlyAverageCents !== null) {
      lines.push(`Média mensal;${formatCurrency(document.summary.monthlyAverageCents)}`);
    }

    for (const section of document.sections) {
      lines.push("");
      lines.push(...renderSectionCsv(section));
    }

    // BOM ensures spreadsheet apps detect UTF-8 correctly.
    return `\uFEFF${lines.join("\n")}`;
  }

  toPdfHtml(document: ExportDocument): string {
    const sectionsHtml = document.sections.map(renderSectionHtml).join("");

    return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <style>
      body { font-family: Arial, sans-serif; color: #1f2937; margin: 28px; }
      h1 { margin: 0 0 12px; font-size: 20px; }
      .meta { margin-bottom: 16px; font-size: 12px; line-height: 1.5; }
      .meta strong { display: inline-block; width: 150px; }
      .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 12px; margin: 0 0 18px; }
      .summary-card { border: 1px solid #d1d5db; border-radius: 10px; padding: 10px 12px; }
      .summary-card span { display: block; font-size: 11px; color: #6b7280; }
      .summary-card strong { display: block; margin-top: 4px; font-size: 14px; color: #111827; }
      .summary-card.total-count { background: #fff5cc; }
      .summary-card.total-value { background: #d9f8e5; }
      .summary-card.avg-receipt { background: #dbeafe; }
      .summary-card.avg-month { background: #fce7f3; }
      .month-section { margin-top: 18px; page-break-inside: avoid; }
      .month-header { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; margin-bottom: 8px; }
      .month-header h2 { margin: 0; font-size: 15px; }
      .month-summary { display: flex; gap: 12px; font-size: 11px; color: #374151; }
      .month-summary .month-total { background: #fef3c7; border: 1px solid #fcd34d; border-radius: 999px; padding: 3px 8px; color: #78350f; }
      table { width: 100%; border-collapse: collapse; font-size: 11px; }
      th, td { border: 1px solid #d1d5db; padding: 6px 8px; vertical-align: top; }
      th { background: #f3f4f6; text-align: left; }
      .col-right { text-align: right; }
      .col-center { text-align: center; }
      .empty { text-align: center; color: #6b7280; }
    </style>
  </head>
  <body>
    <h1>${escapeHtml(document.title)}</h1>
    <div class="meta">
      <div><strong>Período:</strong> ${escapeHtml(document.periodLabel)}</div>
      <div><strong>Data específica:</strong> ${escapeHtml(document.dateLabel)}</div>
      <div><strong>Serviço:</strong> ${escapeHtml(document.serviceLabel)}</div>
      <div><strong>Pagador:</strong> ${escapeHtml(document.payerLabel)}</div>
      <div><strong>Somente com NF:</strong> ${escapeHtml(document.invoiceLabel)}</div>
      <div><strong>Gerado em:</strong> ${escapeHtml(document.generatedAtLabel)}</div>
    </div>

    <div class="summary">
      <div class="summary-card total-count"><span>Total de registros</span><strong>${document.summary.totalCount}</strong></div>
      <div class="summary-card total-value"><span>Valor total</span><strong>${escapeHtml(formatCurrency(document.summary.totalAmountCents))}</strong></div>
      <div class="summary-card avg-receipt"><span>Média por recebimento</span><strong>${escapeHtml(formatCurrency(document.summary.averageAmountCents))}</strong></div>
      ${document.summary.monthlyAverageCents !== null
        ? `<div class="summary-card avg-month"><span>Média mensal</span><strong>${escapeHtml(formatCurrency(document.summary.monthlyAverageCents))}</strong></div>`
        : ""}
    </div>

    ${sectionsHtml}
  </body>
</html>`;
  }
}
