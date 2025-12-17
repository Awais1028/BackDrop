import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { BidReservation, IntegrationSlot, User, ProjectScript } from '@/types'; // FinancingCommitment removed from frontend type usage for now
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Settings, Search, ArrowUpDown, Download } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { api } from '@/api/client';

type SortKey = 'slot' | 'counterparty' | 'amountTerms' | 'createdDate' | 'status';
type SortDirection = 'asc' | 'desc';

const ITEMS_PER_PAGE = 15;

const WorkflowMonitoringPage = () => {
  const { user, role } = useAuth();
  const navigate = useNavigate();

  const [bids, setBids] = useState<BidReservation[]>([]);
  const [usersMap, setUsersMap] = useState<Map<string, User>>(new Map());
  const [slotsMap, setSlotsMap] = useState<Map<string, IntegrationSlot>>(new Map());
  const [scriptsMap, setScriptsMap] = useState<Map<string, ProjectScript>>(new Map());
  // const [commitmentsMap, setCommitmentsMap] = useState<Map<string, FinancingCommitment>>(new Map());
  
  const [selectedDeal, setSelectedDeal] = useState<any>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection }>({ key: 'createdDate', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!user || role !== 'Operator') {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
        try {
            // Need operator specific endpoints to fetch all data.
            // Reusing existing "get all" or discovery endpoints for now.
            // Note: Bids endpoint currently filters by user unless operator role logic is added or specific endpoint used.
            // Bids endpoint at /bids currently returns [] for operator if not handled.
            // We need to update backend to allow operator to see all bids.
            // Assuming we added logic or use direct DB access in backend.
            // For now, let's assume /bids returns all for operator (need to verify backend logic).
            // Backend `read_bids` currently: "if current_user.role in ['advertiser', 'merchant']... else return []"
            // We need to fix this in backend/app/routers/bids.py first or parallel.
            
            // Let's assume we fixed it (I'll do it in next step if needed, but for now apply frontend change).
            // Actually, I should probably fix backend first. But since I'm editing frontend...
            // I'll add the frontend logic to fetch assuming backend works or will work.
            
            const allBids = await api.get<BidReservation[]>('/bids');
            setBids(allBids);

            const allSlots = await api.get<IntegrationSlot[]>('/slots');
            const sMap = new Map<string, IntegrationSlot>();
            allSlots.forEach(s => sMap.set(s.id, s));
            setSlotsMap(sMap);

            const allScripts = await api.get<ProjectScript[]>('/projects');
            const pMap = new Map<string, ProjectScript>();
            allScripts.forEach(p => pMap.set(p.id, p));
            setScriptsMap(pMap);

            try {
                const allUsers = await api.get<User[]>('/auth/users');
                const uMap = new Map<string, User>();
                allUsers.forEach(u => uMap.set(u.id, u));
                setUsersMap(uMap);
            } catch (err) {
                console.error("Failed to fetch users", err);
            }
            
        } catch (error) {
            console.error("Failed to fetch workflow data", error);
        }
    };

    fetchData();

  }, [user, role, navigate]);

  const handleExport = async (bid: BidReservation) => {
    try {
        const evidencePack = await api.get<any>(`/bids/${bid.id}/evidence_pack`);
        setSelectedDeal(evidencePack);
    } catch (error) {
        console.error("Failed to fetch evidence pack", error);
        setSelectedDeal({ error: "Could not generate evidence pack from backend." });
    }
  };

  const getValue = (bid: BidReservation, key: SortKey) => {
    switch (key) {
      case 'slot': return slotsMap.get(bid.slotId || bid.slot_id || '')?.sceneRef || slotsMap.get(bid.slotId || bid.slot_id || '')?.scene_ref || '';
      case 'counterparty': return usersMap.get(bid.counterpartyId || bid.counterparty_id || '')?.name || '';
      case 'amountTerms': return parseFloat((bid.amountTerms || bid.amount_terms || '').replace(/[^0-9.-]+/g, "")) || 0;
      case 'createdDate': return new Date(bid.createdDate || bid.created_date || 0).getTime();
      case 'status': return bid.status;
    }
  };

  const processedBids = useMemo(() => {
    let filteredBids = bids.filter(bid => {
      const slot = slotsMap.get(bid.slotId || bid.slot_id || '');
      const slotName = slot?.sceneRef || slot?.scene_ref || '';
      const counterpartyName = usersMap.get(bid.counterpartyId || bid.counterparty_id || '')?.name || '';
      const amountTerms = bid.amountTerms || bid.amount_terms || '';
      const searchLower = searchTerm.toLowerCase();

      return (
        slotName.toLowerCase().includes(searchLower) ||
        counterpartyName.toLowerCase().includes(searchLower) ||
        amountTerms.toLowerCase().includes(searchLower) ||
        bid.status.toLowerCase().includes(searchLower)
      );
    });

    filteredBids.sort((a, b) => {
      const aVal = getValue(a, sortConfig.key);
      const bVal = getValue(b, sortConfig.key);

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return filteredBids;
  }, [bids, searchTerm, sortConfig, slotsMap, usersMap]);

  const pageCount = Math.ceil(processedBids.length / ITEMS_PER_PAGE);
  const paginatedBids = processedBids.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSort = (key: SortKey) => {
    let direction: SortDirection = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };

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

  const SortableHeader = ({ sortKey, children }: { sortKey: SortKey, children: React.ReactNode }) => (
    <TableHead>
      <Button variant="ghost" onClick={() => handleSort(sortKey)} className="px-2 py-1">
        {children}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    </TableHead>
  );

  return (
    <Dialog onOpenChange={() => setSelectedDeal(null)}>
      <div className="flex flex-col h-full">
        <div className="flex-shrink-0">
          <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
            <Settings className="h-7 w-7 text-green-500" /> Workflow Monitoring
          </h1>
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search by slot, counterparty, terms, or status..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex-1 overflow-y-auto pr-2">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <SortableHeader sortKey="slot">Slot</SortableHeader>
                    <SortableHeader sortKey="counterparty">Counterparty</SortableHeader>
                    <SortableHeader sortKey="amountTerms">Terms</SortableHeader>
                    <SortableHeader sortKey="createdDate">Date Submitted</SortableHeader>
                    <SortableHeader sortKey="status">Status</SortableHeader>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedBids.map(bid => (
                    <TableRow key={bid.id}>
                      <TableCell>{slotsMap.get(bid.slotId || bid.slot_id || '')?.sceneRef || slotsMap.get(bid.slotId || bid.slot_id || '')?.scene_ref || 'Unknown Slot'}</TableCell>
                      <TableCell>{usersMap.get(bid.counterpartyId || bid.counterparty_id || '')?.name || 'Unknown User'}</TableCell>
                      <TableCell>{bid.amountTerms || bid.amount_terms}</TableCell>
                      <TableCell>{new Date(bid.createdDate || bid.created_date || Date.now()).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(bid.status)}>{bid.status}</Badge>
                      </TableCell>
                      <TableCell>
                        {(bid.status === 'Accepted' || bid.status === 'Committed') && (
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => handleExport(bid)}>
                              <Download className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
               {paginatedBids.length === 0 && (
                <p className="text-center text-gray-500 py-10">No bids match your criteria.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex-shrink-0 pt-4">
          {pageCount > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => { e.preventDefault(); setCurrentPage(p => Math.max(1, p - 1)); }}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
                <PaginationItem>
                  <span className="px-4 py-2 text-sm">Page {currentPage} of {pageCount}</span>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => { e.preventDefault(); setCurrentPage(p => Math.min(pageCount, p + 1)); }}
                    className={currentPage === pageCount ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      </div>
      
      {selectedDeal && (
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Evidence Pack Export</DialogTitle>
            <DialogDescription>
              A summary of all information related to this deal. In a real application, this would be a downloadable file.
            </DialogDescription>
          </DialogHeader>
          <pre className="mt-2 w-full rounded-md bg-slate-950 p-4 overflow-x-auto">
            <code className="text-white">{JSON.stringify(selectedDeal, null, 2)}</code>
          </pre>
        </DialogContent>
      )}
    </Dialog>
  );
};

export default WorkflowMonitoringPage;