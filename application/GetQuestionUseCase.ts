import type { IQuestionRepository } from '../domain/interface/IQuestionRepository.ts';
import type { Question } from '../domain/entities/question.ts';
import type { QuestionId } from '../domain/value-objects/questionId.ts';

export type GetQuestionUseCase = (id: QuestionId) => Promise<Question | null>;

export const createGetQuestionUseCase = (repo: IQuestionRepository): GetQuestionUseCase => {
  return (id: QuestionId) => {
    return repo.findById(id);
  };
};
