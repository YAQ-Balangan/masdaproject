// src/config.js
export const API_URL = "https://script.google.com/macros/s/AKfycby6RE_Zc2mzQb2l4f9JGWwVhD1iFrmvmYcTuE8f8x8GIYrDBjMOjK82aFNk5cEVOdqIdA/exec";
export const GURU_PASSWORD = "123";
export const DAFTAR_MAPEL_PASTI = [
    "Bahasa Indonesia", "Fiqih", "Matematika (Wajib)", "Akidah Akhlak",
    "Sejarah Indonesia", "Quran Hadits", "Bahasa Inggris", "SKI", "Bahasa Arab",
];

export const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { type: "spring", stiffness: 300, damping: 24 },
    },
};

export const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};