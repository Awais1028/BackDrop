import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ProjectScript, IntegrationSlot, User } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Users, Search } from 'lucide-react';

const ITEMS_PER_PAGE = 5;

const InventoryPage = () => {
  const { user, role } = useAuth();
  const navigate = useNavigate();

  const [scripts, setScripts] = useState<ProjectScript[]>([]);
  const [slots, setSlots] = useState<IntegrationSlot[]>([]);
  const [usersMap, setUsersMap] = useState<Map<string, string>>(new Map());

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date-desc');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!user || role !== 'Operator') {
      navigate('/login');
      return;
    }

    const allScripts = JSON.parse(localStorage.getItem('projectScripts') || '[]') as ProjectScript[];
    const allSlots = JSON.parse(localStorage.getItem('integrationSlots') || '[]') as IntegrationSlot[];
    const allUsers = JSON.parse(localStorage.getItem('users') || '[]') as User[];

    setScripts(allScripts);
    setSlots(allSlots);

    const map = new Map<string, string>();
    allUsers.forEach(u => map.set(u.id, u.name));
    setUsersMap(map);
  }, [user, role, navigate]);

  const processedScripts = useMemo(() => {
    let filtered = scripts.filter(script =>
      script.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (usersMap.get(script.creatorId) || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'title-asc': return a.title.localeCompare(b.title);
        case 'title-desc': return b.title.localeCompare(a.title);
        case 'date-asc': return new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime();
        case 'date-desc':
        default:
          return new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime();
      }
    });

    return filtered;
  }, [scripts, searchTerm, sortBy, usersMap]);

  const pageCount = Math.ceil(processedScripts.length / ITEMS_PER_PAGE);
  const paginatedScripts = processedScripts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const getStatusVariant = (status: IntegrationSlot['status']) => {
    switch (status) {
      case 'Available': return 'default';
      case 'Locked': return 'secondary';
      case 'Completed': return 'outline';
      default: return 'destructive';
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <Users className="h-7 w-7 text-blue-500" /> Marketplace Inventory
      </h1>

      <Card className="mb-6">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search by script title or creator..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset to first page on search
              }}
            />
          </div>
          <div className="w-full md:w-48">
            <Select value={sortBy} onValueChange={(value) => {
              setSortBy(value);
              setCurrentPage(1); // Reset to first page on sort
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc">Newest First</SelectItem>
                <SelectItem value="date-asc">Oldest First</SelectItem>
                <SelectItem value="title-asc">Title (A-Z)</SelectItem>
                <SelectItem value="title-desc">Title (Z-A)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {paginatedScripts.length === 0 ? (
        <p className="text-center text-gray-500 py-10">No scripts match your criteria.</p>
      ) : (
        <>
          <Accordion type="single" collapsible className="w-full">
            {paginatedScripts.map(script => {
              const scriptSlots = slots.filter(slot => slot.projectId === script.id);
              return (
                <AccordionItem value={script.id} key={script.id}>
                  <AccordionTrigger>
                    <div className="flex justify-between w-full pr-4">
                      <span>{script.title}</span>
                      <span className="text-sm text-gray-500">
                        Creator: {usersMap.get(script.creatorId) || 'Unknown'}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    {scriptSlots.length === 0 ? (
                      <p className="text-sm text-gray-500 px-4 py-2">No integration slots tagged for this script.</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-2">
                        {scriptSlots.map(slot => (
                          <Card key={slot.id}>
                            <CardHeader>
                              <CardTitle className="flex justify-between items-center">
                                {slot.sceneRef}
                                <Badge variant={getStatusVariant(slot.status)}>{slot.status}</Badge>
                              </CardTitle>
                              <CardDescription>{slot.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <p className="text-sm"><strong>Pricing Floor:</strong> ${slot.pricingFloor.toLocaleString()}</p>
                              <p className="text-sm"><strong>Modality:</strong> {slot.modality}</p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>

          {pageCount > 1 && (
            <Pagination className="mt-6">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage(prev => Math.max(1, prev - 1));
                    }}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
                <PaginationItem>
                  <span className="px-4 py-2 text-sm">
                    Page {currentPage} of {pageCount}
                  </span>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage(prev => Math.min(pageCount, prev + 1));
                    }}
                    className={currentPage === pageCount ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}
    </div>
  );
};

export default InventoryPage;