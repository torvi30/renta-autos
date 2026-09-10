import React, { useState } from 'react';
import { ChevronDown, HelpCircle, FileCheck, CreditCard, UserCheck, ShieldAlert } from 'lucide-react';

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: '¿Cuáles son los requisitos mínimos para alquilar un vehículo de lujo?',
      answer: 'Es necesario tener al menos 23 años de edad (25 para modelos superdeportivos), presentar una licencia de conducir vigente (nacional o internacional válida) y documento de identidad o pasaporte original.',
    },
    {
      question: '¿Qué cubre el seguro incluido en el alquiler?',
      answer: 'Todos los vehículos cuentan con póliza a todo riesgo con franquicia reducida, cobertura contra robo, daños a terceros y asistencia médica de urgencia. También disponemos de opción de Cobertura Cero Franquicia.',
    },
    {
      question: '¿Cómo se gestiona la entrega y devolución (Concierge VIP)?',
      answer: 'Coordinamos la entrega directa en la terminal de llegadas del aeropuerto (incluyendo aviación privada), en el lobby de su hotel o directamente en su residencia particular a la hora exacta solicitada.',
    },
    {
      question: '¿Existe límite de kilometraje diario?',
      answer: 'Nuestras tarifas estándar incluyen 200 km libres por día. Disponemos de paquetes con kilometraje ampliado o ilimitado según el modelo y la duración de la reserva.',
    },
    {
      question: '¿Cuál es la política de combustible?',
      answer: 'Entregamos el vehículo con el depósito completamente lleno y verificado. Se devuelve en el mismo estado para evitar cargos adicionales de reabastecimiento.',
    },
  ];

  return (
    <section id="faq" className="py-24 bg-carbon-950 border-t border-carbon-800/80">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-16">
          <span className="text-xs font-semibold tracking-widest text-gold-400 uppercase flex items-center justify-center gap-1.5 mb-2">
            <HelpCircle className="w-4 h-4" />
            <span>TRANSPARENCIA TOTAL</span>
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-silver-100 uppercase font-display">
            Requisitos y Preguntas Frecuentes
          </h2>
          <p className="mt-3 text-sm text-silver-400">
            Todo lo que necesitas saber para disfrutar de una experiencia de alquiler sin contratiempos.
          </p>
        </div>

        {/* Requisitos clave destacados */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
          <div className="p-4 rounded-xl bg-carbon-900 border border-carbon-800 text-center">
            <UserCheck className="w-5 h-5 mx-auto text-gold-400 mb-2" />
            <div className="text-xs font-bold text-silver-200">Edad 23+</div>
            <div className="text-[10px] text-silver-400 mt-0.5">25+ en superdeportivos</div>
          </div>

          <div className="p-4 rounded-xl bg-carbon-900 border border-carbon-800 text-center">
            <FileCheck className="w-5 h-5 mx-auto text-gold-400 mb-2" />
            <div className="text-xs font-bold text-silver-200">Licencia Vigente</div>
            <div className="text-[10px] text-silver-400 mt-0.5">Mínimo 2 años antigüedad</div>
          </div>

          <div className="p-4 rounded-xl bg-carbon-900 border border-carbon-800 text-center">
            <CreditCard className="w-5 h-5 mx-auto text-gold-400 mb-2" />
            <div className="text-xs font-bold text-silver-200">Depósito Seguro</div>
            <div className="text-[10px] text-silver-400 mt-0.5">Retención reembolsable</div>
          </div>

          <div className="p-4 rounded-xl bg-carbon-900 border border-carbon-800 text-center">
            <ShieldAlert className="w-5 h-5 mx-auto text-emerald-400 mb-2" />
            <div className="text-xs font-bold text-silver-200">Póliza Integral</div>
            <div className="text-[10px] text-silver-400 mt-0.5">Cobertura completa</div>
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
