import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { IntegrationSlot, BidReservation } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { Search, DollarSign, Calendar, Target, Handshake } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { Link, useNavigate } from 'react-router-dom';

const DiscoverOpportunitiesPage = () => {
  const { user, role } = useAuth();
  const navigate = useNavigate();

  const [availableSlots, setAvailableSlots] = useState<IntegrationSlot[]>([]);
  const [isBidDialogOpen, setIsBidDialogOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<IntegrationSlot | null>(null);

  // Bid/Reservation form state
  const [objective, setObjective] = useState<BidReservation['objective'] | ''>('');
  const [pricingModel, setPricingModel] = useState<BidReservation['pricingModel'] | ''>('');
  const [amountTerms, setAmountTerms] = useState('');
  const [flightWindow, setFlightWindow] = useState('');

  useEffect(() => {
    if (!user || (role !== 'Advertiser' && role !== 'Merchant')) {
      navigate('/login');
      return;
    }

    const storedSlots = JSON.parse(localStorage.getItem('integrationSlots') || '[]') as IntegrationSlot[];
    // Only show slots that are 'Available'
    setAvailableSlots(storedSlots.filter(slot => slot.status === 'Available'));
  }, [user, role, navigate]);

  const handlePlaceBid = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedSlot) {
      showError('User not authenticated or no slot selected.');
      return;
    }
    if (!objective || !pricingModel || !amountTerms || !flightWindow) {
      showError('Please fill in all required bid/reservation fields.');
      return;
    }

    const newBid: BidReservation = {
      id: uuidv4(),
      counterpartyId: user.id,
      slotId: selectedSlot.id,
      objective: objective as BidReservation['objective'],
      pricingModel: pricingModel as BidReservation['pricingModel'],
      amountTerms: amountTerms,
      flightWindow: flightWindow,
      status: 'Pending', // Initial status
      createdDate: new Date().toISOString(),
      lastModifiedDate: new Date().toISOString(),
    };

    const allBids = JSON.parse(localStorage.getItem('bidReservations') || '[]') as BidReservation[];
    allBids.push(newBid);
    localStorage.setItem('bidReservations', JSON.stringify(allBids));

    showSuccess('Bid/Reservation placed successfully!');
    setIsBidDialogOpen(false);
    // Reset form
    setObjective('');
    setPricingModel('');
    setAmountTerms('');
    setFlightWindow('');
    setSelectedSlot(null);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <Search className="h-7 w-7 text-purple-500" /> Discover Opportunities
      </h1>

      {availableSlots.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400">No available integration slots at the moment. Check back later!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableSlots.map((slot) => (
            <Card key={slot.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Handshake className="h-5 w-5 text-blue-500" />
                  {slot.sceneRef}
                </CardTitle>
                <CardDescription>{slot.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  <strong>Modality:</strong> {slot.modality}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  <strong>Pricing Floor:</strong> ${slot.pricingFloor.toLocaleString()}
                </p>
                {slot.constraints && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <strong>Constraints:</strong> {slot.constraints}
                  </p>
                )}
                <Dialog open={isBidDialogOpen && selectedSlot?.id === slot.id} onOpenChange={setIsBidDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      className="mt-2 w-full"
                      onClick={() => {
                        setSelectedSlot(slot);
                        setIsBidDialogOpen(true);
                      }}
                    >
                      Place Bid / Reserve
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Place Bid for "{selectedSlot?.sceneRef}"</DialogTitle>
                      <DialogDescription>
                        Submit your offer for this integration opportunity.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handlePlaceBid} className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="objective">Objective</Label>
                        <Select value={objective} onValueChange={(value: BidReservation['objective']) => setObjective(value)}>
                          <SelectTrigger id="objective">
                            <SelectValue placeholder="Select objective" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Reach">Reach</SelectItem>
                            <SelectItem value="Conversions">Conversions</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="pricingModel">Pricing Model</Label>
                        <Select value={pricingModel} onValueChange={(value: BidReservation['pricingModel']) => setPricingModel(value)}>
                          <SelectTrigger id="pricingModel">
                            <SelectValue placeholder="Select pricing model" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Fixed">Fixed</SelectItem>
                            <SelectItem value="Rev-Share">Revenue Share</SelectItem>
                            <SelectItem value="Hybrid">Hybrid</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="amountTerms">Amount / Terms</Label>
                        <Input
                          id="amountTerms"
                          value={amountTerms}
                          onChange={(e) => setAmountTerms(e.target.value)}
                          placeholder="e.g., $5000 (Fixed), 10% GMV (Rev-Share)"
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="flightWindow">Proposed Flight Window</Label>
                        <Input
                          id="flightWindow"
                          value={flightWindow}
                          onChange={(e) => setFlightWindow(e.target.value)}
                          placeholder="e.g., Jan 2025 - Mar 2025"
                          required
                        />
                      </div>
                      <DialogFooter>
                        <Button type="submit">Submit Bid</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default DiscoverOpportunitiesPage;