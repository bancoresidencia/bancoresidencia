-- ============================================================
-- Migration 004: Performance Indexes for Question Filtering
-- Plataforma Banco Residência Médica (132.965 questões)
-- ============================================================

-- 1. Índice composto para Especialidade e Ano (acelera filtros por grande área clínica e faixa temporal)
CREATE INDEX IF NOT EXISTS idx_questions_especialidade_year 
  ON public.questions(especialidade, year);

-- 2. Índice composto para Especialidade e Tema (acelera árvore clínica e consultas compostas da hierarquia)
CREATE INDEX IF NOT EXISTS idx_questions_especialidade_tema 
  ON public.questions(especialidade, tema);

-- 3. Índice composto para Banca e Ano (acelera filtros por bancas concorridas e exames anuais)
CREATE INDEX IF NOT EXISTS idx_questions_banca_year 
  ON public.questions(banca, year);

-- 4. Índice para Instituição (acelera filtros por faculdade, hospital universitário e SUS estadual)
CREATE INDEX IF NOT EXISTS idx_questions_institution 
  ON public.questions(institution);

-- 5. Índice para Dificuldade (TRI psicométrica: Fácil, Médio, Difícil)
CREATE INDEX IF NOT EXISTS idx_questions_difficulty 
  ON public.questions(difficulty);

-- 6. Índice para Formato de Questão (Múltipla escolha, Discursiva)
CREATE INDEX IF NOT EXISTS idx_questions_type 
  ON public.questions(type);

-- 7. Índice para Modalidade de Acesso (Residência Médica, Revalida)
CREATE INDEX IF NOT EXISTS idx_questions_modalidade 
  ON public.questions(modalidade);

-- 8. Índices para Gabarito Oficial e Questões Anuladas
CREATE INDEX IF NOT EXISTS idx_questions_correct_answer 
  ON public.questions(correct_answer);

CREATE INDEX IF NOT EXISTS idx_questions_is_anulada 
  ON public.questions(is_anulada);

-- 9. Índices B-Tree para Temas, Focos e Subfocos clínicos
CREATE INDEX IF NOT EXISTS idx_questions_tema 
  ON public.questions(tema);

CREATE INDEX IF NOT EXISTS idx_questions_foco 
  ON public.questions(foco);

CREATE INDEX IF NOT EXISTS idx_questions_subfoco 
  ON public.questions(subfoco);
