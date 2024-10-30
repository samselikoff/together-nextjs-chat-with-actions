"use server";

import Together from "together-ai";

const together = new Together();

export async function getAnswer(question: string) {
  const runner = together.chat.completions.stream({
    model: "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo",
    messages: [{ role: "user", content: question }],
  });

  return runner.toReadableStream();
}

export async function generateText(
  messages: Together.Chat.Completions.CompletionCreateParams.Message[],
) {
  const runner = together.chat.completions.stream({
    model: "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo",
    messages,
  });

  return runner.toReadableStream();
}
