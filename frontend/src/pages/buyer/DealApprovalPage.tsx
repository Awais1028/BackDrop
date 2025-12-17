import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { BidReservation, IntegrationSlot, ProjectScript, User, Comment } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Send, CheckCircle, ShieldCheck, UserCheck, FileText } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
// import { v4 as uuidv4 } from 'uuid'; // Removed
import { api } from '@/api/client';

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

  const fetchDealData = useCallback(async () => {
    if (!user || !bidId) return;

    try {
        const fetchedBid = await api.get<BidReservation>(`/bids/${bidId}`);
        setBid(fetchedBid);

        const slotId = fetchedBid.slotId || fetchedBid.slot_id;
        if (!slotId) throw new Error("Slot ID missing from bid");
        const fetchedSlot = await api.get<IntegrationSlot>(`/slots/${slotId}`);
        setSlot(fetchedSlot);

        const projectId = fetchedSlot.projectId || fetchedSlot.project_id;
        if (!projectId) throw new Error("Project ID missing from slot");
        const fetchedScript = await api.get<ProjectScript>(`/projects/${projectId}`);
        setScript(fetchedScript);

        // Fetch users involved
        const uMap = new Map<string, User>();
        
        // Fetch Creator
        const creatorId = fetchedScript.creatorId || fetchedScript.creator_id;
        if (creatorId) {
            try {
                const fetchedCreator = await api.get<User>(`/auth/users/${creatorId}`);
                setCreator(fetchedCreator);
                uMap.set(creatorId, fetchedCreator);
            } catch (e) { console.error("Failed to fetch creator", e); }
        }

        // Fetch Buyer/Counterparty
        const counterpartyId = fetchedBid.counterpartyId || fetchedBid.counterparty_id;
        if (counterpartyId && counterpartyId !== creatorId) {
             try {
                const fetchedBuyer = await api.get<User>(`/auth/users/${counterpartyId}`);
                uMap.set(counterpartyId, fetchedBuyer);
            } catch (e) { console.error("Failed to fetch buyer", e); }
        }
        
        // Fetch authors of comments if not already fetched
        if (fetchedBid.comments) {
            for (const comment of fetchedBid.comments) {
                const authorId = comment.authorId || comment.author_id; // Handle backend naming
                if (authorId && !uMap.has(authorId)) {
                     try {
                        const fetchedAuthor = await api.get<User>(`/auth/users/${authorId}`);
                        uMap.set(authorId, fetchedAuthor);
                    } catch (e) { console.error("Failed to fetch comment author", e); }
                }
            }
        }

        setUsersMap(uMap);

    } catch (error) {
        console.error("Failed to fetch deal data", error);
        showError('Failed to load deal information.');
        // navigate(-1); // Optional: redirect back on error
    }
  }, [user, bidId]);

  useEffect(() => {
    if (!user || !bidId) {
      navigate('/login');
      return;
    }
    fetchDealData();
  }, [bidId, user, navigate, fetchDealData]);

  const handleAddComment = async () => {
    if (!user || !bid || !newComment.trim()) return;

    try {
        const updatedBid = await api.post<BidReservation>(`/bids/${bid.id}/comments`, { text: newComment });
        setBid(updatedBid);
        setNewComment('');
        showSuccess('Comment added.');
    } catch (error) {
        showError('Failed to add comment.');
    }
  };

  const handleDownloadDealMemo = async () => {
    if (!bidId) return;
    try {
        const memo = await api.get<any>(`/bids/${bidId}/deal_memo`);
        if (memo.download_link) {
             // For prototype, we might not have a real file, so let's just show success
             showSuccess(`Deal Memo accessed. Mock link: ${memo.download_link}`);
             // In real app: window.open(memo.download_link, '_blank');
        }
    } catch (error) {
        showError('Failed to access Deal Memo.');
    }
  };

  const handleFinalApproval = async () => {
    if (!user || !bid || !script) return;

    try {
        const updatedBid = await api.post<BidReservation>(`/bids/${bid.id}/approve`, {});
        setBid(updatedBid);
        
        if (updatedBid.status === 'Committed') {
             showSuccess('Deal committed! Both parties have given final approval.');
        } else {
             showSuccess('Your final approval has been recorded.');
        }
    } catch (error) {
        showError('Failed to record approval.');
    }
  };

  if (!bid || !slot || !script || !creator) return <div>Loading deal...</div>;

  const buyer = usersMap.get(bid.counterpartyId || bid.counterparty_id || '');
  const creatorId = script.creatorId || script.creator_id;
  const isCurrentUserCreator = user?.id === creatorId;
  const creatorApproved = bid.creatorFinalApproval || bid.creator_final_approval;
  const buyerApproved = bid.buyerFinalApproval || bid.buyer_final_approval;
  
  const canCurrentUserApprove = (isCurrentUserCreator && !creatorApproved) || (!isCurrentUserCreator && !buyerApproved);

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
                {(bid.comments || []).map(comment => {
                  const authorId = comment.authorId || comment.author_id; // Handle backend naming
                  const author = usersMap.get(authorId);
                  return (
                    <div key={comment.id} className="flex items-start gap-3">
                      <Avatar>
                        <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${author?.name}`} />
                        <AvatarFallback>{author?.name?.substring(0, 2) || '?'}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{author?.name || 'Unknown User'} <span className="text-xs text-muted-foreground ml-2">{new Date(comment.timestamp).toLocaleString()}</span></p>
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
              <p><strong>Terms:</strong> {bid.amountTerms || bid.amount_terms}</p>
              <p><strong>Status:</strong> <span className="font-semibold">{bid.status}</span></p>
              
              {(bid.status === 'AwaitingFinalApproval' || bid.status === 'Committed') && (
                <div className="mt-4 pt-4 border-t">
                  <h4 className="font-semibold mb-2">Approval Status</h4>
                  <div className="flex items-center gap-2 mb-2">
                    {creatorApproved ? <UserCheck className="h-5 w-5 text-green-500" /> : <UserCheck className="h-5 w-5 text-muted-foreground" />}
                    <span>{creator.name} (Creator)</span>
                  </div>
                  <div className="flex items-center gap-2 mb-4">
                    {buyerApproved ? <ShieldCheck className="h-5 w-5 text-green-500" /> : <ShieldCheck className="h-5 w-5 text-muted-foreground" />}
                    <span>{buyer?.name} (Buyer)</span>
                  </div>
                  {canCurrentUserApprove && (
                    <Button className="w-full" onClick={handleFinalApproval}>
                      <CheckCircle className="mr-2 h-4 w-4" /> Give Final Approval
                    </Button>
                  )}
                </div>
              )}
              
              {(bid.status === 'Accepted' || bid.status === 'AwaitingFinalApproval' || bid.status === 'Committed') && (
                  <div className="mt-4 pt-4 border-t">
                      <Button variant="outline" className="w-full" onClick={handleDownloadDealMemo}>
                          <FileText className="mr-2 h-4 w-4" /> Download Deal Memo
                      </Button>
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