import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { ProjectScript } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { FileText, PlusCircle } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { Link } from 'react-router-dom'; // Import Link

const MyScriptsPage = () => {
  const { user } = useAuth();
  const [scripts, setScripts] = useState<ProjectScript[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [newScriptTitle, setNewScriptTitle] = useState('');
  const [newScriptDocLink, setNewScriptDocLink] = useState('');
  const [newScriptProductionWindow, setNewScriptProductionWindow] = useState('');
  const [newScriptBudgetTarget, setNewScriptBudgetTarget] = useState<number | ''>('');

  useEffect(() => {
    if (user) {
      const storedScripts = JSON.parse(localStorage.getItem('projectScripts') || '[]') as ProjectScript[];
      setScripts(storedScripts.filter(script => script.creatorId === user.id));
    }
  }, [user]);

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
      createdDate: new Date().toISOString(),
      lastModifiedDate: new Date().toISOString(),
    };

    const allScripts = JSON.parse(localStorage.getItem('projectScripts') || '[]') as ProjectScript[];
    allScripts.push(newScript);
    localStorage.setItem('projectScripts', JSON.stringify(allScripts));

    setScripts(prev => [...prev, newScript]);
    showSuccess('Script added successfully!');
    setIsDialogOpen(false);
    setNewScriptTitle('');
    setNewScriptDocLink('');
    setNewScriptProductionWindow('');
    setNewScriptBudgetTarget('');
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Scripts</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Upload New Script
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Upload New Script</DialogTitle>
              <DialogDescription>
                Enter the details for your new script.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddScript} className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newScriptTitle}
                  onChange={(e) => setNewScriptTitle(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="docLink">Document Link (e.g., PDF URL)</Label>
                <Input
                  id="docLink"
                  value={newScriptDocLink}
                  onChange={(e) => setNewScriptDocLink(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="productionWindow">Production Window</Label>
                <Input
                  id="productionWindow"
                  value={newScriptProductionWindow}
                  onChange={(e) => setNewScriptProductionWindow(e.target.value)}
                  placeholder="e.g., Q4 2024 - Q1 2025"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="budgetTarget">Budget Target (Optional)</Label>
                <Input
                  id="budgetTarget"
                  type="number"
                  value={newScriptBudgetTarget}
                  onChange={(e) => setNewScriptBudgetTarget(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="e.g., 100000"
                />
              </div>
              <Button type="submit">Add Script</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {scripts.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400">No scripts uploaded yet. Click "Upload New Script" to get started!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {scripts.map((script) => (
            <Card key={script.id} className="cursor-pointer hover:shadow-lg transition-shadow">
              <Link to={`/creator/scripts/${script.id}`} className="block">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-500" />
                    {script.title}
                  </CardTitle>
                  <CardDescription>
                    Production: {script.productionWindow}
                    {script.budgetTarget && ` | Budget: $${script.budgetTarget.toLocaleString()}`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Uploaded: {new Date(script.createdDate).toLocaleDateString()}
                  </p>
                  <span className="text-blue-500 hover:underline text-sm">
                    View Details
                  </span>
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