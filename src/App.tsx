import React, { useState } from 'react';
import { MOCK_VEHICLES } from './data/mockVehicles';
import { Vehicle } from './types/vehicle';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { HeroSection } from './components/landing/HeroSection';
import { FeaturedFleet } from './components/landing/FeaturedFleet';
import { ExperiencePillars } from './components/landing/ExperiencePillars';
import { BookingSteps } from './components/landing/BookingSteps';
import { FaqSection } from './components/landing/FaqSection';
import { WhatsAppConcierge } from './components/landing/WhatsAppConcierge';
import { VehicleModal } from './components/showcase/VehicleModal';
import { QuickReservationModal } from './components/landing/QuickReservationModal';

export const App: React.FC = () => {
  const [vehicles] = useState<Vehicle[]>(MOCK_VEHICLES);
  const [selectedVehicleForModal, setSelectedVehicleForModal] = useState<Vehicle | null>(null);
  const [selectedVehicleForBooking, setSelectedVehicleForBooking] = useState<Vehicle | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  const handleOpenVehicleModal = (vehicle: Vehicle) => {
    setSelectedVehicleForModal(vehicle);
  };

  const handleCloseVehicleModal = () => {
    setSelectedVehicleForModal(null);
  };

  const handleOpenBooking = (vehicle?: Vehicle) => {
    if (vehicle) {
      setSelectedVehicleForBooking(vehicle);
    } else if (!selectedVehicleForBooking && vehicles.length > 0) {
      setSelectedVehicleForBooking(vehicles[0]);
    }
    // Si estaba abierto el modal de detalle, cerrarlo para mostrar la reserva
    setSelectedVehicleForModal(null);
    setIsBookingModalOpen(true);
  };

  const handleCloseBooking = () => {
    setIsBookingModalOpen(false);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-carbon-950 text-silver-100 font-sans selection:bg-gold-500/20 selection:text-gold-400">
      
      {/* Barra de Navegación Superior */}
      <Navbar
        onNavigateToFleet={() => scrollToSection('showroom')}
        onNavigateToBooking={() => handleOpenBooking()}
      />

      <main className="flex-grow">
        {/* 1. Hero Principal con Protagonista Visual */}
        <HeroSection
          featuredVehicles={vehicles.filter((v) => v.isFeatured)}
          onExploreFleet={() => scrollToSection('showroom')}
          onSelectVehicleForBooking={(veh) => handleOpenBooking(veh)}
        />

        {/* 2. Catálogo Showroom / Flota Destacada */}
        <FeaturedFleet
          vehicles={vehicles}
          onSelectVehicle={handleOpenVehicleModal}
          onQuickBook={handleOpenBooking}
        />

        {/* 3. Pilares de la Experiencia Showroom */}
        <ExperiencePillars />

        {/* 4. Cómo Funciona la Reserva (3 Pasos) */}
        <BookingSteps />

        {/* 5. Preguntas Frecuentes y Requisitos */}
        <FaqSection />
      </main>

      {/* Pie de Página */}
      <Footer />

      {/* Modal de Detalle con Video y 12 fotos */}
      <VehicleModal
        vehicle={selectedVehicleForModal}
        onClose={handleCloseVehicleModal}
        onBook={handleOpenBooking}
      />

      {/* Modal de Solicitud de Reserva */}
      <QuickReservationModal
        vehicle={selectedVehicleForBooking}
        vehicles={vehicles}
        isOpen={isBookingModalOpen}
        onClose={handleCloseBooking}
      />

      {/* Botón flotante y asistente de WhatsApp (Regla 30) */}
      <WhatsAppConcierge
        vehicles={vehicles}
        selectedVehicle={selectedVehicleForBooking}
      />

    </div>
  );
};

export default App;
