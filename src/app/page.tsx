"use client";

import { getAnswer } from "@/app/actions";
import assert from "assert";
import { useActionState, useEffect, useState } from "react";
import { ChatCompletionStream } from "together-ai/lib/ChatCompletionStream.mjs";

export default function Chat() {
  const [answer, setAnswer] = useState("");
  const [status, setStatus] = useState<"idle" | "pending" | "done">("idle");
  const [state, getAnswerAction] = useActionState(
    async (
      prev: null | { question: string; stream: ReadableStream },
      formData: FormData,
    ) => {
      const question = formData.get("question");
      assert(typeof question === "string");

      const stream = await getAnswer(question);
      setStatus("pending");
      return { question, stream };
    },
    null,
  );

  useEffect(() => {
    if (!state) return;

    ChatCompletionStream.fromReadableStream(state.stream)
      .on("content", (delta) => setAnswer((text) => text + delta))
      .on("end", () => setStatus("done"));
  }, [state]);

  return (
    <div className="mx-auto flex w-full max-w-3xl grow flex-col px-4">
      {status === "idle" ? (
        <div className="flex grow flex-col justify-center">
          <form action={getAnswerAction} className="flex w-full gap-2">
            <input
              placeholder="Ask me a question"
              autoFocus
              name="question"
              required
              className="block w-full rounded border border-gray-300 p-2 outline-black"
            />
            <button
              className="rounded bg-black px-3 py-1 font-medium text-white outline-offset-[3px] outline-black"
              type="submit"
            >
              Submit
            </button>
          </form>
        </div>
      ) : (
        <>
          <div className="mt-8 flex flex-col justify-end">
            <div className="grid grid-cols-4">
              <p className="col-span-3 text-xl">{state?.question}</p>

              <div className="text-right">
                <button
                  className="rounded bg-black px-3 py-2 font-medium text-white outline-offset-[3px] outline-black disabled:opacity-50"
                  disabled={status !== "done"}
                  onClick={() => {
                    setAnswer("");
                    setStatus("idle");
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
