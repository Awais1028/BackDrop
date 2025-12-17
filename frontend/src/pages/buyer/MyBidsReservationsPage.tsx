import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { BidReservation, IntegrationSlot } from '@/types';
import { ListChecks, Edit, XCircle, MessageSquare } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { useNavigate, Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from '@/api/client';

const MyBidsReservationsPage = () => {
  const { user, role } = useAuth();
  const navigate = useNavigate();

  const [myBids, setMyBids] = useState<BidReservation[]>([]);
  const [slotsMap, setSlotsMap] = useState<Map<string, IntegrationSlot>>(new Map());
  
  const [isEditBidDialogOpen, setIsEditBidDialogOpen] = useState(false);
  const [editingBid, setEditingBid] = useState<BidReservation | null>(null);
  
  // Edit form state
  const [editObjective, setEditObjective] = useState<BidReservation['objective'] | ''>('');
  const [editPricingModel, setEditPricingModel] = useState<BidReservation['pricingModel'] | ''>('');
  const [editAmountTerms, setEditAmountTerms] = useState('');
  const [editFlightWindow, setEditFlightWindow] = useState('');

  const fetchData = useCallback(async () => {
      try {
        const bids = await api.get<BidReservation[]>('/bids');
        setMyBids(bids);

        // Fetch details for all referenced slots
        // In a real app with many bids, we'd probably batch this or include slot details in the bid response
        const slotIds = Array.from(new Set(bids.map(b => b.slotId || b.slot_id))).filter(Boolean);
        const slots: IntegrationSlot[] = [];
        
        // Naive fetching for now, can be optimized later
        // Since we don't have a bulk get slots endpoint yet that accepts a list of IDs,
        // we can fetch all or just rely on what we have if the list is small.
        // Or better: Fetch the script/slot details individually if needed.
        // Let's use the discovery endpoint which returns all slots for now (MVP optimization later)
        const allSlots = await api.get<IntegrationSlot[]>('/slots');
        
        const map = new Map<string, IntegrationSlot>();
        allSlots.forEach(slot => map.set(slot.id, slot));
        setSlotsMap(map);
      } catch (error) {
          console.error("Failed to fetch bids", error);
      }
  }, []);

  useEffect(() => {
    if (!user || (role !== 'Advertiser' && role !== 'Merchant')) {
      navigate('/login');
      return;
    }
    fetchData();
  }, [user, role, navigate, fetchData]);

  const handleCancelBid = async (bidId: string) => {
    if (window.confirm('Are you sure you want to cancel this bid/reservation?')) {
      try {
        await api.delete(`/bids/${bidId}`);
        setMyBids(prev => prev.map(bid => bid.id === bidId ? { ...bid, status: 'Cancelled' } : bid));
        showSuccess('Bid/Reservation cancelled successfully.');
      } catch (error) {
        showError('Failed to cancel bid.');
      }
    }
  };

  const openEditDialog = (bid: BidReservation) => {
    setEditingBid(bid);
    setEditObjective(bid.objective);
    setEditPricingModel(bid.pricingModel || bid.pricing_model || '');
    setEditAmountTerms(bid.amountTerms || bid.amount_terms || '');
    setEditFlightWindow(bid.flightWindow || bid.flight_window || '');
    setIsEditBidDialogOpen(true);
  };

  const handleEditBidSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBid) return;

    try {
        const payload = {
            slot_id: editingBid.slotId || editingBid.slot_id,
            objective: editObjective,
            pricing_model: editPricingModel,
            amount_terms: editAmountTerms,
            flight_window: editFlightWindow,
        };
        const updatedBid = await api.put<BidReservation>(`/bids/${editingBid.id}`, payload);
        
        setMyBids(prev => prev.map(b => b.id === editingBid.id ? updatedBid : b));
        showSuccess('Bid updated successfully!');
        setIsEditBidDialogOpen(false);
        setEditingBid(null);
    } catch (error) {
        showError('Failed to update bid.');
    }
  };

  const getStatusColor = (status: BidReservation['status']) => {
    switch (status) {
      case 'Pending': return 'text-yellow-500';
      case 'Accepted':
      case 'AwaitingFinalApproval': return 'text-green-500';
      case 'Committed': return 'text-blue-500';
      case 'Declined':
      case 'Cancelled': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const { activeBids, acceptedDeals, historicalBids } = useMemo(() => {
    const activeBids = myBids.filter(b => b.status === 'Pending');
    const acceptedDeals = myBids.filter(b => b.status === 'Accepted' || b.status === 'AwaitingFinalApproval' || b.status === 'Committed');
    const historicalBids = myBids.filter(b => b.status === 'Declined' || b.status === 'Cancelled');
    return { activeBids, acceptedDeals, historicalBids };
  }, [myBids]);

  const BidCard = ({ bid }: { bid: BidReservation }) => {
    const slotId = bid.slotId || bid.slot_id;
    const slot = slotId ? slotsMap.get(slotId) : undefined;
    
    // Handle potential field name differences from backend
    const sceneRef = slot?.sceneRef || slot?.scene_ref || 'Unknown Slot';
    const description = slot?.description || 'No description available.';
    const objective = bid.objective;
    const terms = bid.amountTerms || bid.amount_terms;

    return (
      <Card>
        <CardHeader>
          <CardTitle>{sceneRef}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-1"><strong>Objective:</strong> {objective}</p>
          <p className="text-sm text-muted-foreground mb-1"><strong>Terms:</strong> {terms}</p>
          <p className={`text-sm font-semibold mt-2 ${getStatusColor(bid.status)}`}>Status: {bid.status}</p>
          
          {bid.status === 'Pending' && (
            <div className="flex gap-2 mt-4">
              <Button variant="outline" size="sm" onClick={() => openEditDialog(bid)}><Edit className="h-4 w-4 mr-1" /> Edit</Button>
              <Button variant="destructive" size="sm" onClick={() => handleCancelBid(bid.id)}><XCircle className="h-4 w-4 mr-1" /> Cancel</Button>
            </div>
          )}
          {bid.status === 'AwaitingFinalApproval' && (
            <div className="mt-4">
              <Link to={`/deals/${bid.id}`} className="w-full">
                <Button className="w-full"><MessageSquare className="h-4 w-4 mr-2" /> Review & Approve</Button>
              </Link>
              <p className="text-xs text-center mt-2 text-muted-foreground">Finalize the agreement with the creator.</p>
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
        <p className="text-center text-muted-foreground">You haven't placed any bids or reservations yet.</p>
      ) : (
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="active">Active Bids ({activeBids.length})</TabsTrigger>
            <TabsTrigger value="accepted">My Deals ({acceptedDeals.length})</TabsTrigger>
            <TabsTrigger value="historical">Historical ({historicalBids.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="active" className="mt-4">
            {activeBids.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeBids.map(bid => <BidCard key={bid.id} bid={bid} />)}
              </div>
            ) : <p className="text-center text-muted-foreground py-8">No active bids.</p>}
          </TabsContent>
          <TabsContent value="accepted" className="mt-4">
            {acceptedDeals.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {acceptedDeals.map(bid => <BidCard key={bid.id} bid={bid} />)}
              </div>
            ) : <p className="text-center text-muted-foreground py-8">No deals have been accepted by creators yet.</p>}
          </TabsContent>
          <TabsContent value="historical" className="mt-4">
            {historicalBids.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {historicalBids.map(bid => <BidCard key={bid.id} bid={bid} />)}
              </div>
            ) : <p className="text-center text-muted-foreground py-8">No historical bids.</p>}
          </TabsContent>
        </Tabs>
      )}
      
      <Dialog open={isEditBidDialogOpen} onOpenChange={setIsEditBidDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Bid</DialogTitle>
            <DialogDescription>Update your offer details.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditBidSubmit} className="grid gap-4 py-4">
            <div className="grid gap-2"><Label htmlFor="editObjective">Objective</Label><Select value={editObjective} onValueChange={(value: BidReservation['objective']) => setEditObjective(value)}><SelectTrigger id="editObjective"><SelectValue placeholder="Select objective" /></SelectTrigger><SelectContent><SelectItem value="Reach">Reach</SelectItem><SelectItem value="Conversions">Conversions</SelectItem></SelectContent></Select></div>
            <div className="grid gap-2"><Label htmlFor="editPricingModel">Pricing Model</Label><Select value={editPricingModel} onValueChange={(value: BidReservation['pricingModel']) => setEditPricingModel(value)}><SelectTrigger id="editPricingModel"><SelectValue placeholder="Select pricing model" /></SelectTrigger><SelectContent><SelectItem value="Fixed">Fixed</SelectItem><SelectItem value="Rev-Share">Revenue Share</SelectItem><SelectItem value="Hybrid">Hybrid</SelectItem></SelectContent></Select></div>
            <div className="grid gap-2"><Label htmlFor="editAmountTerms">Amount / Terms</Label><Input id="editAmountTerms" value={editAmountTerms} onChange={(e) => setEditAmountTerms(e.target.value)} placeholder="e.g., $5000 (Fixed), 10% GMV (Rev-Share)" required /></div>
            <div className="grid gap-2"><Label htmlFor="editFlightWindow">Proposed Flight Window</Label><Input id="editFlightWindow" value={editFlightWindow} onChange={(e) => setEditFlightWindow(e.target.value)} placeholder="e.g., Jan 2025 - Mar 2025" required /></div>
            <DialogFooter><Button type="submit">Save Changes</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyBidsReservationsPage;