import { NextRequest, NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';
import { getSupabaseAdmin } from '@/lib/supabase/adminClient';
import { verifyAdminSession } from '@/lib/supabase/adminAuth';
import { DEFAULT_TAB_STATUS, TabStatusMap } from '@/types/tabAvailability';

export const dynamic = 'force-dynamic';

const SETTINGS_KEY = 'tab_availability_settings';
const BACKUP_FILE_PATH = path.resolve(process.cwd(), 'data', 'platform_settings.json');

function readFromFile(): TabStatusMap | null {
  try {
    if (fs.existsSync(BACKUP_FILE_PATH)) {
      const content = fs.readFileSync(BACKUP_FILE_PATH, 'utf8');
      const parsed = JSON.parse(content);
      if (parsed && typeof parsed === 'object') {
        return { ...DEFAULT_TAB_STATUS, ...parsed };
      }
    }
  } catch (err) {
    console.warn('[tab-availability] Erro ao ler platform_settings.json:', err);
  }
  return null;
}

function writeToFile(statusMap: TabStatusMap): void {
  try {
    const dir = path.dirname(BACKUP_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(BACKUP_FILE_PATH, JSON.stringify(statusMap, null, 2), 'utf8');
  } catch (err) {
    console.warn('[tab-availability] Erro ao gravar platform_settings.json:', err);
  }
}

/**
 * GET /api/tab-availability
 * Retorna o mapa de ativação de todas as abas.
 * Acesso livre para qualquer aluno, visitante ou administrador.
 */
export async function GET() {
  try {
    // 1. Tenta buscar do Supabase
    try {
      const supabaseAdmin = getSupabaseAdmin();
      const { data, error } = await supabaseAdmin
        .from('platform_settings')
        .select('value')
        .eq('key', SETTINGS_KEY)
        .maybeSingle();

      if (!error && data?.value && typeof data.value === 'object') {
        const merged: TabStatusMap = {
          ...DEFAULT_TAB_STATUS,
          ...(data.value as TabStatusMap)
        };
        // Atualiza cache local no disco em background
        writeToFile(merged);
        return NextResponse.json(
          { success: true, tabStatus: merged, source: 'database' },
          { headers: { 'Cache-Control': 'no-store, max-age=0' } }
        );
      }
    } catch {
      // Falha de banco (ex: tabela ainda não criada via migration): prossegue para fallback
    }

    // 2. Fallback de alta disponibilidade em disco
    const fileStatus = readFromFile();
    if (fileStatus) {
      return NextResponse.json(
        { success: true, tabStatus: fileStatus, source: 'file_cache' },
        { headers: { 'Cache-Control': 'no-store, max-age=0' } }
      );
    }

    // 3. Padrão inicial
    return NextResponse.json(
      { success: true, tabStatus: DEFAULT_TAB_STATUS, source: 'default' },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } }
    );
  } catch (err) {
    console.error('[tab-availability] Erro no GET:', err);
    return NextResponse.json(
      { success: true, tabStatus: DEFAULT_TAB_STATUS, source: 'fallback_error' },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } }
    );
  }
}

/**
 * POST /api/tab-availability
 * Atualiza o status de bloqueio das abas.
 * Restrito estritamente a administradores e curadores.
 */
export async function POST(req: NextRequest) {
  try {
    const auth = await verifyAdminSession(req);
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: auth.error || 'Acesso negado: permissões insuficientes.' },
        { status: auth.status }
      );
    }

    const body = await req.json();
    if (!body || typeof body.tabStatus !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Payload inválido. tabStatus é obrigatório.' },
        { status: 400 }
      );
    }

    const updatedStatus: TabStatusMap = {
      ...DEFAULT_TAB_STATUS,
      ...body.tabStatus
    };

    // 1. Grava no disco imediatamente
    writeToFile(updatedStatus);

    // 2. Tenta persistir no Supabase (se a tabela platform_settings existir)
    let dbPersisted = false;
    try {
      const supabaseAdmin = getSupabaseAdmin();
      const { error } = await supabaseAdmin
        .from('platform_settings')
        .upsert({
          key: SETTINGS_KEY,
          value: updatedStatus,
          updated_at: new Date().toISOString()
        }, { onConflict: 'key' });

      if (!error) {
        dbPersisted = true;
      }
    } catch (err) {
      console.warn('[tab-availability] Supabase upsert falhou (tabela pendente de migração):', err);
    }

    return NextResponse.json({
      success: true,
      tabStatus: updatedStatus,
      dbPersisted
    });
  } catch (err) {
    console.error('[tab-availability] Erro no POST:', err);
    return NextResponse.json(
      { success: false, error: 'Erro interno ao salvar configurações de abas.' },
      { status: 500 }
    );
  }
}
