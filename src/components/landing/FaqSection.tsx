import React, { useState } from 'react';
import { ChevronDown, HelpCircle, FileCheck, CreditCard, UserCheck, ShieldAlert } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { useLanguage } from '../../context/LanguageContext';

export const FaqSection: React.FC = () => {
  const { settings } = useSettings();
  const { t } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const minAge = settings.policies?.minAge || 25;

  const faqs = [
    {
      question: t.faq.q1,
      answer: t.faq.a1,
    },
    {
      question: t.faq.q2,
      answer: t.faq.a2,
    },
    {
      question: t.faq.q3,
      answer: t.faq.a3,
    },
    {
      question: t.faq.q4,
      answer: t.faq.a4,
    },
    {
      question: t.faq.q5,
      answer: t.faq.a5,
    },
  ];

  return (
    <section id="faq" className="py-24 bg-carbon-950 border-t border-carbon-800/80">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-16">
          <span className="text-xs font-semibold tracking-widest text-gold-400 uppercase flex items-center justify-center gap-1.5 mb-2">
            <HelpCircle className="w-4 h-4" />
            <span>{t.faq.badge}</span>
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-silver-100 uppercase font-display">
            {t.faq.title}
          </h2>
          <p className="mt-3 text-sm text-silver-400">
            {t.faq.subtitle}
          </p>
        </div>

        {/* Requisitos clave destacados */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 mb-8 sm:mb-12">
          <div className="p-3 sm:p-4 rounded-xl bg-carbon-900 border border-carbon-800 text-center">
            <UserCheck className="w-5 h-5 mx-auto text-gold-400 mb-1.5" />
            <div className="text-xs font-bold text-silver-200">{t.faq.reqAge} {minAge}+</div>
            <div className="text-[10px] text-silver-400 mt-0.5">{minAge}+ {t.faq.reqAgeDesc}</div>
          </div>

          <div className="p-3 sm:p-4 rounded-xl bg-carbon-900 border border-carbon-800 text-center">
            <FileCheck className="w-5 h-5 mx-auto text-gold-400 mb-1.5" />
            <div className="text-xs font-bold text-silver-200">{t.faq.reqLicense}</div>
            <div className="text-[10px] text-silver-400 mt-0.5">{t.faq.reqLicenseDesc}</div>
          </div>

          <div className="p-3 sm:p-4 rounded-xl bg-carbon-900 border border-carbon-800 text-center">
            <CreditCard className="w-5 h-5 mx-auto text-gold-400 mb-1.5" />
            <div className="text-xs font-bold text-silver-200">{t.faq.reqDeposit}</div>
            <div className="text-[10px] text-silver-400 mt-0.5">{t.faq.reqDepositDesc}</div>
          </div>

          <div className="p-3 sm:p-4 rounded-xl bg-carbon-900 border border-carbon-800 text-center">
            <ShieldAlert className="w-5 h-5 mx-auto text-emerald-400 mb-1.5" />
            <div className="text-xs font-bold text-silver-200">{t.faq.reqInsurance}</div>
            <div className="text-[10px] text-silver-400 mt-0.5">{t.faq.reqInsuranceDesc}</div>
          </div>
        </div>

        {/* Acordeón de preguntas */}
        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="rounded-xl bg-carbon-900/90 border border-carbon-800 overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <span className="text-sm sm:text-base font-semibold text-silver-200 hover:text-gold-300 transition-colors">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-silver-400 transition-transform duration-300 flex-shrink-0 ${
                      isOpen ? 'rotate-180 text-gold-400' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-silver-400 leading-relaxed border-t border-carbon-850 pt-3 animate-fade-in">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
