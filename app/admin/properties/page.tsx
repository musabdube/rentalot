"use client";

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Search, CheckCircle, XCircle, Eye, Trash2, MessageSquare, Send, Pin } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface PropertyImage { id: string; url: string; isMain?: boolean; caption?: string }

interface Property {
  id: string;
  title: string;
  description?: string;
  suburb?: string;
  city?: string;
  price?: number;
  rentAmount?: number;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  type?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ACTIVE';
  isPinned?: boolean;
  isFeatured?: boolean;
  featureRequested?: boolean;
  featureRequestedAt?: string | null;
  pinRequested?: boolean;
  pinRequestedAt?: string | null;
  createdAt: string;
  landlord: { id: string; name: string; email?: string };
  images?: PropertyImage[];
  furnished?: string;
  petsAllowed?: boolean;
  garage?: boolean;
  parkingSpaces?: number;
  lounge?: boolean;
  veranda?: boolean;
  walled?: boolean;
  securityAlarm?: boolean;
}

type StatusFilter = 'all' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'ACTIVE';

const statusConfig: Record<string, { color: string; label: string }> = {
  PENDING: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
  APPROVED: { color: 'bg-green-100 text-green-800', label: 'Approved' },
  REJECTED: { color: 'bg-red-100 text-red-800', label: 'Rejected' },
  ACTIVE: { color: 'bg-blue-100 text-blue-800', label: 'Active' },
};

export default function AdminPropertiesPage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactMessage, setContactMessage] = useState('');
  const [contactLoading, setContactLoading] = useState(false);

  useEffect(() => {
    if (sessionStatus === 'loading') return;
    if (!session || session.user?.role !== 'ADMIN') {
      router.push('/auth/signin');
      return;
    }
    fetchProperties();
  }, [session, sessionStatus, router]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/properties');
      if (res.ok) setProperties(await res.json());
    } catch (err) {
      console.error(err);
      toast.error('Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  const updateProperty = async (id: string, body: object, successMsg?: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/properties/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        await fetchProperties();
        setSelectedProperty(null);
        if (successMsg) toast.success(successMsg);
      } else {
        toast.error('Action failed');
      }
    } catch (err) {
      console.error(err);
      toast.error('Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = (id: string) => { if (confirm('Approve this listing?')) updateProperty(id, { status: 'APPROVED' }, 'Property approved'); };
  const handleReject = (id: string) => { if (confirm('Reject this listing?')) updateProperty(id, { status: 'REJECTED' }, 'Property rejected'); };
  const handlePinToggle = (id: string, current?: boolean) => updateProperty(id, { isPinned: !current, pinRequested: false }, current ? 'Property unpinned' : 'Property pinned');
  const handleApproveFeature = (id: string) => updateProperty(id, { isFeatured: true, featureRequested: false }, 'Property featured');
  const handleDeclineFeature = (id: string) => updateProperty(id, { featureRequested: false }, 'Feature request declined');
  const handleApprovePin = (id: string) => updateProperty(id, { isPinned: true, pinRequested: false }, 'Property pinned');
  const handleDeclinePin = (id: string) => updateProperty(id, { pinRequested: false }, 'Pin request declined');
  const handleDelete = async (id: string) => {
    if (!confirm('Delete this property?')) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/properties/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProperties(p => p.filter(x => x.id !== id));
        setSelectedProperty(null);
        toast.success('Property deleted');
      } else toast.error('Delete failed');
    } catch (err) {
      console.error(err);
      toast.error('Delete failed');
    } finally { setActionLoading(false); }
  };

  const handleContactLandlord = async () => {
    if (!selectedProperty) return;
    if (!contactMessage.trim()) { toast.error('Enter a message'); return; }
    setContactLoading(true);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rentalRequestId: `admin-property-${selectedProperty.id}`,
          receiverId: selectedProperty.landlord.id,
          content: `[ADMIN MESSAGE] Property: ${selectedProperty.title}\n\n${contactMessage}`,
        }),
      });
      if (res.ok) {
        toast.success('Message sent');
        setContactMessage('');
        setShowContactModal(false);
      } else toast.error('Send failed');
    } catch (err) { console.error(err); toast.error('Send failed'); }
    finally { setContactLoading(false); }
  };

  const filtered = properties.filter(p => {
    const s = searchTerm.trim().toLowerCase();
    const matches = !s || p.title?.toLowerCase().includes(s) || (p.suburb || p.city || '').toLowerCase().includes(s);
    const statusOk = statusFilter === 'all' || p.status === statusFilter;
    return matches && statusOk;
  });

  const stats = { total: properties.length, pending: properties.filter(p => p.status === 'PENDING').length, approved: properties.filter(p => p.status === 'APPROVED').length, rejected: properties.filter(p => p.status === 'REJECTED').length };

  if (sessionStatus === 'loading' || loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/admin/dashboard" className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Property Management</h1>
          <p className="text-gray-600 mt-1">Review and manage property listings</p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6"><p className="text-gray-600 text-sm">Total</p><p className="text-3xl font-bold">{stats.total}</p></div>
          <div className="bg-white rounded-xl shadow-sm p-6"><p className="text-gray-600 text-sm">Pending</p><p className="text-3xl font-bold text-yellow-600">{stats.pending}</p></div>
          <div className="bg-white rounded-xl shadow-sm p-6"><p className="text-gray-600 text-sm">Approved</p><p className="text-3xl font-bold text-green-600">{stats.approved}</p></div>
          <div className="bg-white rounded-xl shadow-sm p-6"><p className="text-gray-600 text-sm">Rejected</p><p className="text-3xl font-bold text-red-600">{stats.rejected}</p></div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search by title or location..." className="w-full pl-10 pr-4 py-2 border rounded-lg" />
            </div>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as StatusFilter)} className="px-4 py-2 border rounded-lg">
              <option value="all">All</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="ACTIVE">Active</option>
            </select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center"><p className="text-gray-600">No properties found</p></div>
        ) : (
          <div className="space-y-4">
            {filtered.map(p => (
              <div key={p.id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4 gap-4">
                  <div className="flex-shrink-0">
                    {p.images && p.images.length > 0 ? <img src={p.images[0].url} alt={p.title} className="w-32 h-32 object-cover rounded-lg" /> : <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400">No Image</div>}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="text-lg font-bold">{p.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusConfig[p.status].color}`}>{statusConfig[p.status].label}</span>
                      {p.isPinned && <span className="px-3 py-1 rounded-full text-sm font-semibold bg-purple-100 text-purple-800">Pinned</span>}
                      {p.isFeatured && <span className="px-3 py-1 rounded-full text-sm font-semibold bg-amber-100 text-amber-800">Featured</span>}
                      {p.featureRequested && !p.isFeatured && <span className="px-3 py-1 rounded-full text-sm font-semibold bg-amber-50 text-amber-700">Feature Requested</span>}
                      {p.pinRequested && !p.isPinned && <span className="px-3 py-1 rounded-full text-sm font-semibold bg-purple-50 text-purple-700">Pin Requested</span>}
                    </div>
                    <p className="text-gray-600 text-sm mb-3">{p.suburb || p.city}</p>
                    <div className="grid grid-cols-4 gap-3 mb-3 text-sm">
                      <div><p className="text-gray-600">Bedrooms</p><p className="font-semibold">{p.bedrooms ?? 'N/A'}</p></div>
                      <div><p className="text-gray-600">Bathrooms</p><p className="font-semibold">{p.bathrooms ?? 'N/A'}</p></div>
                      <div><p className="text-gray-600">Area</p><p className="font-semibold">{p.area ? `${p.area}m²` : 'N/A'}</p></div>
                      <div><p className="text-gray-600">Type</p><p className="font-semibold">{p.type}</p></div>
                    </div>
                  </div>
                  <div className="text-right"><p className="text-2xl font-bold text-emerald-600">{`$${p.price || p.rentAmount}`}</p><p className="text-gray-600 text-sm">/month</p></div>
                </div>

                <div className="flex gap-2">
                  <button onClick={() => setSelectedProperty(p)} className="flex-1 bg-blue-100 text-blue-700 px-4 py-2 rounded-lg"> <Eye className="w-4 h-4" /> View Details</button>
                  <button
                    onClick={() => handlePinToggle(p.id, p.isPinned)}
                    disabled={actionLoading}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2 ${
                      p.isPinned ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    }`}
                  >
                    <Pin className="w-4 h-4" /> {p.isPinned ? 'Unpin' : 'Pin'}
                  </button>
                  {p.featureRequested && !p.isFeatured && (
                    <>
                      <button onClick={() => handleApproveFeature(p.id)} disabled={actionLoading} className="flex-1 bg-amber-100 text-amber-700 px-4 py-2 rounded-lg"> <CheckCircle className="w-4 h-4" /> Approve Feature</button>
                      <button onClick={() => handleDeclineFeature(p.id)} disabled={actionLoading} className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg"> <XCircle className="w-4 h-4" /> Decline Feature</button>
                    </>
                  )}
                  {p.pinRequested && !p.isPinned && (
                    <>
                      <button onClick={() => handleApprovePin(p.id)} disabled={actionLoading} className="flex-1 bg-purple-100 text-purple-700 px-4 py-2 rounded-lg"> <CheckCircle className="w-4 h-4" /> Approve Pin</button>
                      <button onClick={() => handleDeclinePin(p.id)} disabled={actionLoading} className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg"> <XCircle className="w-4 h-4" /> Decline Pin</button>
                    </>
                  )}
                  {p.status === 'PENDING' && (<>
                    <button onClick={() => handleApprove(p.id)} disabled={actionLoading} className="flex-1 bg-green-100 text-green-700 px-4 py-2 rounded-lg"> <CheckCircle className="w-4 h-4" /> Approve</button>
                    <button onClick={() => handleReject(p.id)} disabled={actionLoading} className="flex-1 bg-red-100 text-red-700 px-4 py-2 rounded-lg"> <XCircle className="w-4 h-4" /> Reject</button>
                  </>) }
                  <button onClick={() => handleDelete(p.id)} disabled={actionLoading} className="bg-red-100 text-red-700 px-4 py-2 rounded-lg"> <Trash2 className="w-4 h-4" /> Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Detail Modal */}
        {selectedProperty && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedProperty(null)}>
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold">Property Details</h2>
                <button onClick={() => setSelectedProperty(null)} className="text-gray-500">✕</button>
              </div>
              <div className="p-6 space-y-4">
                {selectedProperty.images && selectedProperty.images.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-3">Images ({selectedProperty.images.length})</p>
                    <div className="grid grid-cols-3 gap-3">{selectedProperty.images.map(img => (<div key={img.id}><img src={img.url} alt={img.caption || 'Property'} className="w-full h-24 object-cover rounded-lg"/></div>))}</div>
                  </div>
                )}

                <div><p className="text-sm font-semibold">Title</p><p className="text-gray-900">{selectedProperty.title}</p></div>
                {selectedProperty.description && (<div><p className="text-sm font-semibold">Description</p><p>{selectedProperty.description}</p></div>)}
                <div><p className="text-sm font-semibold">Location</p><p>{selectedProperty.suburb || selectedProperty.city}</p></div>

                <div className="pt-4 border-t flex gap-3">
                  {selectedProperty.status === 'PENDING' && (<>
                    <button onClick={() => handleApprove(selectedProperty.id)} disabled={actionLoading} className="flex-1 bg-green-600 text-white py-2 rounded-lg">✓ Quick Approve</button>
                    <button onClick={() => handleReject(selectedProperty.id)} disabled={actionLoading} className="flex-1 bg-red-600 text-white py-2 rounded-lg">✕ Quick Reject</button>
                  </>) }
                  <button onClick={() => setShowContactModal(true)} className="flex-1 bg-purple-600 text-white py-2 rounded-lg">Contact Landlord</button>
                  <button onClick={() => setSelectedProperty(null)} className="flex-1 bg-gray-200 py-2 rounded-lg">Close</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Contact Modal */}
        {showContactModal && selectedProperty && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => setShowContactModal(false)}>
            <div className="bg-white rounded-2xl max-w-md w-full" onClick={e => e.stopPropagation()}>
              <div className="p-6 border-b flex items-center justify-between"><h3 className="text-xl font-bold">Contact Landlord</h3><button onClick={() => setShowContactModal(false)} className="text-gray-500">✕</button></div>
              <div className="p-6 space-y-4">
                <div><p className="text-sm text-gray-600 mb-2">Property</p><p className="font-semibold">{selectedProperty.title}</p><p className="text-sm text-gray-600">Landlord: {selectedProperty.landlord.name}</p></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-2">Message</label><textarea value={contactMessage} onChange={e => setContactMessage(e.target.value)} rows={4} className="w-full px-3 py-2 border rounded-lg" disabled={contactLoading} /></div>
                <div className="flex gap-3 pt-4"><button onClick={handleContactLandlord} disabled={contactLoading} className="flex-1 bg-purple-600 text-white py-2 rounded-lg"> <Send className="w-4 h-4" /> {contactLoading ? 'Sending...' : 'Send Message'}</button><button onClick={() => setShowContactModal(false)} className="flex-1 bg-gray-200 py-2 rounded-lg">Cancel</button></div>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

