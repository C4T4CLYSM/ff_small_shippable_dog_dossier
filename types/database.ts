export type Sex = "male" | "female";
export type ExerciseLevel = "low" | "medium" | "high";
export type CompatibilityLevel = "yes" | "no" | "caution";

export interface Medication {
  name: string;
  dose: string;
  frequency: string;
}

export interface FeedingEntry {
  time: string;
  amount: string;
  food_brand: string;
}

export interface User {
  id: string;
  email: string;
  stripe_customer_id: string | null;
  is_founder: boolean;
  paid_at: string | null;
  created_at: string;
}

export interface Dog {
  id: string;
  user_id: string;
  name: string;
  breed: string | null;
  date_of_birth: string | null;
  weight_lbs: number | null;
  sex: Sex | null;
  spayed_neutered: boolean | null;
  coat_color: string | null;
  photo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface DogSafety {
  id: string;
  dog_id: string;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  vet_name: string | null;
  vet_phone: string | null;
  vet_address: string | null;
  microchip_number: string | null;
  medical_conditions: string | null;
  allergies: string | null;
  medications: Medication[];
  updated_at: string;
}

export interface DogRoutine {
  id: string;
  dog_id: string;
  feeding_schedule: FeedingEntry[];
  walk_schedule: string | null;
  potty_schedule: string | null;
  crate_trained: boolean | null;
  sleep_location: string | null;
  exercise_level: ExerciseLevel | null;
  updated_at: string;
}

export interface DogBehavior {
  id: string;
  dog_id: string;
  good_with_kids: CompatibilityLevel | null;
  good_with_dogs: CompatibilityLevel | null;
  good_with_cats: CompatibilityLevel | null;
  known_fears: string | null;
  known_commands: string | null;
  leash_behavior: string | null;
  additional_notes: string | null;
  updated_at: string;
}

export interface DogShareLink {
  id: string;
  dog_id: string;
  token: string;
  label: string;
  show_basics: boolean;
  show_safety: boolean;
  show_routine: boolean;
  show_behavior: boolean;
  created_at: string;
}

export interface DogProfile {
  dog: Dog;
  safety: DogSafety | null;
  routine: DogRoutine | null;
  behavior: DogBehavior | null;
  shareLink: DogShareLink;
}
