type BookmarkType = "ayat" | "doa" | "sholawat" | "dzikir" | "link";

export interface AyatBookmark {
  type: "ayat" | "doa" | "sholawat" | "dzikir";
  title: string;
  arab: string;
  latin: string | null;
  translation: string | null;
  source: string;
}

export interface LinkBookmark {
  type: "link";
  path: string;
  title: string;
}

export type Bookmark = (AyatBookmark | LinkBookmark) & {
  created_at: string;
};

// Function to save a bookmark
export function save_bookmarks(
  type: BookmarkType,
  data: Omit<AyatBookmark, "type"> | Omit<LinkBookmark, "type">,
  bookmarks: Bookmark[],
): Bookmark[] {
  const allowedTypes: BookmarkType[] = [
    "ayat",
    "dzikir",
    "doa",
    "sholawat",
    "link",
  ];

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
  } else if (type === "link") {
    const { path } = data as Omit<LinkBookmark, "type">;
    if (!path) {
      throw new Error(`Missing required field 'path' for type 'link'.`);
    }
  }

  bookmarks.push(newBookmark);
  return bookmarks;
}
