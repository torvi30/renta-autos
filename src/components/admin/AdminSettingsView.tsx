import React, { useState, useRef } from 'react';
import {
  Building2,
  Phone,
  Clock,
  Save,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  MessageSquare,
  RefreshCw,
  Plus,
  Trash2,
  Upload,
  Image as ImageIcon,
  Sliders,
  Share2,
  FileCheck2,
  X,
  Cloud,
  Database,
  ShieldCheck,
  Zap,
  Check,
  AlertCircle,
} from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { luxuryAlert } from '../../context/AlertContext';
import { CompanySettings } from '../../types/settings';
import {
  testCloudinaryConnection,
  getCloudinaryConfig,
  isCloudinaryConfigured,
} from '../../services/cloudinaryService';
import { isFirebaseConfigured } from '../../services/firebase';

type SettingsTab = 'brand' | 'contact' | 'hero' | 'social' | 'policies' | 'cloud';

export const AdminSettingsView: React.FC = () => {
  const { settings, updateSettings, isSaving, getWhatsAppLink } = useSettings();
  const [formData, setFormData] = useState<CompanySettings>({
    ...settings,
    hero: settings.hero || {
      badge: 'CONCESIONARIO SHOWROOM VIP • FLOTA 2026',
      titleLine1: 'TU VIAJE.',
      titleLine2: 'TU VEHÍCULO.',
      description: 'Explora nuestra exclusiva flota de vehículos de alta gama. Usa las flechas o la barra inferior para seleccionar cualquier auto, ver sus detalles y reservar.',
    },
    socialLinks: settings.socialLinks || {
      instagram: '',
      tiktok: '',
      facebook: '',
      youtube: '',
    },
    policies: settings.policies || {
      coverageText: 'Póliza de Cobertura Total Todo Riesgo ($0 Deducible)',
      certificationText: 'Flota Certificada 100% Original',
      minAge: 25,
      depositRefundHours: 48,
    },
  });

  const [activeTab, setActiveTab] = useState<SettingsTab>('brand');
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [newLocation, setNewLocation] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (field: keyof CompanySettings, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleHeroChange = (field: keyof CompanySettings['hero'], value: string) => {
    setFormData((prev) => ({
      ...prev,
      hero: {
        ...prev.hero,
        [field]: value,
      },
    }));
  };

  const handleSocialChange = (field: keyof CompanySettings['socialLinks'], value: string) => {
    setFormData((prev) => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [field]: value,
      },
    }));
  };

  const handlePolicyChange = (field: keyof CompanySettings['policies'], value: any) => {
    setFormData((prev) => ({
      ...prev,
      policies: {
        ...prev.policies,
        [field]: value,
      },
    }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      luxuryAlert.warning(
        'Formato de Imagen No Válido',
        'Por favor selecciona un archivo de imagen compatible (PNG, JPG o WebP).'
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        handleChange('logoUrl', base64);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddLocation = () => {
    if (!newLocation.trim()) return;
    setFormData((prev) => ({
      ...prev,
      pickupLocations: [...prev.pickupLocations, newLocation.trim()],
    }));
    setNewLocation('');
  };

  const handleRemoveLocation = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      pickupLocations: prev.pickupLocations.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings(formData);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 4000);
    luxuryAlert.success({
      title: '¡Configuración Guardada!',
      message: 'Los parámetros comerciales, multimedia y políticas de alquiler se han actualizado con éxito.',
      timer: 3500,
    });
  };

  const testWhatsAppUrl = getWhatsAppLink({
    vehicleName: 'Porsche 911 GT3 RS',
    clientName: 'Víctor Tamayo (Prueba Staff)',
  });

  const [isTestingCloudinary, setIsTestingCloudinary] = useState(false);
  const [cloudinaryTestResult, setCloudinaryTestResult] = useState<{
    success: boolean;
    message: string;
    url?: string;
  } | null>(null);

  const handleTestCloudinary = async () => {
    setIsTestingCloudinary(true);
    setCloudinaryTestResult(null);
    try {
      const result = await testCloudinaryConnection();
      setCloudinaryTestResult(result);
      if (result.success) {
        luxuryAlert.success({
          title: '¡Cloudinary CDN Conectado!',
          message: 'La prueba de subida y optimización en la nube ha sido exitosa.',
          timer: 3500,
        });
      } else {
        luxuryAlert.warning(
          'Configuración de Cloudinary Pendiente',
          result.message
        );
      }
    } catch (err: any) {
      const errMsg = err?.message || 'Error inesperado al conectar con Cloudinary.';
      setCloudinaryTestResult({
        success: false,
        message: errMsg,
      });
      luxuryAlert.error('Error de Conexión CDN', errMsg);
    } finally {
      setIsTestingCloudinary(false);
    }
  };

  const tabButtons: { id: SettingsTab; label: string; icon: any }[] = [
    { id: 'brand', label: 'Marca & Logo', icon: ImageIcon },
    { id: 'contact', label: 'Contacto & WhatsApp', icon: Phone },
    { id: 'hero', label: 'Portada (Hero)', icon: Sliders },
    { id: 'social', label: 'Redes Sociales', icon: Share2 },
    { id: 'policies', label: 'Políticas & Requisitos', icon: FileCheck2 },
    { id: 'cloud', label: 'Cloud & CDN', icon: Cloud },
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      
      {/* ========================================================================= */}
      {/* CABECERA EJECUTIVA DE AJUSTES                                             */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-carbon-900/90 border border-carbon-800 p-6 rounded-2xl backdrop-blur-xl shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-400 shadow-inner">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider font-display">
                Personalización Total de Marca & Contenidos
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-gold-500/20 text-gold-300 border border-gold-500/30">
                WHITE-LABEL
              </span>
            </div>
            <p className="text-xs sm:text-sm text-silver-400 mt-1">
              Configura tu logo oficial, WhatsApp, títulos de la portada, redes sociales y textos de toda la web.
            </p>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={isSaving}
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-gold-500 to-gold-400 hover:from-gold-400 hover:to-gold-300 text-carbon-950 font-black text-sm uppercase tracking-wider transition-all shadow-lg shadow-gold-500/20 hover:shadow-gold-500/40 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Guardando...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Guardar Cambios</span>
            </>
          )}
        </button>
      </div>

      {/* Alerta de Éxito Flotante */}
      {showSuccessToast && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-sm animate-fade-in shadow-xl backdrop-blur-md">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <div>
            <span className="font-bold">¡Cambios guardados con éxito!</span> El logo, textos de portada, WhatsApp y redes sociales están activos en toda la plataforma.
          </div>
        </div>
      )}

      {/* Selector de Pestañas de Ajustes */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-carbon-800 scrollbar-none">
        {tabButtons.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-gold-500/20 border border-gold-500/50 text-gold-400 shadow-md shadow-gold-500/10'
                  : 'bg-carbon-900 border border-carbon-800 text-silver-400 hover:text-white hover:border-carbon-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* ========================================================================= */}
        {/* COLUMNA IZQUIERDA: FORMULARIO DINÁMICO POR PESTAÑA (7 Columnas)           */}
        {/* ========================================================================= */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* PESTAÑA 1: MARCA & LOGO OFICIAL */}
          {activeTab === 'brand' && (
            <div className="bg-carbon-900/80 border border-carbon-800 p-6 rounded-2xl space-y-6 shadow-lg animate-fade-in">
              <div className="flex items-center justify-between border-b border-carbon-800 pb-3">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-gold-400" />
                  <h3 className="text-base font-bold text-white uppercase tracking-wider font-display">
                    Identidad de Marca & Logo Propio
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-gold-400 bg-gold-500/10 px-2 py-0.5 rounded border border-gold-500/20">
                  Navbar, Footer & PDF
                </span>
              </div>

              {/* Subida de Imagen de Logo */}
              <div className="space-y-3 bg-carbon-950/60 p-5 rounded-2xl border border-carbon-800">
                <label className="block text-xs font-bold text-silver-200 uppercase tracking-wider">
                  Logo de la Empresa (PNG transparente o SVG recomendado)
                </label>

                {/* Previsualización del Logo Actual */}
                <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-xl bg-carbon-900 border border-carbon-750">
                  <div className="w-40 h-20 rounded-xl bg-carbon-950 border border-carbon-800 flex items-center justify-center p-3 shadow-inner relative group overflow-hidden">
                    {formData.logoUrl ? (
                      <img
                        src={formData.logoUrl}
                        alt="Logo Preview"
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-center">
                        <Sparkles className="w-6 h-6 text-gold-400 mb-1" />
                        <span className="text-[10px] text-silver-400 font-mono">Isotipo Oficial</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-2 text-center sm:text-left">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleLogoUpload}
                      accept="image/png,image/jpeg,image/webp,image/svg+xml"
                      className="hidden"
                    />
                    <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gold-500/20 hover:bg-gold-500/30 text-gold-300 border border-gold-500/40 text-xs font-bold transition-all shadow-sm"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Subir Imagen de Logo</span>
                      </button>

                      {formData.logoUrl && (
                        <button
                          type="button"
                          onClick={() => handleChange('logoUrl', '')}
                          className="flex items-center gap-1 px-3 py-2 rounded-xl bg-carbon-800 hover:bg-red-500/20 text-silver-400 hover:text-red-400 border border-carbon-700 hover:border-red-500/30 text-xs transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Restablecer</span>
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-silver-400">
                      Formatos: PNG con fondo transparente, SVG o WebP. Máximo 2MB.
                    </p>
                  </div>
                </div>

                {/* Alternativa: URL directa de Logo */}
                <div className="space-y-1.5 pt-1">
                  <label className="block text-[11px] text-silver-400">
                    O pega una URL directa de tu logo en línea:
                  </label>
                  <input
                    type="url"
                    value={formData.logoUrl || ''}
                    onChange={(e) => handleChange('logoUrl', e.target.value)}
                    placeholder="https://ejemplo.com/mi-logo.png"
                    className="w-full px-3.5 py-2 rounded-xl bg-carbon-900 border border-carbon-750 text-white font-mono text-xs focus:outline-none focus:border-gold-500"
                  />
                </div>
              </div>

              {/* Nombre y Tagline */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-silver-300 uppercase tracking-wider">
                    Nombre Comercial de la Empresa *
                  </label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => handleChange('companyName', e.target.value)}
                    placeholder="Premium Car Rental"
                    className="w-full px-4 py-2.5 rounded-xl bg-carbon-950 border border-carbon-800 text-white text-sm font-semibold focus:outline-none focus:border-gold-500 transition-colors"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-silver-300 uppercase tracking-wider">
                    Eslogan / Reseña Editorial (Pie de Página) *
                  </label>
                  <textarea
                    rows={3}
                    value={formData.tagline}
                    onChange={(e) => handleChange('tagline', e.target.value)}
                    placeholder="La experiencia definitiva en alquiler de vehículos de alta gama y superdeportivos..."
                    className="w-full px-4 py-2.5 rounded-xl bg-carbon-950 border border-carbon-800 text-white text-sm focus:outline-none focus:border-gold-500 transition-colors resize-none"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* PESTAÑA 2: CONTACTO & WHATSAPP */}
          {activeTab === 'contact' && (
            <div className="bg-carbon-900/80 border border-carbon-800 p-6 rounded-2xl space-y-5 shadow-lg animate-fade-in">
              <div className="flex items-center justify-between border-b border-carbon-800 pb-3">
                <div className="flex items-center gap-2">
                  <Phone className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-base font-bold text-white uppercase tracking-wider font-display">
                    Canales Concierge & WhatsApp Oficial
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Recepción de Clientes
                </span>
              </div>

              {/* WhatsApp Oficial */}
              <div className="space-y-1.5 bg-carbon-950/60 p-4 rounded-xl border border-carbon-800">
                <label className="block text-xs font-bold text-silver-200 uppercase tracking-wider flex items-center justify-between">
                  <span>Número de WhatsApp para Enlace Directo (wa.me) *</span>
                  <span className="text-[10px] text-emerald-400 font-mono">Código país + número</span>
                </label>
                <div className="flex items-center gap-2">
                  <div className="px-3 py-2.5 rounded-xl bg-carbon-900 border border-carbon-750 text-silver-300 font-mono text-sm">
                    wa.me/
                  </div>
                  <input
                    type="text"
                    value={formData.whatsappPhone}
                    onChange={(e) => handleChange('whatsappPhone', e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="573009115898"
                    className="flex-1 px-4 py-2.5 rounded-xl bg-carbon-900 border border-carbon-750 text-white font-mono text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                    required
                  />
                </div>
                <p className="text-[11px] text-silver-400">
                  Ingresa solo números con código de país (ej. Colombia: <code className="text-gold-400">573001234567</code>).
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-silver-300 uppercase tracking-wider">
                    Teléfono Visible en Footer / PBX
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="+57 (300) 911-5898"
                    className="w-full px-4 py-2.5 rounded-xl bg-carbon-950 border border-carbon-800 text-white font-mono text-sm focus:outline-none focus:border-gold-500"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-silver-300 uppercase tracking-wider">
                    Correo Concierge Oficial
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="concierge@premiumcarrental.com"
                    className="w-full px-4 py-2.5 rounded-xl bg-carbon-950 border border-carbon-800 text-white text-sm focus:outline-none focus:border-gold-500"
                    required
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="block text-xs font-bold text-silver-300 uppercase tracking-wider">
                    Horario de Atención Oficial
                  </label>
                  <div className="relative">
                    <Clock className="w-4 h-4 text-emerald-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={formData.businessHours}
                      onChange={(e) => handleChange('businessHours', e.target.value)}
                      placeholder="Atención 24/7 / 365 días"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-carbon-950 border border-carbon-800 text-white text-sm focus:outline-none focus:border-gold-500"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-silver-300 uppercase tracking-wider">
                    Dirección Showroom
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    placeholder="Cra 43A #1-50, El Poblado"
                    className="w-full px-4 py-2.5 rounded-xl bg-carbon-950 border border-carbon-800 text-white text-sm focus:outline-none focus:border-gold-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-silver-300 uppercase tracking-wider">
                    Ciudad / País
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                    placeholder="Medellín, Colombia"
                    className="w-full px-4 py-2.5 rounded-xl bg-carbon-950 border border-carbon-800 text-white text-sm focus:outline-none focus:border-gold-500"
                  />
                </div>
              </div>

              {/* Puntos de Entrega */}
              <div className="space-y-2 pt-2 border-t border-carbon-800">
                <label className="block text-xs font-bold text-silver-300 uppercase tracking-wider">
                  Bases de Entrega VIP Oficiales
                </label>
                <div className="space-y-2">
                  {formData.pickupLocations.map((loc, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-carbon-950 border border-carbon-800 text-xs text-silver-200">
                      <span className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-gold-400" />
                        {loc}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveLocation(idx)}
                        className="text-silver-500 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="text"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    placeholder="Agregar punto (ej: Hotel The Charlee)"
                    className="flex-1 px-3 py-2 rounded-xl bg-carbon-950 border border-carbon-800 text-white text-xs focus:outline-none focus:border-gold-500"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddLocation();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddLocation}
                    className="px-3 py-2 rounded-xl bg-carbon-800 hover:bg-carbon-750 text-gold-400 border border-carbon-700 text-xs font-bold flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Añadir</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* PESTAÑA 3: PORTADA & HERO */}
          {activeTab === 'hero' && (
            <div className="bg-carbon-900/80 border border-carbon-800 p-6 rounded-2xl space-y-5 shadow-lg animate-fade-in">
              <div className="flex items-center justify-between border-b border-carbon-800 pb-3">
                <div className="flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-gold-400" />
                  <h3 className="text-base font-bold text-white uppercase tracking-wider font-display">
                    Textos de Portada Principal (Hero Section)
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-gold-400 bg-gold-500/10 px-2 py-0.5 rounded border border-gold-500/20">
                  Pantalla de Inicio
                </span>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-silver-300 uppercase tracking-wider">
                    Badge Superior Flotante
                  </label>
                  <input
                    type="text"
                    value={formData.hero.badge}
                    onChange={(e) => handleHeroChange('badge', e.target.value)}
                    placeholder="CONCESIONARIO SHOWROOM VIP 360° • FLOTA 2026"
                    className="w-full px-4 py-2.5 rounded-xl bg-carbon-950 border border-carbon-800 text-gold-400 font-mono text-xs font-bold focus:outline-none focus:border-gold-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-silver-300 uppercase tracking-wider">
                      Título Principal - Línea 1 (Blanco)
                    </label>
                    <input
                      type="text"
                      value={formData.hero.titleLine1}
                      onChange={(e) => handleHeroChange('titleLine1', e.target.value)}
                      placeholder="TU VIAJE."
                      className="w-full px-4 py-2.5 rounded-xl bg-carbon-950 border border-carbon-800 text-white font-extrabold uppercase font-display text-sm focus:outline-none focus:border-gold-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-silver-300 uppercase tracking-wider">
                      Título Principal - Línea 2 (Oro Degradado)
                    </label>
                    <input
                      type="text"
                      value={formData.hero.titleLine2}
                      onChange={(e) => handleHeroChange('titleLine2', e.target.value)}
                      placeholder="TU VEHÍCULO."
                      className="w-full px-4 py-2.5 rounded-xl bg-carbon-950 border border-carbon-800 text-gold-400 font-extrabold uppercase font-display text-sm focus:outline-none focus:border-gold-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-silver-300 uppercase tracking-wider">
                    Párrafo Descriptivo del Showroom
                  </label>
                  <textarea
                    rows={3}
                    value={formData.hero.description}
                    onChange={(e) => handleHeroChange('description', e.target.value)}
                    placeholder="Gira cada vehículo en 360° sobre nuestro plato giratorio..."
                    className="w-full px-4 py-2.5 rounded-xl bg-carbon-950 border border-carbon-800 text-silver-200 text-sm focus:outline-none focus:border-gold-500 resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* PESTAÑA 4: REDES SOCIALES */}
          {activeTab === 'social' && (
            <div className="bg-carbon-900/80 border border-carbon-800 p-6 rounded-2xl space-y-5 shadow-lg animate-fade-in">
              <div className="flex items-center justify-between border-b border-carbon-800 pb-3">
                <div className="flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-gold-400" />
                  <h3 className="text-base font-bold text-white uppercase tracking-wider font-display">
                    Enlaces a Redes Sociales Oficiales
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-silver-400 bg-carbon-800 px-2 py-0.5 rounded">
                  Footer
                </span>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-silver-300 uppercase tracking-wider">
                    Instagram Oficial
                  </label>
                  <input
                    type="url"
                    value={formData.socialLinks.instagram || ''}
                    onChange={(e) => handleSocialChange('instagram', e.target.value)}
                    placeholder="https://instagram.com/tu_cuenta"
                    className="w-full px-4 py-2.5 rounded-xl bg-carbon-950 border border-carbon-800 text-white text-sm focus:outline-none focus:border-gold-500 font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-silver-300 uppercase tracking-wider">
                    TikTok Oficial
                  </label>
                  <input
                    type="url"
                    value={formData.socialLinks.tiktok || ''}
                    onChange={(e) => handleSocialChange('tiktok', e.target.value)}
                    placeholder="https://tiktok.com/@tu_cuenta"
                    className="w-full px-4 py-2.5 rounded-xl bg-carbon-950 border border-carbon-800 text-white text-sm focus:outline-none focus:border-gold-500 font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-silver-300 uppercase tracking-wider">
                    Facebook Oficial
                  </label>
                  <input
                    type="url"
                    value={formData.socialLinks.facebook || ''}
                    onChange={(e) => handleSocialChange('facebook', e.target.value)}
                    placeholder="https://facebook.com/tu_pagina"
                    className="w-full px-4 py-2.5 rounded-xl bg-carbon-950 border border-carbon-800 text-white text-sm focus:outline-none focus:border-gold-500 font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-silver-300 uppercase tracking-wider">
                    YouTube Oficial (Opcional)
                  </label>
                  <input
                    type="url"
                    value={formData.socialLinks.youtube || ''}
                    onChange={(e) => handleSocialChange('youtube', e.target.value)}
                    placeholder="https://youtube.com/@tu_canal"
                    className="w-full px-4 py-2.5 rounded-xl bg-carbon-950 border border-carbon-800 text-white text-sm focus:outline-none focus:border-gold-500 font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* PESTAÑA 5: POLÍTICAS & REQUISITOS */}
          {activeTab === 'policies' && (
            <div className="bg-carbon-900/80 border border-carbon-800 p-6 rounded-2xl space-y-5 shadow-lg animate-fade-in">
              <div className="flex items-center justify-between border-b border-carbon-800 pb-3">
                <div className="flex items-center gap-2">
                  <FileCheck2 className="w-5 h-5 text-gold-400" />
                  <h3 className="text-base font-bold text-white uppercase tracking-wider font-display">
                    Políticas de Renta & Garantías VIP
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Legal & FAQ
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-silver-300 uppercase tracking-wider">
                    Edad Mínima para Rentar (Años)
                  </label>
                  <input
                    type="number"
                    min={18}
                    max={35}
                    value={formData.policies.minAge}
                    onChange={(e) => handlePolicyChange('minAge', parseInt(e.target.value) || 25)}
                    className="w-full px-4 py-2.5 rounded-xl bg-carbon-950 border border-carbon-800 text-white font-mono text-sm focus:outline-none focus:border-gold-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-silver-300 uppercase tracking-wider">
                    Horas para Retorno de Depósito
                  </label>
                  <input
                    type="number"
                    min={12}
                    max={120}
                    value={formData.policies.depositRefundHours}
                    onChange={(e) => handlePolicyChange('depositRefundHours', parseInt(e.target.value) || 48)}
                    className="w-full px-4 py-2.5 rounded-xl bg-carbon-950 border border-carbon-800 text-white font-mono text-sm focus:outline-none focus:border-gold-500"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="block text-xs font-bold text-silver-300 uppercase tracking-wider">
                    Distintivo de Póliza
                  </label>
                  <input
                    type="text"
                    value={formData.policies.coverageText}
                    onChange={(e) => handlePolicyChange('coverageText', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-carbon-950 border border-carbon-800 text-white text-xs focus:outline-none focus:border-gold-500"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="block text-xs font-bold text-silver-300 uppercase tracking-wider">
                    Distintivo de Certificación de Flota
                  </label>
                  <input
                    type="text"
                    value={formData.policies.certificationText}
                    onChange={(e) => handlePolicyChange('certificationText', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-carbon-950 border border-carbon-800 text-white text-xs focus:outline-none focus:border-gold-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* PESTAÑA 6: CLOUD & CDN MULTIMEDIA (CLOUDINARY + FIREBASE) */}
          {activeTab === 'cloud' && (
            <div className="bg-carbon-900/80 border border-carbon-800 p-6 rounded-2xl space-y-6 shadow-lg animate-fade-in">
              <div className="flex items-center justify-between border-b border-carbon-800 pb-3">
                <div className="flex items-center gap-2">
                  <Cloud className="w-5 h-5 text-gold-400" />
                  <h3 className="text-base font-bold text-white uppercase tracking-wider font-display">
                    Almacenamiento Cloud & CDN Multimedia
                  </h3>
                </div>
                <span className={`text-[11px] font-mono px-2 py-0.5 rounded border ${
                  isCloudinaryConfigured()
                    ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
                    : 'text-amber-400 bg-amber-500/10 border-amber-500/30'
                }`}>
                  {isCloudinaryConfigured() ? 'CDN ACTIVO' : 'PENDIENTE CREDENCIALES'}
                </span>
              </div>

              {/* Tarjeta de Estado y Diagnóstico de Cloudinary CDN */}
              <div className="p-5 rounded-2xl bg-carbon-950/70 border border-carbon-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <Zap className="w-4 h-4 text-gold-400" />
                      Cloudinary CDN (Fotos & Videos de Flota)
                    </h4>
                    <p className="text-xs text-silver-400 mt-1">
                      Sube fotos en 4K y videos sin consumir servidor backend, con compresión automática a WebP/AVIF y CDN global.
                    </p>
                  </div>
                  <div className={`self-start px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 ${
                    isCloudinaryConfigured()
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {isCloudinaryConfigured() ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Configurado</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Faltan Variables</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-carbon-900 border border-carbon-800">
                    <span className="text-[10px] uppercase font-bold text-silver-400 block">Cloud Name</span>
                    <span className="text-xs font-mono font-bold text-white truncate block mt-0.5">
                      {getCloudinaryConfig().cloudName || '(No configurado en .env)'}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-carbon-900 border border-carbon-800">
                    <span className="text-[10px] uppercase font-bold text-silver-400 block">Upload Preset (Unsigned)</span>
                    <span className="text-xs font-mono font-bold text-white truncate block mt-0.5">
                      {getCloudinaryConfig().uploadPreset || '(No configurado en .env)'}
                    </span>
                  </div>
                </div>

                {/* Botón de Test de Diagnóstico en Vivo */}
                <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <button
                    type="button"
                    onClick={handleTestCloudinary}
                    disabled={isTestingCloudinary}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gold-500/20 border border-gold-500/40 hover:bg-gold-500/30 text-gold-300 hover:text-gold-200 font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50"
                  >
                    {isTestingCloudinary ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Verificando CDN en vivo...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 text-gold-400" />
                        <span>Probar Conexión con Cloudinary</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Resultado de la Prueba en Vivo */}
                {cloudinaryTestResult && (
                  <div className={`p-4 rounded-xl border text-xs space-y-2 animate-fade-in ${
                    cloudinaryTestResult.success
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                      : 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                  }`}>
                    <div className="flex items-center gap-2 font-bold">
                      {cloudinaryTestResult.success ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                      )}
                      <span>{cloudinaryTestResult.message}</span>
                    </div>

                    {cloudinaryTestResult.url && (
                      <div className="pt-2 border-t border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-silver-300">
                        <span className="font-mono truncate">{cloudinaryTestResult.url}</span>
                        <a
                          href={cloudinaryTestResult.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-bold underline whitespace-nowrap"
                        >
                          Ver archivo en CDN <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Guía Paso a Paso para Obtener las Credenciales */}
              <div className="p-5 rounded-2xl bg-carbon-950/40 border border-carbon-800 space-y-4">
                <h4 className="text-xs font-bold text-gold-400 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Guía de Activación en 3 Pasos (Sin Servidor Backend)
                </h4>

                <div className="space-y-3 text-xs text-silver-300">
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-carbon-900/60 border border-carbon-800">
                    <span className="w-6 h-6 rounded-full bg-gold-500/20 text-gold-400 font-mono font-black text-xs flex items-center justify-center flex-shrink-0">
                      1
                    </span>
                    <div>
                      <p className="font-bold text-white">Crea tu cuenta gratuita en Cloudinary</p>
                      <p className="text-silver-400 text-[11px] mt-0.5">
                        Ingresa a <a href="https://cloudinary.com" target="_blank" rel="noopener noreferrer" className="text-gold-400 underline inline-flex items-center gap-0.5">cloudinary.com <ExternalLink className="w-2.5 h-2.5" /></a> y regístrate en el plan Free (25 créditos mensuales para miles de imágenes y videos).
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-carbon-900/60 border border-carbon-800">
                    <span className="w-6 h-6 rounded-full bg-gold-500/20 text-gold-400 font-mono font-black text-xs flex items-center justify-center flex-shrink-0">
                      2
                    </span>
                    <div>
                      <p className="font-bold text-white">Crea un Upload Preset "Unsigned"</p>
                      <p className="text-silver-400 text-[11px] mt-0.5">
                        En el dashboard de Cloudinary: ve a <strong>Settings (engranaje) &gt; Upload &gt; Upload presets &gt; Add upload preset</strong>. Configura <em>Signing Mode: Unsigned</em> y Folder opcional <em>renta-autos</em>. Guarda y copia el nombre generado.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-carbon-900/60 border border-carbon-800">
                    <span className="w-6 h-6 rounded-full bg-gold-500/20 text-gold-400 font-mono font-black text-xs flex items-center justify-center flex-shrink-0">
                      3
                    </span>
                    <div>
                      <p className="font-bold text-white">Agrega los valores en tu archivo .env</p>
                      <p className="text-silver-400 text-[11px] mt-0.5">
                        Abre tu archivo <code className="text-gold-400 font-mono">.env</code> en el proyecto y pega tu Cloud Name y tu Upload Preset:
                      </p>
                      <div className="mt-2 p-2.5 rounded-lg bg-carbon-950 font-mono text-[11px] text-silver-300 border border-carbon-800 space-y-1 select-all">
                        <div>VITE_CLOUDINARY_CLOUD_NAME=tu_cloud_name</div>
                        <div>VITE_CLOUDINARY_UPLOAD_PRESET=tu_upload_preset</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tarjeta de Firebase NoSQL & Auth */}
              <div className="p-5 rounded-2xl bg-carbon-950/70 border border-carbon-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Database className="w-4 h-4 text-gold-400" />
                    Base de Datos NoSQL (Google Cloud Firestore)
                  </h4>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                    isFirebaseConfigured()
                      ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
                      : 'text-silver-400 bg-carbon-900 border-carbon-800'
                  }`}>
                    {isFirebaseConfigured() ? 'FIRESTORE ACTIVO' : 'LOCAL MOCK'}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-carbon-900 border border-carbon-800">
                    <span className="text-[10px] uppercase font-bold text-silver-400 block">Motor de Datos</span>
                    <span className="text-white font-mono font-bold mt-0.5 block">Google Cloud Firestore (NoSQL)</span>
                  </div>
                  <div className="p-3 rounded-xl bg-carbon-900 border border-carbon-800">
                    <span className="text-[10px] uppercase font-bold text-silver-400 block">Arquitectura Backend</span>
                    <span className="text-emerald-400 font-mono font-bold mt-0.5 block">0 Servidores • 0 SQL</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* ========================================================================= */}
        {/* COLUMNA DERECHA: VISTA PREVIA EN VIVO & SIMULADOR (5 Columnas)            */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5 space-y-6">
          
          {activeTab === 'cloud' ? (
            <div className="space-y-6 animate-fade-in">
              {/* Card de Arquitectura Cloud & CDN */}
              <div className="bg-gradient-to-br from-carbon-900 via-carbon-900/90 to-carbon-950 border border-carbon-800 p-5 rounded-2xl space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-carbon-800 pb-3">
                  <div className="flex items-center gap-2 text-gold-400 font-bold text-xs uppercase tracking-wider">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Arquitectura 100% Serverless</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    CERO BACKEND
                  </span>
                </div>

                <p className="text-xs text-silver-300 leading-relaxed">
                  Tu plataforma está construida con arquitectura moderna desacoplada: sin servidores backend propietarios ni bases de datos SQL pesadas.
                </p>

                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-carbon-950 border border-carbon-800/80">
                    <div className="w-8 h-8 rounded-lg bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-400 flex-shrink-0">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="font-bold text-white text-[11px]">Compresión WebP y AVIF</h5>
                      <p className="text-[10px] text-silver-400">Cloudinary comprime automáticamente las fotos de autos hasta un 85% más ligeras.</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-xl bg-carbon-950 border border-carbon-800/80">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0">
                      <Cloud className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="font-bold text-white text-[11px]">Red CDN Global Ultra-Rápida</h5>
                      <p className="text-[10px] text-silver-400">Servido desde nodos Edge mundiales para carga instantánea en teléfonos y computadores.</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-xl bg-carbon-950 border border-carbon-800/80">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 flex-shrink-0">
                      <Database className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="font-bold text-white text-[11px]">NoSQL Firestore en Tiempo Real</h5>
                      <p className="text-[10px] text-silver-400">Sin esquemas relacionales rígidos de SQL. Sincronización instantánea de reservas y flota.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card de Estado Técnico en Vivo */}
              <div className="bg-carbon-900/90 border border-carbon-800 p-5 rounded-2xl space-y-3 shadow-xl">
                <div className="flex items-center justify-between border-b border-carbon-800 pb-2">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Diagnóstico de Estado en Vivo
                  </span>
                  <span className="text-[10px] font-mono text-gold-400 bg-gold-500/10 px-2 py-0.5 rounded">
                    ENV CHECK
                  </span>
                </div>

                <div className="space-y-2 text-xs font-mono">
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-carbon-950 border border-carbon-800">
                    <span className="text-silver-400">Cloudinary CDN:</span>
                    <span className={isCloudinaryConfigured() ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                      {isCloudinaryConfigured() ? 'ONLINE' : 'FALTA CONFIGURAR'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-carbon-950 border border-carbon-800">
                    <span className="text-silver-400">Firebase NoSQL:</span>
                    <span className={isFirebaseConfigured() ? 'text-emerald-400 font-bold' : 'text-silver-400 font-bold'}>
                      {isFirebaseConfigured() ? 'ONLINE (Spark $0)' : 'STANDBY'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-carbon-950 border border-carbon-800">
                    <span className="text-silver-400">Servidor Backend:</span>
                    <span className="text-gold-400 font-bold">INNECESARIO (0 MB)</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-carbon-950 border border-carbon-800">
                    <span className="text-silver-400">Estilos:</span>
                    <span className="text-emerald-400 font-bold">100% Tailwind CSS</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Card de Prueba Inmediata de WhatsApp */}
              <div className="bg-gradient-to-br from-emerald-950/40 via-carbon-900 to-carbon-950 border border-emerald-500/30 p-5 rounded-2xl space-y-3 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                    <MessageSquare className="w-4 h-4" />
                    <span>Test en Vivo de WhatsApp</span>
                  </div>
                  <span className="text-[10px] font-mono text-silver-400 bg-carbon-900 px-2 py-0.5 rounded border border-carbon-800">
                    wa.me/{formData.whatsappPhone}
                  </span>
                </div>

                <p className="text-xs text-silver-300 leading-relaxed">
                  Haz clic abajo para simular un mensaje de reserva y comprobar que se abra tu WhatsApp oficial:
                </p>

                <a
                  href={testWhatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-carbon-950 font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/20"
                >
                  <Phone className="w-4 h-4 text-carbon-950 fill-carbon-950" />
                  <span>Probar Enlace WhatsApp Ahora</span>
                  <ExternalLink className="w-3.5 h-3.5 ml-1" />
                </a>
              </div>

              {/* SIMULADOR EN VIVO DEL HEADER / NAVBAR */}
              <div className="bg-carbon-900/90 border border-carbon-800 p-5 rounded-2xl space-y-3 shadow-xl">
                <div className="flex items-center justify-between border-b border-carbon-800 pb-2">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Vista Previa del Navbar
                  </span>
                  <span className="text-[10px] font-mono text-gold-400 bg-gold-500/10 px-2 py-0.5 rounded">
                    Superior
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-carbon-950 border border-carbon-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {formData.logoUrl ? (
                      <img
                        src={formData.logoUrl}
                        alt={formData.companyName}
                        className="h-8 max-w-[120px] object-contain"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-carbon-900 border border-gold-500/40 flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-gold-400" />
                      </div>
                    )}
                    <div className="flex flex-col">
                      <span className="text-[9px] font-bold text-gold-400 uppercase tracking-widest leading-none">
                        PREMIUM
                      </span>
                      <span className="text-xs font-black text-white uppercase font-display leading-tight">
                        {formData.companyName || 'CAR RENTAL'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-silver-400 hidden sm:inline font-mono">Showroom • Catálogo</span>
                    <div className="px-2.5 py-1 rounded-lg bg-gold-500 text-carbon-950 font-black text-[10px] uppercase">
                      Reservar
                    </div>
                  </div>
                </div>
              </div>

              {/* SIMULADOR EN VIVO DEL HERO (PORTADA) */}
              <div className="bg-carbon-900/90 border border-carbon-800 p-5 rounded-2xl space-y-3 shadow-xl">
                <div className="flex items-center justify-between border-b border-carbon-800 pb-2">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Vista Previa de la Portada
                  </span>
                  <span className="text-[10px] font-mono text-gold-400 bg-gold-500/10 px-2 py-0.5 rounded">
                    Hero
                  </span>
                </div>

                <div className="p-5 rounded-xl bg-carbon-950 border border-carbon-800 text-center space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-carbon-900 border border-gold-500/40 text-[9px] font-bold text-gold-400 uppercase">
                    <Sparkles className="w-3 h-3 text-gold-400" />
                    <span className="truncate max-w-[240px]">{formData.hero.badge}</span>
                  </div>

                  <h4 className="text-lg font-black uppercase text-white font-display leading-tight">
                    {formData.hero.titleLine1} <br />
                    <span className="bg-gradient-to-r from-gold-300 via-gold-400 to-amber-500 bg-clip-text text-transparent">
                      {formData.hero.titleLine2}
                    </span>
                  </h4>

                  <p className="text-[11px] text-silver-400 line-clamp-2 italic">
                    "{formData.hero.description}"
                  </p>
                </div>
              </div>
            </>
          )}

        </div>

      </form>

    </div>
  );
};
