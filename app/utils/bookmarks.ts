type BookmarkType = "ayat" | "doa" | "sholawat" | "dzikir";

export interface AyatBookmark {
  type: "ayat" | "doa" | "sholawat" | "dzikir";
  title: string;
  arab: string;
  latin: string | null;
  tafsir: {
    source: string | null;
    text: string | null;
  } | null;
  translation: string | null;
  source: string;
  created_at?: string;
}

export interface LinkBookmark {
  type: "link";
  path: string;
  title: string;
}

export type Bookmark = AyatBookmark;

// Function to save a bookmark
export function save_bookmarks(
  type: BookmarkType,
  data: Omit<AyatBookmark, "type">,
  bookmarks: Bookmark[],
): Bookmark[] {
  const allowedTypes: BookmarkType[] = ["ayat", "dzikir", "doa", "sholawat"];

  if (!allowedTypes.includes(type)) {
    throw new Error(
      `Invalid type: ${type}. Allowed types are ${allowedTypes.join(", ")}`,
    );
  }

  let newBookmark: Bookmark = {
    ...data,
    type,
    created_at: new Date().toISOString(),
  } as Bookmark;

  if (
    type === "ayat" ||
    type === "doa" ||
    type === "sholawat" ||
    type === "dzikir"
  ) {
    const { arab, source } = data as Omit<AyatBookmark, "type">;
    if (!arab || !source) {
      throw new Error(`Missing required fields for type '${type}'.`);
    }
  }

  bookmarks.push(newBookmark);
  return bookmarks;
}
