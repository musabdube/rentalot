'use client';

import { PropertyForm } from './PropertyFormTypes';

interface PropertyFormSectionsProps {
  formData: PropertyForm;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

export function LocationSection({ formData, handleInputChange }: PropertyFormSectionsProps) {
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-200">📍 Location</h2>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              City *
            </label>
            <select
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none bg-white"
              required
            >
              <option value="">Select City</option>
              <option value="Harare">Harare</option>
              <option value="Bulawayo">Bulawayo</option>
              <option value="Gweru">Gweru</option>
              <option value="Mutare">Mutare</option>
              <option value="Masvingo">Masvingo</option>
              <option value="Chinhoyi">Chinhoyi</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Suburb/Area
            </label>
            <input
              type="text"
              name="suburb"
              value={formData.suburb}
              onChange={handleInputChange}
              placeholder="e.g., Mount Pleasant, Highfield"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Street Address (Private - Not shown to public)
          </label>
          <input
            type="text"
            name="street"
            value={formData.street}
            onChange={handleInputChange}
            placeholder="e.g., 123 Main Street"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nearby Landmark
          </label>
          <input
            type="text"
            name="nearbyLandmark"
            value={formData.nearbyLandmark}
            onChange={handleInputChange}
            placeholder="e.g., Near OK Mart, Opposite Shopping Center"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              GPS Latitude
            </label>
            <input
              type="number"
              name="gpsLatitude"
              value={formData.gpsLatitude}
              onChange={handleInputChange}
              placeholder="-17.8252"
              step="0.0001"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              GPS Longitude
            </label>
            <input
              type="number"
              name="gpsLongitude"
              value={formData.gpsLongitude}
              onChange={handleInputChange}
              placeholder="31.0521"
              step="0.0001"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function PricingSection({ formData, handleInputChange }: PropertyFormSectionsProps) {
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-200">💰 Pricing</h2>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Monthly Rent Amount *
            </label>
            <input
              type="number"
              name="rentAmount"
              value={formData.rentAmount}
              onChange={handleInputChange}
              placeholder="5000"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Currency
            </label>
            <select
              name="currency"
              value={formData.currency}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none bg-white"
            >
              <option value="USD">USD ($)</option>
              <option value="ZWL">ZWL (Z$)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Deposit Amount
            </label>
            <input
              type="number"
              name="depositAmount"
              value={formData.depositAmount}
              onChange={handleInputChange}
              placeholder="1000"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lease Term
            </label>
            <select
              name="leaseTerm"
              value={formData.leaseTerm}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none bg-white"
            >
              <option value="monthly">Monthly</option>
              <option value="6months">6 Months</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
        </div>

        <label className="flex items-center gap-3 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
          <input
            type="checkbox"
            name="negotiable"
            checked={formData.negotiable}
            onChange={handleInputChange}
            className="w-5 h-5 text-emerald-600 border-gray-300 rounded focus:ring-2 focus:ring-emerald-500"
          />
          <span className="text-gray-900 font-medium">Price is Negotiable</span>
        </label>
      </div>
    </div>
  );
}

export function RoomDetailsSection({ formData, handleInputChange }: PropertyFormSectionsProps) {
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-200">🏠 Room Details</h2>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bedrooms *
            </label>
            <input
              type="number"
              name="bedrooms"
              value={formData.bedrooms}
              onChange={handleInputChange}
              placeholder="2"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bathrooms *
            </label>
            <input
              type="number"
              name="bathrooms"
              value={formData.bathrooms}
              onChange={handleInputChange}
              placeholder="1"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              required
            />
          </div>

          <div className="flex items-center">
            <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                name="sharedBathroom"
                checked={Boolean((formData as any).sharedBathroom)}
                onChange={handleInputChange}
                className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-2 focus:ring-emerald-500"
              />
              <span className="text-gray-900">Shared Bathroom</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Toilets
            </label>
            <input
              type="number"
              name="toilets"
              value={formData.toilets}
              onChange={handleInputChange}
              placeholder="1"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Area (m²)
            </label>
            <input
              type="number"
              name="area"
              value={formData.area}
              onChange={handleInputChange}
              placeholder="120"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Rooms & Features</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { name: 'lounge', label: 'Lounge' },
              { name: 'diningRoom', label: 'Dining Room' },
              { name: 'kitchen', label: 'Kitchen' },
              { name: 'mainBedroomEnsuite', label: 'Main Bedroom Ensuite' },
            ].map((item) => (
              <label key={item.name} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  name={item.name}
                  checked={(formData as any)[item.name]}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-2 focus:ring-emerald-500"
                />
                <span className="text-gray-900">{item.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function GardenSection({ formData, handleInputChange }: PropertyFormSectionsProps) {
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-200">🌿 Garden & Yard</h2>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Yard Size
          </label>
          <select
            name="yardSize"
            value={formData.yardSize}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none bg-white"
          >
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="big">Big</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { name: 'veranda', label: 'Veranda' },
            { name: 'fenced', label: 'Fenced' },
            { name: 'pavedDriveway', label: 'Paved Driveway' },
          ].map((item) => (
            <label key={item.name} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                name={item.name}
                checked={(formData as any)[item.name]}
                onChange={handleInputChange}
                className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-2 focus:ring-emerald-500"
              />
              <span className="text-gray-900">{item.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ParkingSection({ formData, handleInputChange }: PropertyFormSectionsProps) {
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-200">🚗 Parking</h2>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Number of Parking Spaces
          </label>
          <input
            type="number"
            name="parkingSpaces"
            value={formData.parkingSpaces}
            onChange={handleInputChange}
            placeholder="1"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { name: 'garage', label: 'Garage' },
            { name: 'carport', label: 'Carport' },
          ].map((item) => (
            <label key={item.name} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                name={item.name}
                checked={(formData as any)[item.name]}
                onChange={handleInputChange}
                className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-2 focus:ring-emerald-500"
              />
              <span className="text-gray-900">{item.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

export function WaterSection({ formData, handleInputChange }: PropertyFormSectionsProps) {
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-200">💧 Water Supply</h2>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { name: 'municipalWater', label: 'Municipal Water' },
            { name: 'borehole', label: 'Borehole' },
            { name: 'waterTank', label: 'Water Tank' },
          ].map((item) => (
            <label key={item.name} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                name={item.name}
                checked={(formData as any)[item.name]}
                onChange={handleInputChange}
                className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-2 focus:ring-emerald-500"
              />
              <span className="text-gray-900">{item.label}</span>
            </label>
          ))}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tank Capacity (if applicable)
          </label>
          <input
            type="text"
            name="tankCapacity"
            value={formData.tankCapacity}
            onChange={handleInputChange}
            placeholder="e.g., 5000L"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>
  );
}

export function PowerSection({ formData, handleInputChange }: PropertyFormSectionsProps) {
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-200">⚡ Power Supply</h2>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { name: 'zesaAvailable', label: 'ZESA Available' },
            { name: 'solarSystem', label: 'Solar System' },
            { name: 'generator', label: 'Generator' },
          ].map((item) => (
            <label key={item.name} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                name={item.name}
                checked={(formData as any)[item.name]}
                onChange={handleInputChange}
                className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-2 focus:ring-emerald-500"
              />
              <span className="text-gray-900">{item.label}</span>
            </label>
          ))}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Solar Backup Hours (if applicable)
          </label>
          <input
            type="number"
            name="solarBackupHours"
            value={formData.solarBackupHours}
            onChange={handleInputChange}
            placeholder="e.g., 8"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>
  );
}

export function ConnectivitySection({ formData, handleInputChange }: PropertyFormSectionsProps) {
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-200">🌐 Connectivity</h2>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { name: 'internetReady', label: 'Internet Ready' },
            { name: 'fiberAvailable', label: 'Fiber Available' },
            { name: 'wifiIncluded', label: 'WiFi Included' },
          ].map((item) => (
            <label key={item.name} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                name={item.name}
                checked={(formData as any)[item.name]}
                onChange={handleInputChange}
                className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-2 focus:ring-emerald-500"
              />
              <span className="text-gray-900">{item.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

export function SecuritySection({ formData, handleInputChange }: PropertyFormSectionsProps) {
  return (
    <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b border-red-200">🔒 Security (VERY IMPORTANT)</h2>
      <div className="space-y-6">
        <p className="text-sm text-gray-700 p-3 bg-red-100 rounded-lg">
          Security features help tenants feel safe. Please accurately describe all security measures.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { name: 'walled', label: 'Walled Property' },
            { name: 'electricGate', label: 'Electric Gate' },
            { name: 'burglarBars', label: 'Burglar Bars' },
            { name: 'securityAlarm', label: 'Security Alarm' },
            { name: 'guardedArea', label: 'Guarded Area' },
            { name: 'neighborhoodWatch', label: 'Neighborhood Watch' },
          ].map((item) => (
            <label key={item.name} className="flex items-center gap-3 p-3 border border-red-200 bg-white rounded-lg hover:bg-red-50 cursor-pointer">
              <input
                type="checkbox"
                name={item.name}
                checked={(formData as any)[item.name]}
                onChange={handleInputChange}
                className="w-4 h-4 text-red-600 border-red-300 rounded focus:ring-2 focus:ring-red-500"
              />
              <span className="text-gray-900 font-medium">{item.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ConditionSection({ formData, handleInputChange }: PropertyFormSectionsProps) {
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-200">✨ Condition & Extras</h2>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Furnished Status
          </label>
          <select
            name="furnished"
            value={formData.furnished}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none bg-white"
          >
            <option value="No">Not Furnished</option>
            <option value="Partially">Partially Furnished</option>
            <option value="Fully">Fully Furnished</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { name: 'recentlyRenovated', label: 'Recently Renovated' },
            { name: 'tiles', label: 'Tiles' },
            { name: 'ceiling', label: 'Ceiling' },
            { name: 'builtInCupboards', label: 'Built-in Cupboards' },
          ].map((item) => (
            <label key={item.name} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                name={item.name}
                checked={(formData as any)[item.name]}
                onChange={handleInputChange}
                className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-2 focus:ring-emerald-500"
              />
              <span className="text-gray-900">{item.label}</span>
            </label>
          ))}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Additional Policies</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: 'petsAllowed', label: 'Pets Allowed' },
              { name: 'smokingAllowed', label: 'Smoking Allowed' },
              { name: 'sharedProperty', label: 'Shared Property' },
            ].map((item) => (
              <label key={item.name} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  name={item.name}
                  checked={(formData as any)[item.name]}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-2 focus:ring-emerald-500"
                />
                <span className="text-gray-900">{item.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function StudentFriendlySection({ formData, handleInputChange }: PropertyFormSectionsProps) {
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-200">🎓 Student-Friendly Features</h2>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <label className="flex items-center space-x-3 cursor-pointer p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <input
              type="checkbox"
              name="studentFriendly"
              checked={formData.studentFriendly}
              onChange={handleInputChange}
              className="w-5 h-5 text-emerald-600 border-gray-300 rounded focus:ring-2 focus:ring-emerald-500"
            />
            <div>
              <span className="text-sm font-medium text-gray-900">Student Friendly</span>
              <p className="text-xs text-gray-600">Property is suitable for students</p>
            </div>
          </label>

          <label className="flex items-center space-x-3 cursor-pointer p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <input
              type="checkbox"
              name="nearCampus"
              checked={formData.nearCampus}
              onChange={handleInputChange}
              className="w-5 h-5 text-emerald-600 border-gray-300 rounded focus:ring-2 focus:ring-emerald-500"
            />
            <div>
              <span className="text-sm font-medium text-gray-900">Near Campus</span>
              <p className="text-xs text-gray-600">Close to university or college</p>
            </div>
          </label>

          <label className="flex items-center space-x-3 cursor-pointer p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <input
              type="checkbox"
              name="walkingDistance"
              checked={formData.walkingDistance}
              onChange={handleInputChange}
              className="w-5 h-5 text-emerald-600 border-gray-300 rounded focus:ring-2 focus:ring-emerald-500"
            />
            <div>
              <span className="text-sm font-medium text-gray-900">Walking Distance to Campus</span>
              <p className="text-xs text-gray-600">Can walk to campus easily</p>
            </div>
          </label>

          <label className="flex items-center space-x-3 cursor-pointer p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <input
              type="checkbox"
              name="publicTransportNearby"
              checked={formData.publicTransportNearby}
              onChange={handleInputChange}
              className="w-5 h-5 text-emerald-600 border-gray-300 rounded focus:ring-2 focus:ring-emerald-500"
            />
            <div>
              <span className="text-sm font-medium text-gray-900">Public Transport Nearby</span>
              <p className="text-xs text-gray-600">Easy access to buses or transport</p>
            </div>
          </label>

          <label className="flex items-center space-x-3 cursor-pointer p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <input
              type="checkbox"
              name="sharedRoomAllowed"
              checked={formData.sharedRoomAllowed}
              onChange={handleInputChange}
              className="w-5 h-5 text-emerald-600 border-gray-300 rounded focus:ring-2 focus:ring-emerald-500"
            />
            <div>
              <span className="text-sm font-medium text-gray-900">Shared Room Allowed</span>
              <p className="text-xs text-gray-600">Multiple students can share a room</p>
            </div>
          </label>

          <label className="flex items-center space-x-3 cursor-pointer p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <input
              type="checkbox"
              name="utilitiesIncluded"
              checked={formData.utilitiesIncluded}
              onChange={handleInputChange}
              className="w-5 h-5 text-emerald-600 border-gray-300 rounded focus:ring-2 focus:ring-emerald-500"
            />
            <div>
              <span className="text-sm font-medium text-gray-900">Utilities Included</span>
              <p className="text-xs text-gray-600">Water and electricity included in rent</p>
            </div>
          </label>

          <label className="flex items-center space-x-3 cursor-pointer p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <input
              type="checkbox"
              name="studyFriendly"
              checked={formData.studyFriendly}
              onChange={handleInputChange}
              className="w-5 h-5 text-emerald-600 border-gray-300 rounded focus:ring-2 focus:ring-emerald-500"
            />
            <div>
              <span className="text-sm font-medium text-gray-900">Study Friendly</span>
              <p className="text-xs text-gray-600">Quiet environment, good for studying</p>
            </div>
          </label>
        </div>

        {/* Campus Details - Show only if nearCampus is checked */}
        {formData.nearCampus && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Campus Name
              </label>
              <input
                type="text"
                name="campusName"
                value={formData.campusName}
                onChange={handleInputChange}
                placeholder="e.g., University of Zimbabwe"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Distance to Campus (km)
              </label>
              <input
                type="number"
                name="distanceToCampus"
                value={formData.distanceToCampus}
                onChange={handleInputChange}
                placeholder="e.g., 2.5"
                step="0.1"
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function BasicInfoSection({ formData, handleInputChange }: PropertyFormSectionsProps) {
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-200">ℹ️ Basic Information</h2>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Property Title *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="e.g., Modern 2-Bedroom Apartment in Mount Pleasant"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Property Type *
          </label>
          <select
            name="type"
            value={formData.type}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none bg-white"
            required
          >
            <option value="APARTMENT">Apartment</option>
            <option value="HOUSE">House</option>
            <option value="VILLA">Villa</option>
            <option value="STUDIO">Studio</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Describe your property in detail. Include key features, amenities, and what makes it special."
            rows={5}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            required
          />
        </div>
      </div>
    </div>
  );
}
