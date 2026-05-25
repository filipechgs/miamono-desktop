interface IpcResult<T> {
  ok: boolean;
  data?: T;
  errorMessage?: string;
}

interface ServiceData {
  id: number;
  serviceName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PayerData {
  id: number;
  payerFullName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ReceiptFilter {
  year: number;
  month?: number;
  date?: string;
  serviceId?: number;
  payerId?: number;
  hasInvoice?: boolean;
}

interface CreateReceiptInput {
  receiptDate: string;
  serviceId: number;
  payerId: number;
  amountCents: number;
  hasInvoice: boolean;
  notes: string | null;
}

interface ReceiptViewData {
  id: number;
  receiptDate: string;
  serviceId: number;
  serviceName: string;
  payerId: number;
  payerFullName: string;
  amountCents: number;
  hasInvoice: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ReceiptListResult {
  items: ReceiptViewData[];
  totalCount: number;
  totalAmountCents: number;
}

type ReceiptSortColumn = "receiptDate" | "serviceName" | "payerFullName" | "amountCents" | "hasInvoice";
type ReceiptSortDirection = "asc" | "desc";

interface ReceiptSortState {
  column: ReceiptSortColumn;
  direction: ReceiptSortDirection;
}

interface ExportSummary {
  totalCount: number;
  totalAmountCents: number;
  averageAmountCents: number;
  monthlyAverageCents: number | null;
}

interface ExportSection {
  label: string;
  totalCount: number;
  totalAmountCents: number;
  items: ReceiptViewData[];
}

interface ExportDocument {
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

type ExportPayload = ExportDocument;

declare global {
  interface Window {
    miamono: {
      appName: string;
      locale: string;
      services: {
        list: () => Promise<IpcResult<ServiceData[]>>;
        create: (serviceName: string) => Promise<IpcResult<ServiceData>>;
        update: (id: number, serviceName: string) => Promise<IpcResult<ServiceData>>;
        deactivate: (id: number) => Promise<IpcResult<boolean>>;
      };
      payers: {
        list: () => Promise<IpcResult<PayerData[]>>;
        create: (payerFullName: string) => Promise<IpcResult<PayerData>>;
        update: (id: number, payerFullName: string) => Promise<IpcResult<PayerData>>;
        deactivate: (id: number) => Promise<IpcResult<boolean>>;
      };
      receipts: {
        listYears: () => Promise<IpcResult<number[]>>;
        listFiltered: (filter: ReceiptFilter) => Promise<IpcResult<ReceiptListResult>>;
        create: (input: CreateReceiptInput) => Promise<IpcResult<ReceiptViewData>>;
        update: (id: number, input: CreateReceiptInput) => Promise<IpcResult<ReceiptViewData>>;
        remove: (id: number) => Promise<IpcResult<boolean>>;
      };
      exports: {
        exportCsv: (payload: ExportPayload) => Promise<IpcResult<{ saved: boolean; filePath?: string }>>;
        exportPdf: (payload: ExportPayload) => Promise<IpcResult<{ saved: boolean; filePath?: string }>>;
      };
    };
  }
}

const feedbackEl = document.getElementById("feedback") as HTMLParagraphElement;

const showFeedback = (message: string, isError = false): void => {
  feedbackEl.textContent = message;
  feedbackEl.className = isError ? "feedback error" : "feedback";

  clearTimeout((showFeedback as { _timer?: ReturnType<typeof setTimeout> })._timer);
  (showFeedback as { _timer?: ReturnType<typeof setTimeout> })._timer = setTimeout(() => {
    feedbackEl.textContent = "";
    feedbackEl.className = "feedback";
  }, 4000);
};

const serviceForm = document.getElementById("service-form") as HTMLFormElement;
const serviceIdInput = document.getElementById("service-id") as HTMLInputElement;
const serviceNameInput = document.getElementById("service-name") as HTMLInputElement;
const serviceList = document.getElementById("service-list") as HTMLUListElement;
const serviceCancelBtn = document.getElementById("service-cancel") as HTMLButtonElement;

const renderServiceList = (services: ServiceData[]): void => {
  serviceList.innerHTML = "";

  if (services.length === 0) {
    const empty = document.createElement("li");
    empty.textContent = "Nenhum serviço cadastrado.";
    empty.style.color = "var(--muted)";
    empty.style.fontSize = "0.9rem";
    serviceList.appendChild(empty);
    return;
  }

  for (const service of services) {
    const li = document.createElement("li");
    li.className = `list-item${service.isActive ? "" : " inactive"}`;

    const info = document.createElement("div");
    const title = document.createElement("span");
    title.className = "title";
    title.textContent = service.serviceName;
    const status = document.createElement("span");
    status.className = "subtitle";
    status.textContent = service.isActive ? "Ativo" : "Inativo";
    info.appendChild(title);
    info.appendChild(document.createElement("br"));
    info.appendChild(status);

    const actions = document.createElement("div");
    actions.className = "item-actions";

    if (service.isActive) {
      const editBtn = document.createElement("button");
      editBtn.type = "button";
      editBtn.textContent = "Editar";
      editBtn.className = "secondary";
      editBtn.addEventListener("click", () => {
        serviceIdInput.value = String(service.id);
        serviceNameInput.value = service.serviceName;
        serviceNameInput.focus();
      });
      actions.appendChild(editBtn);

      const deactivateBtn = document.createElement("button");
      deactivateBtn.type = "button";
      deactivateBtn.textContent = "Inativar";
      deactivateBtn.className = "danger";
      deactivateBtn.addEventListener("click", async () => {
        const result = await window.miamono.services.deactivate(service.id);
        if (result.ok) {
          showFeedback("Serviço inativado com sucesso.");
          await loadServices();
        } else {
          showFeedback(result.errorMessage ?? "Erro ao inativar serviço.", true);
        }
      });
      actions.appendChild(deactivateBtn);
    }

    li.appendChild(info);
    li.appendChild(actions);
    serviceList.appendChild(li);
  }
};

const loadServices = async (): Promise<void> => {
  const result = await window.miamono.services.list();
  if (result.ok && result.data) renderServiceList(result.data);
};

const resetServiceForm = (): void => {
  serviceIdInput.value = "";
  serviceNameInput.value = "";
  serviceForm.reset();
};

serviceCancelBtn.addEventListener("click", resetServiceForm);

serviceForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const name = serviceNameInput.value.trim();
  if (!name) return;

  const existingId = serviceIdInput.value ? Number(serviceIdInput.value) : null;

  if (existingId) {
    const result = await window.miamono.services.update(existingId, name);
    if (result.ok) {
      showFeedback("Serviço atualizado com sucesso.");
      resetServiceForm();
      await loadServices();
    } else {
      showFeedback(result.errorMessage ?? "Erro ao atualizar serviço.", true);
    }
  } else {
    const result = await window.miamono.services.create(name);
    if (result.ok) {
      showFeedback("Serviço cadastrado com sucesso.");
      resetServiceForm();
      await loadServices();
    } else {
      showFeedback(result.errorMessage ?? "Erro ao cadastrar serviço.", true);
    }
  }
});

const payerForm = document.getElementById("payer-form") as HTMLFormElement;
const payerIdInput = document.getElementById("payer-id") as HTMLInputElement;
const payerNameInput = document.getElementById("payer-name") as HTMLInputElement;
const payerList = document.getElementById("payer-list") as HTMLUListElement;
const payerCancelBtn = document.getElementById("payer-cancel") as HTMLButtonElement;

const renderPayerList = (payers: PayerData[]): void => {
  payerList.innerHTML = "";

  if (payers.length === 0) {
    const empty = document.createElement("li");
    empty.textContent = "Nenhum pagador cadastrado.";
    empty.style.color = "var(--muted)";
    empty.style.fontSize = "0.9rem";
    payerList.appendChild(empty);
    return;
  }

  for (const payer of payers) {
    const li = document.createElement("li");
    li.className = `list-item${payer.isActive ? "" : " inactive"}`;

    const info = document.createElement("div");
    const title = document.createElement("span");
    title.className = "title";
    title.textContent = payer.payerFullName;
    const status = document.createElement("span");
    status.className = "subtitle";
    status.textContent = payer.isActive ? "Ativo" : "Inativo";
    info.appendChild(title);
    info.appendChild(document.createElement("br"));
    info.appendChild(status);

    const actions = document.createElement("div");
    actions.className = "item-actions";

    if (payer.isActive) {
      const editBtn = document.createElement("button");
      editBtn.type = "button";
      editBtn.textContent = "Editar";
      editBtn.className = "secondary";
      editBtn.addEventListener("click", () => {
        payerIdInput.value = String(payer.id);
        payerNameInput.value = payer.payerFullName;
        payerNameInput.focus();
      });
      actions.appendChild(editBtn);

      const deactivateBtn = document.createElement("button");
      deactivateBtn.type = "button";
      deactivateBtn.textContent = "Inativar";
      deactivateBtn.className = "danger";
      deactivateBtn.addEventListener("click", async () => {
        const result = await window.miamono.payers.deactivate(payer.id);
        if (result.ok) {
          showFeedback("Pagador inativado com sucesso.");
          await loadPayers();
        } else {
          showFeedback(result.errorMessage ?? "Erro ao inativar pagador.", true);
        }
      });
      actions.appendChild(deactivateBtn);
    }

    li.appendChild(info);
    li.appendChild(actions);
    payerList.appendChild(li);
  }
};

const loadPayers = async (): Promise<void> => {
  const result = await window.miamono.payers.list();
  if (result.ok && result.data) renderPayerList(result.data);
};

const resetPayerForm = (): void => {
  payerIdInput.value = "";
  payerNameInput.value = "";
  payerForm.reset();
};

payerCancelBtn.addEventListener("click", resetPayerForm);

payerForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const name = payerNameInput.value.trim();
  if (!name) return;

  const existingId = payerIdInput.value ? Number(payerIdInput.value) : null;

  if (existingId) {
    const result = await window.miamono.payers.update(existingId, name);
    if (result.ok) {
      showFeedback("Pagador atualizado com sucesso.");
      resetPayerForm();
      await loadPayers();
    } else {
      showFeedback(result.errorMessage ?? "Erro ao atualizar pagador.", true);
    }
  } else {
    const result = await window.miamono.payers.create(name);
    if (result.ok) {
      showFeedback("Pagador cadastrado com sucesso.");
      resetPayerForm();
      await loadPayers();
    } else {
      showFeedback(result.errorMessage ?? "Erro ao cadastrar pagador.", true);
    }
  }
});

await loadServices();
await loadPayers();

const viewRegistrations = document.getElementById("view-registrations") as HTMLDivElement;
const viewReceipts = document.getElementById("view-receipts") as HTMLDivElement;

document.querySelectorAll<HTMLButtonElement>(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", async () => {
    document.querySelectorAll<HTMLButtonElement>(".tab-btn").forEach((b) => {
      b.classList.remove("active");
      b.setAttribute("aria-selected", "false");
    });

    btn.classList.add("active");
    btn.setAttribute("aria-selected", "true");

    if (btn.dataset.view === "registrations") {
      viewRegistrations.hidden = false;
      viewReceipts.hidden = true;
    } else {
      viewRegistrations.hidden = true;
      viewReceipts.hidden = false;
      await initReceiptsView();
    }
  });
});

const MONTH_LABELS = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const formatCurrency = (cents: number): string =>
  (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const formatCurrencyInput = (cents: number): string =>
  (cents / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const parseCurrencyInputToCents = (value: string): number | null => {
  const digitsOnly = value.replace(/\D/g, "");
  if (!digitsOnly) return null;

  const cents = Number(digitsOnly);
  if (!Number.isFinite(cents) || cents <= 0) return null;

  return cents;
};

const formatDate = (isoDate: string): string => {
  const [year, month, day] = isoDate.split("-");
  return `${day}/${month}/${year}`;
};

const formatMonthLabel = (month: number, year: number): string => `${MONTH_LABELS[month - 1]} de ${year}`;
const formatMonthShortLabel = (month: number, year: number): string => `${String(month).padStart(2, "0")}/${year}`;

const receiptFilterForm = document.getElementById("receipt-filter-form") as HTMLFormElement;
const filterYearSelect = document.getElementById("filter-year") as HTMLSelectElement;
const filterMonthSelect = document.getElementById("filter-month") as HTMLSelectElement;
const filterDateInput = document.getElementById("filter-date") as HTMLInputElement;
const filterServiceSelect = document.getElementById("filter-service") as HTMLSelectElement;
const filterPayerSelect = document.getElementById("filter-payer") as HTMLSelectElement;
const filterHasInvoiceCheckbox = document.getElementById("filter-has-invoice") as HTMLInputElement;
const btnFilterClear = document.getElementById("btn-filter-clear") as HTMLButtonElement;

const receiptFormPanel = document.getElementById("receipt-form-panel") as HTMLElement;
const receiptFormTitleEl = document.getElementById("receipt-form-title") as HTMLHeadingElement;
const receiptForm = document.getElementById("receipt-form") as HTMLFormElement;
const receiptIdInput = document.getElementById("receipt-id") as HTMLInputElement;
const receiptDateInput = document.getElementById("receipt-date") as HTMLInputElement;
const receiptAmountInput = document.getElementById("receipt-amount") as HTMLInputElement;
const receiptServiceSelect = document.getElementById("receipt-service") as HTMLSelectElement;
const receiptPayerSelect = document.getElementById("receipt-payer") as HTMLSelectElement;
const receiptHasInvoiceCheckbox = document.getElementById("receipt-has-invoice") as HTMLInputElement;
const receiptNotesTextarea = document.getElementById("receipt-notes") as HTMLTextAreaElement;
const receiptCancelBtn = document.getElementById("receipt-cancel") as HTMLButtonElement;

const receiptTotalsEl = document.getElementById("receipt-totals") as HTMLDivElement;
const receiptSummaryEl = document.getElementById("receipt-summary") as HTMLDivElement;
const receiptHintEl = document.getElementById("receipt-hint") as HTMLParagraphElement;
const receiptEmptyEl = document.getElementById("receipt-empty") as HTMLParagraphElement;
const receiptSectionsEl = document.getElementById("receipt-sections") as HTMLDivElement;
const btnExportCsv = document.getElementById("btn-export-csv") as HTMLButtonElement;
const btnExportPdf = document.getElementById("btn-export-pdf") as HTMLButtonElement;
const btnNewReceipt = document.getElementById("btn-new-receipt") as HTMLButtonElement;

let receiptViewServices: ServiceData[] = [];
let receiptViewPayers: PayerData[] = [];
let currentReceiptFilter: ReceiptFilter | null = null;
let currentReceiptItems: ReceiptViewData[] = [];
let currentReceiptDocument: ExportDocument | null = null;
let receiptSortState: ReceiptSortState = { column: "receiptDate", direction: "desc" };

const setExportButtonsEnabled = (enabled: boolean): void => {
  btnExportCsv.disabled = !enabled;
  btnExportPdf.disabled = !enabled;
};

const populateSelectOptions = (
  select: HTMLSelectElement,
  items: { id: number; label: string }[],
  placeholder: string,
): void => {
  const currentValue = select.value;
  select.innerHTML = `<option value="">${placeholder}</option>`;

  for (const item of items) {
    const option = document.createElement("option");
    option.value = String(item.id);
    option.textContent = item.label;
    select.appendChild(option);
  }

  select.value = currentValue;
};

const populateYearOptions = (select: HTMLSelectElement, years: number[]): void => {
  const currentValue = select.value;
  select.innerHTML = "";

  for (const year of years) {
    const option = document.createElement("option");
    option.value = String(year);
    option.textContent = String(year);
    select.appendChild(option);
  }

  if (years.length === 0) {
    select.value = "";
    return;
  }

  select.value = currentValue && years.includes(Number(currentValue))
    ? currentValue
    : String(years[0]);
};

const populateMonthOptions = (select: HTMLSelectElement): void => {
  const currentValue = select.value;
  select.innerHTML = `<option value="">Todos os meses</option>`;

  MONTH_LABELS.forEach((label, index) => {
    const option = document.createElement("option");
    option.value = String(index + 1);
    option.textContent = label;
    select.appendChild(option);
  });

  select.value = currentValue;
};

const getSelectedServiceLabel = (): string => {
  if (!filterServiceSelect.value) return "Todos os serviços";

  return receiptViewServices.find((item) => item.id === Number(filterServiceSelect.value))?.serviceName ?? "Selecionado";
};

const getSelectedPayerLabel = (): string => {
  if (!filterPayerSelect.value) return "Todos os pagadores";

  return receiptViewPayers.find((item) => item.id === Number(filterPayerSelect.value))?.payerFullName ?? "Selecionado";
};

const buildFilter = (): ReceiptFilter | null => {
  if (!filterYearSelect.value) return null;

  const filter: ReceiptFilter = { year: Number(filterYearSelect.value) };

  if (filterMonthSelect.value) filter.month = Number(filterMonthSelect.value);
  if (filterDateInput.value) filter.date = filterDateInput.value;
  if (filterServiceSelect.value) filter.serviceId = Number(filterServiceSelect.value);
  if (filterPayerSelect.value) filter.payerId = Number(filterPayerSelect.value);
  if (filterHasInvoiceCheckbox.checked) filter.hasInvoice = true;

  return filter;
};

const sortReceiptItems = (items: ReceiptViewData[], sortState: ReceiptSortState): ReceiptViewData[] => {
  const sortedItems = [...items];

  sortedItems.sort((left, right) => {
    let comparison = 0;

    switch (sortState.column) {
      case "receiptDate":
        comparison = left.receiptDate.localeCompare(right.receiptDate);
        break;
      case "serviceName":
        comparison = left.serviceName.localeCompare(right.serviceName, "pt-BR", { sensitivity: "base" });
        break;
      case "payerFullName":
        comparison = left.payerFullName.localeCompare(right.payerFullName, "pt-BR", { sensitivity: "base" });
        break;
      case "amountCents":
        comparison = left.amountCents - right.amountCents;
        break;
      case "hasInvoice":
        comparison = Number(left.hasInvoice) - Number(right.hasInvoice);
        break;
    }

    return sortState.direction === "asc" ? comparison : -comparison;
  });

  return sortedItems;
};

const buildReceiptSections = (items: ReceiptViewData[], filter: ReceiptFilter, sortState: ReceiptSortState): ExportSection[] => {
  const sortedItems = sortReceiptItems(items, sortState);

  if (filter.month) {
    const totalAmountCents = sortedItems.reduce((sum, item) => sum + item.amountCents, 0);
    return [{
      label: formatMonthLabel(filter.month, filter.year),
      totalCount: sortedItems.length,
      totalAmountCents,
      items: sortedItems,
    }];
  }

  const grouped = new Map<number, ReceiptViewData[]>();

  for (const item of sortedItems) {
    const month = Number(item.receiptDate.slice(5, 7));
    const current = grouped.get(month) ?? [];
    current.push(item);
    grouped.set(month, current);
  }

  return Array.from(grouped.entries())
    .sort(([leftMonth], [rightMonth]) => rightMonth - leftMonth)
    .map(([month, monthItems]) => ({
      label: formatMonthLabel(month, filter.year),
      totalCount: monthItems.length,
      totalAmountCents: monthItems.reduce((sum, item) => sum + item.amountCents, 0),
      items: monthItems,
    }));
};

const buildReceiptDocument = (): ExportDocument | null => {
  if (!currentReceiptFilter) return null;

  const sections = buildReceiptSections(currentReceiptItems, currentReceiptFilter, receiptSortState);
  const totalCount = currentReceiptItems.length;
  const totalAmountCents = currentReceiptItems.reduce((sum, item) => sum + item.amountCents, 0);
  const averageAmountCents = totalCount ? Math.round(totalAmountCents / totalCount) : 0;
  const monthlyAverageCents = sections.length > 1
    ? Math.round(sections.reduce((sum, section) => sum + section.totalAmountCents, 0) / sections.length)
    : null;
  const periodLabel = currentReceiptFilter.month
    ? formatMonthShortLabel(currentReceiptFilter.month, currentReceiptFilter.year)
    : `Ano ${currentReceiptFilter.year}`;

  return {
    title: "Relatório de Recebimentos",
    fileNameBase: currentReceiptFilter.month
      ? `recebimentos_${currentReceiptFilter.year}-${String(currentReceiptFilter.month).padStart(2, "0")}`
      : `recebimentos_${currentReceiptFilter.year}`,
    periodLabel,
    dateLabel: currentReceiptFilter.date ? formatDate(currentReceiptFilter.date) : "Todas as datas",
    serviceLabel: getSelectedServiceLabel(),
    payerLabel: getSelectedPayerLabel(),
    invoiceLabel: currentReceiptFilter.hasInvoice ? "Sim" : "Não",
    generatedAtLabel: new Date().toLocaleString("pt-BR"),
    summary: { totalCount, totalAmountCents, averageAmountCents, monthlyAverageCents },
    sections,
  };
};

const renderSummary = (documentModel: ExportDocument): void => {
  receiptTotalsEl.innerHTML = `${documentModel.periodLabel} &mdash; <strong>${documentModel.summary.totalCount}</strong> recebimento${documentModel.summary.totalCount !== 1 ? "s" : ""} &mdash; Total: <strong>${formatCurrency(documentModel.summary.totalAmountCents)}</strong>`;

  const monthlyAverageMetric = documentModel.summary.monthlyAverageCents !== null
    ? `<div class="summary-metric"><span>Média mensal</span><strong>${formatCurrency(documentModel.summary.monthlyAverageCents)}</strong></div>`
    : "";

  receiptSummaryEl.hidden = false;
  receiptSummaryEl.innerHTML = `
    <div class="summary-metric"><span>Período</span><strong>${documentModel.periodLabel}</strong></div>
    <div class="summary-metric"><span>Total recebido</span><strong>${formatCurrency(documentModel.summary.totalAmountCents)}</strong></div>
    <div class="summary-metric"><span>Média por recebimento</span><strong>${formatCurrency(documentModel.summary.averageAmountCents)}</strong></div>
    ${monthlyAverageMetric}
  `;
};

const renderSortSelect = (column: ReceiptSortColumn, currentValue: ReceiptSortDirection | ""): HTMLSelectElement => {
  const select = document.createElement("select");
  select.className = "sort-select";
  select.dataset.sortColumn = column;
  select.innerHTML = `
    <option value="">Ordenar</option>
    <option value="asc">Menor / A-Z</option>
    <option value="desc">Maior / Z-A</option>
  `;
  select.value = currentValue;

  select.addEventListener("change", () => {
    const direction = select.value as ReceiptSortDirection | "";
    if (!direction) return;

    receiptSortState = { column, direction };
    renderCurrentReceiptsView();
  });

  return select;
};

const renderTableHeader = (): HTMLTableSectionElement => {
  const thead = document.createElement("thead");
  const row = document.createElement("tr");

  const columns: Array<{ label: string; sortable?: ReceiptSortColumn; className?: string }> = [
    { label: "Data", sortable: "receiptDate" },
    { label: "Serviço", sortable: "serviceName" },
    { label: "Pagador", sortable: "payerFullName" },
    { label: "Valor", sortable: "amountCents", className: "col-right" },
    { label: "NF", sortable: "hasInvoice", className: "col-center" },
    { label: "Observações" },
    { label: "" },
  ];

  for (const column of columns) {
    const th = document.createElement("th");
    if (column.className) th.className = column.className;

    if (column.sortable) {
      const wrapper = document.createElement("div");
      wrapper.className = "sortable-header";

      const label = document.createElement("span");
      label.textContent = column.label;

      const currentValue = receiptSortState.column === column.sortable ? receiptSortState.direction : "";
      wrapper.appendChild(label);
      wrapper.appendChild(renderSortSelect(column.sortable, currentValue));
      th.appendChild(wrapper);
    } else {
      th.textContent = column.label;
    }

    row.appendChild(th);
  }

  thead.appendChild(row);
  return thead;
};

const openReceiptEditForm = (item: ReceiptViewData): void => {
  receiptIdInput.value = String(item.id);
  receiptDateInput.value = item.receiptDate;
  receiptAmountInput.value = formatCurrencyInput(item.amountCents);
  receiptServiceSelect.value = String(item.serviceId);
  receiptPayerSelect.value = String(item.payerId);
  receiptHasInvoiceCheckbox.checked = item.hasInvoice;
  receiptNotesTextarea.value = item.notes ?? "";
  receiptFormTitleEl.textContent = "Editar Recebimento";
  receiptFormPanel.hidden = false;
  receiptDateInput.focus();
};

const renderReceiptSectionTable = (section: ExportSection): HTMLDivElement => {
  const container = document.createElement("div");
  container.className = "month-section-card";

  const header = document.createElement("div");
  header.className = "month-header";

  const title = document.createElement("h3");
  title.textContent = section.label;

  const monthSummary = document.createElement("div");
  monthSummary.className = "month-summary";
  monthSummary.innerHTML = `<span><strong>${section.totalCount}</strong> recebimento${section.totalCount !== 1 ? "s" : ""}</span><span>Total: <strong>${formatCurrency(section.totalAmountCents)}</strong></span>`;

  header.appendChild(title);
  header.appendChild(monthSummary);

  const wrapper = document.createElement("div");
  wrapper.className = "table-wrapper";

  const table = document.createElement("table");
  table.className = "data-table";
  table.appendChild(renderTableHeader());

  const tbody = document.createElement("tbody");

  if (section.items.length === 0) {
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = 7;
    td.className = "empty-table-cell";
    td.textContent = "Nenhum recebimento neste período.";
    tr.appendChild(td);
    tbody.appendChild(tr);
  } else {
    for (const item of section.items) {
      const tr = document.createElement("tr");

      const tdDate = document.createElement("td");
      tdDate.textContent = formatDate(item.receiptDate);

      const tdService = document.createElement("td");
      tdService.textContent = item.serviceName;

      const tdPayer = document.createElement("td");
      tdPayer.textContent = item.payerFullName;

      const tdAmount = document.createElement("td");
      tdAmount.className = "col-right";
      tdAmount.textContent = formatCurrency(item.amountCents);

      const tdInvoice = document.createElement("td");
      tdInvoice.className = "col-center";
      tdInvoice.textContent = item.hasInvoice ? "✓" : "—";

      const tdNotes = document.createElement("td");
      tdNotes.textContent = item.notes ?? "";
      tdNotes.className = "col-notes";

      const tdActions = document.createElement("td");
      const actionsDiv = document.createElement("div");
      actionsDiv.className = "item-actions";

      const editBtn = document.createElement("button");
      editBtn.type = "button";
      editBtn.textContent = "Editar";
      editBtn.className = "secondary";
      editBtn.addEventListener("click", () => openReceiptEditForm(item));

      const removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.textContent = "Excluir";
      removeBtn.className = "danger";
      removeBtn.addEventListener("click", async () => {
        if (!confirm(`Excluir o recebimento de ${formatCurrency(item.amountCents)} em ${formatDate(item.receiptDate)}?`)) return;

        const result = await window.miamono.receipts.remove(item.id);
        if (result.ok) {
          showFeedback("Recebimento excluído.");
          await runFilter();
        } else {
          showFeedback(result.errorMessage ?? "Erro ao excluir recebimento.", true);
        }
      });

      actionsDiv.appendChild(editBtn);
      actionsDiv.appendChild(removeBtn);
      tdActions.appendChild(actionsDiv);

      tr.appendChild(tdDate);
      tr.appendChild(tdService);
      tr.appendChild(tdPayer);
      tr.appendChild(tdAmount);
      tr.appendChild(tdInvoice);
      tr.appendChild(tdNotes);
      tr.appendChild(tdActions);
      tbody.appendChild(tr);
    }
  }

  table.appendChild(tbody);
  wrapper.appendChild(table);
  container.appendChild(header);
  container.appendChild(wrapper);
  return container;
};

const renderCurrentReceiptsView = (): void => {
  const documentModel = buildReceiptDocument();
  currentReceiptDocument = documentModel;

  receiptSectionsEl.innerHTML = "";

  if (!documentModel || documentModel.summary.totalCount === 0) {
    receiptTotalsEl.textContent = "";
    receiptSummaryEl.hidden = true;
    receiptEmptyEl.hidden = false;
    receiptHintEl.hidden = true;
    setExportButtonsEnabled(false);
    return;
  }

  receiptEmptyEl.hidden = true;
  receiptHintEl.hidden = true;
  renderSummary(documentModel);
  setExportButtonsEnabled(true);

  for (const section of documentModel.sections) {
    receiptSectionsEl.appendChild(renderReceiptSectionTable(section));
  }
};

const initReceiptsView = async (): Promise<void> => {
  const [yearsResult, servicesResult, payersResult] = await Promise.all([
    window.miamono.receipts.listYears(),
    window.miamono.services.list(),
    window.miamono.payers.list(),
  ]);

  const years = yearsResult.ok && yearsResult.data
    ? yearsResult.data
    : [];

  populateYearOptions(filterYearSelect, years);
  populateMonthOptions(filterMonthSelect);

  if (servicesResult.ok && servicesResult.data) {
    receiptViewServices = servicesResult.data.filter((s) => s.isActive);
    const serviceItems = receiptViewServices.map((s) => ({ id: s.id, label: s.serviceName }));
    populateSelectOptions(filterServiceSelect, serviceItems, "Todos os serviços");
    populateSelectOptions(receiptServiceSelect, serviceItems, "Selecionar...");
  }

  if (payersResult.ok && payersResult.data) {
    receiptViewPayers = payersResult.data.filter((p) => p.isActive);
    const payerItems = receiptViewPayers.map((p) => ({ id: p.id, label: p.payerFullName }));
    populateSelectOptions(filterPayerSelect, payerItems, "Todos os pagadores");
    populateSelectOptions(receiptPayerSelect, payerItems, "Selecionar...");
  }

  await runFilter();
};

const runFilter = async (): Promise<void> => {
  const filter = buildFilter();

  if (!filter) {
    currentReceiptFilter = null;
    currentReceiptItems = [];
    currentReceiptDocument = null;
    setExportButtonsEnabled(false);
    receiptTotalsEl.textContent = "";
    receiptSummaryEl.hidden = true;
    receiptSectionsEl.innerHTML = "";
    receiptEmptyEl.hidden = true;
    receiptHintEl.hidden = false;
    showFeedback("Selecione um ano para filtrar.", true);
    return;
  }

  currentReceiptFilter = filter;
  receiptHintEl.hidden = true;

  const result = await window.miamono.receipts.listFiltered(filter);

  if (result.ok && result.data) {
    currentReceiptItems = result.data.items;
    renderCurrentReceiptsView();
  } else {
    currentReceiptItems = [];
    currentReceiptDocument = null;
    setExportButtonsEnabled(false);
    receiptSummaryEl.hidden = true;
    receiptSectionsEl.innerHTML = "";
    receiptEmptyEl.hidden = true;
    showFeedback(result.errorMessage ?? "Erro ao carregar recebimentos.", true);
  }
};

const runExport = async (kind: "csv" | "pdf"): Promise<void> => {
  if (!currentReceiptDocument || currentReceiptDocument.summary.totalCount === 0) {
    showFeedback("Não há dados para exportar com os filtros atuais.", true);
    return;
  }

  const exportResult = kind === "csv"
    ? await window.miamono.exports.exportCsv(currentReceiptDocument)
    : await window.miamono.exports.exportPdf(currentReceiptDocument);

  if (!exportResult.ok) {
    showFeedback(exportResult.errorMessage ?? `Erro ao exportar ${kind.toUpperCase()}.`, true);
    return;
  }

  if (!exportResult.data?.saved) {
    showFeedback(`Exportação ${kind.toUpperCase()} cancelada.`);
    return;
  }

  showFeedback(`Arquivo ${kind.toUpperCase()} exportado com sucesso: ${exportResult.data.filePath ?? ""}`);
};

const applyFilterDynamically = (): void => {
  void runFilter();
};

filterYearSelect.addEventListener("change", applyFilterDynamically);
filterMonthSelect.addEventListener("change", applyFilterDynamically);
filterDateInput.addEventListener("change", applyFilterDynamically);
filterServiceSelect.addEventListener("change", applyFilterDynamically);
filterPayerSelect.addEventListener("change", applyFilterDynamically);
filterHasInvoiceCheckbox.addEventListener("change", applyFilterDynamically);

receiptFilterForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  await runFilter();
});

btnFilterClear.addEventListener("click", async () => {
  filterYearSelect.value = String(new Date().getFullYear());
  filterMonthSelect.value = "";
  filterDateInput.value = "";
  filterServiceSelect.value = "";
  filterPayerSelect.value = "";
  filterHasInvoiceCheckbox.checked = false;
  receiptSortState = { column: "receiptDate", direction: "desc" };
  currentReceiptFilter = null;
  currentReceiptItems = [];
  currentReceiptDocument = null;
  setExportButtonsEnabled(false);
  receiptTotalsEl.textContent = "";
  receiptSummaryEl.hidden = true;
  receiptSectionsEl.innerHTML = "";
  receiptEmptyEl.hidden = true;
  receiptHintEl.hidden = false;
  await runFilter();
});

btnExportCsv.addEventListener("click", async () => {
  await runExport("csv");
});

btnExportPdf.addEventListener("click", async () => {
  await runExport("pdf");
});

const openReceiptCreateForm = (): void => {
  receiptIdInput.value = "";
  receiptDateInput.value = filterDateInput.value || new Date().toISOString().slice(0, 10);
  receiptAmountInput.value = "";
  receiptServiceSelect.value = "";
  receiptPayerSelect.value = "";
  receiptHasInvoiceCheckbox.checked = false;
  receiptNotesTextarea.value = "";
  receiptFormTitleEl.textContent = "Novo Recebimento";
  receiptFormPanel.hidden = false;
  receiptDateInput.focus();
};

const closeReceiptForm = (): void => {
  receiptFormPanel.hidden = true;
  receiptForm.reset();
};

btnNewReceipt.addEventListener("click", openReceiptCreateForm);
receiptCancelBtn.addEventListener("click", closeReceiptForm);
receiptAmountInput.addEventListener("input", () => {
  const cents = parseCurrencyInputToCents(receiptAmountInput.value);
  receiptAmountInput.value = cents ? formatCurrencyInput(cents) : "";
});
receiptAmountInput.addEventListener("blur", () => {
  const cents = parseCurrencyInputToCents(receiptAmountInput.value);
  receiptAmountInput.value = cents ? formatCurrencyInput(cents) : "";
});

receiptForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const amountCents = parseCurrencyInputToCents(receiptAmountInput.value);
  if (!amountCents) {
    showFeedback("Informe um valor válido maior que zero.", true);
    return;
  }

  const input: CreateReceiptInput = {
    receiptDate: receiptDateInput.value,
    serviceId: Number(receiptServiceSelect.value),
    payerId: Number(receiptPayerSelect.value),
    amountCents,
    hasInvoice: receiptHasInvoiceCheckbox.checked,
    notes: receiptNotesTextarea.value.trim() || null,
  };

  const existingId = receiptIdInput.value ? Number(receiptIdInput.value) : null;

  if (existingId) {
    const result = await window.miamono.receipts.update(existingId, input);
    if (result.ok) {
      showFeedback("Recebimento atualizado com sucesso.");
      closeReceiptForm();
      await runFilter();
    } else {
      showFeedback(result.errorMessage ?? "Erro ao atualizar recebimento.", true);
    }
  } else {
    const result = await window.miamono.receipts.create(input);
    if (result.ok) {
      showFeedback("Recebimento cadastrado com sucesso.");
      closeReceiptForm();
      await runFilter();
    } else {
      showFeedback(result.errorMessage ?? "Erro ao cadastrar recebimento.", true);
    }
  }
});

setExportButtonsEnabled(false);

export {};
