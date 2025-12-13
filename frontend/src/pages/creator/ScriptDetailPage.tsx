import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { ProjectScript, IntegrationSlot, BidReservation, FinancingCommitment, User, Comment } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { FileText, PlusCircle, Tag, Edit, Trash2, Bot, CheckCircle, XCircle, MessageSquare, ArrowLeft } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';

const ScriptDetailPage = () => {
  const { scriptId } = useParams<{ scriptId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [script, setScript] = useState<ProjectScript | null>(null);
  const [slots, setSlots] = useState<IntegrationSlot[]>([]);
  const [bids, setBids] = useState<BidReservation[]>([]);
  const [usersMap, setUsersMap] = useState<Map<string, string>>(new Map());
  
  const [isSlotDialogOpen, setIsSlotDialogOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<IntegrationSlot | null>(null);

  // Form state
  const [sceneRef, setSceneRef] = useState('');
  const [description, setDescription] = useState('');
  const [constraints, setConstraints] = useState('');
  const [pricingFloor, setPricingFloor] = useState<number | ''>('');
  const [modality, setModality] = useState<IntegrationSlot['modality'] | ''>('');

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

  const resetForm = () => {
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
      // Update existing slot
      const updatedSlot = { 
        ...editingSlot, 
        sceneRef, 
        description, 
        constraints, 
        pricingFloor: Number(pricingFloor), 
        modality: modality as IntegrationSlot['modality'],
        lastModifiedDate: new Date().toISOString()
      };
      const updatedSlots = allSlots.map(s => s.id === editingSlot.id ? updatedSlot : s);
      localStorage.setItem('integrationSlots', JSON.stringify(updatedSlots));
      setSlots(updatedSlots.filter(s => s.projectId === scriptId));
      showSuccess('Slot updated successfully!');
    } else {
      // Add new slot
      const newSlot: IntegrationSlot = {
        id: uuidv4(),
        projectId: script.id,
        sceneRef,
        description,
        constraints,
        pricingFloor: Number(pricingFloor),
        modality: modality as IntegrationSlot['modality'],
        status: 'Available',
        visibility: 'Public',
        createdDate: new Date().toISOString(),
        lastModifiedDate: new Date().toISOString(),
      };
      allSlots.push(newSlot);
      localStorage.setItem('integrationSlots', JSON.stringify(allSlots));
      setSlots(prev => [...prev, newSlot]);
      showSuccess('Slot added successfully!');
    }

    setIsSlotDialogOpen(false);
    resetForm();
  };
  
  const handleAcceptBid = (bid: BidReservation) => {
    if (!user || !script) return;

    const initialComment: Comment = {
      id: uuidv4(),
      authorId: user.id,
      text: `Deal accepted! Let's finalize the integration details here.`,
      timestamp: new Date().toISOString(),
    };

    const allBids = JSON.parse(localStorage.getItem('bidReservations') || '[]') as BidReservation[];
    const updatedBids = allBids.map(b =>
      b.id === bid.id ? { 
        ...b, 
        status: 'AwaitingFinalApproval' as const, 
        comments: [initialComment], 
        creatorFinalApproval: false, // Initialize flags
        buyerFinalApproval: false,
        lastModifiedDate: new Date().toISOString() 
      } : b
    );

    const allSlots = JSON.parse(localStorage.getItem('integrationSlots') || '[]') as IntegrationSlot[];
    const updatedSlots = allSlots.map(s =>
      s.id === bid.slotId ? { ...s, status: 'Locked' as const, lastModifiedDate: new Date().toISOString() } : s
    );
    
    localStorage.setItem('bidReservations', JSON.stringify(updatedBids));
    localStorage.setItem('integrationSlots', JSON.stringify(updatedSlots));
    
    const newCommitment: FinancingCommitment = {
      id: uuidv4(),
      slotId: bid.slotId,
      bidId: bid.id,
      counterpartyId: bid.counterpartyId,
      committedAmount: parseFloat(bid.amountTerms.replace(/[^0-9.-]+/g,"")) || 0,
      paidDeposit: false,
      schedule: 'Upon final approval',
      createdDate: new Date().toISOString(),
    };
    const allCommitments = JSON.parse(localStorage.getItem('financingCommitments') || '[]') as FinancingCommitment[];
    allCommitments.push(newCommitment);
    localStorage.setItem('financingCommitments', JSON.stringify(allCommitments));

    showSuccess('Bid accepted! The buyer has been notified to give final approval.');
    
    const scriptSlots = updatedSlots.filter(s => s.projectId === scriptId);
    const scriptSlotIds = scriptSlots.map(s => s.id);
    setSlots(scriptSlots);
    setBids(updatedBids.filter(b => scriptSlotIds.includes(b.slotId)));
  };

  const getBidStatusStyle = (status: BidReservation['status']) => {
    switch (status) {
      case 'Pending': return { textColor: 'text-yellow-600 dark:text-yellow-400', borderColor: 'border-yellow-500' };
      case 'AwaitingFinalApproval': return { textColor: 'text-green-600 dark:text-green-400', borderColor: 'border-green-500' };
      case 'Committed': return { textColor: 'text-blue-600 dark:text-blue-400', borderColor: 'border-blue-500' };
      case 'Declined':
      case 'Cancelled': return { textColor: 'text-red-600 dark:text-red-400', borderColor: 'border-red-500' };
      default: return { textColor: 'text-gray-600 dark:text-gray-400', borderColor: 'border-gray-500' };
    }
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
            <Dialog open={isSlotDialogOpen} onOpenChange={(isOpen) => { setIsSlotDialogOpen(isOpen); if (!isOpen) resetForm(); }}>
              <DialogTrigger asChild>
                <Button><PlusCircle className="mr-2 h-4 w-4" /> Tag New Slot</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingSlot ? 'Edit' : 'Tag New'} Integration Slot</DialogTitle>
                  <DialogDescription>Define a new opportunity for sponsorship in your script.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSlotSubmit} className="grid gap-4 py-4">
                  {/* Form fields */}
                  <Button type="submit">{editingSlot ? 'Save Changes' : 'Add Slot'}</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      <h2 className="text-2xl font-semibold mb-4">Integration Slots</h2>
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
                            <Button variant="destructive" size="sm"><XCircle className="mr-1 h-4 w-4" /> Decline</Button>
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