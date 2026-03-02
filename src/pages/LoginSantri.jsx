import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ArrowLeft } from "lucide-react";

export default function LoginSantri({
  navigateTo,
  loginInputSantri,
  setLoginInputSantri,
  loginError,
  setLoginError,
  handleLoginSantri,
}) {
  return (
    <motion.div
      key="ls"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center min-h-screen p-6"
    >
      <div className="w-full max-w-md p-10 bg-white rounded-[3rem] shadow-[0_20px_50px_rgb(0,0,0,0.1)] relative border border-slate-50">
        <button
          onClick={() => navigateTo("selection")}
          className="absolute top-8 left-8 p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-full transition-colors"
        >
          <ArrowLeft size={24} />
        </button>

        <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-[2rem] flex items-center justify-center mx-auto mb-6 mt-4 shadow-inner">
          <Search size={32} />
        </div>

        <h2 className="text-3xl font-black text-center text-slate-900 mb-2 tracking-tight">
          Cari Data Murid
        </h2>

        {/* Teks instruksi diubah untuk mempertegas penggunaan nama lengkap */}
        <p className="text-center text-slate-500 text-sm mb-8 font-medium">
          Masukkan nama lengkap Anda sesuai data untuk verifikasi.
        </p>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Contoh: Ahmad Maulana (Harus Lengkap)"
            autoFocus
            value={loginInputSantri}
            onChange={(e) => {
              setLoginInputSantri(e.target.value);
              if (loginError) setLoginError("");
            }}
            onKeyDown={(e) => e.key === "Enter" && handleLoginSantri()}
            className={`w-full p-4 rounded-2xl bg-slate-50 border-2 transition-colors outline-none text-center font-bold text-slate-800 placeholder:text-slate-400 placeholder:font-medium focus:bg-white ${
              loginError
                ? "border-red-400 bg-red-50"
                : "border-slate-100 focus:border-amber-500"
            }`}
          />

          <AnimatePresence>
            {loginError && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="text-red-500 text-xs font-bold text-center"
              >
                {loginError}
              </motion.p>
            )}
          </AnimatePresence>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLoginSantri}
            className="w-full p-4 mt-2 bg-amber-500 hover:bg-amber-600 text-slate-900 rounded-2xl font-black uppercase tracking-widest text-sm transition-colors shadow-xl shadow-amber-500/20"
          >
            Cek Nilai
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
