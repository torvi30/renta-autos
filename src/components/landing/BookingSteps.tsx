import React from 'react';
import { MousePointerClick, CalendarDays, KeyRound } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const BookingSteps: React.FC = () => {
  const { t } = useLanguage();

  const steps = [
    {
      stepNumber: '01',
      icon: <MousePointerClick className="w-6 h-6 text-gold-400" />,
      title: t.howItWorks.step1Title,
      description: t.howItWorks.step1Desc,
    },
    {
      stepNumber: '02',
      icon: <CalendarDays className="w-6 h-6 text-gold-400" />,
      title: t.howItWorks.step2Title,
      description: t.howItWorks.step2Desc,
    },
    {
      stepNumber: '03',
      icon: <KeyRound className="w-6 h-6 text-gold-400" />,
      title: t.howItWorks.step3Title,
      description: t.howItWorks.step3Desc,
    },
  ];

  return (
    <section id="how-it-works" className="py-24 bg-carbon-950 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-semibold tracking-widest text-gold-400 uppercase">
            {t.howItWorks.badge}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-silver-100 uppercase font-display mt-2">
            {t.howItWorks.title}
          </h2>
          <p className="mt-3 text-sm text-silver-400">
            {t.howItWorks.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((item, idx) => (
            <div
              key={idx}
              className="relative flex flex-col p-8 rounded-2xl bg-carbon-900 border border-carbon-800 transition-all duration-300 hover:border-gold-500/40"
            >
              {/* Número de paso estilizado en el fondo */}
              <div className="absolute top-4 right-6 text-5xl font-extrabold text-carbon-800/80 font-mono select-none">
                {item.stepNumber}
              </div>

              <div className="w-12 h-12 rounded-xl bg-carbon-850 border border-gold-500/20 flex items-center justify-center mb-6 shadow-md">
                {item.icon}
              </div>

              <h3 className="text-lg font-bold text-silver-100 font-display mb-2">
                {item.title}
              </h3>

              <p className="text-xs sm:text-sm text-silver-400 leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
