// Mock dataset for the AI-Enhanced Service Provider Booking Platform.
// In the Flask bundle this lives in MySQL + provider_dataset.csv.

export type Category =
  | "Electrician"
  | "Plumber"
  | "Carpenter"
  | "Painter"
  | "AC Repair"
  | "Home Cleaning"
  | "Appliance Repair";

export const CATEGORIES: { name: Category; icon: string; color: string }[] = [
  { name: "Electrician", icon: "Zap", color: "from-amber-500 to-orange-500" },
  { name: "Plumber", icon: "Wrench", color: "from-sky-500 to-blue-600" },
  { name: "Carpenter", icon: "Hammer", color: "from-orange-600 to-red-600" },
  { name: "Painter", icon: "Paintbrush", color: "from-pink-500 to-rose-500" },
  { name: "AC Repair", icon: "Wind", color: "from-cyan-500 to-teal-500" },
  { name: "Home Cleaning", icon: "Sparkles", color: "from-emerald-500 to-green-600" },
  { name: "Appliance Repair", icon: "Cog", color: "from-violet-500 to-purple-600" },
];

export interface Provider {
  id: string;
  name: string;
  category: Category;
  city: string;
  rating: number; // 1-5
  reviews: number;
  experience: number; // years
  popularity: number; // 0-100
  bookings: number;
  hourlyRate: number;
  avatar: string;
  bio: string;
  verified: boolean;
}

const FIRST = [
  "Aarav",
  "Priya",
  "Rohan",
  "Neha",
  "Vikram",
  "Isha",
  "Kabir",
  "Ananya",
  "Arjun",
  "Maya",
  "Dev",
  "Riya",
  "Sahil",
  "Tara",
  "Yash",
  "Zara",
  "Aditya",
  "Meera",
  "Karan",
  "Sara",
];
const LAST = [
  "Sharma",
  "Verma",
  "Patel",
  "Singh",
  "Kapoor",
  "Mehta",
  "Iyer",
  "Joshi",
  "Reddy",
  "Khan",
  "Nair",
  "Das",
  "Roy",
  "Bose",
  "Gupta",
];
const CITIES = ["Mumbai", "Delhi", "Bangalore", "Pune", "Hyderabad", "Chennai", "Kolkata", "Jaipur"];

function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function generateProviders(): Provider[] {
  const rand = seeded(42);
  const out: Provider[] = [];
  for (let i = 0; i < 120; i++) {
    const cat = CATEGORIES[Math.floor(rand() * CATEGORIES.length)].name;
    const fn = FIRST[Math.floor(rand() * FIRST.length)];
    const ln = LAST[Math.floor(rand() * LAST.length)];
    const rating = +(3.4 + rand() * 1.6).toFixed(1);
    const exp = Math.floor(1 + rand() * 19);
    const reviews = Math.floor(8 + rand() * 380);
    const popularity = Math.floor(30 + rand() * 70);
    const bookings = Math.floor(reviews * (0.6 + rand() * 0.6));
    out.push({
      id: `prov_${i + 1}`,
      name: `${fn} ${ln}`,
      category: cat,
      city: CITIES[Math.floor(rand() * CITIES.length)],
      rating,
      reviews,
      experience: exp,
      popularity,
      bookings,
      hourlyRate: 200 + Math.floor(rand() * 800),
      avatar: `https://i.pravatar.cc/200?img=${(i % 70) + 1}`,
      verified: rand() > 0.35,
      bio: `${cat} with ${exp} years of hands-on experience serving ${CITIES[Math.floor(rand() * CITIES.length)]} and surrounding areas.`,
    });
  }
  return out;
}

export const PROVIDERS: Provider[] = generateProviders();

export interface Review {
  id: string;
  providerId: string;
  user: string;
  rating: number;
  comment: string;
  date: string;
}

const SAMPLE_REVIEWS = [
  "Punctual, professional and got the job done in one visit.",
  "Excellent work quality. Will definitely book again.",
  "Friendly and explained everything before starting.",
  "A bit late but the work was top notch.",
  "Fair pricing and very neat finishing.",
  "Solved an issue two others couldn't. Highly recommend.",
  "Polite and skilled. Cleaned up after the work.",
];

export function reviewsFor(providerId: string): Review[] {
  const seed = providerId.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const rand = seeded(seed);
  const n = 3 + Math.floor(rand() * 4);
  return Array.from({ length: n }).map((_, i) => ({
    id: `${providerId}_r${i}`,
    providerId,
    user: `${FIRST[Math.floor(rand() * FIRST.length)]} ${LAST[Math.floor(rand() * LAST.length)][0]}.`,
    rating: 4 + Math.floor(rand() * 2),
    comment: SAMPLE_REVIEWS[Math.floor(rand() * SAMPLE_REVIEWS.length)],
    date: new Date(Date.now() - Math.floor(rand() * 60) * 86400000).toISOString().slice(0, 10),
  }));
}

export interface Booking {
  id: string;
  providerId: string;
  providerName: string;
  category: Category;
  date: string;
  status: "Pending" | "Accepted" | "Rejected" | "Completed" | "Cancelled";
  notes: string;
  amount: number;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  createdAt?: string;
}

export const INITIAL_BOOKINGS: Booking[] = [
  {
    id: "bk_001",
    providerId: "prov_3",
    providerName: PROVIDERS[2].name,
    category: PROVIDERS[2].category,
    date: "2026-06-22",
    status: "Accepted",
    notes: "Kitchen sink leakage repair",
    amount: 850,
  },
  {
    id: "bk_002",
    providerId: "prov_8",
    providerName: PROVIDERS[7].name,
    category: PROVIDERS[7].category,
    date: "2026-06-25",
    status: "Pending",
    notes: "Living room deep cleaning",
    amount: 1499,
  },
  {
    id: "bk_003",
    providerId: "prov_15",
    providerName: PROVIDERS[14].name,
    category: PROVIDERS[14].category,
    date: "2026-05-30",
    status: "Completed",
    notes: "AC servicing and gas refill",
    amount: 1899,
  },
  {
    id: "bk_004",
    providerId: "prov_21",
    providerName: PROVIDERS[20].name,
    category: PROVIDERS[20].category,
    date: "2026-05-12",
    status: "Completed",
    notes: "Wardrobe carpentry fix",
    amount: 1200,
  },
];

/* ---------- KNN Recommender (mirrors Backend/ML/train_model.py) ---------- */
// Features: rating, experience, popularity, bookings (normalized) + category match weight.
export interface KNNQuery {
  category?: Category;
  city?: string;
  minRating?: number;
}

export function recommendProviders(query: KNNQuery, k = 5): Provider[] {
  const candidates = PROVIDERS.filter(
    (p) =>
      (!query.city || p.city === query.city) && (!query.minRating || p.rating >= query.minRating),
  );
  const maxBookings = Math.max(...PROVIDERS.map((p) => p.bookings));
  const maxRate = Math.max(...PROVIDERS.map((p) => p.hourlyRate));
  const ideal = { rating: 5, experience: 15, popularity: 100, bookings: 1, rate: 0.4 };

  const scored = candidates.map((p) => {
    const f = {
      rating: p.rating / 5,
      experience: Math.min(p.experience / 20, 1),
      popularity: p.popularity / 100,
      bookings: p.bookings / maxBookings,
      rate: p.hourlyRate / maxRate,
    };
    const i = {
      rating: ideal.rating / 5,
      experience: ideal.experience / 20,
      popularity: ideal.popularity / 100,
      bookings: ideal.bookings,
      rate: ideal.rate,
    };
    const dist = Math.sqrt(
      (f.rating - i.rating) ** 2 +
        (f.experience - i.experience) ** 2 * 0.8 +
        (f.popularity - i.popularity) ** 2 * 0.7 +
        (f.bookings - i.bookings) ** 2 * 0.6 +
        (f.rate - i.rate) ** 2 * 0.4,
    );
    const catBoost = query.category && p.category === query.category ? -0.6 : 0;
    return { p, score: dist + catBoost };
  });

  return scored
    .sort((a, b) => a.score - b.score)
    .slice(0, k)
    .map((s) => s.p);
}

export function getProvider(id: string) {
  return PROVIDERS.find((p) => p.id === id);
}
