"use client";

import { generateText } from "@/app/actions";
import { useState } from "react";
import Together from "together-ai";
import { ChatCompletionStream } from "together-ai/lib/ChatCompletionStream";

export default function Chat() {
  const [messages, setMessages] = useState<
    Together.Chat.Completions.CompletionCreateParams.Message[]
  >([]);
  const [isPending, setIsPending] = useState(false);

  async function handleAction(formData: FormData) {
    setIsPending(true);
    const content = formData.get("prompt");
    if (typeof content !== "string") return;

    setMessages((messages) => [
      ...messages,
      {
        role: "user",
        content,
      },
    ]);

    const stream = await generateText([
      ...messages,
      {
        role: "user",
        content,
      },
    ]);
    const runner = ChatCompletionStream.fromReadableStream(stream);
    runner
      .on("content", (delta, content) => {
        setMessages((messages) => {
          const lastMessage = messages.at(-1);

          if (lastMessage?.role !== "assistant") {
            return [...messages, { role: "assistant", content }];
          } else {
            return [...messages.slice(0, -1), { ...lastMessage, content }];
          }
        });
      })
      .on("end", () => {
        setIsPending(false);
      });
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="space-y-4 py-8">
        {messages.map((message, i) => (
          <div key={i} className="flex">
            {message.role === "user" ? (
              <div className="ml-auto rounded-full bg-blue-500 px-4 py-2 text-white">
                {message.content}
              </div>
            ) : (
              <div className="whitespace-pre-wrap">{message.content}</div>
            )}
          </div>
        ))}
      </div>

      <div className="fixed inset-x-0 bottom-0 m-8 flex justify-center gap-2">
        <form action={handleAction} className="flex w-full max-w-3xl">
          <fieldset className="flex w-full gap-2">
            <input
              autoFocus
              placeholder="Ask anything..."
              name="prompt"
              className="block w-full rounded border border-gray-300 p-2"
            />
            <button
              className="rounded bg-black px-3 py-1 font-medium text-white disabled:opacity-50"
              type="submit"
              disabled={isPending}
            >
              Submit
            </button>
          </fieldset>
        </form>
      </div>
    </div>
  );
}
