import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { IntegrationSlot, BidReservation, ProjectScript } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { Search, Handshake, Filter } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { useNavigate } from 'react-router-dom';

const DiscoverOpportunitiesPage = () => {
  const { user, role } = useAuth();
  const navigate = useNavigate();

  const [availableSlots, setAvailableSlots] = useState<IntegrationSlot[]>([]);
  const [scriptsMap, setScriptsMap] = useState<Map<string, ProjectScript>>(new Map());
  const [isBidDialogOpen, setIsBidDialogOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<IntegrationSlot | null>(null);

  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [ageStartFilter, setAgeStartFilter] = useState<number | ''>('');
  const [ageEndFilter, setAgeEndFilter] = useState<number | ''>('');
  const [genderFilter, setGenderFilter] = useState<ProjectScript['demographicsGender'] | 'all'>('all');

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
    setAvailableSlots(storedSlots.filter(slot => slot.status === 'Available' && slot.visibility === 'Public'));

    const storedScripts = JSON.parse(localStorage.getItem('projectScripts') || '[]') as ProjectScript[];
    const map = new Map<string, ProjectScript>();
    storedScripts.forEach(script => map.set(script.id, script));
    setScriptsMap(map);
  }, [user, role, navigate]);

  const filteredSlots = useMemo(() => {
    return availableSlots.filter(slot => {
      const script = scriptsMap.get(slot.projectId);
      if (!script) return false;

      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        slot.sceneRef.toLowerCase().includes(searchLower) ||
        slot.description.toLowerCase().includes(searchLower) ||
        script.title.toLowerCase().includes(searchLower);

      const matchesGenre = selectedGenre === 'all' || script.genre === selectedGenre;
      
      const matchesGender = genderFilter === 'all' || script.demographicsGender === genderFilter;

      const startFilter = ageStartFilter === '' ? 0 : Number(ageStartFilter);
      const endFilter = ageEndFilter === '' ? 999 : Number(ageEndFilter);
      const scriptStart = script.demographicsAgeStart ?? 0;
      const scriptEnd = script.demographicsAgeEnd ?? 999;
      const matchesAge = Math.max(startFilter, scriptStart) <= Math.min(endFilter, scriptEnd);

      return matchesSearch && matchesGenre && matchesGender && matchesAge;
    });
  }, [availableSlots, searchTerm, selectedGenre, ageStartFilter, ageEndFilter, genderFilter, scriptsMap]);

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

    if (user.role === 'Merchant' && user.minIntegrationFee && pricingModel === 'Fixed') {
      const bidAmount = parseFloat(amountTerms.replace(/[^0-9.-]+/g, ""));
      if (!isNaN(bidAmount) && bidAmount < user.minIntegrationFee) {
        showError(`Your bid of $${bidAmount.toLocaleString()} is below your minimum integration fee of $${user.minIntegrationFee.toLocaleString()}.`);
        return;
      }
    }

    const newBid: BidReservation = {
      id: uuidv4(),
      counterpartyId: user.id,
      slotId: selectedSlot.id,
      objective: objective as BidReservation['objective'],
      pricingModel: pricingModel as BidReservation['pricingModel'],
      amountTerms: amountTerms,
      flightWindow: flightWindow,
      status: 'Pending',
      comments: [],
      creatorFinalApproval: false,
      buyerFinalApproval: false,
      createdDate: new Date().toISOString(),
      lastModifiedDate: new Date().toISOString(),
    };

    const allBids = JSON.parse(localStorage.getItem('bidReservations') || '[]') as BidReservation[];
    allBids.push(newBid);
    localStorage.setItem('bidReservations', JSON.stringify(allBids));

    showSuccess('Bid/Reservation placed successfully!');
    setIsBidDialogOpen(false);
    setObjective('');
    setPricingModel('');
    setAmountTerms('');
    setFlightWindow('');
    setSelectedSlot(null);
  };

  const genres = ['Comedy', 'Sci-Fi', 'Drama', 'Thriller', 'Action'];
  
  const formatAudience = (script: ProjectScript) => {
    const age = script.demographicsAgeStart && script.demographicsAgeEnd ? `${script.demographicsAgeStart}-${script.demographicsAgeEnd}` : '';
    const gender = script.demographicsGender || '';
    if (age && gender) return `${age}, ${gender}`;
    return age || gender || 'N/A';
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <Search className="h-7 w-7 text-purple-500" /> Discover Opportunities
      </h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Filter className="h-5 w-5" /> Filter & Search</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-4">
            <Label htmlFor="search-term">Search Term</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input id="search-term" placeholder="Script title, scene, description..." className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
          </div>
          <div>
            <Label>Genre</Label>
            <Select value={selectedGenre} onValueChange={setSelectedGenre}>
              <SelectTrigger><SelectValue placeholder="Genre" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Genres</SelectItem>
                {genres.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="lg:col-span-2">
            <Label>Target Audience</Label>
            <div className="flex items-center gap-2">
              <Input type="number" placeholder="Start Age" value={ageStartFilter} onChange={(e) => setAgeStartFilter(e.target.value === '' ? '' : Number(e.target.value))} />
              <span>-</span>
              <Input type="number" placeholder="End Age" value={ageEndFilter} onChange={(e) => setAgeEndFilter(e.target.value === '' ? '' : Number(e.target.value))} />
              <Select value={genderFilter} onValueChange={(value: any) => setGenderFilter(value)}>
                <SelectTrigger><SelectValue placeholder="Gender" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {filteredSlots.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400 py-10">No available integration slots match your criteria.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSlots.map((slot) => {
            const script = scriptsMap.get(slot.projectId);
            if (!script) return null;
            return (
              <Card key={slot.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Handshake className="h-5 w-5 text-blue-500" />{slot.sceneRef}</CardTitle>
                  <CardDescription>From script: "{script.title}"</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-1"><strong>Genre:</strong> {script.genre || 'N/A'}</p>
                  <p className="text-sm text-muted-foreground mb-1"><strong>Audience:</strong> {formatAudience(script)}</p>
                  <p className="text-sm text-muted-foreground mb-1"><strong>Modality:</strong> {slot.modality}</p>
                  <p className="text-sm text-muted-foreground mb-1"><strong>Pricing Floor:</strong> ${slot.pricingFloor.toLocaleString()}</p>
                  {slot.constraints && (<p className="text-sm text-muted-foreground mb-2"><strong>Constraints:</strong> {slot.constraints}</p>)}
                  <Dialog open={isBidDialogOpen && selectedSlot?.id === slot.id} onOpenChange={setIsBidDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="mt-2 w-full" onClick={() => { setSelectedSlot(slot); setIsBidDialogOpen(true); }}>Place Bid / Reserve</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Place Bid for "{selectedSlot?.sceneRef}"</DialogTitle>
                        <DialogDescription>Submit your offer for this integration opportunity.</DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handlePlaceBid} className="grid gap-4 py-4">
                        <div className="grid gap-2"><Label htmlFor="objective">Objective</Label><Select value={objective} onValueChange={(value: BidReservation['objective']) => setObjective(value)}><SelectTrigger id="objective"><SelectValue placeholder="Select objective" /></SelectTrigger><SelectContent><SelectItem value="Reach">Reach</SelectItem><SelectItem value="Conversions">Conversions</SelectItem></SelectContent></Select></div>
                        <div className="grid gap-2"><Label htmlFor="pricingModel">Pricing Model</Label><Select value={pricingModel} onValueChange={(value: BidReservation['pricingModel']) => setPricingModel(value)}><SelectTrigger id="pricingModel"><SelectValue placeholder="Select pricing model" /></SelectTrigger><SelectContent><SelectItem value="Fixed">Fixed</SelectItem><SelectItem value="Rev-Share">Revenue Share</SelectItem><SelectItem value="Hybrid">Hybrid</SelectItem></SelectContent></Select></div>
                        <div className="grid gap-2"><Label htmlFor="amountTerms">Amount / Terms</Label><Input id="amountTerms" value={amountTerms} onChange={(e) => setAmountTerms(e.target.value)} placeholder="e.g., $5000 (Fixed), 10% GMV (Rev-Share)" required /></div>
                        <div className="grid gap-2"><Label htmlFor="flightWindow">Proposed Flight Window</Label><Input id="flightWindow" value={flightWindow} onChange={(e) => setFlightWindow(e.target.value)} placeholder="e.g., Jan 2025 - Mar 2025" required /></div>
                        <DialogFooter><Button type="submit">Submit Bid</Button></DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DiscoverOpportunitiesPage;