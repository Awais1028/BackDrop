import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { ProjectScript } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { FileText, PlusCircle } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { Link } from 'react-router-dom';

const MyScriptsPage = () => {
  const { user } = useAuth();
  const [scripts, setScripts] = useState<ProjectScript[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form state
  const [newScriptTitle, setNewScriptTitle] = useState('');
  const [newScriptDocLink, setNewScriptDocLink] = useState('');
  const [newScriptProductionWindow, setNewScriptProductionWindow] = useState('');
  const [newScriptBudgetTarget, setNewScriptBudgetTarget] = useState<number | ''>('');
  const [newScriptAgeStart, setNewScriptAgeStart] = useState<number | ''>('');
  const [newScriptAgeEnd, setNewScriptAgeEnd] = useState<number | ''>('');
  const [newScriptGender, setNewScriptGender] = useState<ProjectScript['demographicsGender'] | ''>('');

  const ageOptions = Array.from({ length: 101 }, (_, i) => i);

  useEffect(() => {
    if (user) {
      const storedScripts = JSON.parse(localStorage.getItem('projectScripts') || '[]') as ProjectScript[];
      const filteredScripts = storedScripts.filter(script => script.creatorId === user.id);
      setScripts(filteredScripts);
    } else {
      setScripts([]);
    }
  }, [user]);

  const resetForm = () => {
    setNewScriptTitle('');
    setNewScriptDocLink('');
    setNewScriptProductionWindow('');
    setNewScriptBudgetTarget('');
    setNewScriptAgeStart('');
    setNewScriptAgeEnd('');
    setNewScriptGender('');
  };

  const handleAddScript = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showError('You must be logged in to add a script.');
      return;
    }
    if (!newScriptTitle || !newScriptDocLink || !newScriptProductionWindow) {
      showError('Please fill in all required fields.');
      return;
    }

    const newScript: ProjectScript = {
      id: uuidv4(),
      title: newScriptTitle,
      creatorId: user.id,
      docLink: newScriptDocLink,
      productionWindow: newScriptProductionWindow,
      budgetTarget: newScriptBudgetTarget === '' ? undefined : Number(newScriptBudgetTarget),
      demographicsAgeStart: newScriptAgeStart === '' ? undefined : Number(newScriptAgeStart),
      demographicsAgeEnd: newScriptAgeEnd === '' ? undefined : Number(newScriptAgeEnd),
      demographicsGender: newScriptGender === '' ? undefined : newScriptGender,
      createdDate: new Date().toISOString(),
      lastModifiedDate: new Date().toISOString(),
    };

    const allScripts = JSON.parse(localStorage.getItem('projectScripts') || '[]') as ProjectScript[];
    allScripts.push(newScript);
    localStorage.setItem('projectScripts', JSON.stringify(allScripts));

    setScripts(prev => [...prev, newScript]);
    showSuccess('Script added successfully!');
    setIsDialogOpen(false);
    resetForm();
  };

  const formatAudience = (script: ProjectScript) => {
    const age = script.demographicsAgeStart != null && script.demographicsAgeEnd != null ? `${script.demographicsAgeStart}-${script.demographicsAgeEnd}` : '';
    const gender = script.demographicsGender || '';
    if (age && gender) return `${age}, ${gender}`;
    return age || gender || 'N/A';
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Scripts</h1>
        <Dialog open={isDialogOpen} onOpenChange={(isOpen) => { setIsDialogOpen(isOpen); if (!isOpen) resetForm(); }}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Upload New Script
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Upload New Script</DialogTitle>
              <DialogDescription>Enter the details for your new script.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddScript} className="grid gap-4 py-4">
              <div className="grid gap-2"><Label htmlFor="title">Title</Label><Input id="title" value={newScriptTitle} onChange={(e) => setNewScriptTitle(e.target.value)} required /></div>
              <div className="grid gap-2"><Label htmlFor="docLink">Document Link</Label><Input id="docLink" value={newScriptDocLink} onChange={(e) => setNewScriptDocLink(e.target.value)} required /></div>
              <div className="grid gap-2"><Label htmlFor="productionWindow">Production Window</Label><Input id="productionWindow" value={newScriptProductionWindow} onChange={(e) => setNewScriptProductionWindow(e.target.value)} placeholder="e.g., Q4 2024" required /></div>
              <div className="grid gap-2"><Label htmlFor="budgetTarget">Budget Target ($)</Label><Input id="budgetTarget" type="number" value={newScriptBudgetTarget} onChange={(e) => setNewScriptBudgetTarget(e.target.value === '' ? '' : Number(e.target.value))} /></div>
              <div className="grid gap-2"><Label>Target Audience (Optional)</Label>
                <div className="flex items-center gap-2">
                  <Select value={newScriptAgeStart !== '' ? String(newScriptAgeStart) : undefined} onValueChange={(val) => setNewScriptAgeStart(val ? Number(val) : '')}>
                    <SelectTrigger><SelectValue placeholder="Start Age" /></SelectTrigger>
                    <SelectContent>{ageOptions.map(age => <SelectItem key={age} value={String(age)}>{age}</SelectItem>)}</SelectContent>
                  </Select>
                  <span>-</span>
                  <Select value={newScriptAgeEnd !== '' ? String(newScriptAgeEnd) : undefined} onValueChange={(val) => setNewScriptAgeEnd(val ? Number(val) : '')}>
                    <SelectTrigger><SelectValue placeholder="End Age" /></SelectTrigger>
                    <SelectContent>{ageOptions.map(age => <SelectItem key={age} value={String(age)}>{age}</SelectItem>)}</SelectContent>
                  </Select>
                  <Select value={newScriptGender} onValueChange={(value: ProjectScript['demographicsGender']) => setNewScriptGender(value)}>
                    <SelectTrigger><SelectValue placeholder="Gender" /></SelectTrigger>
                    <SelectContent><SelectItem value="All">All</SelectItem><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem></SelectContent>
                  </Select>
                </div>
              </div>
              <Button type="submit">Add Script</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {scripts.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[60vh] bg-gray-100 dark:bg-gray-800 rounded-lg p-6">
          <FileText className="h-16 w-16 text-gray-400 mb-4" />
          <p className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No scripts uploaded yet.</p>
          <p className="text-md text-gray-500 dark:text-gray-400">Click "Upload New Script" to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {scripts.map((script) => (
            <Card key={script.id} className="cursor-pointer hover:shadow-lg transition-shadow">
              <Link to={`/creator/scripts/${script.id}`} className="block">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-blue-500" />{script.title}</CardTitle>
                  <CardDescription>Production: {script.productionWindow}{script.budgetTarget && ` | Budget: $${script.budgetTarget.toLocaleString()}`}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Audience: {formatAudience(script)}</p>
                  <span className="text-blue-500 hover:underline text-sm">View Details</span>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyScriptsPage;