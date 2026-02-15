# TOEIC Part 5 Quiz API

## Description

This project is a backend API for a TOEIC Part 5 quiz application. It provides endpoints for clients to fetch questions and submit user answers. The API then validates the user's answer and returns whether it was correct. It serves as a backend for a learning application where users can test their knowledge.

## Architecture Overview

This project uses a layered architecture inspired by Domain-Driven Design (DDD) to separate concerns. It favors a functional programming style and is built on the native Deno runtime, avoiding external web frameworks.

1.  **Presentation Layer**: Handles HTTP requests and responses. Implemented directly with `Deno.serve`.
2.  **Application Layer**: Orchestrates the use cases of the application, implemented as higher-order functions.
3.  **Domain Layer**: The heart of the application. Contains the core business logic, rules, and types.
4.  **Infrastructure Layer**: Contains concrete implementations for external concerns, like the mock database.

## Directory Structure

```
.
├── application/
│   ├── GetQuestionUseCase.ts
│   └── SubmitAnswerUseCase.ts
├── domain/
│   ├── entities/
│   │   └── question.ts
│   ├── interface/
│   │   └── IQuestionRepository.ts
│   └── value-objects/
│       ├── choice.ts
│       └── questionId.ts
├── infrastructure/
│   └── persistence/
│       ├── MockQuestionRepository.ts
│       └── QuestionMapper.ts
└── main.ts
```

## Code Details

(Domain, Application, and Infrastructure layers remain as previously documented)

### Presentation Layer

```typescript
// main.ts
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

console.log("Server starting...");

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

    const publicChoices = question.choices.map(({ label, text }) => ({ label, text }));
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
```
