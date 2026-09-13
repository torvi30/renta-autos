import React from 'react';
import { ShieldCheck, MapPin, Sparkles, Clock4, KeyRound, Headphones } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const ExperiencePillars: React.FC = () => {
  const { t } = useLanguage();

  const pillars = [
    {
      icon: <KeyRound className="w-6 h-6 text-gold-400" />,
      title: t.experience.pillar1Title,
      description: t.experience.pillar1Desc,
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-emerald-400" />,
      title: t.experience.pillar2Title,
      description: t.experience.pillar2Desc,
    },
    {
      icon: <Sparkles className="w-6 h-6 text-gold-400" />,
      title: t.experience.pillar3Title,
      description: t.experience.pillar3Desc,
    },
    {
      icon: <Clock4 className="w-6 h-6 text-blue-400" />,
      title: t.experience.pillar4Title,
      description: t.experience.pillar4Desc,
    },
    {
      icon: <Headphones className="w-6 h-6 text-gold-400" />,
      title: t.experience.pillar5Title,
      description: t.experience.pillar5Desc,
    },
    {
      icon: <MapPin className="w-6 h-6 text-amber-400" />,
      title: t.experience.pillar6Title,
      description: t.experience.pillar6Desc,
    },
  ];

  return (
    <section id="experience" className="py-24 bg-carbon-900/60 border-y border-carbon-800/80 relative">
      {/* Luz ambiente tenue */}
      <div className="absolute inset-0 bg-radial-gradient from-gold-500/5 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-semibold tracking-widest text-gold-400 uppercase">
            {t.experience.badge}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-silver-100 uppercase font-display mt-2">
            {t.experience.title}
          </h2>
          <p className="mt-3 text-sm text-silver-400">
            {t.experience.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {pillars.map((pillar, idx) => (
            <div
              key={idx}
              className="p-8 rounded-2xl bg-carbon-850 border border-carbon-750/80 hover:border-gold-500/40 transition-all duration-300 group hover:-translate-y-1 hover:shadow-showroom"
            >
              <div className="w-12 h-12 rounded-xl bg-carbon-800 border border-carbon-700 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:border-gold-500/50 transition-all">
                {pillar.icon}
              </div>
              <h3 className="text-lg font-bold text-silver-100 font-display mb-2 group-hover:text-gold-300 transition-colors">
                {pillar.title}
              </h3>
              <p className="text-xs sm:text-sm text-silver-400 leading-relaxed">
                {pillar.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
