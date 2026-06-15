"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseClient, slugify } from "@/lib/supabase";

// DEMO ONLY: intentional TypeScript error — Vercel build will fail. Delete this line to fix.
const vercelDemoBreak: string = 123;

export default function HomePage() {
  const router = useRouter();
  const [deckName, setDeckName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const name = deckName.trim();
    const slug = slugify(name);

    if (!slug) {
      setError("Enter a deck name with at least one letter or number.");
      setLoading(false);
      return;
    }

    try {
      const supabase = createSupabaseClient();

      const { data: existing } = await supabase
        .from("decks")
        .select("slug")
        .eq("slug", slug)
        .maybeSingle();

      if (!existing) {
        const { error: insertError } = await supabase
          .from("decks")
          .insert({ slug, name });

        if (insertError) {
          setError(insertError.message);
          setLoading(false);
          return;
        }
      }

      router.push(`/deck/${slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-md space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-semibold tracking-tight">Flashcards</h1>
          <p className="text-zinc-500">
            Create a shared deck, send the link to your friend, and study
            together.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-zinc-600">Deck name</span>
            <input
              type="text"
              value={deckName}
              onChange={(event) => setDeckName(event.target.value)}
              placeholder="Biology midterm"
              className="w-full rounded-2xl bg-zinc-100 px-4 py-3 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300"
            />
          </label>

          {error ? (
            <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-zinc-900 px-4 py-3 font-medium text-white transition hover:bg-zinc-700 disabled:opacity-60"
          >
            {loading ? "Opening deck..." : "Create or open deck"}
          </button>
        </form>

        <p className="text-center text-sm text-zinc-400">
          Same name = same deck. Share the URL with your friend to collaborate.
        </p>
      </div>
    </div>
  );
}
