import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { X, Bed, Bath, Maximize2, MapPin, Check, ChevronLeft, ChevronRight, MessageSquare, Droplet, Zap, Wifi, Lock, Home, Calendar, GraduationCap, Bus, DownloadCloud } from 'lucide-react';
import { Property } from '../types/property';
import { ViewingScheduleModal } from './ViewingScheduleModal';
import { ContactLandlordModal } from './ContactLandlordModal';
import { RentalRequestModal } from './RentalRequestModal';
import { TenantInfoModal, TenantInfoData } from './TenantInfoModal';
import { VerificationBadge } from './VerificationBadge';

interface PropertyModalProps {
  property: Property;
  onClose: () => void;
}

export function PropertyModal({ property, onClose }: PropertyModalProps) {
  const { data: session } = useSession();
  const [showViewingScheduler, setShowViewingScheduler] = useState(false);
  const [showContactLandlord, setShowContactLandlord] = useState(false);
  const [showRentalRequest, setShowRentalRequest] = useState(false);
  const [showTenantInfo, setShowTenantInfo] = useState(false);
  const [tenantData, setTenantData] = useState<TenantInfoData>({});
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images = property.images && property.images.length > 0 
    ? property.images 
    : [{ url: property.imageUrl, isMain: true }];

  const handleDownloadPdf = () => {
    const derivedFeatures: string[] = [
      ...(property.features || []),
      ...(property.furnished && property.furnished !== 'No' ? [`Furnished: ${property.furnished}`] : []),
      ...(property.wifiIncluded ? ['WiFi Included'] : []),
      ...(property.utilitiesIncluded ? ['Utilities Included'] : []),
      ...(property.internetReady ? ['Internet Ready'] : []),
      ...(property.fiberAvailable ? ['Fiber Available'] : []),
      ...(property.parkingSpaces && property.parkingSpaces > 0 ? [`Parking Spaces: ${property.parkingSpaces}`] : []),
      ...(property.garage ? ['Garage'] : []),
      ...(property.carport ? ['Carport'] : []),
      ...(property.securityAlarm ? ['Security Alarm'] : []),
      ...(property.walled ? ['Walled'] : []),
      ...(property.electricGate ? ['Electric Gate'] : []),
      ...(property.burglarBars ? ['Burglar Bars'] : []),
      ...(property.petsAllowed ? ['Pets Allowed'] : []),
      ...(property.nearCampus ? ['Near Campus'] : []),
      ...(property.walkingDistance ? ['Walking Distance'] : []),
      ...(property.publicTransportNearby ? ['Public Transport Nearby'] : []),
      ...(property.studyFriendly ? ['Study Friendly'] : []),
    ].filter(Boolean);

    // Build a simple HTML with property details for printing/saving as PDF
    const html = `
      <html>
        <head>
          <title>${property.title} - Rentalot</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <style>
            :root { --emerald:#10b981; --slate:#0f172a; --muted:#64748b; --bg:#f8fafc; }
            * { box-sizing: border-box; }
            body { margin:0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; color: #0f172a; background: var(--bg); padding: 28px; }
            .page { max-width: 900px; margin: 0 auto; }
            .card { background: #fff; border-radius: 18px; box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08); overflow: hidden; border: 1px solid #e2e8f0; }
            .topbar { display:flex; align-items:center; justify-content:space-between; padding: 18px 22px; border-bottom: 1px solid #e2e8f0; background: linear-gradient(90deg, #ecfdf5 0%, #ffffff 60%); }
            .brand { display:flex; align-items:center; gap:10px; font-weight:800; color:#0f172a; letter-spacing:0.2px; }
            .brand img { width:28px; height:28px; }
            .badge { background: var(--emerald); color:#fff; font-weight:700; padding:6px 10px; border-radius:999px; font-size:12px; text-transform:capitalize; }
            .hero { display:grid; grid-template-columns: 1.1fr 1fr; gap: 18px; padding: 20px 22px; }
            .hero img { width:100%; height: 220px; object-fit: cover; border-radius: 14px; }
            .title { font-size: 26px; font-weight: 800; margin: 0 0 6px; }
            .meta { color: var(--muted); font-size: 14px; }
            .price { font-size: 22px; font-weight: 800; margin: 14px 0 6px; }
            .chips { display:flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
            .chip { background:#f1f5f9; color:#0f172a; padding:6px 10px; border-radius:999px; font-size:12px; font-weight:600; }
            .section { padding: 0 22px 20px; }
            .section h3 { font-size: 14px; text-transform: uppercase; letter-spacing: .12em; color:#64748b; margin: 0 0 8px; }
            .grid { display:grid; grid-template-columns: repeat(4, minmax(0,1fr)); gap: 10px; }
            .stat { background:#f8fafc; border:1px solid #e2e8f0; padding:10px; border-radius:12px; font-size: 13px; }
            .features { display:flex; flex-wrap: wrap; gap: 8px; }
            .feature { background:#ecfeff; color:#0f172a; border:1px solid #cffafe; padding:6px 10px; border-radius:10px; font-size:12px; }
            .footer { padding: 16px 22px 22px; color:#64748b; font-size:12px; border-top:1px dashed #e2e8f0; display:flex; justify-content:space-between; }
            .logo-corner { position: absolute; top: 18px; right: 18px; }
            .card-wrap { position: relative; }
            @media print {
              body { background: #fff; padding: 0; }
              .card { border: none; box-shadow: none; }
            }
          </style>
        </head>
        <body>
          <div class="page">
            <div class="card-wrap">
              <div class="logo-corner">
                <div class="brand">
                  <img alt="Rentalot" src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'><rect width='48' height='48' rx='12' fill='%2310b981'/><path d='M14 30V18h10c4 0 7 2 7 6s-3 6-7 6H14zm6-6h4c1.7 0 3-1 3-3s-1.3-3-3-3h-4v6z' fill='white'/></svg>" />
                  <span>Rentalot</span>
                </div>
              </div>

              <div class="card">
                <div class="topbar">
                  <div class="brand">
                    <img alt="Rentalot" src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'><rect width='48' height='48' rx='12' fill='%2310b981'/><path d='M14 30V18h10c4 0 7 2 7 6s-3 6-7 6H14zm6-6h4c1.7 0 3-1 3-3s-1.3-3-3-3h-4v6z' fill='white'/></svg>" />
                    <span>Rentalot Property Sheet</span>
                  </div>
                  <span class="badge">${property.type}</span>
                </div>

                <div class="hero">
                  <div>
                    ${property.images && property.images.length > 0 ? `<img src="${property.images[0].url}" alt="${property.title}" />` : ''}
                  </div>
                  <div>
                    <h1 class="title">${property.title}</h1>
                    <div class="meta">${[property.suburb, property.city].filter(Boolean).join(', ')}</div>
                    <div class="price">$${(property.rentAmount||property.price||0).toLocaleString()} / ${property.currency||'USD'}</div>
                    <div class="chips">
                      <span class="chip">Bedrooms: ${property.bedrooms ?? 'N/A'}</span>
                      <span class="chip">Bathrooms: ${property.bathrooms ?? 'N/A'}</span>
                      <span class="chip">Area: ${property.area ?? 'N/A'} m²</span>
                      <span class="chip">Toilets: ${property.toilets ?? 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div class="section">
                  <h3>Description</h3>
                  <div style="color:#0f172a; line-height:1.5;">${(property.description || '').replace(/\n/g, '<br/>')}</div>
                </div>

                <div class="section">
                  <h3>Quick Facts</h3>
                  <div class="grid">
                    <div class="stat">Type: ${property.type}</div>
                    <div class="stat">Availability: ${property.available ? 'Available' : 'Unavailable'}</div>
                    <div class="stat">City: ${property.city || 'N/A'}</div>
                    <div class="stat">Suburb: ${property.suburb || 'N/A'}</div>
                  </div>
                </div>

                <div class="section">
                  <h3>Features & Amenities</h3>
                  <div class="features">
                    ${derivedFeatures.length > 0 ? derivedFeatures.map((f) => `<span class="feature">${f}</span>`).join('') : '<span class="feature">None listed</span>'}
                  </div>
                </div>

                <div class="footer">
                  <div>Generated by Rentalot</div>
                  <div>${new Date().toLocaleDateString()}</div>
                </div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(html);
    win.document.close();
    // Wait for resources to load then trigger print dialog
    const triggerPrint = () => {
      try {
        win.focus();
        win.print();
      } catch (e) {
        console.error('Print failed', e);
      }
    };
    // Give time for images to load
    setTimeout(triggerPrint, 700);
  };

  const goToPrevious = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image Gallery */}
        <div className="relative h-96 bg-gray-900">
          <img
            src={images[currentImageIndex].url}
            alt={`${property.title} - Image ${currentImageIndex + 1}`}
            className="w-full h-full object-cover"
          />
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white rounded-full p-2 hover:bg-gray-100 transition-colors z-10"
          >
            <X className="w-6 h-6 text-gray-800" />
          </button>

          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 transition-all"
              >
                <ChevronLeft className="w-6 h-6 text-gray-800" />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 transition-all"
              >
                <ChevronRight className="w-6 h-6 text-gray-800" />
              </button>
            </>
          )}

          {/* Price Badge */}
          <div className="absolute bottom-4 left-4 bg-white px-4 py-2 rounded-full">
            <span className="text-2xl font-bold text-gray-900">
              ${(property.rentAmount || property.price || 0).toLocaleString()}
            </span>
            <span className="text-gray-600">/{property.currency || 'USD'}/month</span>
          </div>

          {/* Image Counter */}
          {images.length > 1 && (
            <div className="absolute bottom-4 right-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm font-medium">
              {currentImageIndex + 1} / {images.length}
            </div>
          )}
        </div>

        {/* Image Thumbnails */}
        {images.length > 1 && (
          <div className="bg-gray-100 px-8 py-4 flex gap-3 overflow-x-auto">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden transition-all ${
                  index === currentImageIndex
                    ? 'ring-2 ring-emerald-600'
                    : 'opacity-60 hover:opacity-100'
                }`}
              >
                <img
                  src={image.url}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}

        <div className="p-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-3xl font-bold text-gray-900">
                  {property.title}
                </h2>
                <VerificationBadge isVerified={property.isVerified ?? false} size="md" />
              </div>
              <div className="flex items-center text-gray-600 mb-2">
                <MapPin className="w-5 h-5 mr-2" />
                <span className="text-lg">
                  {[property.suburb, property.city].filter(Boolean).join(', ')}
                </span>
              </div>
              {property.nearbyLandmark && (
                <p className="text-sm text-gray-600">Near: {property.nearbyLandmark}</p>
              )}
            </div>
            <div className="flex flex-col items-end gap-3">
              <div className="bg-emerald-600 text-white px-4 py-2 rounded-full text-sm font-medium uppercase">
                {property.type}
              </div>
              <button onClick={handleDownloadPdf} className="flex items-center gap-2 bg-gray-100 text-gray-800 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                <DownloadCloud className="w-4 h-4" />
                Download PDF
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 pb-8 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <div className="bg-emerald-50 p-3 rounded-lg">
                <Bed className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{property.bedrooms}</div>
                <div className="text-xs text-gray-600">Bedrooms</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-emerald-50 p-3 rounded-lg">
                <Bath className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{property.bathrooms}</div>
                <div className="text-xs text-gray-600">Bathrooms</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-emerald-50 p-3 rounded-lg">
                <Maximize2 className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{property.area || 'N/A'}</div>
                <div className="text-xs text-gray-600">m²</div>
              </div>
            </div>
            {property.toilets && (
              <div className="flex items-center gap-2">
                <div className="bg-emerald-50 p-3 rounded-lg">
                  <Home className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{property.toilets}</div>
                  <div className="text-xs text-gray-600">Toilets</div>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2">
              <div className="bg-emerald-50 p-3 rounded-lg">
                <Bath className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{property.sharedBathroom ? 'Shared' : 'Private'}</div>
                <div className="text-xs text-gray-600">Bathroom Type</div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Description</h3>
            <p className="text-gray-700 leading-relaxed">{property.description}</p>
          </div>

          {/* Rooms & Features */}
          {(property.lounge || property.diningRoom || property.kitchen) && (
            <div className="mb-8 pb-8 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Rooms & Features</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {property.lounge && (
                  <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-lg">
                    <Check className="w-5 h-5 text-emerald-600" />
                    <span className="text-gray-700">Lounge</span>
                  </div>
                )}
                {property.diningRoom && (
                  <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-lg">
                    <Check className="w-5 h-5 text-emerald-600" />
                    <span className="text-gray-700">Dining Room</span>
                  </div>
                )}
                {property.kitchen && (
                  <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-lg">
                    <Check className="w-5 h-5 text-emerald-600" />
                    <span className="text-gray-700">Kitchen</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Garden/Yard */}
          {(property.veranda || property.fenced || property.pavedDriveway || property.yardSize) && (
            <div className="mb-8 pb-8 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">🌳 Garden & Yard</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {property.yardSize && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600">Yard Size</p>
                    <p className="font-semibold text-gray-900 capitalize">{property.yardSize}</p>
                  </div>
                )}
                {property.veranda && (
                  <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                    <Check className="w-5 h-5 text-blue-600" />
                    <span className="text-gray-700">Veranda</span>
                  </div>
                )}
                {property.fenced && (
                  <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                    <Check className="w-5 h-5 text-blue-600" />
                    <span className="text-gray-700">Fenced</span>
                  </div>
                )}
                {property.pavedDriveway && (
                  <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                    <Check className="w-5 h-5 text-blue-600" />
                    <span className="text-gray-700">Paved Driveway</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Parking */}
          {(property.parkingSpaces || property.garage || property.carport) && (
            <div className="mb-8 pb-8 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">🚗 Parking</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {property.parkingSpaces && (
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <p className="text-sm text-gray-600">Parking Spaces</p>
                    <p className="font-semibold text-gray-900">{property.parkingSpaces}</p>
                  </div>
                )}
                {property.garage && (
                  <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg">
                    <Check className="w-5 h-5 text-purple-600" />
                    <span className="text-gray-700">Garage</span>
                  </div>
                )}
                {property.carport && (
                  <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg">
                    <Check className="w-5 h-5 text-purple-600" />
                    <span className="text-gray-700">Carport</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Water Supply */}
          {(property.municipalWater || property.borehole || property.waterTank || property.tankCapacity) && (
            <div className="mb-8 pb-8 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Droplet className="w-5 h-5 text-blue-600" /> Water Supply
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {property.municipalWater && (
                  <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                    <Check className="w-5 h-5 text-blue-600" />
                    <span className="text-gray-700">Municipal Water</span>
                  </div>
                )}
                {property.borehole && (
                  <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                    <Check className="w-5 h-5 text-blue-600" />
                    <span className="text-gray-700">Borehole</span>
                  </div>
                )}
                {property.waterTank && (
                  <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                    <Check className="w-5 h-5 text-blue-600" />
                    <span className="text-gray-700">Water Tank</span>
                  </div>
                )}
                {property.tankCapacity && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600">Tank Capacity</p>
                    <p className="font-semibold text-gray-900">{property.tankCapacity}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Power Supply */}
          {(property.zesaAvailable || property.solarSystem || property.generator || property.solarBackupHours) && (
            <div className="mb-8 pb-8 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-600" /> Power Supply
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {property.zesaAvailable && (
                  <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg">
                    <Check className="w-5 h-5 text-yellow-600" />
                    <span className="text-gray-700">ZESA Available</span>
                  </div>
                )}
                {property.solarSystem && (
                  <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg">
                    <Check className="w-5 h-5 text-yellow-600" />
                    <span className="text-gray-700">Solar System</span>
                  </div>
                )}
                {property.solarBackupHours && (
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <p className="text-sm text-gray-600">Solar Backup</p>
                    <p className="font-semibold text-gray-900">{property.solarBackupHours}h</p>
                  </div>
                )}
                {property.generator && (
                  <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg">
                    <Check className="w-5 h-5 text-yellow-600" />
                    <span className="text-gray-700">Generator</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Connectivity */}
          {(property.internetReady || property.fiberAvailable || property.wifiIncluded) && (
            <div className="mb-8 pb-8 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Wifi className="w-5 h-5 text-green-600" /> Connectivity
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {property.internetReady && (
                  <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                    <Check className="w-5 h-5 text-green-600" />
                    <span className="text-gray-700">Internet Ready</span>
                  </div>
                )}
                {property.fiberAvailable && (
                  <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                    <Check className="w-5 h-5 text-green-600" />
                    <span className="text-gray-700">Fiber Available</span>
                  </div>
                )}
                {property.wifiIncluded && (
                  <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                    <Check className="w-5 h-5 text-green-600" />
                    <span className="text-gray-700">WiFi Included</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Security Features */}
          {(property.walled || property.electricGate || property.burglarBars || property.securityAlarm || property.guardedArea || property.neighborhoodWatch) && (
            <div className="mb-8 pb-8 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Lock className="w-5 h-5 text-red-600" /> Security Features
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {property.walled && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
                    <Check className="w-5 h-5 text-red-600" />
                    <span className="text-gray-700">Walled</span>
                  </div>
                )}
                {property.electricGate && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
                    <Check className="w-5 h-5 text-red-600" />
                    <span className="text-gray-700">Electric Gate</span>
                  </div>
                )}
                {property.burglarBars && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
                    <Check className="w-5 h-5 text-red-600" />
                    <span className="text-gray-700">Burglar Bars</span>
                  </div>
                )}
                {property.securityAlarm && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
                    <Check className="w-5 h-5 text-red-600" />
                    <span className="text-gray-700">Security Alarm</span>
                  </div>
                )}
                {property.guardedArea && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
                    <Check className="w-5 h-5 text-red-600" />
                    <span className="text-gray-700">Guarded Area</span>
                  </div>
                )}
                {property.neighborhoodWatch && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
                    <Check className="w-5 h-5 text-red-600" />
                    <span className="text-gray-700">Neighborhood Watch</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Condition & Extras */}
          {(property.furnished || property.recentlyRenovated || property.tiles || property.ceiling || property.builtInCupboards || property.mainBedroomEnsuite) && (
            <div className="mb-8 pb-8 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">✨ Condition & Extras</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {property.furnished && (
                  <div className="p-3 bg-amber-50 rounded-lg">
                    <p className="text-sm text-gray-600">Furnished</p>
                    <p className="font-semibold text-gray-900 capitalize">{property.furnished}</p>
                  </div>
                )}
                {property.recentlyRenovated && (
                  <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg">
                    <Check className="w-5 h-5 text-amber-600" />
                    <span className="text-gray-700">Recently Renovated</span>
                  </div>
                )}
                {property.tiles && (
                  <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg">
                    <Check className="w-5 h-5 text-amber-600" />
                    <span className="text-gray-700">Tiles</span>
                  </div>
                )}
                {property.ceiling && (
                  <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg">
                    <Check className="w-5 h-5 text-amber-600" />
                    <span className="text-gray-700">Ceiling</span>
                  </div>
                )}
                {property.builtInCupboards && (
                  <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg">
                    <Check className="w-5 h-5 text-amber-600" />
                    <span className="text-gray-700">Built-in Cupboards</span>
                  </div>
                )}
                {property.mainBedroomEnsuite && (
                  <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg">
                    <Check className="w-5 h-5 text-amber-600" />
                    <span className="text-gray-700">Main Bedroom Ensuite</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Policies */}
          {(property.petsAllowed !== undefined || property.smokingAllowed !== undefined || property.sharedProperty !== undefined) && (
            <div className="mb-8 pb-8 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">📋 Policies</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {property.petsAllowed && (
                  <div className="flex items-center gap-2 p-3 bg-indigo-50 rounded-lg">
                    <Check className="w-5 h-5 text-indigo-600" />
                    <span className="text-gray-700">Pets Allowed</span>
                  </div>
                )}
                {property.smokingAllowed && (
                  <div className="flex items-center gap-2 p-3 bg-indigo-50 rounded-lg">
                    <Check className="w-5 h-5 text-indigo-600" />
                    <span className="text-gray-700">Smoking Allowed</span>
                  </div>
                )}
                {property.sharedProperty && (
                  <div className="flex items-center gap-2 p-3 bg-indigo-50 rounded-lg">
                    <Check className="w-5 h-5 text-indigo-600" />
                    <span className="text-gray-700">Shared Property</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Student-Friendly Features */}
          {(property.studentFriendly || property.nearCampus || property.walkingDistance || property.publicTransportNearby || property.sharedRoomAllowed || property.utilitiesIncluded || property.studyFriendly) && (
            <div className="mb-8 pb-8 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-blue-600" /> Student-Friendly Features
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {property.studentFriendly && (
                  <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                    <Check className="w-5 h-5 text-blue-600" />
                    <span className="text-gray-700">Student Friendly</span>
                  </div>
                )}
                {property.nearCampus && (
                  <div className="flex flex-col gap-1 p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-blue-600" />
                      <span className="text-gray-700 font-medium">Near Campus</span>
                    </div>
                    {property.campusName && (
                      <p className="text-xs text-gray-600 ml-7">{property.campusName}</p>
                    )}
                    {property.distanceToCampus && (
                      <p className="text-xs text-gray-600 ml-7">{property.distanceToCampus} km away</p>
                    )}
                  </div>
                )}
                {property.walkingDistance && (
                  <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                    <Check className="w-5 h-5 text-blue-600" />
                    <span className="text-gray-700">Walking Distance to Campus</span>
                  </div>
                )}
                {property.publicTransportNearby && (
                  <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                    <Bus className="w-5 h-5 text-blue-600" />
                    <span className="text-gray-700">Public Transport Nearby</span>
                  </div>
                )}
                {property.sharedRoomAllowed && (
                  <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                    <Check className="w-5 h-5 text-blue-600" />
                    <span className="text-gray-700">Shared Room Allowed</span>
                  </div>
                )}
                {property.utilitiesIncluded && (
                  <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                    <Zap className="w-5 h-5 text-blue-600" />
                    <span className="text-gray-700">Utilities Included</span>
                  </div>
                )}
                {property.studyFriendly && (
                  <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                    <Check className="w-5 h-5 text-blue-600" />
                    <span className="text-gray-700">Study-Friendly Environment</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Lease Terms */}
          {(property.leaseTerm || property.negotiable) && (
            <div className="mb-8 pb-8 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">📝 Lease Terms</h3>
              <div className="grid grid-cols-2 gap-3">
                {property.leaseTerm && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Lease Term</p>
                    <p className="font-semibold text-gray-900 capitalize">{property.leaseTerm}</p>
                  </div>
                )}
                {property.negotiable && (
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <Check className="w-5 h-5 text-gray-600" />
                    <span className="text-gray-700">Terms Negotiable</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {session?.user?.role === 'TENANT' && (
              <button
                className="bg-amber-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-amber-700 transition-colors flex items-center justify-center gap-2"
                onClick={() => setShowTenantInfo(true)}
              >
                <Calendar className="w-5 h-5" />
                Request to Rent
              </button>
            )}
            <button
              className="bg-emerald-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-emerald-700 transition-colors"
              onClick={() => setShowViewingScheduler(true)}
            >
              Schedule a Viewing
            </button>

            <button 
              className="bg-blue-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              onClick={() => setShowContactLandlord(true)}
            >
              <MessageSquare className="w-5 h-5" />
              Contact Landlord
            </button>
          </div>

          {/* Landlord Info */}
          {property.landlord && (
            <div className="pt-8 border-t border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Landlord Information</h3>
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                {property.landlord.avatar && (
                  <img 
                    src={property.landlord.avatar} 
                    alt={property.landlord.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-lg font-semibold text-gray-900">{property.landlord.name}</h4>
                    <VerificationBadge isVerified={property.landlord.isVerified ?? false} size="sm" showLabel />
                  </div>
                </div>
              </div>
            </div>
          )}

          {showViewingScheduler && (
            <ViewingScheduleModal
              property={property}
              onClose={() => setShowViewingScheduler(false)}
            />
          )}

          {showContactLandlord && (
            <ContactLandlordModal
              property={property}
              onClose={() => setShowContactLandlord(false)}
            />
          )}

          {showTenantInfo && (
            <TenantInfoModal
              isOpen={showTenantInfo}
              onClose={() => setShowTenantInfo(false)}
              onSubmit={(data) => {
                setTenantData(data);
                setShowRentalRequest(true);
                setShowTenantInfo(false);
              }}
            />
          )}

          {showRentalRequest && (
            <RentalRequestModal
              property={property}
              tenantInfo={tenantData}
              onClose={() => setShowRentalRequest(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
