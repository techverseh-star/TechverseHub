import { z } from "zod";

export const emailSchema = z.string().trim().min(3).max(254).email();

const longText = (max: number) => z.string().max(max);

export const geminiRequestSchema = z.object({
  task: z.enum(["lesson_explain", "simplify_concept", "generate_quiz", "study_helper"]),
  content: longText(20_000).optional(),
  topic: longText(2_000).optional(),
});

const chatMessageSchema = z.object({
  role: z.enum(["system", "user", "assistant"]),
  content: longText(8_000),
});

export const groqRequestSchema = z.object({
  task: z.enum([
    "chat",
    "study_planning",
    "code_explain",
    "code_debug",
    "code_refactor",
    "practice_hint",
    "practice_solution",
  ]),
  code: longText(50_000).optional(),
  language: longText(30).optional(),
  problem: longText(20_000).optional(),
  hints: longText(5_000).optional(),
  solution: longText(20_000).optional(),
  size: z.enum(["small", "large"]).optional(),
  context: longText(20_000).optional(),
  messages: z.array(chatMessageSchema).max(30).optional(),
});

export const runRequestSchema = z.object({
  code: longText(50_000),
  language: longText(30),
  testInput: longText(5_000).optional(),
});

export const fileSaveSchema = z.object({
  file: z.object({
    id: z.string().min(1).max(200),
    name: z.string().min(1).max(200),
    content: z.string().max(300_000),
    language: z.string().min(1).max(50),
  }),
});

export const fileDeleteSchema = z.object({
  file_id: z.string().min(1).max(200),
});

export const feedbackSchema = z.object({
  subject: longText(200).optional(),
  message: z.string().trim().min(1, "Message is required").max(5_000),
  rating: z.number().int().min(1).max(5),
  email: emailSchema.optional(),
  userId: z.string().max(200).optional(),
});

export const welcomeEmailSchema = z.object({
  email: emailSchema,
});

export const reminderEmailSchema = z.object({
  email: emailSchema,
});

export const requestResetSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  token: z.string().regex(/^[a-f0-9]{64}$/, "Invalid token format"),
  password: z.string().min(8).max(200).optional(),
  checkOnly: z.boolean().optional(),
});

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
