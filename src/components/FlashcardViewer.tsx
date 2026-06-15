"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createSupabaseClient } from "@/lib/supabase";
import type { Flashcard } from "@/lib/types";

type FlashcardViewerProps = {
  deckSlug: string;
  deckName: string;
};

export default function FlashcardViewer({
  deckSlug,
  deckName: initialDeckName,
}: FlashcardViewerProps) {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [deckName, setDeckName] = useState(initialDeckName);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [deckId, setDeckId] = useState<string | null>(null);

  const current = cards[index];
  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/deck/${deckSlug}`;
  }, [deckSlug]);

  const loadCards = useCallback(async () => {
    const supabase = createSupabaseClient();

    const { data: deck, error: deckError } = await supabase
      .from("decks")
      .select("id, name")
      .eq("slug", deckSlug)
      .single();

    if (deckError || !deck) {
      setError("Deck not found.");
      setLoading(false);
      return;
    }

    setDeckId(deck.id);
    setDeckName(deck.name);

    const { data, error: cardsError } = await supabase
      .from("flashcards")
      .select("*")
      .eq("deck_id", deck.id)
      .order("position", { ascending: true })
      .order("created_at", { ascending: true });

    if (cardsError) {
      setError(cardsError.message);
    } else {
      setCards(data ?? []);
      setIndex((currentIndex) =>
        data && data.length > 0
          ? Math.min(currentIndex, data.length - 1)
          : 0,
      );
    }

    setLoading(false);
  }, [deckSlug]);

  useEffect(() => {
    loadCards();
  }, [loadCards]);

  useEffect(() => {
    if (!deckId) return;

    const supabase = createSupabaseClient();
    const channel = supabase
      .channel(`deck-${deckId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "flashcards",
          filter: `deck_id=eq.${deckId}`,
        },
        () => {
          loadCards();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [deckId, loadCards]);

  async function addCard(event: React.FormEvent) {
    event.preventDefault();
    if (!deckId) return;

    const trimmedFront = front.trim();
    const trimmedBack = back.trim();
    if (!trimmedFront || !trimmedBack) return;

    const supabase = createSupabaseClient();
    const { error: insertError } = await supabase.from("flashcards").insert({
      deck_id: deckId,
      front: trimmedFront,
      back: trimmedBack,
      position: cards.length,
    });

    if (insertError) {
      setError(insertError.message);
      return;
    }

    setFront("");
    setBack("");
    setFlipped(false);
  }

  async function copyLink() {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  function goPrev() {
    setFlipped(false);
    setIndex((currentIndex) => Math.max(0, currentIndex - 1));
  }

  function goNext() {
    setFlipped(false);
    setIndex((currentIndex) =>
      Math.min(cards.length - 1, currentIndex + 1),
    );
  }

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center text-zinc-500">
        Loading deck...
      </div>
    );
  }

  if (error && !deckId) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6">
        <p className="text-red-600">{error}</p>
        <Link
          href="/"
          className="rounded-2xl bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-700"
        >
          Back home
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link href="/" className="text-sm text-zinc-400 hover:text-zinc-600">
            ← All decks
          </Link>
          <h1 className="mt-1 text-2xl font-semibold">{deckName}</h1>
        </div>
        <button
          type="button"
          onClick={copyLink}
          className="rounded-2xl bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-200"
        >
          {copied ? "Link copied!" : "Copy share link"}
        </button>
      </header>

      <section className="space-y-4">
        {cards.length === 0 ? (
          <div className="rounded-3xl bg-zinc-100 px-6 py-16 text-center text-zinc-500">
            No cards yet. Add your first flashcard below.
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setFlipped((value) => !value)}
              className="group min-h-56 w-full rounded-3xl bg-zinc-100 px-8 py-12 text-center transition hover:bg-zinc-200"
            >
              <p className="text-sm uppercase tracking-wide text-zinc-400">
                {flipped ? "Back" : "Front"}
              </p>
              <p className="mt-4 text-2xl font-medium leading-relaxed text-zinc-900">
                {flipped ? current.back : current.front}
              </p>
              <p className="mt-6 text-sm text-zinc-400">
                Tap to flip
              </p>
            </button>

            <div className="flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={goPrev}
                disabled={index === 0}
                className="rounded-2xl bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-sm text-zinc-500">
                {index + 1} / {cards.length}
              </span>
              <button
                type="button"
                onClick={goNext}
                disabled={index >= cards.length - 1}
                className="rounded-2xl bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </>
        )}
      </section>

      <form onSubmit={addCard} className="space-y-4 rounded-3xl bg-zinc-50 p-6">
        <h2 className="text-lg font-medium">Add a card</h2>
        <label className="block space-y-2">
          <span className="text-sm text-zinc-500">Front</span>
          <input
            type="text"
            value={front}
            onChange={(event) => setFront(event.target.value)}
            placeholder="Question or term"
            className="w-full rounded-2xl bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-zinc-300"
          />
        </label>
        <label className="block space-y-2">
          <span className="text-sm text-zinc-500">Back</span>
          <input
            type="text"
            value={back}
            onChange={(event) => setBack(event.target.value)}
            placeholder="Answer or definition"
            className="w-full rounded-2xl bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-zinc-300"
          />
        </label>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button
          type="submit"
          className="rounded-2xl bg-zinc-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-zinc-700"
        >
          Add card
        </button>
      </form>
    </div>
  );
}
