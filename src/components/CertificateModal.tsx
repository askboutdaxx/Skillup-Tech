import React, { useState } from 'react';
import { Certificate } from '../context/AuthProgressContext';
import { X, Printer, Check, Copy, Award, ShieldCheck } from 'lucide-react';

interface CertificateModalProps {
  certificate: Certificate | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  certificate,
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !certificate) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyCode = () => {
    try {
      navigator.clipboard.writeText(certificate.certificateCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#0D1E4C]/60 dark:bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white dark:bg-[#132044] rounded-3xl border border-[#D1E0FC] dark:border-[#233876] shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Top Control Bar (Hidden on print) */}
        <div className="no-print flex items-center justify-between px-6 py-4 bg-[#F8FAFC] dark:bg-[#0A1128] border-b border-[#D1E0FC] dark:border-[#233876]">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-[#1E5EFF]" />
            <span className="text-xs font-bold text-[#0D1E4C] dark:text-white uppercase tracking-wider">
              Verified Digital Certificate
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#D1E0FC] dark:border-[#233876] bg-white dark:bg-[#132044] text-xs font-semibold text-[#0D1E4C] dark:text-white hover:bg-[#EAF1FF] dark:hover:bg-[#1C2E60] transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied ID' : 'Copy ID'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-[#1E5EFF] hover:bg-[#164BD6] text-white text-xs font-bold rounded-xl transition-colors shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-[#3B507D] dark:text-slate-400 hover:text-[#0D1E4C] dark:hover:text-white hover:bg-[#EAF1FF] dark:hover:bg-[#1C2E60] transition-colors"
              aria-label="Close certificate"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Canvas / Framed Document */}
        <div className="p-6 sm:p-12 bg-white text-[#0D1E4C]">
          <div className="relative border-8 border-double border-[#D1E0FC] rounded-2xl p-6 sm:p-12 text-center bg-linear-to-b from-white via-[#F8FAFC] to-[#EAF1FF]/40">
            {/* Corner Decorative Ornaments */}
            <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-[#1E5EFF]" />
            <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-[#1E5EFF]" />
            <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-[#1E5EFF]" />
            <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-[#1E5EFF]" />

            {/* Brand Header */}
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-[#1E5EFF] text-white flex items-center justify-center font-black text-base shadow-xs">
                S
              </div>
              <span className="text-xl font-black text-[#0D1E4C] tracking-tight">
                SkillUp Tech
              </span>
            </div>

            <span className="text-xs font-bold tracking-[0.25em] text-[#1E5EFF] uppercase block mb-4">
              Academic & Technical Credential
            </span>

            <h1 className="text-3xl sm:text-5xl font-black text-[#0D1E4C] tracking-tight mb-4">
              CERTIFICATE OF COMPLETION
            </h1>

            <p className="text-xs sm:text-sm text-[#3B507D] uppercase tracking-widest font-semibold mb-3">
              This credential is proudly presented to
            </p>

            {/* Learner Name */}
            <div className="my-6">
              <span className="text-2xl sm:text-4xl font-extrabold text-[#1E5EFF] uppercase border-b-2 border-[#1E5EFF] pb-2 px-6 sm:px-12 inline-block">
                {certificate.learnerName}
              </span>
            </div>

            <p className="max-w-xl mx-auto text-xs sm:text-sm text-[#3B507D] leading-relaxed mb-6 font-medium">
              for successfully finishing all rigorous course modules, practical code exercises, and comprehensive end-of-module knowledge assessments in:
            </p>

            <div className="inline-block px-6 py-2.5 bg-[#EAF1FF] border border-[#D1E0FC] rounded-2xl mb-8">
              <span className="text-lg sm:text-2xl font-black text-[#0D1E4C]">
                {certificate.trackTitle}
              </span>
            </div>

            {/* Verification and Signatures Strip */}
            <div className="pt-8 border-t border-[#D1E0FC] grid grid-cols-1 sm:grid-cols-3 items-center gap-6 text-left">
              {/* Left: Issue Date and ID */}
              <div>
                <span className="block text-[11px] font-bold text-[#3B507D] uppercase tracking-wider">
                  Issue Date
                </span>
                <span className="text-xs sm:text-sm font-semibold text-[#0D1E4C]">
                  {certificate.issueDate}
                </span>

                <span className="block text-[11px] font-bold text-[#3B507D] uppercase tracking-wider mt-2">
                  Credential ID
                </span>
                <span className="text-xs font-mono font-bold text-[#1E5EFF]">
                  {certificate.certificateCode}
                </span>
              </div>

              {/* Center: Gold/Blue Security Seal */}
              <div className="flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-full bg-linear-to-tr from-[#1E5EFF] to-blue-400 text-white flex flex-col items-center justify-center shadow-md border-2 border-white">
                  <ShieldCheck className="w-6 h-6" />
                  <span className="text-[8px] font-black uppercase tracking-widest">Verified</span>
                </div>
                <span className="text-[10px] font-bold text-[#3B507D] mt-1.5 uppercase tracking-wider">
                  Authentic Credential
                </span>
              </div>

              {/* Right: Academic Director Signature */}
              <div className="sm:text-right">
                <div className="font-serif italic text-lg sm:text-xl text-[#0D1E4C] font-bold select-none">
                  Dr. Samuel Adeyemi
                </div>
                <div className="h-px bg-[#0D1E4C] w-32 ml-auto my-1 sm:block hidden" />
                <span className="block text-[11px] font-bold text-[#3B507D] uppercase tracking-wider">
                  Dean of Digital Academics
                </span>
                <span className="block text-[10px] text-[#3B507D]">
                  SkillUp Tech Global Faculty
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
