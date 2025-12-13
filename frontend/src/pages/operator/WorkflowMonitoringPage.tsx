import React, 'useState', useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { BidReservation, IntegrationSlot, User } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Settings, Search, ArrowUpDown } from 'lucide-react';

type SortKey = 'slot' | 'counterparty' | 'amountTerms' | 'createdDate' | 'status';
type SortDirection = 'asc' | 'desc';

const ITEMS_PER_PAGE = 15;

const WorkflowMonitoringPage = () => {
  const { user, role } = useAuth();
  const navigate = useNavigate();

  const [bids, setBids] = useState<BidReservation[]>([]);
  const [usersMap, setUsersMap] = useState<Map<string, string>>(new Map());
  const [slotsMap, setSlotsMap] = useState<Map<string, IntegrationSlot>>(new Map());

  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection }>({ key: 'createdDate', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!user || role !== 'Operator') {
      navigate('/login');
      return;
    }

    const allBids = JSON.parse(localStorage.getItem('bidReservations') || '[]') as BidReservation[];
    const allUsers = JSON.parse(localStorage.getItem('users') || '[]') as User[];
    const allSlots = JSON.parse(localStorage.getItem('integrationSlots') || '[]') as IntegrationSlot[];

    setBids(allBids);

    const uMap = new Map<string, string>();
    allUsers.forEach(u => uMap.set(u.id, u.name));
    setUsersMap(uMap);

    const sMap = new Map<string, IntegrationSlot>();
    allSlots.forEach(s => sMap.set(s.id, s));
    setSlotsMap(sMap);
  }, [user, role, navigate]);

  const processedBids = useMemo(() => {
    let filteredBids = bids.filter(bid => {
      const slotName = slotsMap.get(bid.slotId)?.sceneRef || '';
      const counterpartyName = usersMap.get(bid.counterpartyId) || '';
      const searchLower = searchTerm.toLowerCase();

      return (
        slotName.toLowerCase().includes(searchLower) ||
        counterpartyName.toLowerCase().includes(searchLower) ||
        bid.amountTerms.toLowerCase().includes(searchLower) ||
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

  const getValue = (bid: BidReservation, key: SortKey) => {
    switch (key) {
      case 'slot': return slotsMap.get(bid.slotId)?.sceneRef || '';
      case 'counterparty': return usersMap.get(bid.counterpartyId) || '';
      case 'amountTerms': return parseFloat(bid.amountTerms.replace(/[^0-9.-]+/g, "")) || 0;
      case 'createdDate': return new Date(bid.createdDate).getTime();
      case 'status': return bid.status;
    }
  };

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
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedBids.map(bid => (
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
  );
};

export default WorkflowMonitoringPage;