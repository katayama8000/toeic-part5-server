import { createGetQuestionUseCase } from './application/GetQuestionUseCase.ts';
import { createSubmitAnswerUseCase } from './application/SubmitAnswerUseCase.ts';
import { createQuestionId } from './domain/value-objects/questionId.ts';
import { createMockQuestionRepository } from './infrastructure/persistence/MockQuestionRepository.ts';

// A helper function to create JSON responses.
const jsonResponse = (data: unknown, status = 200) => {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
};

// --- Composition Root (simplified for native Deno) ---
const questionRepo = createMockQuestionRepository();
const getQuestionUseCase = createGetQuestionUseCase(questionRepo);
const submitAnswerUseCase = createSubmitAnswerUseCase(questionRepo);

// --- URL Routing Patterns ---
const GET_QUESTION_PATTERN = new URLPattern({ pathname: '/questions/:id' });
const SUBMIT_ANSWER_PATTERN = new URLPattern({
  pathname: '/questions/:id/answer',
});

console.log('Server starting...');

// --- Server ---
Deno.serve(async (req: Request) => {
  const url = new URL(req.url);
  const getMatch = GET_QUESTION_PATTERN.exec(url);

  // Handle GET /questions/:id
  if (getMatch && req.method === 'GET') {
    const { id } = getMatch.pathname.groups;
    const questionId = createQuestionId(id!);
    const question = await getQuestionUseCase(questionId);

    if (!question) {
      return jsonResponse({ error: 'Question not found' }, 404);
    }

    const publicChoices = question.choices.map(({ label, text }) => ({
      label,
      text,
    }));
    const publicQuestion = {
      id: question.id,
      sentence: question.sentence,
      choices: publicChoices,
    };

    return jsonResponse(publicQuestion);
  }

  const postMatch = SUBMIT_ANSWER_PATTERN.exec(url);

  // Handle POST /questions/:id/answer
  if (postMatch && req.method === 'POST') {
    const { id } = postMatch.pathname.groups;
    const questionId = createQuestionId(id!);

    try {
      const body = (await req.json()) as { submittedLabel: string };
      const { submittedLabel } = body;
      if (typeof submittedLabel !== 'string') {
        return jsonResponse({ error: 'submittedLabel must be a string' }, 400);
      }

      const result = await submitAnswerUseCase(questionId, submittedLabel);

      if (!result) {
        return jsonResponse({ error: 'Question not found' }, 404);
      }

      return jsonResponse(result);
    } catch (_error) {
      return jsonResponse({ error: 'Invalid request body' }, 400);
    }
  }

  return jsonResponse({ error: 'Not Found' }, 404);
});
