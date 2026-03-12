import { useEffect, useMemo, useState } from "react";
import { ExternalLink } from "lucide-react";
import Navbar from "@/components/Navbar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const ACCENT_COLOR = "#ff4499";

type BookEntry = {
  title: string;
  author: string;
  summary: string;
  amazonUrl: string;
  notes?: string;
};

type BookSection = {
  title: string;
  subtitle?: string;
  books: BookEntry[];
  secondary?: boolean;
};

const amazonSearchUrl = (query: string) =>
  `https://www.amazon.com/s?k=${encodeURIComponent(query)}`;

const bookSections: BookSection[] = [
  {
    title: "Core Philosophy",
    books: [
      {
        title: "The Ego and Its Own",
        author: "Max Stirner",
        summary:
          "Radical individualism. Stirner argues that all systems—religion, morality, nation, even “humanity”—are illusions that enslave the individual. True freedom comes from rejecting imposed ideals and living for oneself.",
        amazonUrl: "https://www.amazon.com/Ego-Its-Own-Max-Stirner/dp/1978385005",
      },
      {
        title: "Thus Spoke Zarathustra",
        author: "Friedrich Nietzsche",
        summary:
          "A poetic philosophical novel introducing Nietzsche’s ideas: the Übermensch, the death of God, and eternal recurrence. It is a call to create your own values.",
        amazonUrl: amazonSearchUrl("Thus Spoke Zarathustra Nietzsche"),
      },
      {
        title: "Beyond Good and Evil",
        author: "Friedrich Nietzsche",
        summary:
          "A critique of traditional morality and philosophy. Nietzsche argues morals are expressions of power and psychology, not universal truths.",
        amazonUrl: amazonSearchUrl("Beyond Good and Evil Nietzsche"),
      },
      {
        title: "The Will to Power",
        author: "Friedrich Nietzsche",
        summary:
          "A collection of Nietzsche’s notes exploring the idea that the basic drive of life is will to power: the urge to grow, dominate, and create.",
        amazonUrl: amazonSearchUrl("The Will to Power Nietzsche"),
      },
    ],
  },
  {
    title: "Poetry & Shorter Works",
    books: [
      {
        title: "The Raven",
        author: "Edgar Allan Poe",
        summary:
          "A grieving man is haunted by a raven repeating “Nevermore.” It explores loss, obsession, and madness. Poe’s essay explains how he engineered the poem for emotional effect.",
        amazonUrl: amazonSearchUrl("The Raven Edgar Allan Poe"),
        notes: "Plus his essay on how he wrote it",
      },
      {
        title: "Character of the Happy Warrior",
        author: "William Wordsworth",
        summary:
          "Describes the ideal moral hero: disciplined, humble, virtuous, and guided by inner strength.",
        amazonUrl: amazonSearchUrl("Character of the Happy Warrior Wordsworth"),
      },
      {
        title: "Wotan (essay)",
        author: "Carl Jung",
        summary:
          "Jung analyzes Nazi Germany psychologically, suggesting the German people were overtaken by an archetypal mythic force symbolized by the god Wotan.",
        amazonUrl: amazonSearchUrl("Wotan Carl Jung"),
      },
    ],
  },
  {
    title: "Historical Epics & Sagas",
    books: [
      {
        title: "Beowulf",
        author: "Anonymous",
        summary:
          "Hero Beowulf defeats monsters Grendel and a dragon. Themes include heroism, fate, mortality, and honor.",
        amazonUrl: amazonSearchUrl("Beowulf"),
      },
      {
        title: "Nibelungenlied",
        author: "Anonymous",
        summary:
          "A tragic German epic about the hero Siegfried, betrayal, revenge, and doom. It is a foundation of Germanic mythic tradition.",
        amazonUrl: amazonSearchUrl("Nibelungenlied"),
      },
      {
        title: "Hamlet",
        author: "William Shakespeare",
        summary:
          "Prince Hamlet seeks revenge for his father’s murder while struggling with doubt and moral paralysis.",
        amazonUrl: amazonSearchUrl("Hamlet Shakespeare"),
      },
    ],
  },
  {
    title: "Spengler Trilogy",
    books: [
      {
        title: "Man and Technics",
        author: "Oswald Spengler",
        summary:
          "Argues technology is both humanity’s triumph and its downfall. Civilization destroys nature and eventually itself.",
        amazonUrl: amazonSearchUrl("Man and Technics Spengler"),
        notes: "Short",
      },
      {
        title: "Hour of Decision",
        author: "Oswald Spengler",
        summary:
          "A political warning about Western decline, mass democracy, and looming global conflicts.",
        amazonUrl: amazonSearchUrl("Hour of Decision Spengler"),
        notes: "Short",
      },
      {
        title: "The Decline of the West",
        author: "Oswald Spengler",
        summary:
          "Spengler argues civilizations are like organisms: they grow, peak, decay, and die. The West, he argues, is in its final stage.",
        amazonUrl: amazonSearchUrl("Decline of the West Spengler"),
        notes: "Long, arduous",
      },
    ],
  },
  {
    title: "Political & Strategic",
    books: [
      {
        title: "The Concept of the Political",
        author: "Carl Schmitt",
        summary:
          "Defines politics through the friend-enemy distinction and argues political identity comes from conflict.",
        amazonUrl: amazonSearchUrl("The Concept of the Political Carl Schmitt"),
      },
      {
        title: "The Nomos of the Earth",
        author: "Carl Schmitt",
        summary:
          "A history of international law and global order, explaining how European powers shaped modern geopolitics.",
        amazonUrl: amazonSearchUrl("Nomos of the Earth Carl Schmitt"),
      },
      {
        title: "On War",
        author: "Carl von Clausewitz",
        summary:
          "Classic military theory: war is politics by other means, with emphasis on strategy, uncertainty, and morale.",
        amazonUrl: amazonSearchUrl("On War Clausewitz"),
      },
    ],
  },
  {
    title: "Esoteric / Advanced",
    books: [
      {
        title: "Cosmogonic Reflections",
        author: "Ludwig Klages",
        summary:
          "Dense mystical philosophy criticizing modern rationalism and praising instinct, myth, and life-energy.",
        amazonUrl: amazonSearchUrl("Cosmogonic Reflections Ludwig Klages"),
        notes: "Requires multiple reads",
      },
      {
        title: "Faust (Parts 1 & 2)",
        author: "Johann Wolfgang von Goethe",
        summary:
          "Faust sells his soul to Mephistopheles for knowledge and experience. It explores ambition, temptation, redemption, and the human spirit.",
        amazonUrl: amazonSearchUrl("Faust Goethe Parts 1 2"),
        notes: "Part 2 is very difficult",
      },
    ],
  },
  {
    title: "Fiction (For Balance)",
    books: [
      {
        title: "The Picture of Dorian Gray",
        author: "Oscar Wilde",
        summary:
          "A man stays young while his portrait ages, reflecting his corruption. It is about vanity, morality, and beauty.",
        amazonUrl: amazonSearchUrl("Picture of Dorian Gray Oscar Wilde"),
      },
      {
        title: "Flashman series",
        author: "George MacDonald Fraser",
        summary:
          "Comic historical novels about a cowardly British officer stumbling into fame and adventure.",
        amazonUrl: amazonSearchUrl("Flashman series George MacDonald Fraser"),
      },
      {
        title: "Sherlock Holmes",
        author: "Arthur Conan Doyle",
        summary:
          "Detective stories featuring Holmes solving crimes through logic and deduction.",
        amazonUrl: amazonSearchUrl("Sherlock Holmes Arthur Conan Doyle"),
      },
      {
        title: "My Man Jeeves / Jeeves series",
        author: "P.G. Wodehouse",
        summary:
          "Comedy stories about a clueless aristocrat and his brilliant valet Jeeves.",
        amazonUrl: amazonSearchUrl("Jeeves P G Wodehouse"),
      },
    ],
  },
  {
    title: "Also Mentioned (Secondary List)",
    secondary: true,
    books: [
      {
        title: "Heroes and Hero-Worship",
        author: "Thomas Carlyle",
        summary:
          "Argues that history is driven by great individuals and that heroes shape civilizations.",
        amazonUrl: amazonSearchUrl("Heroes and Hero Worship Carlyle"),
      },
      {
        title: "Prussianism and Socialism",
        author: "Oswald Spengler",
        summary:
          "Spengler argues for a disciplined, duty-based “Prussian” socialism over liberal democracy.",
        amazonUrl: amazonSearchUrl("Prussianism and Socialism Spengler"),
      },
    ],
  },
];

const Books = () => {
  const [selectedBook, setSelectedBook] = useState<(BookEntry & { sectionTitle: string }) | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  const totalBooks = useMemo(
    () => bookSections.reduce((sum, section) => sum + section.books.length, 0),
    [],
  );

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 font-sans selection:bg-black selection:text-white transition-colors">
        <Navbar showHomeLink={true} useAbsolutePaths={true} />

        <section className="pt-32 pb-16 border-b-4 border-black dark:border-white bg-background dark:bg-zinc-950 pattern-grid-lg relative overflow-hidden">
          <div className="container mx-auto px-6 relative z-10 text-center">
            <div className="space-y-6">
              <div className="inline-block">
                <span
                  style={{ backgroundColor: ACCENT_COLOR }}
                  className="px-3 py-1 border-2 border-black dark:border-white font-mono font-bold text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]"
                >
                  /BOOKS
                </span>
              </div>

              <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-black dark:text-white mb-4">
                Books
              </h1>

              <p className="text-xl font-mono text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Tap any book to open a summary + Amazon link. {totalBooks} titles total,
                grouped by theme.
              </p>
            </div>
          </div>

          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
        </section>

        <section className="py-16 px-6 bg-gray-50 dark:bg-zinc-950">
          <div className="container mx-auto max-w-4xl space-y-8">
            {bookSections.map((section) => (
              <div
                key={section.title}
                className={`border-4 border-black dark:border-white p-6 transition-all duration-200 ${
                  section.secondary
                    ? "bg-gray-100 dark:bg-zinc-900/70 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.7)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.7)]"
                    : "bg-card dark:bg-zinc-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]"
                }`}
              >
                <div className="flex items-center justify-between gap-4 mb-5">
                  <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-black dark:text-white">
                    {section.title}
                  </h2>
                  <span
                    className="px-3 py-1 border-2 border-black dark:border-white font-mono font-bold text-xs text-white whitespace-nowrap"
                    style={{ backgroundColor: section.secondary ? "#6b7280" : ACCENT_COLOR }}
                  >
                    {section.secondary ? "SECONDARY" : `${section.books.length} BOOKS`}
                  </span>
                </div>

                <ol className="space-y-3">
                  {section.books.map((book, index) => (
                    <li
                      key={`${section.title}-${book.title}`}
                      className="border-2 border-black dark:border-white bg-white dark:bg-zinc-950"
                    >
                      <button
                        type="button"
                        onClick={() => setSelectedBook({ ...book, sectionTitle: section.title })}
                        className="w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-zinc-900 transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-black/20 dark:focus-visible:ring-white/30"
                      >
                        <div className="flex flex-col md:flex-row md:items-start gap-3">
                          <span
                            className="inline-flex items-center justify-center min-w-9 h-9 px-2 border-2 border-black dark:border-white font-mono font-bold text-sm dark:text-white"
                            style={{ backgroundColor: ACCENT_COLOR, color: "white" }}
                          >
                            {index + 1}
                          </span>
                          <div className="flex-1">
                            <p className="text-lg md:text-xl font-black text-black dark:text-white leading-tight">
                              {book.title}
                            </p>
                            <p className="font-mono text-sm md:text-base text-gray-700 dark:text-gray-300">
                              {book.author}
                            </p>
                            {book.notes && (
                              <p className="mt-1 font-mono text-sm italic text-gray-600 dark:text-gray-400">
                                {book.notes}
                              </p>
                            )}
                          </div>
                          <span className="font-mono text-xs uppercase text-gray-500 dark:text-gray-400 self-start md:self-center">
                            Open
                          </span>
                        </div>
                      </button>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </section>
      </div>

      <Dialog open={Boolean(selectedBook)} onOpenChange={(open) => !open && setSelectedBook(null)}>
        <DialogContent className="border-4 border-black dark:border-white bg-card dark:bg-zinc-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] rounded-none max-w-2xl">
          {selectedBook && (
            <div className="space-y-4">
              <DialogHeader className="text-left pr-8">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span
                    className="px-2 py-1 border-2 border-black dark:border-white font-mono font-bold text-[10px] text-white uppercase tracking-wide"
                    style={{ backgroundColor: ACCENT_COLOR }}
                  >
                    {selectedBook.sectionTitle}
                  </span>
                  <span className="px-2 py-1 border-2 border-black dark:border-white font-mono font-bold text-[10px] uppercase dark:text-white">
                    {selectedBook.author}
                  </span>
                </div>
                <DialogTitle className="text-2xl md:text-3xl font-black uppercase tracking-tight dark:text-white leading-tight">
                  {selectedBook.title}
                </DialogTitle>
                <DialogDescription className="font-mono text-sm md:text-base leading-relaxed text-gray-700 dark:text-gray-300">
                  {selectedBook.summary}
                </DialogDescription>
              </DialogHeader>

              {selectedBook.notes && (
                <div className="border-2 border-black dark:border-white bg-white dark:bg-zinc-950 p-3 font-mono text-sm italic text-gray-700 dark:text-gray-300">
                  {selectedBook.notes}
                </div>
              )}

              <a
                href={selectedBook.amazonUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black font-mono font-bold uppercase text-sm border-2 border-black dark:border-white hover:bg-[color:var(--accent)] dark:hover:bg-[color:var(--accent)] hover:text-white dark:hover:text-white transition-all"
                style={{ "--accent": ACCENT_COLOR } as React.CSSProperties}
              >
                View on Amazon
                <ExternalLink size={14} />
              </a>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Books;
