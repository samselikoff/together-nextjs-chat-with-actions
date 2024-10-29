"use client";

import { generateText } from "@/app/actions";
import { useState } from "react";
import { ChatCompletionStream } from "together-ai/lib/ChatCompletionStream";

export default function Chat() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [isPending, setIsPending] = useState(false);

  async function handleAction(formData: FormData) {
    const content = formData.get("prompt");
    if (typeof content !== "string") return;
    setIsPending(true);
    setQuestion(content);

    const stream = await generateText([{ role: "user", content }]);
    const runner = ChatCompletionStream.fromReadableStream(stream);
    runner
      .on("content", (delta) => setAnswer((text) => text + delta))
      .on("end", () => setIsPending(false));
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl grow flex-col px-4">
      {!question ? (
        <div className="flex grow flex-col justify-center">
          <form action={handleAction} className="flex w-full">
            <fieldset className="flex w-full gap-2" disabled={isPending}>
              <input
                placeholder="Ask anything..."
                autoFocus
                name="prompt"
                className="block w-full rounded border border-gray-300 p-2"
              />
              <button
                className="rounded bg-black px-3 py-1 font-medium text-white"
                type="submit"
              >
                Submit
              </button>
            </fieldset>
          </form>
        </div>
      ) : (
        <>
          <div className="mt-8 flex flex-col justify-end">
            <div className="grid grid-cols-4">
              <p className="col-span-3 text-xl">{question}</p>

              <div className="text-right">
                <button
                  className="rounded bg-black px-3 py-2 font-medium text-white disabled:opacity-50"
                  disabled={isPending}
                  onClick={() => {
                    setQuestion("");
                    setAnswer("");
                  }}
                >
                  Reset
                </button>
              </div>
            </div>
          </div>

          <div className="py-8">
            <p className="whitespace-pre-wrap">{answer}</p>
          </div>
        </>
      )}
    </div>
  );
}
