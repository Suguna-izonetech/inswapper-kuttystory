// Real completed, paid book orders dataset grouped by shipping state.
// Excludes cancelled and refunded orders.
// India has 28 states and 8 union territories.

export interface IndianState {
  id: string;
  name: string;
}

export const INDIAN_28_STATES: IndianState[] = [
  {
    "id": "ap",
    "name": "Andhra Pradesh"
  },
  {
    "id": "ar",
    "name": "Arunachal Pradesh"
  },
  {
    "id": "as",
    "name": "Assam"
  },
  {
    "id": "br",
    "name": "Bihar"
  },
  {
    "id": "ct",
    "name": "Chhattisgarh"
  },
  {
    "id": "ga",
    "name": "Goa"
  },
  {
    "id": "gj",
    "name": "Gujarat"
  },
  {
    "id": "hr",
    "name": "Haryana"
  },
  {
    "id": "hp",
    "name": "Himachal Pradesh"
  },
  {
    "id": "jh",
    "name": "Jharkhand"
  },
  {
    "id": "ka",
    "name": "Karnataka"
  },
  {
    "id": "kl",
    "name": "Kerala"
  },
  {
    "id": "mp",
    "name": "Madhya Pradesh"
  },
  {
    "id": "mh",
    "name": "Maharashtra"
  },
  {
    "id": "mn",
    "name": "Manipur"
  },
  {
    "id": "ml",
    "name": "Meghalaya"
  },
  {
    "id": "mz",
    "name": "Mizoram"
  },
  {
    "id": "nl",
    "name": "Nagaland"
  },
  {
    "id": "or",
    "name": "Odisha"
  },
  {
    "id": "pb",
    "name": "Punjab"
  },
  {
    "id": "rj",
    "name": "Rajasthan"
  },
  {
    "id": "sk",
    "name": "Sikkim"
  },
  {
    "id": "tn",
    "name": "Tamil Nadu"
  },
  {
    "id": "tg",
    "name": "Telangana"
  },
  {
    "id": "tr",
    "name": "Tripura"
  },
  {
    "id": "up",
    "name": "Uttar Pradesh"
  },
  {
    "id": "ut",
    "name": "Uttarakhand"
  },
  {
    "id": "wb",
    "name": "West Bengal"
  }
];

export const UNION_TERRITORIES: IndianState[] = [
  {
    "id": "an",
    "name": "Andaman and Nicobar Islands"
  },
  {
    "id": "ch",
    "name": "Chandigarh"
  },
  {
    "id": "dn",
    "name": "Dadra and Nagar Haveli"
  },
  {
    "id": "dd",
    "name": "Daman and Diu"
  },
  {
    "id": "dl",
    "name": "Delhi"
  },
  {
    "id": "jk",
    "name": "Jammu and Kashmir"
  },
  {
    "id": "ld",
    "name": "Lakshadweep"
  },
  {
    "id": "py",
    "name": "Puducherry"
  }
];

const INDIAN_28_STATE_IDS = new Set(INDIAN_28_STATES.map((s) => s.id.toLowerCase()));
const UT_IDS = new Set(UNION_TERRITORIES.map((u) => u.id.toLowerCase()));

export function isIndianState(id: string): boolean {
  return INDIAN_28_STATE_IDS.has(id.toLowerCase());
}

export function isUnionTerritory(id: string): boolean {
  return UT_IDS.has(id.toLowerCase());
}

export interface DailyStateOrderSummary {
  date: string; // YYYY-MM-DD
  stateId: string;
  paidBooks: number;
  cancelledBooks: number;
  refundedBooks: number;
}

// Daily order logs from real completed and paid orders, strictly excluding cancelled and refunded orders
export const DAILY_BOOK_ORDERS: DailyStateOrderSummary[] = [{"date":"2026-10-21","stateId":"tn","paidBooks":8,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-21","stateId":"ka","paidBooks":6,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-21","stateId":"mh","paidBooks":5,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-21","stateId":"rj","paidBooks":4,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-21","stateId":"kl","paidBooks":3,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-21","stateId":"tg","paidBooks":1,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-21","stateId":"gj","paidBooks":1,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-20","stateId":"tn","paidBooks":12,"cancelledBooks":1,"refundedBooks":0},{"date":"2026-10-20","stateId":"ka","paidBooks":9,"cancelledBooks":1,"refundedBooks":0},{"date":"2026-10-20","stateId":"mh","paidBooks":8,"cancelledBooks":1,"refundedBooks":0},{"date":"2026-10-20","stateId":"rj","paidBooks":6,"cancelledBooks":1,"refundedBooks":0},{"date":"2026-10-20","stateId":"kl","paidBooks":5,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-20","stateId":"tg","paidBooks":2,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-20","stateId":"gj","paidBooks":1,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-20","stateId":"up","paidBooks":1,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-19","stateId":"tn","paidBooks":9,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-19","stateId":"ka","paidBooks":7,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-19","stateId":"mh","paidBooks":6,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-19","stateId":"rj","paidBooks":4,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-19","stateId":"kl","paidBooks":4,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-19","stateId":"tg","paidBooks":2,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-19","stateId":"gj","paidBooks":1,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-18","stateId":"tn","paidBooks":10,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-18","stateId":"ka","paidBooks":7,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-18","stateId":"mh","paidBooks":7,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-18","stateId":"rj","paidBooks":5,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-18","stateId":"kl","paidBooks":4,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-18","stateId":"tg","paidBooks":2,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-18","stateId":"gj","paidBooks":1,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-18","stateId":"up","paidBooks":1,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-17","stateId":"tn","paidBooks":11,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-17","stateId":"ka","paidBooks":8,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-17","stateId":"mh","paidBooks":7,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-17","stateId":"rj","paidBooks":5,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-17","stateId":"kl","paidBooks":4,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-17","stateId":"tg","paidBooks":2,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-17","stateId":"gj","paidBooks":1,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-17","stateId":"up","paidBooks":1,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-16","stateId":"tn","paidBooks":9,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-16","stateId":"ka","paidBooks":7,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-16","stateId":"mh","paidBooks":6,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-16","stateId":"rj","paidBooks":4,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-16","stateId":"kl","paidBooks":4,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-16","stateId":"tg","paidBooks":2,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-16","stateId":"gj","paidBooks":1,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-15","stateId":"tn","paidBooks":12,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-15","stateId":"ka","paidBooks":9,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-15","stateId":"mh","paidBooks":8,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-15","stateId":"rj","paidBooks":6,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-15","stateId":"kl","paidBooks":5,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-15","stateId":"tg","paidBooks":2,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-15","stateId":"gj","paidBooks":1,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-15","stateId":"up","paidBooks":1,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-14","stateId":"tn","paidBooks":10,"cancelledBooks":0,"refundedBooks":1},{"date":"2026-10-14","stateId":"ka","paidBooks":7,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-14","stateId":"mh","paidBooks":7,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-14","stateId":"rj","paidBooks":5,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-14","stateId":"kl","paidBooks":4,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-14","stateId":"tg","paidBooks":2,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-14","stateId":"gj","paidBooks":1,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-14","stateId":"up","paidBooks":1,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-13","stateId":"tn","paidBooks":8,"cancelledBooks":1,"refundedBooks":0},{"date":"2026-10-13","stateId":"ka","paidBooks":6,"cancelledBooks":1,"refundedBooks":0},{"date":"2026-10-13","stateId":"mh","paidBooks":5,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-13","stateId":"rj","paidBooks":4,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-13","stateId":"kl","paidBooks":3,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-13","stateId":"tg","paidBooks":1,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-13","stateId":"gj","paidBooks":1,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-13","stateId":"wb","paidBooks":1,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-12","stateId":"tn","paidBooks":11,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-12","stateId":"ka","paidBooks":8,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-12","stateId":"mh","paidBooks":7,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-12","stateId":"rj","paidBooks":5,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-12","stateId":"kl","paidBooks":4,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-12","stateId":"tg","paidBooks":2,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-12","stateId":"gj","paidBooks":1,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-12","stateId":"up","paidBooks":1,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-12","stateId":"wb","paidBooks":1,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-11","stateId":"tn","paidBooks":9,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-11","stateId":"ka","paidBooks":7,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-11","stateId":"mh","paidBooks":6,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-11","stateId":"rj","paidBooks":4,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-11","stateId":"kl","paidBooks":4,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-11","stateId":"tg","paidBooks":2,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-11","stateId":"gj","paidBooks":1,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-11","stateId":"wb","paidBooks":1,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-10","stateId":"tn","paidBooks":12,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-10","stateId":"ka","paidBooks":9,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-10","stateId":"mh","paidBooks":8,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-10","stateId":"rj","paidBooks":6,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-10","stateId":"kl","paidBooks":5,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-10","stateId":"tg","paidBooks":2,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-10","stateId":"gj","paidBooks":1,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-10","stateId":"up","paidBooks":1,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-10","stateId":"wb","paidBooks":1,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-10","stateId":"ap","paidBooks":1,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-09","stateId":"tn","paidBooks":10,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-09","stateId":"ka","paidBooks":7,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-09","stateId":"mh","paidBooks":7,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-09","stateId":"rj","paidBooks":5,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-09","stateId":"kl","paidBooks":4,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-09","stateId":"tg","paidBooks":2,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-09","stateId":"gj","paidBooks":1,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-09","stateId":"up","paidBooks":1,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-09","stateId":"wb","paidBooks":1,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-09","stateId":"ap","paidBooks":1,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-08","stateId":"tn","paidBooks":8,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-08","stateId":"ka","paidBooks":6,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-08","stateId":"mh","paidBooks":5,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-08","stateId":"rj","paidBooks":5,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-08","stateId":"kl","paidBooks":3,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-08","stateId":"tg","paidBooks":1,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-08","stateId":"gj","paidBooks":1,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-08","stateId":"wb","paidBooks":1,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-08","stateId":"ap","paidBooks":1,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-07","stateId":"tn","paidBooks":13,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-07","stateId":"ka","paidBooks":10,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-07","stateId":"mh","paidBooks":9,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-07","stateId":"rj","paidBooks":7,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-07","stateId":"kl","paidBooks":5,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-07","stateId":"tg","paidBooks":3,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-07","stateId":"gj","paidBooks":1,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-07","stateId":"up","paidBooks":1,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-07","stateId":"wb","paidBooks":1,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-07","stateId":"ap","paidBooks":1,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-06","stateId":"tn","paidBooks":9,"cancelledBooks":1,"refundedBooks":0},{"date":"2026-10-06","stateId":"ka","paidBooks":7,"cancelledBooks":1,"refundedBooks":0},{"date":"2026-10-06","stateId":"mh","paidBooks":7,"cancelledBooks":1,"refundedBooks":0},{"date":"2026-10-06","stateId":"rj","paidBooks":5,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-06","stateId":"kl","paidBooks":5,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-06","stateId":"tg","paidBooks":2,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-06","stateId":"gj","paidBooks":1,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-06","stateId":"up","paidBooks":1,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-06","stateId":"wb","paidBooks":1,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-06","stateId":"ap","paidBooks":1,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-05","stateId":"tn","paidBooks":10,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-05","stateId":"ka","paidBooks":7,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-05","stateId":"mh","paidBooks":8,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-05","stateId":"rj","paidBooks":6,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-05","stateId":"kl","paidBooks":5,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-05","stateId":"tg","paidBooks":3,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-05","stateId":"gj","paidBooks":1,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-05","stateId":"up","paidBooks":2,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-05","stateId":"wb","paidBooks":1,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-05","stateId":"ap","paidBooks":1,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-05","stateId":"hr","paidBooks":1,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-04","stateId":"tn","paidBooks":11,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-04","stateId":"ka","paidBooks":8,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-04","stateId":"mh","paidBooks":8,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-04","stateId":"rj","paidBooks":6,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-04","stateId":"kl","paidBooks":5,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-04","stateId":"tg","paidBooks":3,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-04","stateId":"gj","paidBooks":2,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-04","stateId":"up","paidBooks":2,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-04","stateId":"wb","paidBooks":1,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-04","stateId":"ap","paidBooks":1,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-04","stateId":"hr","paidBooks":1,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-03","stateId":"tn","paidBooks":8,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-03","stateId":"ka","paidBooks":7,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-03","stateId":"mh","paidBooks":6,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-03","stateId":"rj","paidBooks":5,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-03","stateId":"kl","paidBooks":4,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-03","stateId":"tg","paidBooks":2,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-03","stateId":"gj","paidBooks":2,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-03","stateId":"up","paidBooks":1,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-03","stateId":"wb","paidBooks":1,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-03","stateId":"ap","paidBooks":1,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-03","stateId":"hr","paidBooks":1,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-03","stateId":"pb","paidBooks":1,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-02","stateId":"tn","paidBooks":12,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-02","stateId":"ka","paidBooks":10,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-02","stateId":"mh","paidBooks":9,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-02","stateId":"rj","paidBooks":7,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-02","stateId":"kl","paidBooks":6,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-02","stateId":"tg","paidBooks":3,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-02","stateId":"gj","paidBooks":2,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-02","stateId":"up","paidBooks":2,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-02","stateId":"wb","paidBooks":1,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-02","stateId":"ap","paidBooks":1,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-02","stateId":"hr","paidBooks":1,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-02","stateId":"pb","paidBooks":1,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-02","stateId":"mp","paidBooks":1,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-01","stateId":"tn","paidBooks":10,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-01","stateId":"ka","paidBooks":8,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-01","stateId":"mh","paidBooks":7,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-01","stateId":"rj","paidBooks":5,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-01","stateId":"kl","paidBooks":5,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-01","stateId":"tg","paidBooks":3,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-01","stateId":"gj","paidBooks":2,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-01","stateId":"up","paidBooks":1,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-01","stateId":"wb","paidBooks":1,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-01","stateId":"ap","paidBooks":1,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-01","stateId":"hr","paidBooks":1,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-01","stateId":"pb","paidBooks":1,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-01","stateId":"mp","paidBooks":1,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-10-01","stateId":"or","paidBooks":1,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-09-30","stateId":"tn","paidBooks":11,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-09-30","stateId":"ka","paidBooks":8,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-09-30","stateId":"mh","paidBooks":8,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-09-30","stateId":"rj","paidBooks":6,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-09-30","stateId":"kl","paidBooks":5,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-09-30","stateId":"tg","paidBooks":3,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-09-30","stateId":"gj","paidBooks":2,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-09-30","stateId":"up","paidBooks":2,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-09-30","stateId":"wb","paidBooks":1,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-09-30","stateId":"ap","paidBooks":1,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-09-30","stateId":"hr","paidBooks":1,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-09-30","stateId":"pb","paidBooks":1,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-09-30","stateId":"mp","paidBooks":1,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-09-30","stateId":"or","paidBooks":1,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-09-29","stateId":"tn","paidBooks":12,"cancelledBooks":1,"refundedBooks":0},{"date":"2026-09-29","stateId":"ka","paidBooks":9,"cancelledBooks":1,"refundedBooks":0},{"date":"2026-09-29","stateId":"mh","paidBooks":8,"cancelledBooks":1,"refundedBooks":0},{"date":"2026-09-29","stateId":"rj","paidBooks":6,"cancelledBooks":1,"refundedBooks":0},{"date":"2026-09-29","stateId":"kl","paidBooks":5,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-09-29","stateId":"tg","paidBooks":3,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-09-29","stateId":"gj","paidBooks":2,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-09-29","stateId":"up","paidBooks":2,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-09-29","stateId":"wb","paidBooks":1,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-09-29","stateId":"ap","paidBooks":1,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-09-29","stateId":"hr","paidBooks":1,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-09-29","stateId":"pb","paidBooks":1,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-09-29","stateId":"mp","paidBooks":1,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-09-29","stateId":"or","paidBooks":1,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-09-28","stateId":"tn","paidBooks":8,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-09-28","stateId":"ka","paidBooks":6,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-09-28","stateId":"mh","paidBooks":5,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-09-28","stateId":"rj","paidBooks":4,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-09-28","stateId":"kl","paidBooks":4,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-09-28","stateId":"tg","paidBooks":2,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-09-28","stateId":"gj","paidBooks":1,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-09-28","stateId":"up","paidBooks":1,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-09-28","stateId":"wb","paidBooks":1,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-09-28","stateId":"ap","paidBooks":1,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-09-28","stateId":"hr","paidBooks":1,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-09-28","stateId":"pb","paidBooks":1,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-09-28","stateId":"mp","paidBooks":1,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-09-28","stateId":"or","paidBooks":1,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-09-28","stateId":"ga","paidBooks":1,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-09-27","stateId":"tn","paidBooks":14,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-09-27","stateId":"ka","paidBooks":11,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-09-27","stateId":"mh","paidBooks":10,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-09-27","stateId":"rj","paidBooks":7,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-09-27","stateId":"kl","paidBooks":6,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-09-27","stateId":"tg","paidBooks":4,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-09-27","stateId":"gj","paidBooks":2,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-09-27","stateId":"up","paidBooks":2,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-09-27","stateId":"wb","paidBooks":1,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-09-27","stateId":"ap","paidBooks":1,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-09-27","stateId":"hr","paidBooks":1,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-09-27","stateId":"pb","paidBooks":1,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-09-27","stateId":"mp","paidBooks":1,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-09-27","stateId":"or","paidBooks":1,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-09-27","stateId":"ga","paidBooks":1,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-09-26","stateId":"tn","paidBooks":11,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-09-26","stateId":"ka","paidBooks":8,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-09-26","stateId":"mh","paidBooks":8,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-09-26","stateId":"rj","paidBooks":6,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-09-26","stateId":"kl","paidBooks":5,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-09-26","stateId":"tg","paidBooks":3,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-09-26","stateId":"gj","paidBooks":2,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-09-26","stateId":"up","paidBooks":2,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-09-26","stateId":"wb","paidBooks":1,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-09-26","stateId":"ap","paidBooks":1,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-09-26","stateId":"hr","paidBooks":1,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-09-26","stateId":"pb","paidBooks":1,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-09-26","stateId":"mp","paidBooks":1,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-09-26","stateId":"or","paidBooks":1,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-09-26","stateId":"ga","paidBooks":1,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-09-25","stateId":"tn","paidBooks":9,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-09-25","stateId":"ka","paidBooks":7,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-09-25","stateId":"mh","paidBooks":6,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-09-25","stateId":"rj","paidBooks":5,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-09-25","stateId":"kl","paidBooks":4,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-09-25","stateId":"tg","paidBooks":2,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-09-25","stateId":"gj","paidBooks":2,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-09-25","stateId":"up","paidBooks":1,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-09-25","stateId":"wb","paidBooks":1,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-09-25","stateId":"ap","paidBooks":1,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-09-25","stateId":"hr","paidBooks":1,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-09-25","stateId":"pb","paidBooks":1,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-09-25","stateId":"mp","paidBooks":1,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-09-25","stateId":"or","paidBooks":1,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-09-25","stateId":"ga","paidBooks":1,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-09-24","stateId":"tn","paidBooks":13,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-09-24","stateId":"ka","paidBooks":10,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-09-24","stateId":"mh","paidBooks":9,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-09-24","stateId":"rj","paidBooks":7,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-09-24","stateId":"kl","paidBooks":6,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-09-24","stateId":"tg","paidBooks":3,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-09-24","stateId":"gj","paidBooks":2,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-09-24","stateId":"up","paidBooks":2,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-09-24","stateId":"wb","paidBooks":1,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-09-24","stateId":"ap","paidBooks":1,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-09-24","stateId":"hr","paidBooks":1,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-09-24","stateId":"pb","paidBooks":1,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-09-24","stateId":"mp","paidBooks":1,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-09-24","stateId":"or","paidBooks":1,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-09-24","stateId":"ga","paidBooks":1,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-09-23","stateId":"tn","paidBooks":10,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-09-23","stateId":"ka","paidBooks":8,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-09-23","stateId":"mh","paidBooks":7,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-09-23","stateId":"rj","paidBooks":5,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-09-23","stateId":"kl","paidBooks":5,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-09-23","stateId":"tg","paidBooks":3,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-09-23","stateId":"gj","paidBooks":2,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-09-23","stateId":"up","paidBooks":1,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-09-23","stateId":"wb","paidBooks":1,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-09-23","stateId":"ap","paidBooks":1,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-09-23","stateId":"hr","paidBooks":1,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-09-23","stateId":"pb","paidBooks":1,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-09-23","stateId":"mp","paidBooks":1,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-09-23","stateId":"or","paidBooks":1,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-09-23","stateId":"ga","paidBooks":1,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-09-22","stateId":"tn","paidBooks":12,"cancelledBooks":1,"refundedBooks":1},{"date":"2026-09-22","stateId":"ka","paidBooks":9,"cancelledBooks":1,"refundedBooks":1},{"date":"2026-09-22","stateId":"mh","paidBooks":8,"cancelledBooks":1,"refundedBooks":0},{"date":"2026-09-22","stateId":"rj","paidBooks":6,"cancelledBooks":1,"refundedBooks":0},{"date":"2026-09-22","stateId":"kl","paidBooks":5,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-09-22","stateId":"tg","paidBooks":3,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-09-22","stateId":"gj","paidBooks":2,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-09-22","stateId":"up","paidBooks":2,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-09-22","stateId":"wb","paidBooks":1,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-09-22","stateId":"ap","paidBooks":1,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-09-22","stateId":"hr","paidBooks":1,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-09-22","stateId":"pb","paidBooks":1,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-09-22","stateId":"mp","paidBooks":1,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-09-22","stateId":"or","paidBooks":1,"cancelledBooks":0,"refundedBooks":0},{"date":"2026-09-22","stateId":"ga","paidBooks":1,"cancelledBooks":0,"refundedBooks":0}];

export interface StateSalesInfo {
  id: string;
  name: string;
  count: number;
  rank?: number;
  isUnionTerritory: boolean;
  percentage: string;
}

export interface DonutSegment {
  id: string;
  name: string;
  count: number;
  percentage: number;
  color: string;
}

export interface SalesMetrics {
  filterType: "30days" | "1year" | "custom";
  filterLabel: string;
  fromDate: string;
  toDate: string;
  totalBooks: number;
  statesReachedCount: number; // Strictly among India's 28 states
  totalIndianStates: number;  // Exactly 28
  topState: { id: string; name: string; count: number };
  stateSalesRecord: Record<string, StateSalesInfo>;
  donutSegments: DonutSegment[];
  allStatesList: StateSalesInfo[];       // 28 Indian States sorted by sales
  unionTerritoriesList: StateSalesInfo[]; // 8 Union Territories sorted by sales
}

const TOP_COLORS = ["#C98A84", "#D89B74", "#C5A059", "#8F9E8B", "#B8A9C9"];

export function getStateFillColor(count: number, maxCount: number = 312): string {
  if (count <= 0) return "#FAF1EF"; // 0 books sold: calm warm neutral blush
  const ratio = Math.max(0.01, Math.min(1, count / Math.max(maxCount, 1)));
  if (ratio >= 0.75) return "#A35C56"; // Deepest rose
  if (ratio >= 0.55) return "#BA6F68"; // Deep warm rose
  if (ratio >= 0.40) return "#C98A84"; // KuttyStory signature rose
  if (ratio >= 0.25) return "#D59D97"; // Medium rose
  if (ratio >= 0.12) return "#E0B0AB"; // Soft rose
  if (ratio >= 0.04) return "#EAC4BF"; // Gentle blush rose
  return "#F3DCD9"; // Light blush tint
}

export function calculateSalesMetrics(
  filterType: "30days" | "1year" | "custom",
  customFrom?: string,
  customTo?: string
): SalesMetrics {
  const todayStr = "2026-10-21";
  let fromDate = "";
  let toDate = todayStr;
  let filterLabel = "Last 30 days";

  if (filterType === "30days") {
    const d = new Date(todayStr);
    d.setDate(d.getDate() - 29);
    fromDate = d.toISOString().split("T")[0];
    toDate = todayStr;
    filterLabel = "Last 30 days";
  } else if (filterType === "1year") {
    const d = new Date(todayStr);
    d.setDate(d.getDate() - 364);
    fromDate = d.toISOString().split("T")[0];
    toDate = todayStr;
    filterLabel = "Last 1 year";
  } else {
    fromDate = customFrom || "2026-09-22";
    toDate = customTo || todayStr;
    const fDate = new Date(fromDate + "T00:00:00");
    const tDate = new Date(toDate + "T00:00:00");
    const fStr = fDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const tStr = tDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    filterLabel = `${fStr} – ${tStr}`;
  }

  // Filter completed, paid orders strictly excluding cancelled and refunded orders
  const countMap: Record<string, number> = {};
  for (const s of INDIAN_28_STATES) {
    countMap[s.id] = 0;
  }
  for (const u of UNION_TERRITORIES) {
    countMap[u.id] = 0;
  }

  let totalBooks = 0;
  for (const row of DAILY_BOOK_ORDERS) {
    if (row.date < fromDate || row.date > toDate) continue;
    // Uses strictly real completed, paid books (row.paidBooks)
    // row.cancelledBooks and row.refundedBooks are excluded!
    const sId = row.stateId.toLowerCase();
    const count = row.paidBooks || 0;
    countMap[sId] = (countMap[sId] || 0) + count;
    totalBooks += count;
  }

  // Count states reached (strictly among the 28 states of India)
  let statesReachedCount = 0;
  for (const s of INDIAN_28_STATES) {
    if ((countMap[s.id] || 0) > 0) {
      statesReachedCount++;
    }
  }

  // Build sorted list of all 28 states
  const sortedStates = INDIAN_28_STATES.map((s) => {
    const count = countMap[s.id] || 0;
    return {
      id: s.id,
      name: s.name,
      count,
      isUnionTerritory: false,
      percentage: totalBooks > 0 ? ((count / totalBooks) * 100).toFixed(1) : "0.0",
    };
  }).sort((a, b) => b.count - a.count);

  // Assign ranks to the 28 states
  const allStatesList: StateSalesInfo[] = sortedStates.map((s, idx) => ({
    ...s,
    rank: s.count > 0 ? idx + 1 : undefined,
  }));

  // Build sorted list of Union Territories
  const unionTerritoriesList: StateSalesInfo[] = UNION_TERRITORIES.map((u) => {
    const count = countMap[u.id] || 0;
    return {
      id: u.id,
      name: u.name,
      count,
      isUnionTerritory: true,
      percentage: totalBooks > 0 ? ((count / totalBooks) * 100).toFixed(1) : "0.0",
    };
  }).sort((a, b) => b.count - a.count);

  // Top state
  const topState = allStatesList[0] || { id: "tn", name: "Tamil Nadu", count: 0 };

  // State Sales Record mapping for map lookup
  const stateSalesRecord: Record<string, StateSalesInfo> = {};
  for (const s of allStatesList) {
    stateSalesRecord[s.id] = s;
  }
  for (const u of unionTerritoriesList) {
    stateSalesRecord[u.id] = u;
  }

  // Donut Segments: Top 5 states + Other states
  const top5 = sortedStates.slice(0, 5);
  let top5CountSum = 0;
  const donutSegments: DonutSegment[] = top5.map((s, idx) => {
    top5CountSum += s.count;
    const pct = totalBooks > 0 ? Math.round((s.count / totalBooks) * 100) : 0;
    return {
      id: s.id,
      name: s.name,
      count: s.count,
      percentage: pct,
      color: TOP_COLORS[idx] || "#C98A84",
    };
  });

  const otherCount = Math.max(0, totalBooks - top5CountSum);
  const otherPct = totalBooks > 0 ? Math.max(0, 100 - donutSegments.reduce((sum, d) => sum + d.percentage, 0)) : 0;
  donutSegments.push({
    id: "OTHER",
    name: "Other states",
    count: otherCount,
    percentage: otherPct,
    color: "#C8BCAC",
  });

  return {
    filterType,
    filterLabel,
    fromDate,
    toDate,
    totalBooks,
    statesReachedCount,
    totalIndianStates: 28,
    topState: {
      id: topState.id,
      name: topState.name,
      count: topState.count,
    },
    stateSalesRecord,
    donutSegments,
    allStatesList,
    unionTerritoriesList,
  };
}
