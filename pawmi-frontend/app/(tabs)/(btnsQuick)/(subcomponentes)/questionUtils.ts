/**
 * Utilidades para manejo de preguntas guiadas
 */

import { GUIDED_QUESTIONS, SymptomOverrides } from './constants';

export const findNextQuestionIndex = (startIndex: number, overrides: SymptomOverrides) => {
  for (let index = startIndex; index < GUIDED_QUESTIONS.length; index += 1) {
    const candidate = GUIDED_QUESTIONS[index];
    if (!candidate.shouldAsk || candidate.shouldAsk(overrides)) {
      return index;
    }
  }
  return -1;
};
