'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, X, Image as ImageIcon } from 'lucide-react';
import { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import {
  LocationSection,
  PricingSection,
  RoomDetailsSection,
  GardenSection,
  ParkingSection,
  WaterSection,
  PowerSection,
  ConnectivitySection,
  SecuritySection,
  ConditionSection,
  BasicInfoSection,
  StudentFriendlySection,
} from '../PropertyFormSections';
import type { PropertyForm } from '../PropertyFormTypes';

export default function AddPropertyPage() {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const fileInputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const [formData, setFormData] = useState<PropertyForm>({
    // Basic Info
    title: '',
    description: '',
    type: 'APARTMENT',
    imageUrls: ['', '', '', '', '', ''],

    // Location
    city: '',
    suburb: '',
    street: '',
    nearbyLandmark: '',
    gpsLatitude: '',
    gpsLongitude: '',

    // Pricing
    rentAmount: '',
    currency: 'USD',
    depositAmount: '',
    leaseTerm: 'monthly',
    negotiable: false,

    // Rooms
    bedrooms: '',
    bathrooms: '',
    sharedBathroom: false,
    toilets: '',
    lounge: false,
    diningRoom: false,
    kitchen: false,
    area: '',

    // Garden/Yard
    yardSize: 'small',
    veranda: false,
    fenced: false,
    pavedDriveway: false,

    // Parking
    parkingSpaces: '0',
    garage: false,
    carport: false,

    // Water
    municipalWater: false,
    borehole: false,
    waterTank: false,
    tankCapacity: '',

    // Power
    zesaAvailable: false,
    solarSystem: false,
    solarBackupHours: '',
    generator: false,

    // Connectivity
    internetReady: false,
    fiberAvailable: false,
    wifiIncluded: false,

    // Security (6 fields - matching SecuritySection checkboxes)
    walled: false,
    electricGate: false,
    burglarBars: false,
    securityAlarm: false,
    guardedArea: false,
    neighborhoodWatch: false,

    // Condition
    furnished: 'No',
    recentlyRenovated: false,
    tiles: false,
    ceiling: false,
    builtInCupboards: false,
    mainBedroomEnsuite: false,
    petsAllowed: false,
    smokingAllowed: false,
    sharedProperty: false,

    // Student-friendly
    studentFriendly: false,
    nearCampus: false,
    campusName: '',
    distanceToCampus: '',
    walkingDistance: false,
    publicTransportNearby: false,
    sharedRoomAllowed: false,
    utilitiesIncluded: false,
    studyFriendly: false,
  });

  if (status === 'loading') {
    return <div className="p-8">Loading...</div>;
  }

  if (!session || session.user?.role !== 'LANDLORD') {
    redirect('/auth/signin');
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleArrayFieldChange = (fieldName: string, index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: (prev[fieldName as keyof PropertyForm] as string[]).map((item, i) =>
        i === index ? value : item
      ),
    }));
  };

  const handleImageUrlChange = (index: number, value: string) => {
    const newImageUrls = [...formData.imageUrls];
    newImageUrls[index] = value;
    setFormData(prev => ({ ...prev, imageUrls: newImageUrls }));
  };

  const removeImageUrl = (index: number) => {
    const newImageUrls = [...formData.imageUrls];
    newImageUrls[index] = '';
    setFormData(prev => ({ ...prev, imageUrls: newImageUrls }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const newImageUrls = [...formData.imageUrls];
      newImageUrls[index] = result;
      setFormData(prev => ({ ...prev, imageUrls: newImageUrls }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const images = formData.imageUrls.filter(url => url.trim() !== '');
      
      if (images.length === 0) {
        toast.error('Please add at least one image URL');
        setIsLoading(false);
        return;
      }

      if (!formData.title.trim()) {
        toast.error('Property title is required');
        setIsLoading(false);
        return;
      }

      if (!formData.rentAmount) {
        toast.error('Rent amount is required');
        setIsLoading(false);
        return;
      }

      if (!formData.bedrooms) {
        toast.error('Number of bedrooms is required');
        setIsLoading(false);
        return;
      }

      // Build payload with all fields
      const payload = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        images: images.map((url, index) => ({
          url,
          isMain: index === 0,
        })),

        // Location
        city: formData.city,
        suburb: formData.suburb,
        street: formData.street,
        nearbyLandmark: formData.nearbyLandmark,
        gpsLatitude: formData.gpsLatitude,
        gpsLongitude: formData.gpsLongitude,

        // Pricing
        rentAmount: parseInt(formData.rentAmount),
        currency: formData.currency,
        depositAmount: formData.depositAmount ? parseInt(formData.depositAmount) : null,
        leaseTerm: formData.leaseTerm,
        negotiable: formData.negotiable,

        // Rooms
        bedrooms: parseInt(formData.bedrooms),
        bathrooms: parseInt(formData.bathrooms),
        toilets: formData.toilets ? parseInt(formData.toilets) : 0,
        lounge: formData.lounge,
        diningRoom: formData.diningRoom,
        kitchen: formData.kitchen,
        area: formData.area ? parseInt(formData.area) : null,

        // Garden/Yard
        yardSize: formData.yardSize,
        veranda: formData.veranda,
        fenced: formData.fenced,
        pavedDriveway: formData.pavedDriveway,

        // Parking
        parkingSpaces: formData.parkingSpaces ? parseInt(formData.parkingSpaces) : 0,
        garage: formData.garage,
        carport: formData.carport,

        // Water
        municipalWater: formData.municipalWater,
        borehole: formData.borehole,
        waterTank: formData.waterTank,
        tankCapacity: formData.tankCapacity ? formData.tankCapacity : null,

        // Power
        zesaAvailable: formData.zesaAvailable,
        solarSystem: formData.solarSystem,
        solarBackupHours: formData.solarBackupHours ? parseInt(formData.solarBackupHours) : null,
        generator: formData.generator,

        // Connectivity
        internetReady: formData.internetReady,
        fiberAvailable: formData.fiberAvailable,
        wifiIncluded: formData.wifiIncluded,

        // Security
        walled: formData.walled,
        electricGate: formData.electricGate,
        burglarBars: formData.burglarBars,
        securityAlarm: formData.securityAlarm,
        guardedArea: formData.guardedArea,
        neighborhoodWatch: formData.neighborhoodWatch,

        // Condition
        furnished: formData.furnished,
        recentlyRenovated: formData.recentlyRenovated,
        tiles: formData.tiles,
        ceiling: formData.ceiling,
        builtInCupboards: formData.builtInCupboards,
        mainBedroomEnsuite: formData.mainBedroomEnsuite,
        petsAllowed: formData.petsAllowed,
        smokingAllowed: formData.smokingAllowed,
        sharedProperty: formData.sharedProperty,
        sharedBathroom: formData.sharedBathroom,

        // Student-friendly
        studentFriendly: formData.studentFriendly,
        nearCampus: formData.nearCampus,
        campusName: formData.campusName || null,
        distanceToCampus: formData.distanceToCampus ? parseFloat(formData.distanceToCampus) : null,
        walkingDistance: formData.walkingDistance,
        publicTransportNearby: formData.publicTransportNearby,
        sharedRoomAllowed: formData.sharedRoomAllowed,
        utilitiesIncluded: formData.utilitiesIncluded,
        studyFriendly: formData.studyFriendly,
      };

      // Default publish behavior: PENDING
      (payload as any).status = 'PENDING';

      const response = await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success('Property created successfully!');
        window.location.href = '/landlord/properties';
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to create property');
      }
    } catch (error) {
      console.error('Error creating property:', error);
      toast.error('Error creating property');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    setIsLoading(true);
    try {
      const images = formData.imageUrls.filter(url => url.trim() !== '');
      if (images.length === 0) {
        toast.error('Please add at least one image URL');
        setIsLoading(false);
        return;
      }

      const payload = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        images: images.map((url, index) => ({ url, isMain: index === 0 })),
        city: formData.city,
        suburb: formData.suburb,
        street: formData.street,
        nearbyLandmark: formData.nearbyLandmark,
        gpsLatitude: formData.gpsLatitude,
        gpsLongitude: formData.gpsLongitude,
        rentAmount: parseInt(formData.rentAmount),
        currency: formData.currency,
        depositAmount: formData.depositAmount ? parseInt(formData.depositAmount) : null,
        leaseTerm: formData.leaseTerm,
        negotiable: formData.negotiable,
        bedrooms: parseInt(formData.bedrooms),
        bathrooms: parseInt(formData.bathrooms),
        toilets: formData.toilets ? parseInt(formData.toilets) : 0,
        lounge: formData.lounge,
        diningRoom: formData.diningRoom,
        kitchen: formData.kitchen,
        area: formData.area ? parseInt(formData.area) : null,
        yardSize: formData.yardSize,
        veranda: formData.veranda,
        fenced: formData.fenced,
        pavedDriveway: formData.pavedDriveway,
        parkingSpaces: formData.parkingSpaces ? parseInt(formData.parkingSpaces) : 0,
        garage: formData.garage,
        carport: formData.carport,
        municipalWater: formData.municipalWater,
        borehole: formData.borehole,
        waterTank: formData.waterTank,
        tankCapacity: formData.tankCapacity ? formData.tankCapacity : null,
        zesaAvailable: formData.zesaAvailable,
        solarSystem: formData.solarSystem,
        solarBackupHours: formData.solarBackupHours ? parseInt(formData.solarBackupHours) : null,
        generator: formData.generator,
        internetReady: formData.internetReady,
        fiberAvailable: formData.fiberAvailable,
        wifiIncluded: formData.wifiIncluded,
        walled: formData.walled,
        electricGate: formData.electricGate,
        burglarBars: formData.burglarBars,
        securityAlarm: formData.securityAlarm,
        guardedArea: formData.guardedArea,
        neighborhoodWatch: formData.neighborhoodWatch,
        furnished: formData.furnished,
        recentlyRenovated: formData.recentlyRenovated,
        tiles: formData.tiles,
        ceiling: formData.ceiling,
        builtInCupboards: formData.builtInCupboards,
        mainBedroomEnsuite: formData.mainBedroomEnsuite,
        petsAllowed: formData.petsAllowed,
        smokingAllowed: formData.smokingAllowed,
        sharedProperty: formData.sharedProperty,
        sharedBathroom: formData.sharedBathroom,
        studentFriendly: formData.studentFriendly,
        nearCampus: formData.nearCampus,
        campusName: formData.campusName || null,
        distanceToCampus: formData.distanceToCampus ? parseFloat(formData.distanceToCampus) : null,
        walkingDistance: formData.walkingDistance,
        publicTransportNearby: formData.publicTransportNearby,
        sharedRoomAllowed: formData.sharedRoomAllowed,
        utilitiesIncluded: formData.utilitiesIncluded,
        studyFriendly: formData.studyFriendly,
        status: 'DRAFT',
      };

      const response = await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success('Draft saved');
        window.location.href = '/landlord/properties';
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to save draft');
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      toast.error('Error saving draft');
    } finally {
      setIsLoading(false);
    }
  };

  const filledImages = formData.imageUrls.filter(url => url.trim() !== '').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/landlord/properties"
            className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Properties
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Add New Property</h1>
          <p className="text-gray-600 mt-1">Fill in all property details for the Zimbabwean rental market</p>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-white rounded-xl shadow-sm p-8">
            {/* Form Sections */}
            <div className="space-y-8">
              <BasicInfoSection formData={formData} handleInputChange={handleInputChange} />
              <LocationSection formData={formData} handleInputChange={handleInputChange} />
              <PricingSection formData={formData} handleInputChange={handleInputChange} />
              <RoomDetailsSection formData={formData} handleInputChange={handleInputChange} />
              <GardenSection formData={formData} handleInputChange={handleInputChange} />
              <ParkingSection formData={formData} handleInputChange={handleInputChange} />
              <WaterSection formData={formData} handleInputChange={handleInputChange} />
              <PowerSection formData={formData} handleInputChange={handleInputChange} />
              <ConnectivitySection formData={formData} handleInputChange={handleInputChange} />
              <SecuritySection formData={formData} handleInputChange={handleInputChange} />
              <ConditionSection formData={formData} handleInputChange={handleInputChange} />
              <StudentFriendlySection formData={formData} handleInputChange={handleInputChange} />
            </div>
          </div>

          {/* Property Images Section */}
          <div className="bg-white rounded-xl shadow-sm p-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Property Images</h2>
              <span className="text-sm text-emerald-600 font-medium">
                {filledImages}/6 images added
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Add image URLs (up to 6). The first image will be the main property photo.
            </p>

            <div className="space-y-3">
              {formData.imageUrls.map((url, index) => (
                <div key={index} className="flex gap-3">
                  <div className="flex-1">
                    <div className="relative">
                      <input
                        type="url"
                        value={url}
                        onChange={(e) => handleImageUrlChange(index, e.target.value)}
                        placeholder={`Image ${index + 1} URL (e.g., https://example.com/image.jpg)`}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                      {/* Hidden file input for uploads (Cloudinary via server) */}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={(el) => { fileInputsRef.current[index] = el; }}
                        onChange={(e) => handleFileSelect(e, index)}
                      />
                      {url && (
                        <div className="absolute right-3 top-2.5">
                          <ImageIcon className="w-5 h-5 text-emerald-600" />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {url && (
                      <button
                        type="button"
                        onClick={() => removeImageUrl(index)}
                        className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => fileInputsRef.current[index]?.click()}
                      className="px-3 py-2 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200 transition-colors"
                    >
                      Upload
                    </button>

                    {index === 0 && url && (
                      <div className="px-3 py-2 bg-emerald-100 text-emerald-600 rounded-lg text-xs font-medium">
                        Main
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Image Preview */}
            {filledImages > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Preview</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {formData.imageUrls.map((url, index) =>
                    url ? (
                      <div key={index} className="relative">
                        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
                          <img
                            src={url}
                            alt={`Property ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"%3E%3Crect fill="%23f3f4f6" width="400" height="400"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="18" font-family="sans-serif"%3EImage Not Found%3C/text%3E%3C/svg%3E';
                            }}
                          />
                        </div>
                        {index === 0 && (
                          <div className="absolute top-2 left-2 bg-emerald-600 text-white text-xs font-bold px-2 py-1 rounded">
                            Main
                          </div>
                        )}
                      </div>
                    ) : null
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="bg-white rounded-xl shadow-sm p-8 flex gap-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-emerald-600 text-white py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              {isLoading ? 'Creating Property...' : 'Create Property'}
            </button>
            <Link
              href="/landlord/properties"
              className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors text-center"
            >
              Cancel
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}
