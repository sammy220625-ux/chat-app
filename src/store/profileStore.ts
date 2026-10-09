import { create } from "zustand";
import { mockProfile } from "../data/mockProfile";

export type Profile = typeof mockProfile;

type State = {
  profile: Profile;
  updateProfile: (changes: Partial<Profile>) => void;
};

export const useProfileStore = create<State>((set) => ({
  profile: mockProfile,
  updateProfile: (changes) =>
    set((s) => ({ profile: { ...s.profile, ...changes } })),
}));
