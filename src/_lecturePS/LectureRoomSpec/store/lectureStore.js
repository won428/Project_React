import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware'; // devtools 추가

// devtools로 감싸고, 그 안을 persist로 감쌉니다.
export const useLectureStore = create(
    devtools( // ◀◀◀ 1. devtools로 감싸기
        persist(
            (set) => ({
                lectureId: null,
                setLectureId: (id) => set({ lectureId: id }),
                clearLecture: () => set({ lectureId: null }),
            }),
            {
                name: 'lecture-storage',
            }
        ),
        { name: "Lecture Store" } // ◀◀◀ 2. DevTools에 표시될 이름
    )
);