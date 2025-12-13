import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { ProjectScript, IntegrationSlot } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { FileText, PlusCircle, Tag, Edit, Trash2, Bot } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';

const ScriptDetailPage = () => {
  const { scriptId } = useParams<{ scriptId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [script, setScript] = useState<ProjectScript | null>(null);
  const [slots, setSlots] = useState<IntegrationSlot[]>([]);
  const [isSlotDialogOpen, setIsSlotDialogOpen] = useState(false);
  const [isEditScriptDialogOpen, setIsEditScriptDialogOpen] = useState(false);

  // New slot form state
  const [newSlotSceneRef, setNewSlotSceneRef] = useState('');
  const [newSlotDescription, setNewSlotDescription] = useState('');
  const [newSlotConstraints, setNewSlotConstraints] = useState('');
  const [newSlotPricingFloor, setNewSlotPricingFloor] = useState<number | ''>('');
  const [newSlotModality, setNewSlotModality] = useState<IntegrationSlot['modality'] | ''>('');

  // Edit script form state
  const [editScriptTitle, setEditScriptTitle] = useState('');
  const [editScriptDocLink, setEditScriptDocLink] = useState('');
  const [editScriptProductionWindow, setEditScriptProductionWindow] = useState('');
  const [editScriptBudgetTarget, setEditScriptBudgetTarget] = useState<number | ''>('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const storedScripts = JSON.parse(localStorage.getItem('projectScripts') || '[]') as ProjectScript[];
    const foundScript = storedScripts.find(s => s.id === scriptId && s.creatorId === user.id);

    if (foundScript) {
      setScript(foundScript);
      const storedSlots = JSON.parse(localStorage.getItem('integrationSlots') || '[]') as IntegrationSlot[];
      setSlots(storedSlots.filter(slot => slot.projectId === foundScript.id));

      // Initialize edit script form state
      setEditScriptTitle(foundScript.title);
      setEditScriptDocLink(foundScript.docLink);
      setEditScriptProductionWindow(foundScript.productionWindow);
      setEditScriptBudgetTarget(foundScript.budgetTarget ?? '');
    } else {
      showError('Script not found or you do not have access.');
      navigate('/creator/scripts');
    }
  }, [scriptId, user, navigate]);

  const handleAddSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!script || !user) {
      showError('Script not loaded or user not authenticated.');
      return;
    }
    if (!newSlotSceneRef || !newSlotDescription || !newSlotPricingFloor || !newSlotModality) {
      showError('Please fill in all required slot fields.');
      return;
    }

    const newSlot: IntegrationSlot = {
      id: uuidv4(),
      projectId: script.id,
      sceneRef: newSlotSceneRef,
      description: newSlotDescription,
      constraints: newSlotConstraints,
      pricingFloor: Number(newSlotPricingFloor),
      modality: newSlotModality as IntegrationSlot['modality'],
      status: 'Available', // Default status
      createdDate: new Date().toISOString(),
      lastModifiedDate: new Date().toISOString(),
    };

    const allSlots = JSON.parse(localStorage.getItem('integrationSlots') || '[]') as IntegrationSlot[];
    allSlots.push(newSlot);
    localStorage.setItem('integrationSlots', JSON.stringify(allSlots));

    setSlots(prev => [...prev, newSlot]);
    showSuccess('Integration slot added successfully!');
    setIsSlotDialogOpen(false);
    // Reset form
    setNewSlotSceneRef('');
    setNewSlotDescription('');
    setNewSlotConstraints('');
    setNewSlotPricingFloor('');
    setNewSlotModality('');
  };

  const handleEditScript = (e: React.FormEvent) => {
    e.preventDefault();
    if (!script || !user) {
      showError('Script not loaded or user not authenticated.');
      return;
    }
    if (!editScriptTitle || !editScriptDocLink || !editScriptProductionWindow) {
      showError('Please fill in all required script fields.');
      return;
    }

    const updatedScript: ProjectScript = {
      ...script,
      title: editScriptTitle,
      docLink: editScriptDocLink,
      productionWindow: editScriptProductionWindow,
      budgetTarget: editScriptBudgetTarget === '' ? undefined : Number(editScriptBudgetTarget),
      lastModifiedDate: new Date().toISOString(),
    };

    const allScripts = JSON.parse(localStorage.getItem('projectScripts') || '[]') as ProjectScript[];
    const updatedScripts = allScripts.map(s => s.id === script.id ? updatedScript : s);
    localStorage.setItem('projectScripts', JSON.stringify(updatedScripts));

    setScript(updatedScript);
    showSuccess('Script updated successfully!');
    setIsEditScriptDialogOpen(false);
  };

  const handleDeleteScript = () => {
    if (!script || !user) {
      showError('Script not loaded or user not authenticated.');
      return;
    }

    if (window.confirm(`Are you sure you want to delete the script "${script.title}"? This will also delete all associated integration slots.`)) {
      const allScripts = JSON.parse(localStorage.getItem('projectScripts') || '[]') as ProjectScript[];
      const filteredScripts = allScripts.filter(s => s.id !== script.id);
      localStorage.setItem('projectScripts', JSON.stringify(filteredScripts));

      const allSlots = JSON.parse(localStorage.getItem('integrationSlots') || '[]') as IntegrationSlot[];
      const filteredSlots = allSlots.filter(s => s.projectId !== script.id);
      localStorage.setItem('integrationSlots', JSON.stringify(filteredSlots));

      showSuccess('Script and all associated slots deleted successfully!');
      navigate('/creator/scripts');
    }
  };

  const handleDeleteSlot = (slotId: string, slotDescription: string) => {
    if (window.confirm(`Are you sure you want to delete the integration slot "${slotDescription}"?`)) {
      const allSlots = JSON.parse(localStorage.getItem('integrationSlots') || '[]') as IntegrationSlot[];
      const filteredSlots = allSlots.filter(s => s.id !== slotId);
      localStorage.setItem('integrationSlots', JSON.stringify(filteredSlots));
      setSlots(filteredSlots);
      showSuccess('Integration slot deleted successfully!');
    }
  };

  const handleAISuggestions = () => {
    showSuccess('AI is analyzing your script for suggestions... (This is a prototype placeholder)');
    // In a real application, this would trigger an API call to an LLM
  };

  if (!script) {
    return <div className="text-center text-gray-500 dark:text-gray-400">Loading script details...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FileText className="h-7 w-7 text-blue-500" /> {script.title}
        </h1>
        <div className="flex gap-2">
          <Dialog open={isEditScriptDialogOpen} onOpenChange={setIsEditScriptDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Edit className="mr-2 h-4 w-4" /> Edit Script
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Edit Script Details</DialogTitle>
                <DialogDescription>
                  Update the information for your script.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleEditScript} className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="editTitle">Title</Label>
                  <Input
                    id="editTitle"
                    value={editScriptTitle}
                    onChange={(e) => setEditScriptTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="editDocLink">Document Link (e.g., PDF URL)</Label>
                  <Input
                    id="editDocLink"
                    value={editScriptDocLink}
                    onChange={(e) => setEditScriptDocLink(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="editProductionWindow">Production Window</Label>
                  <Input
                    id="editProductionWindow"
                    value={editScriptProductionWindow}
                    onChange={(e) => setEditScriptProductionWindow(e.target.value)}
                    placeholder="e.g., Q4 2024 - Q1 2025"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="editBudgetTarget">Budget Target (Optional)</Label>
                  <Input
                    id="editBudgetTarget"
                    type="number"
                    value={editScriptBudgetTarget}
                    onChange={(e) => setEditScriptBudgetTarget(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="e.g., 100000"
                  />
                </div>
                <Button type="submit">Save Changes</Button>
              </form>
            </DialogContent>
          </Dialog>
          <Button variant="destructive" size="sm" onClick={handleDeleteScript}>
            <Trash2 className="mr-2 h-4 w-4" /> Delete Script
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Script Overview</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <p><strong>Production Window:</strong> {script.productionWindow}</p>
          {script.budgetTarget && <p><strong>Budget Target:</strong> ${script.budgetTarget.toLocaleString()}</p>}
          <p><strong>Document:</strong> <a href={script.docLink} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{script.docLink}</a></p>
          <p className="text-sm text-gray-500">Last Updated: {new Date(script.lastModifiedDate).toLocaleString()}</p>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Integration Slots</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleAISuggestions}>
            <Bot className="mr-2 h-4 w-4" /> Get AI Suggestions
          </Button>
          <Dialog open={isSlotDialogOpen} onOpenChange={setIsSlotDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" /> Tag New Slot
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Tag New Integration Slot</DialogTitle>
                <DialogDescription>
                  Define a new opportunity within your script.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddSlot} className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="sceneRef">Scene Reference</Label>
                  <Input
                    id="sceneRef"
                    value={newSlotSceneRef}
                    onChange={(e) => setNewSlotSceneRef(e.target.value)}
                    placeholder="e.g., Kitchen Scene #2 (Page 12)"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newSlotDescription}
                    onChange={(e) => setNewSlotDescription(e.target.value)}
                    placeholder="Briefly describe the integration opportunity (e.g., 'Character uses a specific brand of coffee machine')."
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="constraints">Constraints (e.g., Brand Suitability, Product Categories)</Label>
                  <Input
                    id="constraints"
                    value={newSlotConstraints}
                    onChange={(e) => setNewSlotConstraints(e.target.value)}
                    placeholder="e.g., 'No alcohol, luxury goods only'"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="pricingFloor">Pricing Floor ($)</Label>
                  <Input
                    id="pricingFloor"
                    type="number"
                    value={newSlotPricingFloor}
                    onChange={(e) => setNewSlotPricingFloor(e.target.value === '' ? '' : Number(e.target.value))}
                    required
                    min="0"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="modality">Modality</Label>
                  <Select value={newSlotModality} onValueChange={(value: IntegrationSlot['modality']) => setNewSlotModality(value)}>
                    <SelectTrigger id="modality">
                      <SelectValue placeholder="Select modality" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Private Auction">Private Auction</SelectItem>
                      <SelectItem value="PG/Reservation">PG/Reservation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit">Add Slot</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {slots.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400">No integration slots tagged yet. Tag a new one or get AI suggestions!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {slots.map((slot) => (
            <Card key={slot.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5 text-green-500" />
                  {slot.sceneRef}
                </CardTitle>
                <CardDescription>{slot.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  <strong>Modality:</strong> {slot.modality}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  <strong>Pricing Floor:</strong> ${slot.pricingFloor.toLocaleString()}
                </p>
                {slot.constraints && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <strong>Constraints:</strong> {slot.constraints}
                  </p>
                )}
                <div className="flex gap-2 mt-2">
                  {/* Future: Add Edit Slot functionality */}
                  <Button variant="outline" size="sm" onClick={() => showSuccess('Edit slot functionality coming soon!')}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDeleteSlot(slot.id, slot.description)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ScriptDetailPage;