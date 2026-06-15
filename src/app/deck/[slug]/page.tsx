import FlashcardViewer from "@/components/FlashcardViewer";

type DeckPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function DeckPage({ params }: DeckPageProps) {
  const { slug } = await params;
  const deckName = slug.replace(/-/g, " ");

  return <FlashcardViewer deckSlug={slug} deckName={deckName} />;
}
