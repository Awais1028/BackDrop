import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { IntegrationSlot, BidReservation, ProjectScript } from '@/types';
// import { v4 as uuidv4 } from 'uuid'; // Removed
import { Search, Handshake, Filter } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { useNavigate } from 'react-router-dom';
import { api } from '@/api/client';

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

  const ageOptions = Array.from({ length: 101 }, (_, i) => i);

  const fetchData = useCallback(async () => {
    try {
        const slots = await api.get<IntegrationSlot[]>('/slots');
        setAvailableSlots(slots.filter(slot => slot.status === 'Available' && slot.visibility === 'Public'));
        
        // Optimize: Fetch only needed scripts or use a backend "expand" feature if available
        // For MVP, fetching all projects to build the map is okay if volume is low.
        // Better: Fetch projects for the visible slots.
        const projects = await api.get<ProjectScript[]>('/projects');
        const map = new Map<string, ProjectScript>();
        projects.forEach(script => map.set(script.id, script));
        setScriptsMap(map);
    } catch (error) {
        console.error("Failed to fetch discovery data", error);
    }
  }, []);

  useEffect(() => {
    if (!user || (role !== 'Advertiser' && role !== 'Merchant')) {
      navigate('/login');
      return;
    }
    fetchData();
  }, [user, role, navigate, fetchData]);

  const filteredSlots = useMemo(() => {
    return availableSlots.filter(slot => {
      const projectId = slot.projectId || slot.project_id;
      if (!projectId) return false;
      const script = scriptsMap.get(projectId);
      if (!script) return false;

      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        (slot.sceneRef || slot.scene_ref || '').toLowerCase().includes(searchLower) ||
        (slot.description || '').toLowerCase().includes(searchLower) ||
        script.title.toLowerCase().includes(searchLower);

      const matchesGenre = selectedGenre === 'all' || script.genre === selectedGenre;
      
      const matchesGender = genderFilter === 'all' || script.demographicsGender === genderFilter;

      const startFilter = ageStartFilter === '' ? 0 : Number(ageStartFilter);
      const endFilter = ageEndFilter === '' ? 100 : Number(ageEndFilter);
      const scriptStart = script.demographicsAgeStart ?? 0;
      const scriptEnd = script.demographicsAgeEnd ?? 100;
      const matchesAge = Math.max(startFilter, scriptStart) <= Math.min(endFilter, scriptEnd);

      return matchesSearch && matchesGenre && matchesGender && matchesAge;
    });
  }, [availableSlots, searchTerm, selectedGenre, ageStartFilter, ageEndFilter, genderFilter, scriptsMap]);

  const handlePlaceBid = async (e: React.FormEvent) => {
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

    try {
        const payload = {
            slot_id: selectedSlot.id,
            objective: objective,
            pricing_model: pricingModel,
            amount_terms: amountTerms,
            flight_window: flightWindow,
        };
        
        await api.post('/bids', payload);

        showSuccess('Bid/Reservation placed successfully!');
        setIsBidDialogOpen(false);
        setObjective('');
        setPricingModel('');
        setAmountTerms('');
        setFlightWindow('');
        setSelectedSlot(null);
    } catch (error) {
        showError('Failed to place bid.');
    }
  };

  const genres = ['Comedy', 'Sci-Fi', 'Drama', 'Thriller', 'Action'];
  
  const formatAudience = (script: ProjectScript) => {
    const age = script.demographicsAgeStart != null && script.demographicsAgeEnd != null ? `${script.demographicsAgeStart}-${script.demographicsAgeEnd}` : '';
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
              <Select value={ageStartFilter !== '' ? String(ageStartFilter) : undefined} onValueChange={(val) => setAgeStartFilter(val ? Number(val) : '')}>
                <SelectTrigger><SelectValue placeholder="Start Age" /></SelectTrigger>
                <SelectContent>{ageOptions.map(age => <SelectItem key={age} value={String(age)}>{age}</SelectItem>)}</SelectContent>
              </Select>
              <span>-</span>
              <Select value={ageEndFilter !== '' ? String(ageEndFilter) : undefined} onValueChange={(val) => setAgeEndFilter(val ? Number(val) : '')}>
                <SelectTrigger><SelectValue placeholder="End Age" /></SelectTrigger>
                <SelectContent>{ageOptions.map(age => <SelectItem key={age} value={String(age)}>{age}</SelectItem>)}</SelectContent>
              </Select>
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
            const projectId = slot.projectId || slot.project_id;
            const script = projectId ? scriptsMap.get(projectId) : undefined;
            if (!script) return null;

            const sceneRef = slot.sceneRef || slot.scene_ref;
            const pricingFloor = slot.pricingFloor || slot.pricing_floor || 0;

            return (
              <Card key={slot.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Handshake className="h-5 w-5 text-blue-500" />{sceneRef}</CardTitle>
                  <CardDescription>From script: "{script.title}"</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-1"><strong>Genre:</strong> {script.genre || 'N/A'}</p>
                  <p className="text-sm text-muted-foreground mb-1"><strong>Audience:</strong> {formatAudience(script)}</p>
                  <p className="text-sm text-muted-foreground mb-1"><strong>Modality:</strong> {slot.modality}</p>
                  <p className="text-sm text-muted-foreground mb-1"><strong>Pricing Floor:</strong> ${pricingFloor.toLocaleString()}</p>
                  {slot.constraints && (<p className="text-sm text-muted-foreground mb-2"><strong>Constraints:</strong> {slot.constraints}</p>)}
                  <Dialog open={isBidDialogOpen && selectedSlot?.id === slot.id} onOpenChange={setIsBidDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="mt-2 w-full" onClick={() => { setSelectedSlot(slot); setIsBidDialogOpen(true); }}>Place Bid / Reserve</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Place Bid for "{selectedSlot?.sceneRef || selectedSlot?.scene_ref}"</DialogTitle>
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