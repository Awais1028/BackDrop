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
import { ProjectScript, IntegrationSlot, BidReservation, FinancingCommitment, User, Comment } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { FileText, PlusCircle, Tag, Edit, Trash2, Bot, CheckCircle, XCircle, MessageSquare, ArrowLeft, Loader2 } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
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

  useEffect(() => {
    if (!user || !scriptId) {
      navigate('/login');
      return;
    }

    const allUsers = JSON.parse(localStorage.getItem('users') || '[]') as User[];
    const uMap = new Map<string, string>();
    allUsers.forEach(u => uMap.set(u.id, u.name));
    setUsersMap(uMap);

    const allScripts = JSON.parse(localStorage.getItem('projectScripts') || '[]') as ProjectScript[];
    const foundScript = allScripts.find(s => s.id === scriptId);

    if (foundScript && foundScript.creatorId === user.id) {
      setScript(foundScript);
      setEditScriptTitle(foundScript.title);
      setEditScriptProductionWindow(foundScript.productionWindow);
      setEditScriptBudgetTarget(foundScript.budgetTarget || '');

      const allSlots = JSON.parse(localStorage.getItem('integrationSlots') || '[]') as IntegrationSlot[];
      const scriptSlots = allSlots.filter(slot => slot.projectId === scriptId);
      setSlots(scriptSlots);

      const slotIds = scriptSlots.map(s => s.id);
      const allBids = JSON.parse(localStorage.getItem('bidReservations') || '[]') as BidReservation[];
      setBids(allBids.filter(bid => slotIds.includes(bid.slotId)));
    } else {
      showError("Script not found or you don't have permission to view it.");
      navigate('/creator/scripts');
    }
  }, [scriptId, user, navigate]);

  const resetSlotForm = () => {
    setSceneRef('');
    setDescription('');
    setConstraints('');
    setPricingFloor('');
    setModality('');
    setEditingSlot(null);
  };

  const handleSlotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!script || !sceneRef || !description || pricingFloor === '' || !modality) {
      showError('Please fill in all required slot fields.');
      return;
    }

    const allSlots = JSON.parse(localStorage.getItem('integrationSlots') || '[]') as IntegrationSlot[];

    if (editingSlot) {
      const updatedSlot = { ...editingSlot, sceneRef, description, constraints, pricingFloor: Number(pricingFloor), modality: modality as IntegrationSlot['modality'], lastModifiedDate: new Date().toISOString() };
      const updatedSlots = allSlots.map(s => s.id === editingSlot.id ? updatedSlot : s);
      localStorage.setItem('integrationSlots', JSON.stringify(updatedSlots));
      setSlots(updatedSlots.filter(s => s.projectId === scriptId));
      showSuccess('Slot updated successfully!');
    } else {
      const newSlot: IntegrationSlot = { id: uuidv4(), projectId: script.id, sceneRef, description, constraints, pricingFloor: Number(pricingFloor), modality: modality as IntegrationSlot['modality'], status: 'Available', visibility: 'Public', createdDate: new Date().toISOString(), lastModifiedDate: new Date().toISOString() };
      allSlots.push(newSlot);
      localStorage.setItem('integrationSlots', JSON.stringify(allSlots));
      setSlots(prev => [...prev, newSlot]);
      showSuccess('Slot added successfully!');
    }

    setIsSlotDialogOpen(false);
    resetSlotForm();
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

  const handleAcceptBid = (bid: BidReservation) => {
    // ... (logic remains the same)
  };

  const handleDeclineBid = (bidId: string) => {
    const allBids = JSON.parse(localStorage.getItem('bidReservations') || '[]') as BidReservation[];
    const updatedBids = allBids.map(b => b.id === bidId ? { ...b, status: 'Declined' as const, lastModifiedDate: new Date().toISOString() } : b);
    localStorage.setItem('bidReservations', JSON.stringify(updatedBids));
    setBids(prev => prev.map(b => b.id === bidId ? { ...b, status: 'Declined' as const } : b));
    showSuccess('Bid declined.');
  };

  const handleEditScriptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!script) return;
    const updatedScript = { ...script, title: editScriptTitle, productionWindow: editScriptProductionWindow, budgetTarget: editScriptBudgetTarget === '' ? undefined : Number(editScriptBudgetTarget), lastModifiedDate: new Date().toISOString() };
    const allScripts = JSON.parse(localStorage.getItem('projectScripts') || '[]') as ProjectScript[];
    const updatedScripts = allScripts.map(s => s.id === script.id ? updatedScript : s);
    localStorage.setItem('projectScripts', JSON.stringify(updatedScripts));
    setScript(updatedScript);
    showSuccess('Script updated successfully!');
    setIsEditScriptDialogOpen(false);
  };

  const handleDeleteScript = () => {
    if (!script) return;
    const allScripts = JSON.parse(localStorage.getItem('projectScripts') || '[]') as ProjectScript[];
    const updatedScripts = allScripts.filter(s => s.id !== script.id);
    localStorage.setItem('projectScripts', JSON.stringify(updatedScripts));

    const allSlots = JSON.parse(localStorage.getItem('integrationSlots') || '[]') as IntegrationSlot[];
    const updatedSlots = allSlots.filter(s => s.projectId !== script.id);
    localStorage.setItem('integrationSlots', JSON.stringify(updatedSlots));

    showSuccess('Script and all associated slots deleted.');
    navigate('/creator/scripts');
  };

  const getBidStatusStyle = (status: BidReservation['status']) => {
    // ... (logic remains the same)
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
              <CardTitle className="flex items-center gap-2 text-2xl">
                <FileText className="h-6 w-6 text-blue-500" />
                {script.title}
              </CardTitle>
              <CardDescription>
                Production: {script.productionWindow}
                {script.budgetTarget && ` | Budget: $${script.budgetTarget.toLocaleString()}`}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Dialog open={isEditScriptDialogOpen} onOpenChange={setIsEditScriptDialogOpen}>
                <DialogTrigger asChild><Button variant="outline" size="sm"><Edit className="h-4 w-4" /></Button></DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Edit Script Details</DialogTitle></DialogHeader>
                  <form onSubmit={handleEditScriptSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2"><Label htmlFor="editTitle">Title</Label><Input id="editTitle" value={editScriptTitle} onChange={(e) => setEditScriptTitle(e.target.value)} required /></div>
                    <div className="grid gap-2"><Label htmlFor="editProdWindow">Production Window</Label><Input id="editProdWindow" value={editScriptProductionWindow} onChange={(e) => setEditScriptProductionWindow(e.target.value)} required /></div>
                    <div className="grid gap-2"><Label htmlFor="editBudget">Budget Target</Label><Input id="editBudget" type="number" value={editScriptBudgetTarget} onChange={(e) => setEditScriptBudgetTarget(e.target.value === '' ? '' : Number(e.target.value))} /></div>
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
                  <span className="flex items-center gap-2"><Tag className="h-5 w-5 text-green-500" />{slot.sceneRef}</span>
                </CardTitle>
                <CardDescription>{slot.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm"><strong>Pricing Floor:</strong> ${slot.pricingFloor.toLocaleString()}</p>
                <p className="text-sm"><strong>Modality:</strong> {slot.modality}</p>
                <p className="text-sm"><strong>Status:</strong> {slot.status}</p>
                <h3 className="text-md font-semibold mt-4 mb-2">Bids for this Slot:</h3>
                {bids.filter(bid => bid.slotId === slot.id).length === 0 ? (
                  <p className="text-sm text-gray-500">No bids yet.</p>
                ) : (
                  <div className="space-y-2">
                    {bids.filter(bid => bid.slotId === slot.id).map(bid => (
                      <div key={bid.id} className={`p-3 rounded-md border-l-4 ${getBidStatusStyle(bid.status).borderColor} bg-background`}>
                        <p className="font-semibold text-sm">From: {usersMap.get(bid.counterpartyId) || 'Unknown'}</p>
                        <p className="text-sm">Terms: {bid.amountTerms}</p>
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