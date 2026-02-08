'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/app/components/Header';
import { ArrowLeft, Plus, X, Image as ImageIcon } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
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
} from '../../PropertyFormSections';
import { PropertyForm } from '../../PropertyFormTypes';

// Re-export PropertyForm from types
export type { PropertyForm };

export default function EditPropertyPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const propertyId = params.id as string;
  
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProperty, setIsLoadingProperty] = useState(true);
  const [formData, setFormData] = useState<PropertyForm>({
    title: '',
    city: '',
    suburb: '',
    street: '',
    nearbyLandmark: '',
    gpsLatitude: '',
    gpsLongitude: '',
    description: '',
    rentAmount: '',
    currency: 'USD',
    depositAmount: '',
    leaseTerm: 'monthly',
    negotiable: false,
    bedrooms: '',
    bathrooms: '',
    sharedBathroom: false,
    toilets: '',
    lounge: false,
    diningRoom: false,
    kitchen: false,
    area: '',
    type: 'APARTMENT',
    yardSize: 'small',
    veranda: false,
    fenced: false,
    pavedDriveway: false,
    parkingSpaces: '0',
    garage: false,
    carport: false,
    municipalWater: false,
    borehole: false,
    waterTank: false,
    tankCapacity: '',
    zesaAvailable: false,
    solarSystem: false,
    solarBackupHours: '',
    generator: false,
    internetReady: false,
    fiberAvailable: false,
    wifiIncluded: false,
    walled: false,
    electricGate: false,
    burglarBars: false,
    securityAlarm: false,
    guardedArea: false,
    neighborhoodWatch: false,
    furnished: 'No',
    recentlyRenovated: false,
    tiles: false,
    ceiling: false,
    builtInCupboards: false,
    mainBedroomEnsuite: false,
    petsAllowed: false,
    smokingAllowed: false,
    sharedProperty: false,
    imageUrls: ['', '', '', '', '', ''],
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

  useEffect(() => {
    if (status === 'loading') {
      return;
    }

    if (!session || session.user?.role !== 'LANDLORD') {
      router.push('/auth/signin');
      return;
    }

    // Fetch property data
    const fetchProperty = async () => {
      try {
        const response = await fetch(`/api/landlord/properties/${propertyId}`);
        if (response.ok) {
          const property = await response.json();
          
          // Map images to imageUrls
          const imageUrls = ['', '', '', '', '', ''];
          property.images?.forEach((img: any, index: number) => {
            if (index < 6) {
              imageUrls[index] = img.url;
            }
          });

          setFormData({
            title: property.title,
            city: property.city || '',
            suburb: property.suburb || '',
            street: property.street || '',
            nearbyLandmark: property.nearbyLandmark || '',
            gpsLatitude: property.gpsLatitude?.toString() || '',
            gpsLongitude: property.gpsLongitude?.toString() || '',
            description: property.description,
            rentAmount: (property.rentAmount || property.price).toString(),
            currency: property.currency || 'USD',
            depositAmount: (property.depositAmount || '').toString(),
            leaseTerm: property.leaseTerm || 'monthly',
            negotiable: property.negotiable || false,
            bedrooms: property.bedrooms.toString(),
            bathrooms: property.bathrooms.toString(),
            toilets: (property.toilets || '').toString(),
            lounge: property.lounge || false,
            diningRoom: property.diningRoom || false,
            kitchen: property.kitchen || false,
            area: (property.area || '').toString(),
            type: property.type,
            yardSize: property.yardSize || 'small',
            veranda: property.veranda || false,
            fenced: property.fenced || false,
            pavedDriveway: property.pavedDriveway || false,
            parkingSpaces: (property.parkingSpaces || '0').toString(),
            garage: property.garage || false,
            carport: property.carport || false,
            municipalWater: property.municipalWater || false,
            borehole: property.borehole || false,
            waterTank: property.waterTank || false,
            tankCapacity: property.tankCapacity || '',
            zesaAvailable: property.zesaAvailable || false,
            solarSystem: property.solarSystem || false,
            solarBackupHours: (property.solarBackupHours || '').toString(),
            generator: property.generator || false,
            internetReady: property.internetReady || false,
            fiberAvailable: property.fiberAvailable || false,
            wifiIncluded: property.wifiIncluded || false,
            walled: property.walled || false,
            electricGate: property.electricGate || false,
            burglarBars: property.burglarBars || false,
            securityAlarm: property.securityAlarm || false,
            guardedArea: property.guardedArea || false,
            neighborhoodWatch: property.neighborhoodWatch || false,
            furnished: property.furnished || 'No',
            recentlyRenovated: property.recentlyRenovated || false,
            tiles: property.tiles || false,
            ceiling: property.ceiling || false,
            builtInCupboards: property.builtInCupboards || false,
            mainBedroomEnsuite: property.mainBedroomEnsuite || false,
            petsAllowed: property.petsAllowed || false,
            smokingAllowed: property.smokingAllowed || false,
            sharedProperty: property.sharedProperty || false,
            sharedBathroom: property.sharedBathroom || false,
            imageUrls,
            // Student-friendly
            studentFriendly: property.studentFriendly || false,
            nearCampus: property.nearCampus || false,
            campusName: property.campusName || '',
            distanceToCampus: (property.distanceToCampus || '').toString(),
            walkingDistance: property.walkingDistance || false,
            publicTransportNearby: property.publicTransportNearby || false,
            sharedRoomAllowed: property.sharedRoomAllowed || false,
            utilitiesIncluded: property.utilitiesIncluded || false,
            studyFriendly: property.studyFriendly || false,
          });
        } else {
          toast.error('Failed to load property');
          router.push('/landlord/properties');
        }
      } catch (error) {
        console.error('Error fetching property:', error);
        toast.error('Error loading property');
        router.push('/landlord/properties');
      } finally {
        setIsLoadingProperty(false);
      }
    };

    fetchProperty();
  }, [session, status, router, propertyId]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleImageUrlChange = (index: number, value: string) => {
    const newImageUrls = [...formData.imageUrls];
    newImageUrls[index] = value;
    setFormData(prev => ({ ...prev, imageUrls: newImageUrls }));
  };

  const fileInputsRef = useRef<Array<HTMLInputElement | null>>([]);

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

  const removeImageUrl = (index: number) => {
    const newImageUrls = [...formData.imageUrls];
    newImageUrls[index] = '';
    setFormData(prev => ({ ...prev, imageUrls: newImageUrls }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Filter out empty image URLs
      const images = formData.imageUrls.filter(url => url.trim() !== '');
      
      if (images.length === 0) {
        toast.error('Please add at least one image URL');
        setIsLoading(false);
        return;
      }

      const payload = {
        title: formData.title,
        city: formData.city,
        suburb: formData.suburb,
        street: formData.street,
        nearbyLandmark: formData.nearbyLandmark,
        gpsLatitude: formData.gpsLatitude ? parseFloat(formData.gpsLatitude) : null,
        gpsLongitude: formData.gpsLongitude ? parseFloat(formData.gpsLongitude) : null,
        description: formData.description,
        rentAmount: parseInt(formData.rentAmount),
        currency: formData.currency,
        depositAmount: formData.depositAmount ? parseInt(formData.depositAmount) : null,
        leaseTerm: formData.leaseTerm,
        negotiable: formData.negotiable,
        bedrooms: parseInt(formData.bedrooms),
        bathrooms: parseInt(formData.bathrooms),
        toilets: formData.toilets ? parseInt(formData.toilets) : null,
        lounge: formData.lounge,
        diningRoom: formData.diningRoom,
        kitchen: formData.kitchen,
        area: formData.area ? parseInt(formData.area) : null,
        type: formData.type,
        yardSize: formData.yardSize,
        veranda: formData.veranda,
        fenced: formData.fenced,
        pavedDriveway: formData.pavedDriveway,
        parkingSpaces: parseInt(formData.parkingSpaces) || 0,
        garage: formData.garage,
        carport: formData.carport,
        municipalWater: formData.municipalWater,
        borehole: formData.borehole,
        waterTank: formData.waterTank,
        tankCapacity: formData.tankCapacity,
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
        images: images.map((url, index) => ({
          url,
          isMain: index === 0,
        })),
        // status will be optionally provided by caller via body.status
      };

      // Attach status if caller set it on the formData.status
      if ((formData as any).status) (payload as any).status = (formData as any).status;

      const response = await fetch(`/api/landlord/properties/${propertyId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success('Property updated successfully!');
        router.push('/landlord/properties');
      } else {
        toast.error('Failed to update property');
      }
    } catch (error) {
      console.error('Error updating property:', error);
      toast.error('Error updating property');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    // set status to DRAFT and submit
    (formData as any).status = 'DRAFT';
    const fakeEvent = { preventDefault: () => {} } as unknown as React.FormEvent;
    await handleSubmit(fakeEvent);
  };

  const handlePublish = async () => {
    // set status to PENDING and submit
    (formData as any).status = 'PENDING';
    const fakeEvent = { preventDefault: () => {} } as unknown as React.FormEvent;
    await handleSubmit(fakeEvent);
  };

  const filledImages = formData.imageUrls.filter(url => url.trim() !== '').length;

  if (status === 'loading' || isLoadingProperty) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/landlord/properties"
            className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Properties
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Edit Property</h1>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Property Title and Type */}
            <BasicInfoSection formData={formData} handleInputChange={handleInputChange} />

            {/* Location Details */}
            <LocationSection formData={formData} handleInputChange={handleInputChange} />

            {/* Pricing Information */}
            <PricingSection formData={formData} handleInputChange={handleInputChange} />

            {/* Room Details */}
            <RoomDetailsSection formData={formData} handleInputChange={handleInputChange} />

            {/* Garden / Yard */}
            <GardenSection formData={formData} handleInputChange={handleInputChange} />

            {/* Parking */}
            <ParkingSection formData={formData} handleInputChange={handleInputChange} />

            {/* Water Supply */}
            <WaterSection formData={formData} handleInputChange={handleInputChange} />

            {/* Power / Electricity */}
            <PowerSection formData={formData} handleInputChange={handleInputChange} />

            {/* Connectivity */}
            <ConnectivitySection formData={formData} handleInputChange={handleInputChange} />

            {/* Security Features - Most Important! */}
            <SecuritySection formData={formData} handleInputChange={handleInputChange} />

            {/* Condition & Extras */}
            <ConditionSection formData={formData} handleInputChange={handleInputChange} />

            {/* Student-Friendly Features */}
            <StudentFriendlySection formData={formData} handleInputChange={handleInputChange} />

            {/* Property Images */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">🖼️ Property Images</h2>
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
            <div className="flex gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                disabled={isLoading}
                onClick={handleSaveDraft}
                className="w-1/4 bg-yellow-100 text-yellow-800 py-3 rounded-lg font-medium hover:bg-yellow-200 transition-colors disabled:opacity-50"
              >
                Save as Draft
              </button>

              <button
                type="button"
                disabled={isLoading}
                onClick={handlePublish}
                className="w-1/4 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                Submit for Approval
              </button>

              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-emerald-600 text-white py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                {isLoading ? 'Updating Property...' : 'Update Property'}
              </button>

              <Link
                href="/landlord/properties"
                className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors text-center"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
