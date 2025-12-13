import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ProjectScript, IntegrationSlot, User } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';

const InventoryPage = () => {
  const { user, role } = useAuth();
  const navigate = useNavigate();

  const [scripts, setScripts] = useState<ProjectScript[]>([]);
  const [slots, setSlots] = useState<IntegrationSlot[]>([]);
  const [usersMap, setUsersMap] = useState<Map<string, string>>(new Map());

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

      {scripts.length === 0 ? (
        <p className="text-center text-gray-500">No scripts have been uploaded to the marketplace yet.</p>
      ) : (
        <Accordion type="single" collapsible className="w-full">
          {scripts.map(script => {
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
      )}
    </div>
  );
};

export default InventoryPage;