import { create } from "zustand";
import { ResumeData } from "@/types/resume";

interface ResumeStore {
    resumes: ResumeData[];
    currentResume: ResumeData | null;
    loading: boolean;
    error: string | null;
    setResumes: (resumes: ResumeData[]) => void;
    setCurrentResume: (resume: ResumeData | null) => void;
    addResume: (resume: ResumeData) => void;
    removeResume: (id: string) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    clearError: () => void;
}

export const useResumeStore = create<ResumeStore>((set) => ({
    resumes: [],
    currentResume: null,
    loading: false,
    error: null,

    setResumes: (resumes) => set({ resumes }),
    setCurrentResume: (resume) => set({ currentResume: resume }),
    addResume: (resume) => set((state) => ({
        resumes: [resume, ...state.resumes],
    })),
    removeResume: (id) => set((state) => ({
        resumes: state.resumes.filter((r) => r.id !== id),
    })),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),
    clearError: () => set({ error: null }),
}));
