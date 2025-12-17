import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { ProjectScript } from '@/types';
import { FileText, PlusCircle } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { Link } from 'react-router-dom';
import { api } from '@/api/client';

const MyScriptsPage = () => {
  const { user } = useAuth();
  const [scripts, setScripts] = useState<ProjectScript[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [newScriptTitle, setNewScriptTitle] = useState('');
  const [newScriptFile, setNewScriptFile] = useState<File | null>(null);
  const [newScriptProductionWindow, setNewScriptProductionWindow] = useState('');
  const [newScriptBudgetTarget, setNewScriptBudgetTarget] = useState<number | ''>('');
  const [newScriptAgeStart, setNewScriptAgeStart] = useState<number | ''>('');
  const [newScriptAgeEnd, setNewScriptAgeEnd] = useState<number | ''>('');
  const [newScriptGender, setNewScriptGender] = useState<ProjectScript['demographicsGender'] | ''>('');

  const ageOptions = Array.from({ length: 101 }, (_, i) => i);

  useEffect(() => {
    const fetchScripts = async () => {
      try {
        const data = await api.get<ProjectScript[]>('/projects/');
        setScripts(data);
      } catch (error) {
        console.error("Failed to fetch scripts", error);
        // Fallback to local storage or empty if API fails (or for demo if backend not running)
        // For now, let's assume API works or we show empty.
      }
    };

    if (user) {
      fetchScripts();
    } else {
      setScripts([]);
    }
  }, [user]);

  const resetForm = () => {
    setNewScriptTitle('');
    setNewScriptFile(null);
    setNewScriptProductionWindow('');
    setNewScriptBudgetTarget('');
    setNewScriptAgeStart('');
    setNewScriptAgeEnd('');
    setNewScriptGender('');
  };

  const handleAddScript = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showError('You must be logged in to add a script.');
      return;
    }
    if (!newScriptTitle || !newScriptFile || !newScriptProductionWindow) {
      showError('Please fill in all required fields and upload a file.');
      return;
    }

    setIsLoading(true);

    const metadata = {
      title: newScriptTitle,
      production_window: newScriptProductionWindow,
      budget_target: newScriptBudgetTarget === '' ? 0 : Number(newScriptBudgetTarget),
      demographics: {
        ageStart: newScriptAgeStart === '' ? 0 : Number(newScriptAgeStart),
        ageEnd: newScriptAgeEnd === '' ? 100 : Number(newScriptAgeEnd),
        gender: newScriptGender || 'All'
      }
    };

    const formData = new FormData();
    formData.append('file', newScriptFile);
    formData.append('metadata', JSON.stringify(metadata));

    try {
      const newScript = await api.post<ProjectScript>('/projects/', formData);
      setScripts(prev => [...prev, newScript]);
      showSuccess('Script added successfully!');
      setIsDialogOpen(false);
      resetForm();
    } catch (error: any) {
      showError(error.message || 'Failed to create project');
    } finally {
      setIsLoading(false);
    }
  };

  const formatAudience = (script: ProjectScript) => {
    const demographics = script.demographics;
    const ageStart = demographics?.ageStart ?? script.demographicsAgeStart;
    const ageEnd = demographics?.ageEnd ?? script.demographicsAgeEnd;
    const gender = demographics?.gender ?? script.demographicsGender ?? '';
    
    const age = ageStart != null && ageEnd != null ? `${ageStart}-${ageEnd}` : '';
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
              <div className="grid gap-2">
                <Label htmlFor="scriptFile">Script File (PDF)</Label>
                <Input
                  id="scriptFile"
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setNewScriptFile(e.target.files ? e.target.files[0] : null)}
                  required
                />
              </div>
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
              <Button type="submit" disabled={isLoading}>{isLoading ? 'Uploading...' : 'Add Script'}</Button>
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
                  <CardDescription>
                    Production: {script.productionWindow || script.production_window}
                    {(script.budgetTarget || script.budget_target) && ` | Budget: $${(script.budgetTarget || script.budget_target || 0).toLocaleString()}`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Audience: {formatAudience(script)}
                  </p>
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