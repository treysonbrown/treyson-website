export type AccommodationBlock = {
  city: string;
  start: string;
  end: string;
  note?: string;
};

export type TripDay = {
  id: string;
  dateLabel: string;
  dayOfWeek: string;
  city: string;
  mainPlan?: string;
  otherPlans?: string[];
  foodIdeas?: string[];
  notes?: string[];
};

export type TripDayOverride = {
  _id: string;
  tripSlug: string;
  dayId: string;
  city?: string;
  mainPlan?: string;
  otherPlans: string[];
  foodIdeas: string[];
  notes: string[];
  updatedAt: number;
};

export type TripDayFormValues = {
  city: string;
  mainPlan: string;
  otherPlans: string;
  foodIdeas: string;
  notes: string;
};

export type IdeaCategory = "food" | "sight" | "shopping" | "day-trip" | "hotel" | "transit" | "other";

export type TripIdea = {
  _id: string;
  _creationTime?: number;
  tripSlug: string;
  title: string;
  url?: string;
  imageUrl?: string;
  description?: string;
  city?: string;
  day?: string;
  category?: string;
  createdAt: number;
};

export type TripIdeaFormValues = {
  title: string;
  url: string;
  imageUrl: string;
  description: string;
  city: string;
  day: string;
  category: string;
};

export const accommodationBlocks: AccommodationBlock[] = [
  {
    city: "Tokyo",
    start: "May 1",
    end: "May 7",
  },
  {
    city: "Osaka",
    start: "May 8",
    end: "May 13",
  },
  {
    city: "May 14",
    start: "Open decision",
    end: "Open decision",
    note: "All-nighter, extend Osaka through May 14, or return to Tokyo for one final night.",
  },
];

export const tripDays: TripDay[] = [
  {
    id: "may-1",
    dateLabel: "May 1, 2026",
    dayOfWeek: "Friday",
    city: "Tokyo",
  },
  {
    id: "may-2",
    dateLabel: "May 2, 2026",
    dayOfWeek: "Saturday",
    city: "Tokyo",
  },
  {
    id: "may-3",
    dateLabel: "May 3, 2026",
    dayOfWeek: "Sunday",
    city: "Tokyo",
    mainPlan: "Kamakura day trip",
    otherPlans: ["Enoshima Island", "Hanging train", "Aquarium", "Beach"],
    notes: ["Use the JR line.", "Does not need tickets in advance."],
  },
  {
    id: "may-4",
    dateLabel: "May 4, 2026",
    dayOfWeek: "Monday",
    city: "Tokyo",
  },
  {
    id: "may-5",
    dateLabel: "May 5, 2026",
    dayOfWeek: "Tuesday",
    city: "Tokyo",
    mainPlan: "Mt. Fuji day trip",
    notes: ["Main Fuji day."],
  },
  {
    id: "may-6",
    dateLabel: "May 6, 2026",
    dayOfWeek: "Wednesday",
    city: "Tokyo",
    notes: ["Backup Fuji day if May 5 weather is bad."],
  },
  {
    id: "may-7",
    dateLabel: "May 7, 2026",
    dayOfWeek: "Thursday",
    city: "Tokyo",
  },
  {
    id: "may-8",
    dateLabel: "May 8, 2026",
    dayOfWeek: "Friday",
    city: "Osaka",
  },
  {
    id: "may-9",
    dateLabel: "May 9, 2026",
    dayOfWeek: "Saturday",
    city: "Osaka",
  },
  {
    id: "may-10",
    dateLabel: "May 10, 2026",
    dayOfWeek: "Sunday",
    city: "Osaka",
  },
  {
    id: "may-11",
    dateLabel: "May 11, 2026",
    dayOfWeek: "Monday",
    city: "Osaka",
  },
  {
    id: "may-12",
    dateLabel: "May 12, 2026",
    dayOfWeek: "Tuesday",
    city: "Osaka",
  },
  {
    id: "may-13",
    dateLabel: "May 13, 2026",
    dayOfWeek: "Wednesday",
    city: "Osaka",
  },
  {
    id: "may-14",
    dateLabel: "May 14, 2026",
    dayOfWeek: "Thursday",
    city: "Open",
    notes: [
      "Open decision: all-nighter on the 14th, book Osaka May 8-14, or stay in Tokyo one last night.",
    ],
  },
];

export const ideaCategoryOptions: { value: IdeaCategory; label: string }[] = [
  { value: "food", label: "Food" },
  { value: "sight", label: "Sight" },
  { value: "shopping", label: "Shopping" },
  { value: "day-trip", label: "Day Trip" },
  { value: "hotel", label: "Hotel" },
  { value: "transit", label: "Transit" },
  { value: "other", label: "Other" },
];

export const dayOptions = tripDays.map((day) => ({
  value: day.dateLabel,
  label: `${day.dateLabel} (${day.dayOfWeek})`,
}));

export const cityOptions = ["Tokyo", "Osaka", "Kamakura", "Enoshima", "Mt. Fuji", "Open"].map((city) => ({
  value: city,
  label: city,
}));
