
export interface StoreItem {
  id: number;
  name: string;
  description: string;
  icon: string;
  price: number;
  inStock: boolean;
  popular?: boolean;
}

export interface Bundle {
  id: number;
  name: string;
  description: string;
  icon: string;
  price: number;
  originalPrice: number;
  items: string[];
}

interface StoreItems {
  lifelines: StoreItem[];
  powerups: StoreItem[];
  cosmetics: StoreItem[];
  bundles: Bundle[];
}

export const STORE_ITEMS: StoreItems = {
  lifelines: [
    { id: 1, name: "50/50", description: "Remove two incorrect answers from a multiple-choice question.", icon: "⚡", price: 50, inStock: true, popular: true },
    { id: 2, name: "Ask the Imam", description: "Get a contextual hint from an AI-powered Imam.", icon: "🧠", price: 75, inStock: true },
    { id: 3, name: "Skip Question", description: "Move to the next question without penalty.", icon: "⏭️", price: 25, inStock: true },
    { id: 4, name: "Extra Time", description: "Add 15 seconds to the timer for the current question.", icon: "⏰", price: 30, inStock: true, popular: true },
  ],
  powerups: [
    { id: 5, name: "Double Points", description: "Earn 2x the points for your next correct answer.", icon: "💎", price: 100, inStock: true, popular: true },
    { id: 6, name: "Streak Shield", description: "Protect your answer streak from being reset on one wrong answer.", icon: "🛡️", price: 150, inStock: true },
    { id: 7, name: "XP Boost", description: "Receive a 50% XP boost for the entire quiz.", icon: "🚀", price: 200, inStock: true },
    { id: 8, name: "Free Pass", description: "Get one question right automatically.", icon: "🎟️", price: 250, inStock: false },
  ],
  cosmetics: [
    { id: 9, name: "Golden Avatar Frame", description: "A shiny gold frame for your profile picture.", icon: "🖼️", price: 500, inStock: true, popular: true },
    { id: 10, name: "Starry Background", description: "A beautiful starry night background for your profile.", icon: "🌌", price: 300, inStock: true },
    { id: 11, name: "Calligraphy Badge", description: "An exclusive badge featuring beautiful Arabic calligraphy.", icon: "🖋️", price: 400, inStock: true },
    { id: 12, name: "Masjid Profile Theme", description: "A full profile theme inspired by mosque architecture.", icon: "🕌", price: 750, inStock: false },
  ],
  bundles: [
    {
      id: 1,
      name: "Starter Pack",
      description: "Everything a new student needs to get ahead.",
      icon: "🎁",
      price: 250,
      originalPrice: 330,
      items: ["3x 50/50 Lifelines", "2x Ask the Imam", "1x Streak Shield"],
    },
    {
      id: 2,
      name: "Scholar's Bundle",
      description: "A comprehensive pack for the dedicated learner.",
      icon: "📚",
      price: 500,
      originalPrice: 680,
      items: ["5x All Lifelines", "2x XP Boost", "Golden Avatar Frame"],
    },
  ],
};
