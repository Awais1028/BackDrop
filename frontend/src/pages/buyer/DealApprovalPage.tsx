import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { BidReservation, IntegrationSlot, ProjectScript, User, Comment } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Send, CheckCircle, ShieldCheck, UserCheck } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { v4 as uuidv4 } from 'uuid';

const DealApprovalPage = () => {
  const { bidId } = useParams<{ bidId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [bid, setBid] = useState<BidReservation | null>(null);
  const [slot, setSlot] = useState<IntegrationSlot | null>(null);
  const [script, setScript] = useState<ProjectScript | null>(null);
  const [usersMap, setUsersMap] = useState<Map<string, User>>(new Map());
  const [newComment, setNewComment] = useState('');
  const [creator, setCreator] = useState<User | null>(null);

  useEffect(() => {
    if (!user || !bidId) {
      navigate('/login');
      return;
    }

    const allUsers = JSON.parse(localStorage.getItem('users') || '[]') as User[];
    const uMap = new Map<string, User>();
    allUsers.forEach(u => uMap.set(u.id, u));
    setUsersMap(uMap);

    const allBids = JSON.parse(localStorage.getItem('bidReservations') || '[]') as BidReservation[];
    const foundBid = allBids.find(b => b.id === bidId);
    
    if (foundBid) {
        const allSlots = JSON.parse(localStorage.getItem('integrationSlots') || '[]') as IntegrationSlot[];
        const foundSlot = allSlots.find(s => s.id === foundBid.slotId);
        
        if (foundSlot) {
            const allScripts = JSON.parse(localStorage.getItem('projectScripts') || '[]') as ProjectScript[];
            const foundScript = allScripts.find(s => s.id === foundSlot.projectId);
            
            if (foundScript) {
                // Security check: ensure current user is part of this deal
                if (user.id === foundScript.creatorId || user.id === foundBid.counterpartyId) {
                    setBid(foundBid);
                    setSlot(foundSlot);
                    setScript(foundScript);
                    setCreator(uMap.get(foundScript.creatorId) || null);
                } else {
                    showError('You do not have permission to view this deal.');
                    navigate('/');
                }
            }
        }
    } else {
      showError('Deal not found.');
      navigate(-1);
    }
  }, [bidId, user, navigate]);

  const handleAddComment = () => {
    if (!user || !bid || !newComment.trim()) return;

    const comment: Comment = {
      id: uuidv4(),
      authorId: user.id,
      text: newComment,
      timestamp: new Date().toISOString(),
    };

    const updatedBid = { ...bid, comments: [...bid.comments, comment] };
    
    const allBids = JSON.parse(localStorage.getItem('bidReservations') || '[]') as BidReservation[];
    const updatedBids = allBids.map(b => b.id === bid.id ? updatedBid : b);
    localStorage.setItem('bidReservations', JSON.stringify(updatedBids));

    setBid(updatedBid);
    setNewComment('');
    showSuccess('Comment added.');
  };

  const handleFinalApproval = () => {
    if (!user || !bid || !script) return;

    let updatedBid = { ...bid };
    const isCreator = user.id === script.creatorId;

    if (isCreator && !bid.creatorFinalApproval) {
      updatedBid.creatorFinalApproval = true;
      showSuccess('Your final approval has been recorded.');
    } else if (!isCreator && !bid.buyerFinalApproval) {
      updatedBid.buyerFinalApproval = true;
      showSuccess('Your final approval has been recorded.');
    } else {
      showError('You have already approved this deal.');
      return;
    }

    // Check if both parties have now approved
    if (updatedBid.creatorFinalApproval && updatedBid.buyerFinalApproval) {
      updatedBid.status = 'Committed';
      showSuccess('Deal committed! Both parties have given final approval.');
    }

    const allBids = JSON.parse(localStorage.getItem('bidReservations') || '[]') as BidReservation[];
    const updatedBids = allBids.map(b => b.id === bid.id ? updatedBid : b);
    localStorage.setItem('bidReservations', JSON.stringify(updatedBids));
    setBid(updatedBid);
  };

  if (!bid || !slot || !script || !creator) return <div>Loading deal...</div>;

  const buyer = usersMap.get(bid.counterpartyId);
  const isCurrentUserCreator = user?.id === creator.id;
  const canCurrentUserApprove = (isCurrentUserCreator && !bid.creatorFinalApproval) || (!isCurrentUserCreator && !bid.buyerFinalApproval);

  return (
    <div className="container mx-auto p-4">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Deal Discussion & Approval</CardTitle>
              <CardDescription>Finalize the details for the integration in "{slot.sceneRef}".</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 h-96 overflow-y-auto p-4 border rounded-md">
                {bid.comments.map(comment => {
                  const author = usersMap.get(comment.authorId);
                  return (
                    <div key={comment.id} className="flex items-start gap-3">
                      <Avatar>
                        <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${author?.name}`} />
                        <AvatarFallback>{author?.name.substring(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{author?.name} <span className="text-xs text-muted-foreground ml-2">{new Date(comment.timestamp).toLocaleString()}</span></p>
                        <p className="text-sm">{comment.text}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              {bid.status === 'AwaitingFinalApproval' && (
                <div className="mt-4">
                  <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment or ask a question..."
                    className="mb-2"
                  />
                  <Button onClick={handleAddComment}><Send className="mr-2 h-4 w-4" /> Send</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Deal Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p><strong>Script:</strong> {script.title}</p>
              <p><strong>Creator:</strong> {creator?.name}</p>
              <p><strong>Buyer:</strong> {buyer?.name}</p>
              <p><strong>Terms:</strong> {bid.amountTerms}</p>
              <p><strong>Status:</strong> <span className="font-semibold">{bid.status}</span></p>
              
              {bid.status === 'AwaitingFinalApproval' && (
                <div className="mt-4 pt-4 border-t">
                  <h4 className="font-semibold mb-2">Approval Status</h4>
                  <div className="flex items-center gap-2 mb-2">
                    {bid.creatorFinalApproval ? <UserCheck className="h-5 w-5 text-green-500" /> : <UserCheck className="h-5 w-5 text-muted-foreground" />}
                    <span>{creator.name} (Creator)</span>
                  </div>
                  <div className="flex items-center gap-2 mb-4">
                    {bid.buyerFinalApproval ? <ShieldCheck className="h-5 w-5 text-green-500" /> : <ShieldCheck className="h-5 w-5 text-muted-foreground" />}
                    <span>{buyer?.name} (Buyer)</span>
                  </div>
                  {canCurrentUserApprove && (
                    <Button className="w-full" onClick={handleFinalApproval}>
                      <CheckCircle className="mr-2 h-4 w-4" /> Give Final Approval
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DealApprovalPage;