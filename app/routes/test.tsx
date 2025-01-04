import React from "react";
// Define types for bookmark data
import { Trash2, Repeat } from "lucide-react";
import { Button } from "#app/components/ui/button-shadcn";
type BookmarkType = "ayat" | "doa" | "sholawat" | "link";

interface AyatBookmark {
  type: "ayat" | "doa" | "sholawat";
  arab: string;
  latin: string;
  translation: string;
  source: string;
}

interface LinkBookmark {
  type: "link";
  path: string;
}

type Bookmark = (AyatBookmark | LinkBookmark) & {
  createdAt: string;
};

// Function to save a bookmark
function saveBookmark(
  type: BookmarkType,
  data: Omit<AyatBookmark, "type"> | Omit<LinkBookmark, "type">,
  bookmarks: Bookmark[],
): Bookmark[] {
  const allowedTypes: BookmarkType[] = ["ayat", "doa", "sholawat", "link"];

  if (!allowedTypes.includes(type)) {
    throw new Error(
      `Invalid type: ${type}. Allowed types are ${allowedTypes.join(", ")}`,
    );
  }

  let newBookmark: Bookmark = {
    ...data,
    type,
    createdAt: new Date().toISOString(),
  } as Bookmark;

  if (type === "ayat" || type === "doa" || type === "sholawat") {
    const { arab, latin, translation, source } = data as Omit<
      AyatBookmark,
      "type"
    >;
    if (!arab || !latin || !translation || !source) {
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
// Function to delete a bookmark

// React Component Example
const App: React.FC = () => {
  const [bookmarks, setBookmarks] = React.useState<Bookmark[]>([]);

  const handleAddAyat = () => {
    try {
      const newBookmarks = saveBookmark(
        "ayat",
        {
          arab: "إن الله مع الصابرين",
          latin: "Inna Allaha ma'a as-sabireen",
          translation: "Sesungguhnya Allah beserta orang-orang yang sabar.",
          source: "Al-Baqarah: 153",
        },
        [...bookmarks],
      );
      setBookmarks(newBookmarks);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddLink = () => {
    try {
      const newBookmarks = saveBookmark(
        "link",
        { path: "https://example.com" },
        [...bookmarks],
      );
      setBookmarks(newBookmarks);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteBookmark = (createdAt: string) => {
    try {
      const newBookmarks = bookmarks?.filter((d) => d.createdAt !== createdAt);
      setBookmarks(newBookmarks);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h1>Bookmark Manager</h1>
      <button onClick={handleAddAyat}>Add Ayat</button>
      <button onClick={handleAddLink}>Add Link</button>

      {bookmarks.map((d, index) => (
        <div key={index} className="flex item-start gap-x-2">
          <Button
            size="icon"
            variant="destructive"
            onClick={() => handleDeleteBookmark(d.createdAt)}
          >
            <Trash2 />
          </Button>
          <span>{index}</span>
          <pre className="text-sm">{JSON.stringify(d, null, 2)}</pre>
        </div>
      ))}
    </div>
  );
};

export default App;
