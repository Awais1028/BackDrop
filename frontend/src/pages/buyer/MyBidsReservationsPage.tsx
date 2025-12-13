import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { BidReservation, IntegrationSlot } from '@/types';
import { ListChecks, Edit, XCircle } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { useNavigate } from 'react-router-dom';

const MyBidsReservationsPage = () => {
  const { user, role } = useAuth();
  const navigate = useNavigate();

  const [myBids, setMyBids] = useState<BidReservation[]>([]);
  const [slotsMap, setSlotsMap] = useState<Map<string, IntegrationSlot>>(new Map());

  useEffect(() => {
    if (!user || (role !== 'Advertiser' && role !== 'Merchant')) {
      navigate('/login');
      return;
    }

    const storedBids = JSON.parse(localStorage.getItem('bidReservations') || '[]') as BidReservation[];
    setMyBids(storedBids.filter(bid => bid.counterpartyId === user.id));

    const storedSlots = JSON.parse(localStorage.getItem('integrationSlots') || '[]') as IntegrationSlot[];
    const map = new Map<string, IntegrationSlot>();
    storedSlots.forEach(slot => map.set(slot.id, slot));
    setSlotsMap(map);
  }, [user, role, navigate]);

  const handleCancelBid = (bidId: string, slotId: string) => {
    if (window.confirm('Are you sure you want to cancel this bid/reservation?')) {
      const allBids = JSON.parse(localStorage.getItem('bidReservations') || '[]') as BidReservation[];
      const updatedBids = allBids.map(bid =>
        bid.id === bidId ? { ...bid, status: 'Cancelled', lastModifiedDate: new Date().toISOString() } : bid
      );
      localStorage.setItem('bidReservations', JSON.stringify(updatedBids));
      setMyBids(updatedBids.filter(bid => bid.counterpartyId === user?.id));
      showSuccess('Bid/Reservation cancelled successfully.');

      // Optionally, update the slot status if it was locked by this bid
      const slot = slotsMap.get(slotId);
      if (slot && slot.status === 'Locked') {
        const allSlots = JSON.parse(localStorage.getItem('integrationSlots') || '[]') as IntegrationSlot[];
        const updatedSlots = allSlots.map(s =>
          s.id === slotId ? { ...s, status: 'Available', lastModifiedDate: new Date().toISOString() } : s
        );
        localStorage.setItem('integrationSlots', JSON.stringify(updatedSlots));
      }
    }
  };

  const getStatusColor = (status: BidReservation['status']) => {
    switch (status) {
      case 'Pending': return 'text-yellow-500';
      case 'Accepted': return 'text-green-500';
      case 'Committed': return 'text-blue-500';
      case 'Declined':
      case 'Cancelled': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <ListChecks className="h-7 w-7 text-green-500" /> My Bids / Reservations
      </h1>

      {myBids.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400">You haven't placed any bids or reservations yet. Go to "Discover Opportunities" to find some!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {myBids.map((bid) => {
            const slot = slotsMap.get(bid.slotId);
            return (
              <Card key={bid.id}>
                <CardHeader>
                  <CardTitle>{slot?.sceneRef || 'Unknown Slot'}</CardTitle>
                  <CardDescription>{slot?.description || 'No description available.'}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    <strong>Objective:</strong> {bid.objective}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    <strong>Pricing Model:</strong> {bid.pricingModel}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    <strong>Terms:</strong> {bid.amountTerms}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    <strong>Flight Window:</strong> {bid.flightWindow}
                  </p>
                  <p className={`text-sm font-semibold mt-2 ${getStatusColor(bid.status)}`}>
                    Status: {bid.status}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Submitted: {new Date(bid.createdDate).toLocaleDateString()}
                  </p>
                  {bid.status === 'Pending' && (
                    <div className="flex gap-2 mt-4">
                      {/* Future: Add Edit Bid functionality */}
                      <Button variant="outline" size="sm" onClick={() => showError('Editing bids is coming soon!')}>
                        <Edit className="h-4 w-4" /> Edit
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleCancelBid(bid.id, bid.slotId)}>
                        <XCircle className="h-4 w-4" /> Cancel
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyBidsReservationsPage;