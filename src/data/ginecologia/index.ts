import { Question } from '@/types';
import { oncologiaGinecologicaQuestions } from './oncologiaGinecologica';
import { infeccoesGinecologicasQuestions } from './infeccoesGinecologicas';
import { mastologiaQuestions } from './mastologia';
import { sangramentoUterinoQuestions } from './sangramentoUterino';
import { planejamentoFamiliarQuestions } from './planejamentoFamiliar';
import { climaterioQuestions } from './climaterio';
import { miomasQuestions } from './miomas';
import { uroginecologiaQuestions } from './uroginecologia';
import { endometrioseQuestions } from './endometriose';
import { fundamentosGinecologiaQuestions } from './fundamentosGinecologia';
import { ginecologiaEndocrinaQuestions } from './ginecologiaEndocrina';
import { sopQuestions } from './sop';
import { infertilidadeQuestions } from './infertilidade';
import { violenciaSexualQuestions } from './violenciaSexual';
import { sindromePremenstrualQuestions } from './sindromePremenstrual';
import { outrosGinecologiaQuestions } from './outrosGinecologia';

export const ginecologiaQuestions: Question[] = [
  ...oncologiaGinecologicaQuestions,
  ...infeccoesGinecologicasQuestions,
  ...mastologiaQuestions,
  ...sangramentoUterinoQuestions,
  ...planejamentoFamiliarQuestions,
  ...climaterioQuestions,
  ...miomasQuestions,
  ...uroginecologiaQuestions,
  ...endometrioseQuestions,
  ...fundamentosGinecologiaQuestions,
  ...ginecologiaEndocrinaQuestions,
  ...sopQuestions,
  ...infertilidadeQuestions,
  ...violenciaSexualQuestions,
  ...sindromePremenstrualQuestions,
  ...outrosGinecologiaQuestions,
];
