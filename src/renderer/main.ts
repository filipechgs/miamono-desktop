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
  month: number;
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
        listFiltered: (filter: ReceiptFilter) => Promise<IpcResult<ReceiptListResult>>;
        create: (input: CreateReceiptInput) => Promise<IpcResult<ReceiptViewData>>;
        update: (id: number, input: CreateReceiptInput) => Promise<IpcResult<ReceiptViewData>>;
        remove: (id: number) => Promise<IpcResult<boolean>>;
      };
    };
  }
}

// ── Feedback ──────────────────────────────────────────────────────────────────

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

// ── Services ──────────────────────────────────────────────────────────────────

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
  if (result.ok && result.data) {
    renderServiceList(result.data);
  }
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

// ── Payers ────────────────────────────────────────────────────────────────────

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
  if (result.ok && result.data) {
    renderPayerList(result.data);
  }
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

// ── Bootstrap ─────────────────────────────────────────────────────────────────

await loadServices();
await loadPayers();

// ── Tab navigation ────────────────────────────────────────────────────────────

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

    const view = btn.dataset.view;

    if (view === "registrations") {
      viewRegistrations.hidden = false;
      viewReceipts.hidden = true;
    } else {
      viewRegistrations.hidden = true;
      viewReceipts.hidden = false;
      await initReceiptsView();
    }
  });
});

// ── Receipts ──────────────────────────────────────────────────────────────────

const formatCurrency = (cents: number): string =>
  (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const formatDate = (isoDate: string): string => {
  const [year, month, day] = isoDate.split("-");
  return `${day}/${month}/${year}`;
};

// Filter form elements
const receiptFilterForm = document.getElementById("receipt-filter-form") as HTMLFormElement;
const filterMonthInput = document.getElementById("filter-month") as HTMLInputElement;
const filterDateInput = document.getElementById("filter-date") as HTMLInputElement;
const filterServiceSelect = document.getElementById("filter-service") as HTMLSelectElement;
const filterPayerSelect = document.getElementById("filter-payer") as HTMLSelectElement;
const filterHasInvoiceCheckbox = document.getElementById("filter-has-invoice") as HTMLInputElement;
const btnFilterClear = document.getElementById("btn-filter-clear") as HTMLButtonElement;

// Receipt form elements
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

// Results elements
const receiptTotalsEl = document.getElementById("receipt-totals") as HTMLDivElement;
const receiptHintEl = document.getElementById("receipt-hint") as HTMLParagraphElement;
const receiptEmptyEl = document.getElementById("receipt-empty") as HTMLParagraphElement;
const receiptTableWrapper = document.getElementById("receipt-table-wrapper") as HTMLDivElement;
const receiptTbody = document.getElementById("receipt-tbody") as HTMLTableSectionElement;
const btnNewReceipt = document.getElementById("btn-new-receipt") as HTMLButtonElement;

// Track all active services/payers loaded for the receipts view
let receiptViewServices: ServiceData[] = [];
let receiptViewPayers: PayerData[] = [];

const populateSelectOptions = (
  select: HTMLSelectElement,
  items: { id: number; label: string }[],
  placeholder: string,
): void => {
  const currentValue = select.value;
  select.innerHTML = `<option value="">${placeholder}</option>`;

  for (const item of items) {
    const opt = document.createElement("option");
    opt.value = String(item.id);
    opt.textContent = item.label;
    select.appendChild(opt);
  }

  select.value = currentValue;
};

const initReceiptsView = async (): Promise<void> => {
  const [servicesResult, payersResult] = await Promise.all([
    window.miamono.services.list(),
    window.miamono.payers.list(),
  ]);

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

  // Default the month filter to current month if not already set
  if (!filterMonthInput.value) {
    filterMonthInput.value = new Date().toISOString().slice(0, 7);
    await runFilter();
  }
};

const buildFilter = (): ReceiptFilter | null => {
  const monthValue = filterMonthInput.value; // YYYY-MM
  if (!monthValue) return null;

  const [yearStr, monthStr] = monthValue.split("-");
  const filter: ReceiptFilter = {
    year: Number(yearStr),
    month: Number(monthStr),
  };

  if (filterDateInput.value) filter.date = filterDateInput.value;
  if (filterServiceSelect.value) filter.serviceId = Number(filterServiceSelect.value);
  if (filterPayerSelect.value) filter.payerId = Number(filterPayerSelect.value);
  if (filterHasInvoiceCheckbox.checked) filter.hasInvoice = true;

  return filter;
};

const renderReceiptsTable = (result: ReceiptListResult): void => {
  receiptTbody.innerHTML = "";

  if (result.totalCount === 0) {
    receiptTableWrapper.hidden = true;
    receiptEmptyEl.hidden = false;
    receiptTotalsEl.textContent = "";
    return;
  }

  receiptEmptyEl.hidden = true;
  receiptTableWrapper.hidden = false;

  receiptTotalsEl.innerHTML =
    `<strong>${result.totalCount}</strong> recebimento${result.totalCount !== 1 ? "s" : ""}` +
    ` &mdash; Total: <strong>${formatCurrency(result.totalAmountCents)}</strong>`;

  for (const item of result.items) {
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
    receiptTbody.appendChild(tr);
  }
};

const runFilter = async (): Promise<void> => {
  const filter = buildFilter();

  if (!filter) {
    showFeedback("Selecione um mês para filtrar.", true);
    return;
  }

  receiptHintEl.hidden = true;

  const result = await window.miamono.receipts.listFiltered(filter);

  if (result.ok && result.data) {
    renderReceiptsTable(result.data);
  } else {
    showFeedback(result.errorMessage ?? "Erro ao carregar recebimentos.", true);
  }
};

receiptFilterForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  await runFilter();
});

btnFilterClear.addEventListener("click", () => {
  filterMonthInput.value = new Date().toISOString().slice(0, 7);
  filterDateInput.value = "";
  filterServiceSelect.value = "";
  filterPayerSelect.value = "";
  filterHasInvoiceCheckbox.checked = false;
  receiptTableWrapper.hidden = true;
  receiptEmptyEl.hidden = true;
  receiptHintEl.hidden = false;
  receiptTotalsEl.textContent = "";
});

// ── Receipt form ──────────────────────────────────────────────────────────────

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

const openReceiptEditForm = (item: ReceiptViewData): void => {
  receiptIdInput.value = String(item.id);
  receiptDateInput.value = item.receiptDate;
  receiptAmountInput.value = (item.amountCents / 100).toFixed(2);
  receiptServiceSelect.value = String(item.serviceId);
  receiptPayerSelect.value = String(item.payerId);
  receiptHasInvoiceCheckbox.checked = item.hasInvoice;
  receiptNotesTextarea.value = item.notes ?? "";
  receiptFormTitleEl.textContent = "Editar Recebimento";
  receiptFormPanel.hidden = false;
  receiptDateInput.focus();
};

const closeReceiptForm = (): void => {
  receiptFormPanel.hidden = true;
  receiptForm.reset();
};

btnNewReceipt.addEventListener("click", openReceiptCreateForm);
receiptCancelBtn.addEventListener("click", closeReceiptForm);

receiptForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const amountRaw = parseFloat(receiptAmountInput.value);
  if (isNaN(amountRaw) || amountRaw <= 0) {
    showFeedback("Informe um valor válido maior que zero.", true);
    return;
  }

  const amountCents = Math.round(amountRaw * 100);

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

export {};
