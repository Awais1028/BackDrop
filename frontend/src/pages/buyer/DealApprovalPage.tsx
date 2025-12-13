import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { BidReservation, IntegrationSlot, ProjectScript, User, Comment } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Send, CheckCircle } from 'lucide-react';
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

    if (!foundBid || (foundBid.counterpartyId !== user.id && usersMap.get(foundBid.counterpartyId)?.role !== 'Creator')) {
       // Logic to ensure only participants can view
       // This is simplified; a real app would check creatorId on the script
       // For now, we'll assume if you're not the buyer, you must be the creator.
    }
    
    if (foundBid) {
        setBid(foundBid);
        const allSlots = JSON.parse(localStorage.getItem('integrationSlots') || '[]') as IntegrationSlot[];
        const foundSlot = allSlots.find(s => s.id === foundBid.slotId);
        setSlot(foundSlot || null);

        if (foundSlot) {
            const allScripts = JSON.parse(localStorage.getItem('projectScripts') || '[]') as ProjectScript[];
            const foundScript = allScripts.find(s => s.id === foundSlot.projectId);
            setScript(foundScript || null);
        }
    } else {
      showError('Deal not found.');
      navigate('/buyer/bids');
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
    if (!user || !bid || user.id !== bid.counterpartyId) return;

    const finalComment: Comment = {
      id: uuidv4(),
      authorId: user.id,
      text: 'This deal has been formally approved and committed.',
      timestamp: new Date().toISOString(),
    };

    const updatedBid = { 
        ...bid, 
        status: 'Committed' as const,
        comments: [...bid.comments, finalComment],
        lastModifiedDate: new Date().toISOString()
    };

    const allBids = JSON.parse(localStorage.getItem('bidReservations') || '[]') as BidReservation[];
    const updatedBids = allBids.map(b => b.id === bid.id ? updatedBid : b);
    localStorage.setItem('bidReservations', JSON.stringify(updatedBids));

    setBid(updatedBid);
    showSuccess('Deal Approved & Committed!');
    navigate('/buyer/bids');
  };

  if (!bid || !slot || !script) return <div>Loading deal...</div>;

  const creator = usersMap.get(script.creatorId);

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
              <p><strong>Terms:</strong> {bid.amountTerms}</p>
              <p><strong>Flight Window:</strong> {bid.flightWindow}</p>
              <p><strong>Status:</strong> <span className="font-semibold">{bid.status}</span></p>
              {bid.status === 'AwaitingFinalApproval' && user.id === bid.counterpartyId && (
                <Button className="w-full mt-4" onClick={handleFinalApproval}>
                  <CheckCircle className="mr-2 h-4 w-4" /> Final Approval & Commit
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DealApprovalPage;