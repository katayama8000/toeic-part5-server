# Database Schema Proposal

This document outlines a proposed relational database schema for the TOEIC Part 5 Solver application. The schema is designed to persist the core domain models: `Question`, `Choice`, and `Solution`.

## Tables

### `questions`

This table stores the main question aggregate.

| Column       | Type         | Constraints/Description                |
|--------------|--------------|----------------------------------------|
| `id`         | `VARCHAR(255)` | Primary Key, unique identifier (e.g., UUID) |
| `sentence`   | `TEXT`       | The problem sentence with a blank.     |
| `created_at` | `TIMESTAMP`  | Timestamp of when the record was created. |
| `updated_at` | `TIMESTAMP`  | Timestamp of the last update.          |

### `choices`

This table stores the multiple-choice options for each question.

| Column        | Type          | Constraints/Description                     |
|---------------|---------------|---------------------------------------------|
| `id`          | `BIGINT`      | Primary Key, auto-incrementing integer.     |
| `question_id` | `VARCHAR(255)`| Foreign Key, references `questions.id`.     |
| `label`       | `VARCHAR(8)`  | The option label (e.g., "A", "B").          |
| `text`        | `TEXT`        | The text content of the choice.             |

### `solutions`

This table stores the analysis result for a question. This can be used for caching or logging.

| Column              | Type          | Constraints/Description                        |
|---------------------|---------------|------------------------------------------------|
| `id`                | `BIGINT`      | Primary Key, auto-incrementing integer.        |
| `question_id`       | `VARCHAR(255)`| Foreign Key, references `questions.id`. Unique. |
| `correct_choice_id` | `BIGINT`      | Foreign Key, references `choices.id`.          |
| `explanation`       | `TEXT`        | The explanation for why the choice is correct. |
| `corrected_sentence`| `TEXT`        | The full sentence with the correct answer.     |
| `analyzed_at`       | `TIMESTAMP`   | Timestamp of when the analysis was performed.  |
