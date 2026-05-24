import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("miamono", {
  appName: "Miamono Desktop",
  locale: "pt-BR",
  services: {
    list: () => ipcRenderer.invoke("services:list"),
    create: (serviceName: string) => ipcRenderer.invoke("services:create", serviceName),
    update: (id: number, serviceName: string) =>
      ipcRenderer.invoke("services:update", id, serviceName),
    deactivate: (id: number) => ipcRenderer.invoke("services:deactivate", id),
  },
  payers: {
    list: () => ipcRenderer.invoke("payers:list"),
    create: (payerFullName: string) => ipcRenderer.invoke("payers:create", payerFullName),
    update: (id: number, payerFullName: string) =>
      ipcRenderer.invoke("payers:update", id, payerFullName),
    deactivate: (id: number) => ipcRenderer.invoke("payers:deactivate", id),
  },
  receipts: {
    listFiltered: (filter: unknown) => ipcRenderer.invoke("receipts:list-filtered", filter),
    create: (input: unknown) => ipcRenderer.invoke("receipts:create", input),
    update: (id: number, input: unknown) => ipcRenderer.invoke("receipts:update", id, input),
    remove: (id: number) => ipcRenderer.invoke("receipts:remove", id),
  },
});
