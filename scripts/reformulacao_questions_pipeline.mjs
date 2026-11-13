#!/usr/bin/env node
/**
 * PIPELINE DE REFORMULAÇÃO E CONSOLIDAÇÃO DAS TABELAS DO SUPABASE
 * 
 * Estrutura Alvo:
 * 1. questions_direto    <- questions + questions_expansion_direto (SEM questões de questions_revalida_base)
 * 2. questions_rplus     <- questions_expansion_r_plus
 * 3. questions_revalida  <- questions_expansion_revalida + questions_revalida_base (cruzadas e deduplicadas)
 * 4. questions_titulo    <- questions_expansion_titulo_especialista
 * 
 * Regras:
 * - Conservação absoluta de dados (Zero Data Loss).
 * - Expurgo cirúrgico do Revalida em questions_direto via ID, Código e Hash normalizado de enunciado.
 * - Fusão inteligente de registros com preservação dos metadados mais ricos.
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

// 1. Carrega variáveis de ambiente
const envPath = path.resolve(process.cwd(), '.env.local');
const env = {};
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
      }
    }
  }
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ ERRO: SUPABASE_URL ou SERVICE_KEY ausentes.');
  process.exit(1);
}

export function normalizeStatement(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // remove acentos
    .replace(/[^\w\s]/g, ' ')                          // remove pontuação
    .replace(/\s+/g, ' ')                             // normaliza espaços
    .trim();
}

export function computeStatementHash(text) {
  const norm = normalizeStatement(text);
  if (!norm || norm.length < 20) return null;
  return crypto.createHash('md5').update(norm).digest('hex');
}

console.log('📦 Módulo de reformulação carregado com sucesso.');

