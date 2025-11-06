/**
 * Constantes para el chat de salud
 */

export type FeatureKey =
  | 'vomitos'
  | 'diarrea'
  | 'diarrea_hemorragica'
  | 'fiebre'
  | 'letargo'
  | 'deshidratacion'
  | 'tos'
  | 'disnea'
  | 'dolor_abdominal'
  | 'convulsiones'
  | 'signos_neurologicos'
  | 'estornudos'
  | 'secrecion_nasal'
  | 'is_chronic'
  | 'is_seasonal';

export type SymptomOverrides = Partial<Record<FeatureKey, number>>;

export type GuidedQuestion = {
  id: string;
  prompt: string;
  type: 'yesno' | 'freeform';
  feature?: FeatureKey | FeatureKey[];
  shouldAsk?: (overrides: SymptomOverrides) => boolean;
};

export const GUIDED_QUESTIONS: GuidedQuestion[] = [
  {
    id: 'vomitos',
    prompt: '¿Tu pelud@ ha tenido vómitos? 🤢',
    type: 'yesno',
    feature: 'vomitos',
    shouldAsk: (overrides) => overrides.vomitos === undefined,
  },
  {
    id: 'diarrea',
    prompt: '¿Ha tenido diarrea o cacas blanditas? 💩',
    type: 'yesno',
    feature: 'diarrea',
    shouldAsk: (overrides) => overrides.diarrea === undefined,
  },
  {
    id: 'diarreaHemorragica',
    prompt: 'Entiendo... ¿has notado sangre en las heces? Esto es importante 🩸',
    type: 'yesno',
    feature: 'diarrea_hemorragica',
    shouldAsk: (overrides) => overrides.diarrea === 1 && overrides.diarrea_hemorragica === undefined,
  },
  {
    id: 'respiratory',
    prompt: '¿Tiene tos, estornudos o le cuesta respirar? 😮‍💨',
    type: 'yesno',
    feature: ['tos', 'disnea'],
    shouldAsk: (overrides) => overrides.tos === undefined && overrides.disnea === undefined,
  },
  {
    id: 'lethargy',
    prompt: '¿Lo/la notas más apagad@, sin ganas de jugar o moverse? 😔',
    type: 'yesno',
    feature: 'letargo',
    shouldAsk: (overrides) => overrides.letargo === undefined,
  },
  {
    id: 'chronic',
    prompt: '¿Estos síntomas llevan más de 2 semanas? ⏰',
    type: 'yesno',
    feature: 'is_chronic',
  },
];

export const SYMPTOM_KEYWORDS = [
  'vomito',
  'vomitos',
  'nausea',
  'nauseas',
  'diarrea',
  'sangre',
  'fiebre',
  'tos',
  'disnea',
  'respira',
  'respiracion',
  'dolor',
  'letargo',
  'debilidad',
  'convulsion',
  'convulsiones',
  'temblores',
  'paralisis',
  'cojera',
  'apatico',
  'apatia',
  'triste',
  'cansado',
  'desganado',
  'apetito',
  'no come',
  'no quiere comer',
  'picazon',
  'prurito',
  'alergia',
  'herida',
  'ulcera',
  'ictericia',
  'orina',
  'hematuria',
  'deshidratacion',
];

export const SKIP_KEYWORDS = ['saltar', 'omitir', 'skip', 'no aplica', 'pasar pregunta'];

export const POSITIVE_KEYWORDS = [
  'si',
  'sii',
  'sip',
  'claro',
  'por supuesto',
  'afirmativo',
  'asi es',
  'correcto',
  'exacto',
  'seguro',
  'cierto',
];

export const NEGATIVE_KEYWORDS = [
  'no',
  'nop',
  'negativo',
  'ninguna',
  'ninguno',
  'nunca',
  'para nada',
];
