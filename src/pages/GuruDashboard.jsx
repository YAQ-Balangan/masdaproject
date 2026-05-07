// src/pages/GuruDashboard.jsx
import React, { useState, useRef, useEffect } from "react";
import { pdfjs, Document, Page } from "react-pdf";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

import {
  UploadCloud,
  LogOut,
  Sparkles,
  CheckCircle,
  ClipboardPaste,
  Smartphone,
  Loader2,
  ScanSearch,
  MousePointer2,
} from "lucide-react";

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbxUK-kLBa1NT2brcn49j8stpi3-fFHAjmvZ9qV8XeHirtwK8teT87Rsh9zRfO7KYg_GTA/exec";

export default function GuruDashboard({ setRole }) {
  const [file, setFile] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState(null);

  const [currentQNumber, setCurrentQNumber] = useState(1);
  const [answerKeyText, setAnswerKeyText] = useState("");
  const [parsedKeys, setParsedKeys] = useState({});
  const [manualKunci, setManualKunci] = useState("");
  const [wacana, setWacana] = useState("");

  const [isUploading, setIsUploading] = useState(false);
  const containerRef = useRef(null);

  const onFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setNumPages(null);
    }
  };

  const handleExtractKeys = () => {
    if (!answerKeyText.trim()) {
      alert("Kotak kunci jawaban masih kosong!");
      return;
    }

    const autoKeys = {};
    const keyRegex = /(\d+)\s*[\.\-\)]?\s*([A-E])/gi;
    let match;
    let count = 0;

    while ((match = keyRegex.exec(answerKeyText)) !== null) {
      const nomorSoal = parseInt(match[1]);
      const hurufKunci = match[2].toUpperCase();
      autoKeys[nomorSoal] = hurufKunci;
      count++;
    }

    if (count > 0) {
      setParsedKeys(autoKeys);
      setManualKunci("");
      alert(
        `Mantap! ${count} Kunci Jawaban berhasil dipetakan ke dalam sistem.`,
      );
    } else {
      alert(
        "Sistem tidak mendeteksi format kunci yang valid. Pastikan formatnya ada angka dan huruf (Misal: 1. A)",
      );
    }
  };

  const activeKunci = manualKunci || parsedKeys[currentQNumber] || "";

  useEffect(() => {
    if (file && !crop) {
      setCrop({ unit: "%", x: 5, y: 1, width: 90, height: 5 });
    }
  }, [file, crop]);

  // LOGIKA SNIPER CAMERA YANG TELAH DISEMPURNAKAN
  const captureCropAsBase64 = () => {
    try {
      const container = containerRef.current;
      if (!container || !completedCrop) return null;

      const containerRect = container.getBoundingClientRect();

      // Hitung posisi absolut berdasarkan PERSENTASE agar tidak meleset
      const cropAbsX =
        containerRect.left + (completedCrop.x * containerRect.width) / 100;
      const cropAbsY =
        containerRect.top + (completedCrop.y * containerRect.height) / 100;
      const cropAbsWidth = (completedCrop.width * containerRect.width) / 100;
      const cropAbsHeight = (completedCrop.height * containerRect.height) / 100;

      if (cropAbsWidth <= 0 || cropAbsHeight <= 0) {
        throw new Error(
          "Area seleksi terlalu kecil. Silakan tarik kotak biru lebih lebar.",
        );
      }

      // Buat Kanvas Final
      const finalCanvas = document.createElement("canvas");
      const scale = 2; // Skala x2 agar teks tajam saat dibaca di HP
      finalCanvas.width = cropAbsWidth * scale;
      finalCanvas.height = cropAbsHeight * scale;
      const ctx = finalCanvas.getContext("2d");
      ctx.scale(scale, scale);

      // Beri background putih murni
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, cropAbsWidth, cropAbsHeight);

      let isDrawn = false;
      const pages = container.querySelectorAll(".react-pdf__Page");

      pages.forEach((page) => {
        const pageCanvas = page.querySelector("canvas");
        if (pageCanvas) {
          const pageRect = page.getBoundingClientRect();

          // Cek area yang bersinggungan (intersection)
          if (
            pageRect.bottom > cropAbsY &&
            pageRect.top < cropAbsY + cropAbsHeight
          ) {
            const sX = Math.max(0, cropAbsX - pageRect.left);
            const sY = Math.max(0, cropAbsY - pageRect.top);
            const sWidth = Math.min(
              pageRect.width - sX,
              cropAbsX + cropAbsWidth - Math.max(pageRect.left, cropAbsX),
            );
            const sHeight = Math.min(
              pageRect.height - sY,
              cropAbsY + cropAbsHeight - Math.max(pageRect.top, cropAbsY),
            );

            const dX = Math.max(0, pageRect.left - cropAbsX);
            const dY = Math.max(0, pageRect.top - cropAbsY);

            const scaleX = pageCanvas.width / pageRect.width;
            const scaleY = pageCanvas.height / pageRect.height;

            ctx.drawImage(
              pageCanvas,
              sX * scaleX,
              sY * scaleY,
              sWidth * scaleX,
              sHeight * scaleY,
              dX,
              dY,
              sWidth,
              sHeight,
            );
            isDrawn = true;
          }
        }
      });

      if (!isDrawn) {
        throw new Error(
          "Gagal mengambil gambar dari PDF. Pastikan kotak biru menutupi area teks.",
        );
      }

      return finalCanvas.toDataURL("image/png");
    } catch (error) {
      throw new Error(error.message);
    }
  };

  const handlePublish = async () => {
    if (!completedCrop || !activeKunci) {
      alert(
        "Pastikan area soal telah Anda potong dan Kunci Jawaban sudah terpilih (hijau)!",
      );
      return;
    }

    setIsUploading(true);

    try {
      // 1. Eksekusi Kamera
      const base64Image = captureCropAsBase64();

      if (!base64Image) {
        throw new Error(
          "Gambar gagal diproses. Silakan atur ulang kotak seleksi.",
        );
      }

      // 2. Kirim ke Database
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          base64: base64Image,
          kunci: activeKunci,
          wacana: wacana,
          nomor: currentQNumber,
        }),
      });

      const result = await response.json();
      if (result.status === "success") {
        setManualKunci("");
        setWacana("");

        // Turunkan kotak sedikit ke soal selanjutnya
        setCrop((prev) => ({ ...prev, y: prev.y + prev.height + 0.5 }));
        setCurrentQNumber((prev) => prev + 1);
      } else {
        alert("Gagal menyimpan ke database: " + result.message);
      }
    } catch (err) {
      console.error(err);
      // Menampilkan pesan error spesifik jika terjadi masalah
      alert("GAGAL: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 font-sans text-slate-100 flex flex-col">
      <header className="bg-slate-800/80 backdrop-blur-md p-4 border-b border-slate-700 flex justify-between items-center sticky top-0 z-50 shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-600 p-2 rounded-lg shadow-lg shadow-emerald-600/20">
            <Sparkles size={20} className="text-white" />
          </div>
          <h1 className="text-lg font-black tracking-tighter uppercase">
            Masda Pro <span className="text-emerald-500">Auto-Snap</span>
          </h1>
        </div>
        <button
          onClick={() => setRole && setRole("home")}
          className="bg-slate-700 hover:bg-red-500 hover:text-white px-4 py-2 rounded-xl transition-all text-xs font-bold flex items-center gap-2"
        >
          <LogOut size={16} /> Keluar
        </button>
      </header>

      <div className="flex-1 max-w-[1600px] w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden">
        {/* SISI KIRI: KERTAS PANJANG (SCROLLABLE) */}
        <div className="lg:col-span-8 h-[calc(100vh-73px)] overflow-y-auto bg-slate-950 p-4 md:p-8 scrollbar-thin scrollbar-thumb-slate-700">
          {!file ? (
            <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-[3rem] bg-slate-900/50">
              <UploadCloud
                size={80}
                className="text-emerald-500 mb-6 drop-shadow-[0_0_15px_rgba(16,185,129,0.4)]"
              />
              <input
                type="file"
                accept=".pdf"
                onChange={onFileChange}
                className="hidden"
                id="pdf-long"
              />
              <label
                htmlFor="pdf-long"
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-12 py-5 rounded-3xl font-black uppercase tracking-widest cursor-pointer shadow-2xl transition-all"
              >
                Upload Master PDF
              </label>
              <p className="mt-6 text-sm font-medium text-slate-500">
                Sistem akan menyusun seluruh halaman PDF menjadi satu gulungan
                panjang.
              </p>
            </div>
          ) : (
            <div className="relative mx-auto flex flex-col items-center">
              <div className="mb-6 bg-emerald-900/40 border border-emerald-500/30 px-8 py-3 rounded-full text-xs font-black uppercase text-emerald-400 tracking-widest flex items-center gap-2 backdrop-blur-sm sticky top-4 z-40 shadow-xl">
                <MousePointer2 size={16} /> Scroll ke bawah untuk melihat
                seluruh soal
              </div>

              <div className="shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-slate-700 bg-white min-w-[750px]">
                {/* PERBAIKAN: Memastikan onChange mengembalikan nilai percentCrop agar koordinat akurat */}
                <ReactCrop
                  crop={crop}
                  onChange={(pixelCrop, percentCrop) => setCrop(percentCrop)}
                  onComplete={(pixelCrop, percentCrop) =>
                    setCompletedCrop(percentCrop)
                  }
                >
                  <div ref={containerRef} className="bg-white">
                    <Document
                      file={file}
                      onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                      onLoadError={(error) =>
                        alert("Gagal memuat PDF: " + error.message)
                      }
                    >
                      {numPages ? (
                        Array.from(new Array(numPages), (el, index) => (
                          <div
                            key={`page_${index + 1}`}
                            className="border-b border-slate-200 last:border-0 relative"
                          >
                            {index > 0 && (
                              <div className="absolute top-0 left-0 w-full h-1 bg-red-500/20 z-10 pointer-events-none border-t border-red-500/50 border-dashed"></div>
                            )}
                            <Page
                              pageNumber={index + 1}
                              renderTextLayer={false}
                              renderAnnotationLayer={false}
                              width={750}
                            />
                          </div>
                        ))
                      ) : (
                        <div className="p-32 text-center flex flex-col items-center justify-center">
                          <Loader2
                            className="animate-spin text-emerald-500 mb-4"
                            size={48}
                          />
                          <p className="text-slate-400 font-black uppercase tracking-widest">
                            Membentangkan Kertas PDF...
                          </p>
                        </div>
                      )}
                    </Document>
                  </div>
                </ReactCrop>
              </div>
            </div>
          )}
        </div>

        {/* SISI KANAN: PANEL KONTROL FIXED */}
        <div className="lg:col-span-4 h-[calc(100vh-73px)] bg-slate-900 border-l border-slate-800 p-6 flex flex-col gap-6 shadow-2xl overflow-y-auto scrollbar-hide">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-white">Area Kerja</h2>
            <div className="bg-slate-800 px-4 py-2 rounded-xl border border-slate-700 flex items-center gap-3">
              <span className="text-[10px] font-black text-slate-400 uppercase">
                Posisi Soal
              </span>
              <input
                type="number"
                className="bg-slate-900 px-2 py-1 text-lg font-black text-emerald-400 outline-none w-14 rounded-lg text-center border border-slate-600 focus:border-emerald-500"
                value={currentQNumber}
                onChange={(e) => setCurrentQNumber(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="space-y-6 flex-1">
            <div className="bg-slate-800/80 p-5 rounded-3xl border border-slate-700 shadow-inner">
              <label className="flex items-center gap-2 text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-3">
                <ClipboardPaste size={16} /> Wadah Kunci Jawaban Massal
              </label>
              <textarea
                className="w-full bg-slate-900 border border-slate-700 p-4 rounded-2xl text-xs text-slate-300 outline-none focus:border-emerald-500 transition-all font-mono"
                rows="5"
                placeholder="Paste daftar kunci di sini...&#10;Contoh:&#10;1. A&#10;2. B&#10;3. D"
                value={answerKeyText}
                onChange={(e) => setAnswerKeyText(e.target.value)}
              />
              <button
                onClick={handleExtractKeys}
                className="w-full mt-3 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-emerald-900/50"
              >
                <ScanSearch size={16} /> Proses & Deteksi Kunci
              </button>
            </div>

            <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-blue-500"></div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block text-center mb-4">
                Kunci Jawaban Soal No. {currentQNumber}
              </label>
              <div className="grid grid-cols-5 gap-2">
                {["A", "B", "C", "D", "E"].map((k) => (
                  <button
                    key={k}
                    onClick={() => setManualKunci(k)}
                    className={`h-14 rounded-2xl font-black text-xl transition-all duration-300 ${activeKunci === k ? "bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)] scale-110 border-emerald-400" : "bg-slate-800 text-slate-500 border border-slate-700 hover:border-emerald-500/50 hover:bg-slate-700"}`}
                  >
                    {k}
                  </button>
                ))}
              </div>
              {parsedKeys[currentQNumber] && !manualKunci && (
                <p className="text-[9px] text-emerald-400 text-center font-bold mt-4 uppercase tracking-widest">
                  ✨ Dipilih Otomatis oleh Sistem
                </p>
              )}
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">
                Teks Wacana (Opsional)
              </label>
              <textarea
                className="w-full bg-slate-800 border border-slate-700 p-4 rounded-2xl text-xs text-white outline-none focus:border-emerald-500 transition-all"
                rows="2"
                placeholder="Ketik jika ada bacaan terkait..."
                value={wacana}
                onChange={(e) => setWacana(e.target.value)}
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800">
            <button
              disabled={isUploading || !file}
              onClick={handlePublish}
              className="w-full py-6 rounded-3xl bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white font-black uppercase tracking-[0.15em] text-sm shadow-[0_10px_30px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center gap-3 disabled:opacity-30 active:scale-95"
            >
              {isUploading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <>
                  <CheckCircle size={22} /> Simpan Snapshot & Lanjut
                </>
              )}
            </button>
            <p className="text-center text-[10px] text-slate-500 font-bold mt-4">
              Nomor soal akan otomatis pindah setelah disimpan.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
