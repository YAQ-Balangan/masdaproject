// src/pages/LoginGuru.jsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, ArrowLeft } from "lucide-react";

export default function LoginGuru({
  navigateTo,
  loginInputGuru,
  setLoginInputGuru,
  loginError,
  setLoginError,
  handleLoginGuru,
}) {
  return (
    <motion.div
      key="lg"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center min-h-screen p-6"
    >
      <div className="w-full max-w-md p-10 bg-white rounded-[3rem] shadow-[0_20px_50px_rgb(0,0,0,0.1)] relative border border-slate-50">
        <button
          onClick={() => navigateTo("selection")}
          className="absolute top-8 left-8 p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6 mt-4 shadow-inner">
          <Lock size={32} />
        </div>
        <h2 className="text-3xl font-black text-center text-slate-900 mb-2 tracking-tight">
          Login Admin
        </h2>
        <p className="text-center text-slate-500 text-sm mb-8 font-medium">
          Masukkan kunci akses untuk melanjutkan.
        </p>
        <div className="space-y-4">
          <input
            type="password"
            placeholder="Ketik Password..."
            autoFocus
            value={loginInputGuru}
            onChange={(e) => {
              setLoginInputGuru(e.target.value);
              if (loginError) setLoginError("");
            }}
            onKeyDown={(e) => e.key === "Enter" && handleLoginGuru()}
            className={`w-full p-4 rounded-2xl bg-slate-50 border-2 transition-colors outline-none text-center font-bold text-slate-800 placeholder:text-slate-400 placeholder:font-medium focus:bg-white ${loginError ? "border-red-400 bg-red-50" : "border-slate-100 focus:border-emerald-500"}`}
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
            onClick={handleLoginGuru}
            className="w-full p-4 mt-2 bg-slate-900 hover:bg-slate-800 text-emerald-400 rounded-2xl font-black uppercase tracking-widest text-sm transition-colors shadow-xl shadow-slate-900/20"
          >
            Otorisasi Akses
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
