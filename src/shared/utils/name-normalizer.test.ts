import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizeDisplayName } from "./name-normalizer.ts";

// ── Casos simples ─────────────────────────────────────────────────────────────

test("capitaliza uma única palavra", () => {
  assert.equal(normalizeDisplayName("carlos"), "Carlos");
});

test("capitaliza palavra em maiúsculas", () => {
  assert.equal(normalizeDisplayName("CARLOS"), "Carlos");
});

test("capitaliza palavra com capitalização mista", () => {
  assert.equal(normalizeDisplayName("cARLOs"), "Carlos");
});

test("retorna string vazia para entrada vazia", () => {
  assert.equal(normalizeDisplayName(""), "");
});

test("retorna string vazia para entrada com apenas espaços", () => {
  assert.equal(normalizeDisplayName("   "), "");
});

// ── Nomes compostos ───────────────────────────────────────────────────────────

test("capitaliza nome composto simples", () => {
  assert.equal(normalizeDisplayName("filipe santos"), "Filipe Santos");
});

test("capitaliza nome composto com capitalização mista", () => {
  assert.equal(normalizeDisplayName("fILIPE sANTOS"), "Filipe Santos");
});

test("capitaliza nome composto em maiúsculas", () => {
  assert.equal(normalizeDisplayName("FILIPE SANTOS"), "Filipe Santos");
});

// ── Artigos e preposições ────────────────────────────────────────────────────

test("mantém 'de' em minúsculo", () => {
  assert.equal(normalizeDisplayName("Roberto de Oliveira"), "Roberto de Oliveira");
});

test("mantém 'da' em minúsculo", () => {
  assert.equal(normalizeDisplayName("Maria DA Silva"), "Maria da Silva");
});

test("mantém 'do' em minúsculo", () => {
  assert.equal(normalizeDisplayName("Pedro DO Carmo"), "Pedro do Carmo");
});

test("mantém 'das' em minúsculo", () => {
  assert.equal(normalizeDisplayName("Ana DAS Neves"), "Ana das Neves");
});

test("mantém 'dos' em minúsculo", () => {
  assert.equal(normalizeDisplayName("fILIPE DOS sANTOS"), "Filipe dos Santos");
});

test("mantém 'e' em minúsculo", () => {
  assert.equal(normalizeDisplayName("Engenharia E Arquitetura"), "Engenharia e Arquitetura");
});

// ── Caso do exemplo da documentação ──────────────────────────────────────────

test("exemplo exato da documentação: fILIPE DOS sANTOS → Filipe dos Santos", () => {
  assert.equal(normalizeDisplayName("fILIPE DOS sANTOS"), "Filipe dos Santos");
});

// ── Espaços extras ───────────────────────────────────────────────────────────

test("remove espaços extras no início e fim", () => {
  assert.equal(normalizeDisplayName("  Carlos  "), "Carlos");
});

test("colapsa espaços múltiplos entre palavras", () => {
  assert.equal(normalizeDisplayName("Filipe   dos   Santos"), "Filipe dos Santos");
});

// ── Nomes de serviços ─────────────────────────────────────────────────────────

test("normaliza nome de serviço simples", () => {
  assert.equal(normalizeDisplayName("consultoria financeira"), "Consultoria Financeira");
});

test("normaliza nome de serviço com artigo", () => {
  assert.equal(
    normalizeDisplayName("GESTÃO DE PROJETOS"),
    "Gestão de Projetos",
  );
});

test("normaliza nome de serviço com preposição da lista", () => {
  assert.equal(
    normalizeDisplayName("desenvolvimento de SOFTWARE e SISTEMAS"),
    "Desenvolvimento de Software e Sistemas",
  );
});
