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
import { FileText, PlusCircle, Tag, Edit, Trash2, Bot, CheckCircle, XCircle, MessageSquare } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';

const ScriptDetailPage = () => {
  const { scriptId } = useParams<{ scriptId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [script, setScript] = useState<ProjectScript | null>(null);
  const [slots, setSlots] = useState<IntegrationSlot[]>([]);
  const [bids, setBids] = useState<BidReservation[]>([]);
  const [usersMap, setUsersMap] = useState<Map<string, string>>(new Map());
  // ... other states

  useEffect(() => {
    // ... useEffect logic remains the same
  }, [scriptId, user, navigate]);

  // ... other handlers like handleAddSlot, handleDeleteScript, etc.

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
      b.id === bid.id ? { ...b, status: 'AwaitingFinalApproval' as const, comments: [initialComment], lastModifiedDate: new Date().toISOString() } : b
    );

    const allSlots = JSON.parse(localStorage.getItem('integrationSlots') || '[]') as IntegrationSlot[];
    const updatedSlots = allSlots.map(s =>
      s.id === bid.slotId ? { ...s, status: 'Locked' as const, lastModifiedDate: new Date().toISOString() } : s
    );
    
    localStorage.setItem('bidReservations', JSON.stringify(updatedBids));
    localStorage.setItem('integrationSlots', JSON.stringify(updatedSlots));
    
    // This part is simplified. A real app would not create the commitment until final approval.
    // For the prototype, we create it now.
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
    // Refresh state
    setBids(updatedBids.filter(b => slots.some(s => s.id === b.slotId)));
    setSlots(updatedSlots);
  };

  // ... other handlers

  const getBidStatusStyle = (status: BidReservation['status']) => {
    switch (status) {
      case 'Pending': return { textColor: 'text-yellow-600 dark:text-yellow-400', borderColor: 'border-yellow-500' };
      case 'Accepted':
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
      {/* ... Script Header and Details ... */}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {slots.map((slot) => (
          <Card key={slot.id} className="hover:shadow-lg transition-shadow">
            {/* ... Slot Header and Details ... */}
            <CardContent>
              {/* ... Slot Info ... */}
              <h3 className="text-lg font-semibold mt-4 mb-2">Bids for this Slot:</h3>
              {bids.filter(bid => bid.slotId === slot.id).length === 0 ? (
                <p className="text-sm text-gray-500">No bids yet for this slot.</p>
              ) : (
                <div className="space-y-3">
                  {bids.filter(bid => bid.slotId === slot.id).map(bid => (
                    <Card key={bid.id} className={`p-3 bg-slate-800 dark:bg-slate-900 text-slate-50 rounded-md border-l-4 shadow-sm ${getBidStatusStyle(bid.status).borderColor}`}>
                      <CardTitle className="text-base">Bid from {usersMap.get(bid.counterpartyId) || 'Unknown'}</CardTitle>
                      <CardContent className="p-0 mt-2 text-sm">
                        <p><strong>Terms:</strong> {bid.amountTerms}</p>
                        <p className={`font-semibold ${getBidStatusStyle(bid.status).textColor}`}>Status: {bid.status}</p>
                        {bid.status === 'Pending' && (
                          <div className="flex gap-2 mt-3">
                            <Button size="sm" onClick={() => handleAcceptBid(bid)}><CheckCircle className="mr-1 h-4 w-4" /> Accept</Button>
                            <Button variant="secondary" size="sm" /* onClick={() => handleDeclineBid(bid)} */><XCircle className="mr-1 h-4 w-4" /> Decline</Button>
                          </div>
                        )}
                        {bid.status === 'AwaitingFinalApproval' && (
                           <Link to={`/buyer/deals/${bid.id}`} className="w-full">
                             <Button variant="outline" size="sm" className="mt-2 w-full text-white"><MessageSquare className="mr-2 h-4 w-4" /> View Discussion</Button>
                           </Link>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ScriptDetailPage;