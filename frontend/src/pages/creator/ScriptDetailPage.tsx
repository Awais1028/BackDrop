import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { ProjectScript, IntegrationSlot, BidReservation, User } from '@/types';
import { FileText, PlusCircle, Tag, Edit, Trash2, Bot, CheckCircle, XCircle, MessageSquare, ArrowLeft, Loader2 } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { api } from '@/api/client';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const ScriptDetailPage = () => {
  const { scriptId } = useParams<{ scriptId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [script, setScript] = useState<ProjectScript | null>(null);
  const [slots, setSlots] = useState<IntegrationSlot[]>([]);
  const [bids, setBids] = useState<BidReservation[]>([]);
  const [usersMap, setUsersMap] = useState<Map<string, string>>(new Map());
  
  const [isSlotDialogOpen, setIsSlotDialogOpen] = useState(false);
  const [isEditScriptDialogOpen, setIsEditScriptDialogOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<IntegrationSlot | null>(null);

  // Form state for slots
  const [sceneRef, setSceneRef] = useState('');
  const [description, setDescription] = useState('');
  const [constraints, setConstraints] = useState('');
  const [pricingFloor, setPricingFloor] = useState<number | ''>('');
  const [modality, setModality] = useState<IntegrationSlot['modality'] | ''>('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Form state for editing script
  const [editScriptTitle, setEditScriptTitle] = useState('');
  const [editScriptProductionWindow, setEditScriptProductionWindow] = useState('');
  const [editScriptBudgetTarget, setEditScriptBudgetTarget] = useState<number | ''>('');
  const [editScriptAgeStart, setEditScriptAgeStart] = useState<number | ''>('');
  const [editScriptAgeEnd, setEditScriptAgeEnd] = useState<number | ''>('');
  const [editScriptGender, setEditScriptGender] = useState<ProjectScript['demographicsGender'] | ''>('');

  const ageOptions = Array.from({ length: 101 }, (_, i) => i);

  useEffect(() => {
    const fetchData = async () => {
      if (!user || !scriptId) return;

      try {
        // Fetch Script Details
        const foundScript = await api.get<ProjectScript>(`/projects/${scriptId}`);
        setScript(foundScript);
        
        // Populate edit form
        setEditScriptTitle(foundScript.title);
        setEditScriptProductionWindow(foundScript.production_window || foundScript.productionWindow || '');
        setEditScriptBudgetTarget(foundScript.budget_target || foundScript.budgetTarget || '');
        
        // Handle demographics structure differences
        const demographics = foundScript.demographics;
        setEditScriptAgeStart(demographics?.ageStart ?? foundScript.demographicsAgeStart ?? '');
        setEditScriptAgeEnd(demographics?.ageEnd ?? foundScript.demographicsAgeEnd ?? '');
        setEditScriptGender(demographics?.gender ?? foundScript.demographicsGender ?? '');

        // Fetch Slots
        const scriptSlots = await api.get<IntegrationSlot[]>(`/slots/?project_id=${scriptId}`);
        setSlots(scriptSlots);

        // Fetch Bids for all slots
        const allBids: BidReservation[] = [];
        // Note: In production, we should have a single endpoint to get all bids for a project to avoid N+1
        await Promise.all(scriptSlots.map(async (slot) => {
            try {
                const slotBids = await api.get<BidReservation[]>(`/bids/slot/${slot.id}`);
                allBids.push(...slotBids);
            } catch (err) {
                console.warn(`Failed to fetch bids for slot ${slot.id}`, err);
            }
        }));
        setBids(allBids);

      } catch (error: any) {
        console.error("Failed to fetch script details:", error);
        showError("Script not found or access denied.");
        navigate('/creator/scripts');
      }
    };

    fetchData();
  }, [scriptId, user, navigate]);

  const resetSlotForm = () => {
    setSceneRef('');
    setDescription('');
    setConstraints('');
    setPricingFloor('');
    setModality('');
    setEditingSlot(null);
  };

  const handleSlotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!script || !sceneRef || !description || pricingFloor === '' || !modality) {
      showError('Please fill in all required slot fields.');
      return;
    }

    try {
      const payload = {
        scene_ref: sceneRef,
        description,
        constraints,
        pricing_floor: Number(pricingFloor),
        modality,
        status: 'Available',
        visibility: 'Public'
      };

      if (editingSlot) {
        const updatedSlot = await api.put<IntegrationSlot>(`/slots/${editingSlot.id}`, payload);
        setSlots(prev => prev.map(s => s.id === editingSlot.id ? updatedSlot : s));
        showSuccess('Slot updated successfully!');
      } else {
        const newSlot = await api.post<IntegrationSlot>(`/slots/?project_id=${script.id}`, payload);
        setSlots(prev => [...prev, newSlot]);
        showSuccess('Slot added successfully!');
      }

      setIsSlotDialogOpen(false);
      resetSlotForm();
    } catch (error: any) {
      showError(error.message || 'Failed to save slot');
    }
  };

  const handleAiAssist = () => {
    setIsAiLoading(true);
    setTimeout(() => {
      setSceneRef("Scene: Character uses Smartphone");
      setDescription("A close-up shot of the new 'Pixel 10' smartphone, highlighting its sleek design and vibrant screen as the character navigates an app.");
      setConstraints("Tech brands, non-competitors to Google");
      setPricingFloor(15000);
      setModality("PG/Reservation");
      setIsAiLoading(false);
      showSuccess("AI suggestions populated!");
    }, 2000);
  };

  const handleAcceptBid = async (bid: BidReservation) => {
    try {
        // Backend endpoint expects POST to accept
        const updatedBid = await api.post<BidReservation>(`/bids/${bid.id}/accept`, {});
        setBids(prev => prev.map(b => b.id === bid.id ? updatedBid : b));
        showSuccess('Bid accepted! Awaiting final approval from both parties.');
    } catch (error) {
        showError('Failed to accept bid.');
    }
  };

  const handleDeclineBid = async (bidId: string) => {
    try {
        const updatedBid = await api.post<BidReservation>(`/bids/${bidId}/decline`, {});
        setBids(prev => prev.map(b => b.id === bidId ? updatedBid : b));
        showSuccess('Bid declined.');
    } catch (error) {
        showError('Failed to decline bid.');
    }
  };

  const handleEditScriptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!script) return;

    try {
      const payload = {
        title: editScriptTitle,
        production_window: editScriptProductionWindow,
        budget_target: editScriptBudgetTarget === '' ? 0 : Number(editScriptBudgetTarget),
        demographics: {
          ageStart: editScriptAgeStart === '' ? 0 : Number(editScriptAgeStart),
          ageEnd: editScriptAgeEnd === '' ? 100 : Number(editScriptAgeEnd),
          gender: editScriptGender || 'All'
        }
      };

      const updatedScript = await api.put<ProjectScript>(`/projects/${script.id}`, payload);
      setScript(updatedScript);
      showSuccess('Script updated successfully!');
      setIsEditScriptDialogOpen(false);
    } catch (error: any) {
      showError(error.message || 'Failed to update script');
    }
  };

  const handleDeleteScript = async () => {
    if (!script) return;
    
    try {
      await api.delete(`/projects/${script.id}`);
      showSuccess('Script and all associated slots deleted.');
      navigate('/creator/scripts');
    } catch (error: any) {
      showError(error.message || 'Failed to delete script');
    }
  };

  const getBidStatusStyle = (status: BidReservation['status']) => {
    switch (status) {
      case 'Pending': return { borderColor: 'border-yellow-500', textColor: 'text-yellow-500' };
      case 'Accepted': case 'AwaitingFinalApproval': return { borderColor: 'border-green-500', textColor: 'text-green-500' };
      case 'Committed': return { borderColor: 'border-blue-500', textColor: 'text-blue-500' };
      case 'Declined': case 'Cancelled': return { borderColor: 'border-red-500', textColor: 'text-red-500' };
      default: return { borderColor: 'border-gray-500', textColor: 'text-gray-500' };
    }
  };

  const formatAudience = (script: ProjectScript) => {
    const demographics = script.demographics;
    const ageStart = demographics?.ageStart ?? script.demographicsAgeStart;
    const ageEnd = demographics?.ageEnd ?? script.demographicsAgeEnd;
    const gender = demographics?.gender ?? script.demographicsGender ?? '';
    
    const age = ageStart != null && ageEnd != null ? `${ageStart}-${ageEnd}` : '';
    if (age && gender) return `${age}, ${gender}`;
    return age || gender || 'N/A';
  };

  if (!script) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-4">
      <Button variant="ghost" onClick={() => navigate('/creator/scripts')} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to My Scripts
      </Button>
      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl"><FileText className="h-6 w-6 text-blue-500" />{script.title}</CardTitle>
              <CardDescription>
                Production: {script.production_window || script.productionWindow}
                {(script.budget_target || script.budgetTarget) && ` | Budget: $${(script.budget_target || script.budgetTarget || 0).toLocaleString()}`}
                {` | Audience: ${formatAudience(script)}`}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Dialog open={isEditScriptDialogOpen} onOpenChange={setIsEditScriptDialogOpen}>
                <DialogTrigger asChild><Button variant="outline" size="sm"><Edit className="h-4 w-4" /></Button></DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader><DialogTitle>Edit Script Details</DialogTitle></DialogHeader>
                  <form onSubmit={handleEditScriptSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2"><Label htmlFor="editTitle">Title</Label><Input id="editTitle" value={editScriptTitle} onChange={(e) => setEditScriptTitle(e.target.value)} required /></div>
                    <div className="grid gap-2"><Label htmlFor="editProdWindow">Production Window</Label><Input id="editProdWindow" value={editScriptProductionWindow} onChange={(e) => setEditScriptProductionWindow(e.target.value)} required /></div>
                    <div className="grid gap-2"><Label htmlFor="editBudget">Budget Target ($)</Label><Input id="editBudget" type="number" value={editScriptBudgetTarget} onChange={(e) => setEditScriptBudgetTarget(e.target.value === '' ? '' : Number(e.target.value))} /></div>
                    <div className="grid gap-2"><Label>Target Audience</Label>
                      <div className="flex items-center gap-2">
                        <Select value={editScriptAgeStart !== '' ? String(editScriptAgeStart) : undefined} onValueChange={(val) => setEditScriptAgeStart(val ? Number(val) : '')}>
                          <SelectTrigger><SelectValue placeholder="Start Age" /></SelectTrigger>
                          <SelectContent>{ageOptions.map(age => <SelectItem key={age} value={String(age)}>{age}</SelectItem>)}</SelectContent>
                        </Select>
                        <span>-</span>
                        <Select value={editScriptAgeEnd !== '' ? String(editScriptAgeEnd) : undefined} onValueChange={(val) => setEditScriptAgeEnd(val ? Number(val) : '')}>
                          <SelectTrigger><SelectValue placeholder="End Age" /></SelectTrigger>
                          <SelectContent>{ageOptions.map(age => <SelectItem key={age} value={String(age)}>{age}</SelectItem>)}</SelectContent>
                        </Select>
                        <Select value={editScriptGender} onValueChange={(value: ProjectScript['demographicsGender']) => setEditScriptGender(value)}>
                          <SelectTrigger><SelectValue placeholder="Gender" /></SelectTrigger>
                          <SelectContent><SelectItem value="All">All</SelectItem><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem></SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button type="submit">Save Changes</Button>
                  </form>
                </DialogContent>
              </Dialog>
              <AlertDialog>
                <AlertDialogTrigger asChild><Button variant="destructive" size="sm"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete "{script.title}" and all its integration slots. This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                  <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDeleteScript}>Delete</AlertDialogAction></AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Integration Slots</h2>
        <Dialog open={isSlotDialogOpen} onOpenChange={(isOpen) => { setIsSlotDialogOpen(isOpen); if (!isOpen) resetSlotForm(); }}>
          <DialogTrigger asChild><Button><PlusCircle className="mr-2 h-4 w-4" /> Tag New Slot</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editingSlot ? 'Edit' : 'Tag New'} Integration Slot</DialogTitle><DialogDescription>Define a new opportunity for sponsorship in your script.</DialogDescription></DialogHeader>
            <form onSubmit={handleSlotSubmit} className="grid gap-4 py-4">
              <div className="grid gap-2"><Label htmlFor="sceneRef">Scene Reference</Label><Input id="sceneRef" value={sceneRef} onChange={(e) => setSceneRef(e.target.value)} required /></div>
              <div className="grid gap-2"><Label htmlFor="description">Description</Label><Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} required /></div>
              <div className="grid gap-2"><Label htmlFor="constraints">Constraints (Optional)</Label><Input id="constraints" value={constraints} onChange={(e) => setConstraints(e.target.value)} /></div>
              <div className="grid gap-2"><Label htmlFor="pricingFloor">Pricing Floor ($)</Label><Input id="pricingFloor" type="number" value={pricingFloor} onChange={(e) => setPricingFloor(e.target.value === '' ? '' : Number(e.target.value))} required /></div>
              <div className="grid gap-2"><Label htmlFor="modality">Modality</Label><Select value={modality} onValueChange={(value: IntegrationSlot['modality']) => setModality(value)}><SelectTrigger><SelectValue placeholder="Select modality" /></SelectTrigger><SelectContent><SelectItem value="Private Auction">Private Auction</SelectItem><SelectItem value="PG/Reservation">PG/Reservation</SelectItem></SelectContent></Select></div>
              <div className="flex justify-between items-center gap-2 pt-2">
                <Button type="submit" className="flex-1">{editingSlot ? 'Save Changes' : 'Add Slot'}</Button>
                <Button type="button" variant="outline" onClick={handleAiAssist} disabled={isAiLoading} className="flex-1">
                  {isAiLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Bot className="mr-2 h-4 w-4" />}
                  AI Assist
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {slots.length === 0 ? (
        <p>No integration slots tagged yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {slots.map((slot) => (
            <Card key={slot.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2"><Tag className="h-5 w-5 text-green-500" />{slot.scene_ref || slot.sceneRef}</span>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => {
                       setEditingSlot(slot);
                       setSceneRef(slot.scene_ref || slot.sceneRef || '');
                       setDescription(slot.description || '');
                       setConstraints(slot.constraints || '');
                       setPricingFloor(slot.pricing_floor || slot.pricingFloor || '');
                       setModality(slot.modality);
                       setIsSlotDialogOpen(true);
                    }}><Edit className="h-4 w-4" /></Button>
                  </div>
                </CardTitle>
                <CardDescription>{slot.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow pt-4">
                <p className="text-sm"><strong>Pricing Floor:</strong> ${(slot.pricing_floor || slot.pricingFloor || 0).toLocaleString()}</p>
                <p className="text-sm"><strong>Modality:</strong> {slot.modality}</p>
                <p className="text-sm"><strong>Status:</strong> <span className={slot.status === 'Available' ? 'text-green-600' : 'text-gray-600'}>{slot.status}</span></p>
                <p className="text-sm"><strong>Visibility:</strong> {slot.visibility}</p>
                <h3 className="text-md font-semibold mt-4 mb-2">Bids for this Slot:</h3>
                {bids.filter(bid => bid.slotId === slot.id).length === 0 ? (
                  <p className="text-sm text-gray-500">No bids yet.</p>
                ) : (
                  <div className="space-y-2">
                    {bids.filter(bid => bid.slotId === slot.id).map(bid => (
                      <div key={bid.id} className={`p-3 rounded-md border-l-4 ${getBidStatusStyle(bid.status).borderColor} bg-background`}>
                        <p className="font-semibold text-sm">From: {usersMap.get(bid.counterpartyId || bid.counterparty_id || '') || 'Unknown Advertiser'}</p>
                        <p className="text-sm">Terms: {bid.amountTerms || bid.amount_terms}</p>
                        <p className={`text-sm font-bold ${getBidStatusStyle(bid.status).textColor}`}>Status: {bid.status}</p>
                        {bid.status === 'Pending' && (
                          <div className="flex gap-2 mt-2">
                            <Button size="sm" onClick={() => handleAcceptBid(bid)}><CheckCircle className="mr-1 h-4 w-4" /> Accept</Button>
                            <Button variant="destructive" size="sm" onClick={() => handleDeclineBid(bid.id)}><XCircle className="mr-1 h-4 w-4" /> Decline</Button>
                          </div>
                        )}
                        {bid.status === 'AwaitingFinalApproval' && (
                           <Link to={`/deals/${bid.id}`}>
                             <Button variant="outline" size="sm" className="mt-2 w-full"><MessageSquare className="mr-2 h-4 w-4" /> View Discussion</Button>
                           </Link>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ScriptDetailPage;