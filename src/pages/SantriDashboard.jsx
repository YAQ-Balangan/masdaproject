// src/pages/SantriDashboard.jsx
import React, { useState, useEffect } from "react";
import {
  Play,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  FileText,
  Loader2,
  LogOut,
} from "lucide-react";

// URL GOOGLE SCRIPT MASDA PRO SUDAH TERPASANG
const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbxUK-kLBa1NT2brcn49j8stpi3-fFHAjmvZ9qV8XeHirtwK8teT87Rsh9zRfO7KYg_GTA/exec";

export default function SantriDashboard({ setRole }) {
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [step, setStep] = useState("intro"); // intro, exam, result
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});

  // Mengambil data soal riil dari database Google Sheets
  useEffect(() => {
    const fetchSoal = async () => {
      try {
        const response = await fetch(GOOGLE_SCRIPT_URL);
        const data = await response.json();
        setQuestions(data);
      } catch (error) {
        console.error("Gagal mengambil soal:", error);
        alert("Gagal memuat soal. Pastikan koneksi internet stabil.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchSoal();
  }, []);

  const startExam = () => setStep("exam");

  const handleAnswer = (jawaban) => {
    setAnswers({ ...answers, [questions[currentIdx].id]: jawaban });
  };

  const submitExam = () => {
    if (window.confirm("Yakin ingin menyelesaikan ujian ini?")) {
      setStep("result");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <Loader2 size={48} className="text-emerald-500 animate-spin mb-4" />
        <h2 className="text-xl font-bold text-slate-700 animate-pulse">
          Menarik Data Ujian...
        </h2>
      </div>
    );
  }

  // Jika Database Kosong
  if (questions.length === 0 && !isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="bg-white p-10 rounded-3xl shadow-sm text-center border border-slate-200">
          <FileText size={64} className="mx-auto text-slate-300 mb-4" />
          <h2 className="text-2xl font-bold text-slate-800 mb-2">
            Belum Ada Ujian
          </h2>
          <p className="text-slate-500 mb-6">
            Guru belum mengunggah soal ujian ke dalam sistem.
          </p>
          <button
            onClick={() => setRole("home")}
            className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  if (step === "intro") {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
        <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 max-w-md w-full text-center relative overflow-hidden">
          <button
            onClick={() => setRole("home")}
            className="absolute top-6 left-6 text-slate-400 hover:text-slate-800 transition"
          >
            <LogOut size={24} />
          </button>

          <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6 mt-8 shadow-inner">
            <FileText size={48} />
          </div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900 mb-2">
            Ujian Masda Pro
          </h2>
          <p className="text-slate-500 mb-8 font-medium">
            Anda memiliki{" "}
            <strong className="text-emerald-600">
              {questions.length} Soal
            </strong>{" "}
            untuk dikerjakan.
          </p>

          <button
            onClick={startExam}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-emerald-500/30 flex justify-center items-center gap-2 transition-all hover:scale-[1.02]"
          >
            <Play size={18} /> Mulai Kerjakan
          </button>
        </div>
      </div>
    );
  }

  if (step === "result") {
    let score = 0;
    questions.forEach((q) => {
      if (answers[q.id] === q.kunci) score += 1;
    });
    const finalScore = Math.round((score / questions.length) * 100);

    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white p-12 rounded-[3rem] shadow-sm border border-slate-100 max-w-md w-full text-center">
          <h2 className="text-xl font-black text-slate-400 uppercase tracking-widest mb-6">
            Ujian Selesai
          </h2>
          <div className="w-40 h-40 rounded-full border-[12px] border-emerald-400 flex items-center justify-center mx-auto mb-8 shadow-inner">
            <span className="text-6xl font-black text-emerald-500">
              {finalScore}
            </span>
          </div>
          <p className="text-slate-600 font-medium mb-8">
            Benar <strong className="text-slate-900">{score}</strong> dari{" "}
            <strong className="text-slate-900">{questions.length}</strong> Soal
          </p>
          <button
            onClick={() => setRole("home")}
            className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm w-full"
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIdx];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Header Siswa */}
      <div className="bg-white p-4 md:px-8 border-b border-slate-200 flex justify-between items-center z-10 shadow-sm sticky top-0">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-100 text-emerald-600 font-black px-4 py-2 rounded-xl text-sm">
            Soal {currentIdx + 1} / {questions.length}
          </div>
        </div>
        <div className="flex gap-1 overflow-x-auto max-w-[50%] scrollbar-hide py-1">
          {questions.map((q, idx) => (
            <div
              key={q.id}
              className={`min-w-[32px] h-8 rounded-lg flex items-center justify-center text-xs font-black shadow-sm shrink-0
                ${currentIdx === idx ? "ring-2 ring-emerald-500 ring-offset-2 bg-emerald-50 text-emerald-700" : ""}
                ${answers[q.id] && currentIdx !== idx ? "bg-emerald-500 text-white" : ""}
                ${!answers[q.id] && currentIdx !== idx ? "bg-slate-100 text-slate-400" : ""}
              `}
            >
              {idx + 1}
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-32 max-w-4xl mx-auto w-full">
        {/* Teks Wacana Jika Ada */}
        {currentQ.wacana && (
          <div className="mb-6 bg-amber-50/80 border border-amber-200/60 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4 border-b border-amber-200/50 pb-3">
              <span className="bg-amber-400 text-amber-900 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg">
                Teks Induk
              </span>
            </div>
            <p className="text-slate-700 whitespace-pre-wrap leading-relaxed font-medium">
              {currentQ.wacana}
            </p>
          </div>
        )}

        {/* Gambar Soal (Diambil dari Google Drive) */}
        <div className="bg-white p-2 rounded-3xl shadow-sm border border-slate-100 mb-8 overflow-hidden">
          <img
            src={currentQ.snippetUrl}
            alt={`Soal Nomor ${currentIdx + 1}`}
            className="w-full rounded-2xl object-contain border border-slate-50"
            loading="lazy"
          />
        </div>

        {/* Area Tombol Jawaban */}
        <div>
          <h3 className="text-[11px] font-black text-slate-400 mb-4 text-center uppercase tracking-widest">
            Lembar Jawab Digital
          </h3>
          <div className="grid grid-cols-5 gap-3 max-w-xl mx-auto">
            {["A", "B", "C", "D", "E"].map((opt) => (
              <button
                key={opt}
                onClick={() => handleAnswer(opt)}
                className={`flex flex-col items-center justify-center py-5 rounded-2xl border-2 transition-all active:scale-95 shadow-sm
                  ${
                    answers[currentQ.id] === opt
                      ? "bg-emerald-500 border-emerald-500 text-white shadow-emerald-200"
                      : "bg-white border-slate-100 text-slate-500 hover:border-emerald-300"
                  }`}
              >
                <span className="text-2xl font-black">{opt}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Navigasi Bawah Sticky */}
      <div className="bg-white/80 backdrop-blur-md border-t border-slate-100 p-4 md:px-8 fixed bottom-0 left-0 right-0 flex justify-between gap-4 z-20">
        <button
          onClick={() => setCurrentIdx(currentIdx - 1)}
          disabled={currentIdx === 0}
          className="flex-1 max-w-[200px] py-4 rounded-2xl font-black text-sm border-2 border-slate-100 text-slate-500 disabled:opacity-40 flex justify-center items-center gap-2 hover:bg-slate-50 transition-all"
        >
          <ChevronLeft size={18} />{" "}
          <span className="hidden sm:inline uppercase tracking-wider">
            Sebelumnya
          </span>
        </button>

        {currentIdx < questions.length - 1 ? (
          <button
            onClick={() => setCurrentIdx(currentIdx + 1)}
            className="flex-1 max-w-[200px] py-4 rounded-2xl font-black text-sm bg-slate-900 text-white flex justify-center items-center gap-2 hover:bg-slate-800 transition-all shadow-lg"
          >
            <span className="hidden sm:inline uppercase tracking-wider">
              Selanjutnya
            </span>{" "}
            <ChevronRight size={18} />
          </button>
        ) : (
          <button
            onClick={submitExam}
            className="flex-1 max-w-[200px] py-4 rounded-2xl font-black text-sm bg-emerald-500 text-white flex justify-center items-center gap-2 hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-200"
          >
            <CheckCircle size={18} />{" "}
            <span className="uppercase tracking-wider">Kumpulkan</span>
          </button>
        )}
      </div>
    </div>
  );
}
