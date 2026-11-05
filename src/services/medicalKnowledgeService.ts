import catalogData from '@/data/medicalKnowledgeCatalog.json';
import { supabase } from '@/lib/supabase';

export interface MedicalBookMeta {
  theme: string;
  fileName: string;
  storagePath: string;
  totalChunks: number;
  characters: number;
}

export interface SpecialtyMeta {
  name: string;
  booksCount: number;
  chunksCount: number;
  books: MedicalBookMeta[];
}

export interface MedicalKnowledgeCatalog {
  version: string;
  generatedAt: string;
  bucket: string;
  totalSpecialties: number;
  totalBooks: number;
  totalChunks: number;
  specialties: Record<string, SpecialtyMeta>;
}

export interface KnowledgeChunk {
  id: string;
  specialty: string;
  theme: string;
  source: string;
  content: string;
}

export interface MedicalBookContent {
  specialty: string;
  theme: string;
  bookTitle: string;
  extractedAt: string;
  totalChunks: number;
  characters: number;
  chunks: KnowledgeChunk[];
}

export const SPECIALTY_ALIAS_MAP: Record<string, string[]> = {
  'Cirurgia Geral': ['Cirurgia'],
  'Cirurgia': ['Cirurgia'],
  'Clínica Médica': [
    'Cardiologia',
    'Dermatologia',
    'Endocrinologia',
    'Gastroenterologia',
    'Hematologia',
    'Hepatologia',
    'Infectologia',
    'Nefrologia',
    'Neurologia',
    'Pneumologia',
    'Reumatologia'
  ],
  'Ginecologia e Obstetrícia': ['Ginecologia', 'Obstetrícia'],
  'Ginecologia': ['Ginecologia'],
  'Obstetrícia': ['Obstetrícia'],
  'Medicina Preventiva e Social': ['Medicina Preventiva'],
  'Medicina Preventiva': ['Medicina Preventiva'],
  'Preventiva': ['Medicina Preventiva'],
  'Pediatria': ['Pediatria'],
  'Ortopedia': ['Ortopedia'],
  'Oftalmologia': ['Oftalmologia'],
  'Otorrinolaringologia': ['Otorrinolaringologia'],
  'Psiquiatria': ['Psiquiatria'],
  'Radiologia': ['Radiologia'],
  'Anestesiologia': ['Anestesiologia'],
  'Medicina de Emergência': ['Medicina de Emergência', 'Infectologia', 'Cardiologia'],
  'Urologia': ['Urologia']
};

export const medicalKnowledgeService = {
  /**
   * Retorna o catálogo oficial com todas as 21 especialidades e 341 livros indexados
   */
  getCatalog(): MedicalKnowledgeCatalog {
    return catalogData as MedicalKnowledgeCatalog;
  },

  /**
   * Lista todas as 21 especialidades médicas disponíveis
   */
  getSpecialties(): string[] {
    return Object.keys(catalogData.specialties);
  },

  /**
   * Obtém os livros de uma especialidade (com suporte a aliases de especialidades clínicas agregadas)
   */
  getBooksBySpecialty(specialty: string): MedicalBookMeta[] {
    const specs = catalogData.specialties as Record<string, SpecialtyMeta>;
    const direct = specs[specialty];
    if (direct && direct.books && direct.books.length > 0) {
      return direct.books;
    }

    const aliases = SPECIALTY_ALIAS_MAP[specialty];
    if (aliases && aliases.length > 0) {
      const books: MedicalBookMeta[] = [];
      const seen = new Set<string>();
      for (const alias of aliases) {
        const specMeta = specs[alias];
        if (specMeta && specMeta.books) {
          for (const b of specMeta.books) {
            if (!seen.has(b.storagePath)) {
              seen.add(b.storagePath);
              books.push(b);
            }
          }
        }
      }
      return books;
    }

    return [];
  },

  /**
   * Baixa e carrega o conteúdo completo de um livro através do proxy seguro da API
   * com proteção contra scraping acelerado e sem expor o bucket para acesso público anônimo
   */
  async fetchBookContent(storagePath: string): Promise<MedicalBookContent | null> {
    try {
      if (typeof window !== 'undefined') {
        const response = await fetch(`/api/knowledge/book?path=${encodeURIComponent(storagePath)}`);
        if (!response.ok) {
          console.error('[MedicalKnowledge] Falha ao obter livro:', response.statusText);
          return null;
        }
        const json = await response.json();
        return (json.data as MedicalBookContent) || null;
      }

      // 1. Verificação prévia no disco local (Node.js runtime / SSR / Route Handlers)
      try {
        const fs = await import('fs');
        const path = await import('path');
        const localPath = path.join(process.cwd(), 'data', 'knowledge', storagePath);
        if (fs.existsSync(localPath)) {
          const raw = fs.readFileSync(localPath, 'utf-8');
          return JSON.parse(raw) as MedicalBookContent;
        }
      } catch {
        // Fallback para download do storage caso fs não esteja acessível
      }

      // 2. Fallback para execução server-side ou scripts com cliente Supabase direto
      const { data, error } = await supabase.storage
        .from('medical-knowledge')
        .download(storagePath);

      if (error || !data) {
        console.error('Erro ao baixar livro do Supabase Storage:', error);
        return null;
      }

      const text = await data.text();
      return JSON.parse(text) as MedicalBookContent;
    } catch (err) {
      console.error('Falha ao processar conteúdo do livro:', err);
      return null;
    }
  }
};
