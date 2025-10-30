import { create } from "zustand";

export const useLectureStore = create((set) => ({
    lectureId: null,
    setLectureId: (id) => set({ lectureId: id }),
}));
