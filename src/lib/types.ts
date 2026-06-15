export type Flashcard = {
  id: string;
  deck_id: string;
  front: string;
  back: string;
  position: number;
  created_at: string;
};

export type Deck = {
  id: string;
  slug: string;
  name: string;
  created_at: string;
};
