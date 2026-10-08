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
   * Obtém os livros de uma especialidade
   */
  getBooksBySpecialty(specialty: string): MedicalBookMeta[] {
    const spec = (catalogData.specialties as Record<string, SpecialtyMeta>)[specialty];
    return spec ? spec.books : [];
  },

  /**
   * Baixa e carrega o conteúdo completo de um livro do Supabase Storage
   */
  async fetchBookContent(storagePath: string): Promise<MedicalBookContent | null> {
    try {
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
