import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { BidReservation, IntegrationSlot, User } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Settings } from 'lucide-react';

const WorkflowMonitoringPage = () => {
  const { user, role } = useAuth();
  const navigate = useNavigate();

  const [bids, setBids] = useState<BidReservation[]>([]);
  const [usersMap, setUsersMap] = useState<Map<string, string>>(new Map());
  const [slotsMap, setSlotsMap] = useState<Map<string, IntegrationSlot>>(new Map());

  useEffect(() => {
    if (!user || role !== 'Operator') {
      navigate('/login');
      return;
    }

    const allBids = JSON.parse(localStorage.getItem('bidReservations') || '[]') as BidReservation[];
    const allUsers = JSON.parse(localStorage.getItem('users') || '[]') as User[];
    const allSlots = JSON.parse(localStorage.getItem('integrationSlots') || '[]') as IntegrationSlot[];

    setBids(allBids.sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()));

    const uMap = new Map<string, string>();
    allUsers.forEach(u => uMap.set(u.id, u.name));
    setUsersMap(uMap);

    const sMap = new Map<string, IntegrationSlot>();
    allSlots.forEach(s => sMap.set(s.id, s));
    setSlotsMap(sMap);
  }, [user, role, navigate]);

  const getStatusVariant = (status: BidReservation['status']) => {
    switch (status) {
      case 'Pending': return 'default';
      case 'Accepted': return 'secondary';
      case 'Committed': return 'outline';
      case 'Declined':
      case 'Cancelled': return 'destructive';
      default: return 'destructive';
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <Settings className="h-7 w-7 text-green-500" /> Workflow Monitoring
      </h1>

      <Card>
        <CardHeader>
          <CardTitle>All Bids & Reservations</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Slot</TableHead>
                <TableHead>Counterparty</TableHead>
                <TableHead>Terms</TableHead>
                <TableHead>Date Submitted</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bids.map(bid => (
                <TableRow key={bid.id}>
                  <TableCell>{slotsMap.get(bid.slotId)?.sceneRef || 'Unknown Slot'}</TableCell>
                  <TableCell>{usersMap.get(bid.counterpartyId) || 'Unknown User'}</TableCell>
                  <TableCell>{bid.amountTerms}</TableCell>
                  <TableCell>{new Date(bid.createdDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(bid.status)}>{bid.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkflowMonitoringPage;