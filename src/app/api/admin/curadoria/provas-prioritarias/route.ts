import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { verifyAdminSession } from '@/lib/supabase/adminAuth';

export const dynamic = 'force-dynamic';

export interface PriorityExamItem {
  id: string;
  instituicao: string;
  banca: string;
  ano: number;
  tipo_prova: string;
  total_questoes: number;
  com_gabarito: number;
  anuladas: number;
  discursivas: number;
  auditadas: number;
  faltam: number;
  percentual: number;
  priorityTier: 'ouro' | 'prata' | 'bronze' | 'critica' | 'blindada';
}

let cachedExams: PriorityExamItem[] | null = null;
let lastCacheTime = 0;

function loadExamsFromStorage(): PriorityExamItem[] {
  const now = Date.now();
  if (cachedExams && now - lastCacheTime < 60000) {
    return cachedExams;
  }

  const csvPath = path.resolve(process.cwd(), 'data/relatorio_provas_instituicoes_ano.csv');
  if (!fs.existsSync(csvPath)) {
    return [];
  }

  const content = fs.readFileSync(csvPath, 'utf8').trim();
  const lines = content.split('\n').slice(1);
  const result: PriorityExamItem[] = [];

  for (const line of lines) {
    if (!line.trim()) continue;
    // RFC 4180 parsing simples
    const row: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (c === ',' && !inQuotes) {
        row.push(current);
        current = '';
      } else {
        current += c;
      }
    }
    row.push(current);

    const inst = row[0] || '';
    const banca = row[1] || '';
    const ano = Number(row[2]) || 0;
    const tipo = row[3] || '';
    const total = Number(row[4]) || 0;
    const comGab = Number(row[5]) || 0;
    const anul = Number(row[6]) || 0;
    const disc = Number(row[7]) || 0;
    const audit = Number(row[8]) || 0;
    const faltam = Number(row[9]) || 0;
    const pctStr = (row[10] || '').replace('%', '').trim();
    const pct = parseFloat(pctStr) || 0;

    let tier: PriorityExamItem['priorityTier'] = 'critica';
    if (faltam === 0) {
      tier = 'blindada';
    } else if (faltam <= 5) {
      tier = 'ouro';
    } else if (faltam <= 10) {
      tier = 'prata';
    } else if (faltam <= 20) {
      tier = 'bronze';
    } else {
      tier = 'critica';
    }

    result.push({
      id: `${inst}__${banca}__${ano}__${tipo}`,
      instituicao: inst,
      banca,
      ano,
      tipo_prova: tipo,
      total_questoes: total,
      com_gabarito: comGab,
      anuladas: anul,
      discursivas: disc,
      auditadas: audit,
      faltam,
      percentual: pct,
      priorityTier: tier
    });
  }

  cachedExams = result;
  lastCacheTime = now;
  return result;
}

export async function GET(req: NextRequest) {
  try {
    // 1. Verificação estrita de autorização de Administrador / Curador
    const auth = await verifyAdminSession(req);
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: auth.error || 'Acesso negado: permissões insuficientes.' },
        { status: auth.status }
      );
    }

    const { searchParams } = new URL(req.url);
    const tier = searchParams.get('tier'); // 'ouro' | 'prata' | 'bronze' | 'critica' | 'blindada' | 'todas'
    const search = (searchParams.get('search') || '').toLowerCase().trim();
    const ano = searchParams.get('ano');

    const allExams = loadExamsFromStorage();

    let filtered = allExams;

    if (tier && tier !== 'todas') {
      filtered = filtered.filter(e => e.priorityTier === tier);
    }

    if (ano && ano !== 'todos') {
      const anoNum = Number(ano);
      filtered = filtered.filter(e => e.ano === anoNum);
    }

    if (search) {
      filtered = filtered.filter(e =>
        e.instituicao.toLowerCase().includes(search) ||
        e.banca.toLowerCase().includes(search)
      );
    }

    // Ordenar por prioridade (ouro primeiro: menor quantidade de faltantes primeiro)
    filtered.sort((a, b) => {
      // Se ambos tiverem pendência, o que tem menos faltantes vem primeiro para fechar rápido!
      if (a.faltam > 0 && b.faltam > 0) {
        if (a.faltam !== b.faltam) return a.faltam - b.faltam;
        return b.ano - a.ano;
      }
      if (a.faltam === 0 && b.faltam > 0) return 1;
      if (b.faltam === 0 && a.faltam > 0) return -1;
      return b.ano - a.ano;
    });

    // Contadores para os filtros de topo
    const counts = {
      todas: allExams.length,
      ouro: allExams.filter(e => e.priorityTier === 'ouro').length,
      prata: allExams.filter(e => e.priorityTier === 'prata').length,
      bronze: allExams.filter(e => e.priorityTier === 'bronze').length,
      critica: allExams.filter(e => e.priorityTier === 'critica').length,
      blindada: allExams.filter(e => e.priorityTier === 'blindada').length
    };

    return NextResponse.json({
      success: true,
      total: filtered.length,
      counts,
      exams: filtered.slice(0, 200) // Primeiras 200 para resposta ultra rápida
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro ao listar provas';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
