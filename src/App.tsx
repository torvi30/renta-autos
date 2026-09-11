import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Vehicle, VehicleStatus } from './types/vehicle';
import {
  subscribeVehicles,
  getLocalVehicles,
  updateVehicleStatusInCloud,
} from './services/vehicleService';
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
import { CatalogPage } from './views/CatalogPage';
import { VehicleDetailPage } from './views/VehicleDetailPage';
import { AdminLoginPage } from './views/admin/AdminLoginPage';
import { AdminDashboardPage } from './views/admin/AdminDashboardPage';
import { ProtectedRoute } from './components/admin/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';

type AppRoute = 'home' | 'catalog' | 'vehicle_detail' | 'admin_login' | 'admin';

interface RouteState {
  route: AppRoute;
  slug: string | null;
}

const parseRouteFromLocation = (): RouteState => {
  if (typeof window === 'undefined') return { route: 'home', slug: null };
  const path = window.location.pathname;
  const hash = window.location.hash;

  if (path.startsWith('/admin/login')) {
    return { route: 'admin_login', slug: null };
  }

  if (path.startsWith('/admin')) {
    return { route: 'admin', slug: null };
  }

  if (path.startsWith('/vehicles/')) {
    const slug = path.replace('/vehicles/', '').split('/')[0].split('?')[0];
    if (slug) {
      return { route: 'vehicle_detail', slug };
    }
  }

  if (path === '/vehicles' || path.startsWith('/vehicles') || hash === '#catalog') {
    return { route: 'catalog', slug: null };
  }

  return { route: 'home', slug: null };
};

const AppContent: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>(getLocalVehicles);
  const [routeState, setRouteState] = useState<RouteState>(parseRouteFromLocation);
  const [selectedVehicleForModal, setSelectedVehicleForModal] = useState<Vehicle | null>(null);
  const [selectedVehicleForBooking, setSelectedVehicleForBooking] = useState<Vehicle | null>(null);
  const [bookingDates, setBookingDates] = useState<{ startDate?: string; endDate?: string }>({});
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  // Suscripción reactiva en tiempo real a Cloud Firestore (con fallback a local)
  useEffect(() => {
    const unsubscribe = subscribeVehicles((updatedList) => {
      setVehicles(updatedList);
    });
    return () => unsubscribe();
  }, []);

  const handleUpdateVehicleStatus = useCallback((vehicleId: string, newStatus: VehicleStatus) => {
    updateVehicleStatusInCloud(vehicleId, newStatus);
  }, []);

  const currentRoute = routeState.route;
  const currentSlug = routeState.slug;

  const currentVehicleForDetail = useMemo(() => {
    if (!currentSlug) return null;
    return vehicles.find((v) => v.slug === currentSlug) || null;
  }, [vehicles, currentSlug]);

  // Sincronización con el historial del navegador (Back / Forward)
  useEffect(() => {
    const handlePopState = () => {
      setRouteState(parseRouteFromLocation());
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateToHome = useCallback(() => {
    setRouteState({ route: 'home', slug: null });
    if (window.location.pathname !== '/') {
      window.history.pushState({}, '', '/');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const navigateToCatalog = useCallback(() => {
    setRouteState({ route: 'catalog', slug: null });
    if (window.location.pathname !== '/vehicles') {
      window.history.pushState({}, '', '/vehicles');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const navigateToVehicle = useCallback((slug: string) => {
    setRouteState({ route: 'vehicle_detail', slug });
    const targetPath = `/vehicles/${slug}`;
    if (window.location.pathname !== targetPath) {
      window.history.pushState({}, '', targetPath);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const navigateToAdminLogin = useCallback(() => {
    setRouteState({ route: 'admin_login', slug: null });
    if (window.location.pathname !== '/admin/login') {
      window.history.pushState({}, '', '/admin/login');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const navigateToAdminDashboard = useCallback(() => {
    setRouteState({ route: 'admin', slug: null });
    if (window.location.pathname !== '/admin') {
      window.history.pushState({}, '', '/admin');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleOpenVehicleModal = (vehicle: Vehicle) => {
    navigateToVehicle(vehicle.slug);
  };

  const handleCloseVehicleModal = () => {
    setSelectedVehicleForModal(null);
  };

  const handleOpenBooking = (vehicle?: Vehicle, startDate?: string, endDate?: string) => {
    if (vehicle) {
      setSelectedVehicleForBooking(vehicle);
    } else if (!selectedVehicleForBooking && vehicles.length > 0) {
      setSelectedVehicleForBooking(vehicles[0]);
    }
    setBookingDates({ startDate, endDate });
    setSelectedVehicleForModal(null);
    setIsBookingModalOpen(true);
  };

  const handleCloseBooking = () => {
    setIsBookingModalOpen(false);
  };

  const scrollToSection = (id: string) => {
    if (currentRoute !== 'home') {
      navigateToHome();
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      return;
    }

    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // 1. Ruta de Acceso Administrativo (/admin/login) - Fase 5
  if (currentRoute === 'admin_login') {
    return (
      <AdminLoginPage
        onNavigateHome={navigateToHome}
        onLoginSuccess={navigateToAdminDashboard}
      />
    );
  }

  // 2. Ruta de Panel Administrativo Protegido (/admin) - Fase 6
  if (currentRoute === 'admin') {
    return (
      <ProtectedRoute onNavigateToLogin={navigateToAdminLogin}>
        <AdminDashboardPage
          vehicles={vehicles}
          onUpdateVehicleStatus={handleUpdateVehicleStatus}
          onNavigateHome={navigateToHome}
          onNavigateToCatalog={navigateToCatalog}
          onNavigateToVehicleDetail={navigateToVehicle}
        />
      </ProtectedRoute>
    );
  }

  // 3. Rutas Públicas (Home, Catálogo, Ficha de Vehículo)
  return (
    <div className="min-h-screen flex flex-col bg-carbon-950 text-silver-100 font-sans selection:bg-gold-500/20 selection:text-gold-400">
      
      {/* Barra de Navegación Superior */}
      <Navbar
        currentRoute={currentRoute === 'home' ? 'home' : 'catalog'}
        onNavigateHome={navigateToHome}
        onNavigateToCatalog={navigateToCatalog}
        onNavigateToFleet={() => scrollToSection('showroom')}
        onNavigateToBooking={() => handleOpenBooking()}
        onNavigateToAdmin={navigateToAdminLogin}
      />

      <main className="flex-grow">
        {currentRoute === 'vehicle_detail' ? (
          /* Vista de Detalle de Vehículo (/vehicles/:slug) - Fase 3 */
          <VehicleDetailPage
            vehicle={currentVehicleForDetail}
            allVehicles={vehicles}
            onNavigateHome={navigateToHome}
            onNavigateToCatalog={navigateToCatalog}
            onSelectVehicle={(veh) => navigateToVehicle(veh.slug)}
            onOpenBooking={handleOpenBooking}
          />
        ) : currentRoute === 'catalog' ? (
          /* Vista del Catálogo Completo (/vehicles) - Fase 2 */
          <CatalogPage
            vehicles={vehicles}
            onSelectVehicle={handleOpenVehicleModal}
            onQuickBook={handleOpenBooking}
            onNavigateHome={navigateToHome}
          />
        ) : (
          /* Vista Principal / Showroom Landing - Fase 1 */
          <>
            {/* 1. Master Showroom Pavilion con la Flota Boutique de Autos de Lujo */}
            <HeroSection
              vehicles={vehicles}
              onExploreFleet={() => scrollToSection('showroom')}
              onSelectVehicleForModal={handleOpenVehicleModal}
              onSelectVehicleForBooking={(veh) => handleOpenBooking(veh)}
            />

            {/* 2. Catálogo Showroom / Flota Destacada */}
            <FeaturedFleet
              vehicles={vehicles}
              onSelectVehicle={handleOpenVehicleModal}
              onQuickBook={handleOpenBooking}
              onNavigateToCatalog={navigateToCatalog}
            />

            {/* 3. Pilares de la Experiencia Showroom */}
            <ExperiencePillars />

            {/* 4. Cómo Funciona la Reserva (3 Pasos) */}
            <BookingSteps />

            {/* 5. Preguntas Frecuentes y Requisitos */}
            <FaqSection />
          </>
        )}
      </main>

      {/* Pie de Página con acceso a Portal Corporativo */}
      <Footer onNavigateToAdmin={navigateToAdminLogin} />

      {/* Modal de Detalle con Video y 12 fotos (Fallback/modal directo) */}
      <VehicleModal
        vehicle={selectedVehicleForModal}
        onClose={handleCloseVehicleModal}
        onBook={handleOpenBooking}
      />

      {/* Modal de Solicitud de Reserva (Fase 4: BookingFlowModal) */}
      <QuickReservationModal
        vehicle={selectedVehicleForBooking}
        vehicles={vehicles}
        isOpen={isBookingModalOpen}
        onClose={handleCloseBooking}
        initialStartDate={bookingDates.startDate}
        initialEndDate={bookingDates.endDate}
      />

      {/* Botón flotante y asistente de WhatsApp (Regla 30) */}
      <WhatsAppConcierge
        vehicles={vehicles}
        selectedVehicle={selectedVehicleForBooking}
      />

    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
