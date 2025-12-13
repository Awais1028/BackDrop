import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { BidReservation, IntegrationSlot } from '@/types';
import { ListChecks, Edit, XCircle, CheckCircle } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

  const handleCancelBid = (bidId: string) => {
    if (window.confirm('Are you sure you want to cancel this bid/reservation?')) {
      const allBids = JSON.parse(localStorage.getItem('bidReservations') || '[]') as BidReservation[];
      const updatedBids = allBids.map(bid =>
        bid.id === bidId ? { ...bid, status: 'Cancelled', lastModifiedDate: new Date().toISOString() } : bid
      );
      localStorage.setItem('bidReservations', JSON.stringify(updatedBids));
      setMyBids(updatedBids.filter(bid => bid.counterpartyId === user?.id));
      showSuccess('Bid/Reservation cancelled successfully.');
    }
  };

  const handleCommitDeal = (bidId: string) => {
    const allBids = JSON.parse(localStorage.getItem('bidReservations') || '[]') as BidReservation[];
    const updatedBids = allBids.map(bid =>
      bid.id === bidId ? { ...bid, status: 'Committed', lastModifiedDate: new Date().toISOString() } : bid
    );
    localStorage.setItem('bidReservations', JSON.stringify(updatedBids));
    setMyBids(updatedBids.filter(bid => bid.counterpartyId === user?.id));
    showSuccess('Deal committed successfully! The creator has been notified.');
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

  const { activeBids, acceptedDeals, historicalBids } = useMemo(() => {
    const activeBids = myBids.filter(b => b.status === 'Pending');
    const acceptedDeals = myBids.filter(b => b.status === 'Accepted' || b.status === 'Committed');
    const historicalBids = myBids.filter(b => b.status === 'Declined' || b.status === 'Cancelled');
    return { activeBids, acceptedDeals, historicalBids };
  }, [myBids]);

  const BidCard = ({ bid }: { bid: BidReservation }) => {
    const slot = slotsMap.get(bid.slotId);
    return (
      <Card>
        <CardHeader>
          <CardTitle>{slot?.sceneRef || 'Unknown Slot'}</CardTitle>
          <CardDescription>{slot?.description || 'No description available.'}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1"><strong>Objective:</strong> {bid.objective}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1"><strong>Pricing Model:</strong> {bid.pricingModel}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1"><strong>Terms:</strong> {bid.amountTerms}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1"><strong>Flight Window:</strong> {bid.flightWindow}</p>
          <p className={`text-sm font-semibold mt-2 ${getStatusColor(bid.status)}`}>Status: {bid.status}</p>
          <p className="text-xs text-gray-500 mt-1">Submitted: {new Date(bid.createdDate).toLocaleDateString()}</p>
          
          {bid.status === 'Pending' && (
            <div className="flex gap-2 mt-4">
              <Button variant="outline" size="sm" onClick={() => showError('Editing bids is coming soon!')}><Edit className="h-4 w-4 mr-1" /> Edit</Button>
              <Button variant="destructive" size="sm" onClick={() => handleCancelBid(bid.id)}><XCircle className="h-4 w-4 mr-1" /> Cancel</Button>
            </div>
          )}
          {bid.status === 'Accepted' && (
            <div className="mt-4">
              <Button className="w-full" onClick={() => handleCommitDeal(bid.id)}><CheckCircle className="h-4 w-4 mr-2" /> Commit to Deal</Button>
              <p className="text-xs text-center mt-2 text-muted-foreground">Finalize the agreement and commit your spend.</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <ListChecks className="h-7 w-7 text-green-500" /> My Bids / Reservations
      </h1>

      {myBids.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400">You haven't placed any bids or reservations yet. Go to "Discover Opportunities" to find some!</p>
      ) : (
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="active">Active Bids ({activeBids.length})</TabsTrigger>
            <TabsTrigger value="accepted">Accepted Deals ({acceptedDeals.length})</TabsTrigger>
            <TabsTrigger value="historical">Historical ({historicalBids.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="active" className="mt-4">
            {activeBids.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeBids.map(bid => <BidCard key={bid.id} bid={bid} />)}
              </div>
            ) : <p className="text-center text-gray-500 py-8">No active bids.</p>}
          </TabsContent>
          <TabsContent value="accepted" className="mt-4">
            {acceptedDeals.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {acceptedDeals.map(bid => <BidCard key={bid.id} bid={bid} />)}
              </div>
            ) : <p className="text-center text-gray-500 py-8">No deals have been accepted by creators yet.</p>}
          </TabsContent>
          <TabsContent value="historical" className="mt-4">
            {historicalBids.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {historicalBids.map(bid => <BidCard key={bid.id} bid={bid} />)}
              </div>
            ) : <p className="text-center text-gray-500 py-8">No historical bids.</p>}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default MyBidsReservationsPage;