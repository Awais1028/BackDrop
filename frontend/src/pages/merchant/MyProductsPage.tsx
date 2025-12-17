import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { SKU, User } from '@/types';
// import { v4 as uuidv4 } from 'uuid'; // Removed as backend generates IDs
import { Package, PlusCircle, Upload, Settings, Edit, Trash2 } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { useNavigate } from 'react-router-dom';
import Papa from 'papaparse';
import { api } from '@/api/client';
import { Checkbox } from '@/components/ui/checkbox';

interface SkuFormProps {
  skuTitle: string;
  setSkuTitle: (value: string) => void;
  skuPrice: number | '';
  setSkuPrice: (value: number | '') => void;
  skuMargin: number | '';
  setSkuMargin: (value: number | '') => void;
  skuTags: string;
  setSkuTags: (value: string) => void;
  skuImageUrl: string;
  setSkuImageUrl: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  buttonText: string;
}

const SkuForm = ({
  skuTitle, setSkuTitle,
  skuPrice, setSkuPrice,
  skuMargin, setSkuMargin,
  skuTags, setSkuTags,
  skuImageUrl, setSkuImageUrl,
  onSubmit, buttonText
}: SkuFormProps) => {
  return (
      <form onSubmit={onSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
              <Label htmlFor="title">SKU Title</Label>
              <Input id="title" value={skuTitle} onChange={(e) => setSkuTitle(e.target.value)} placeholder="e.g., Summer T-Shirt" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                  <Label htmlFor="price">Price ($)</Label>
                  <Input id="price" type="number" step="0.01" value={skuPrice} onChange={(e) => setSkuPrice(e.target.value === '' ? '' : Number(e.target.value))} required />
              </div>
              <div className="grid gap-2">
                  <Label htmlFor="margin">Margin (%)</Label>
                  <Input id="margin" type="number" min="0" max="100" value={skuMargin} onChange={(e) => setSkuMargin(e.target.value === '' ? '' : Number(e.target.value))} required />
              </div>
          </div>
          <div className="grid gap-2">
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <Input id="tags" value={skuTags} onChange={(e) => setSkuTags(e.target.value)} placeholder="clothing, summer, casual" />
          </div>
          <div className="grid gap-2">
              <Label htmlFor="imageUrl">Image Upload (Optional)</Label>
              <Input
                id="imageUrl"
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const formData = new FormData();
                    formData.append('file', file);
                    try {
                      const response = await api.post<{ url: string }>('/skus/upload-image', formData);
                      setSkuImageUrl(response.url);
                      showSuccess('Image uploaded successfully');
                    } catch (error) {
                      showError('Failed to upload image');
                    }
                  }
                }}
              />
              {skuImageUrl && (
                <div className="mt-2">
                  <img src={skuImageUrl} alt="Preview" className="h-20 w-20 object-cover rounded-md" />
                </div>
              )}
          </div>
          <DialogFooter>
              <Button type="submit">{buttonText}</Button>
          </DialogFooter>
      </form>
  );
};

const MyProductsPage = () => {
  const { user, role, updateCurrentUser } = useAuth();
  const navigate = useNavigate();

  const [skus, setSkus] = useState<SKU[]>([]);
  const [isAddSkuDialogOpen, setIsAddSkuDialogOpen] = useState(false);
  const [isEditSkuDialogOpen, setIsEditSkuDialogOpen] = useState(false);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [editingSku, setEditingSku] = useState<SKU | null>(null);
  const [selectedSkuIds, setSelectedSkuIds] = useState<Set<string>>(new Set());

  // Form state
  const [skuTitle, setSkuTitle] = useState('');
  const [skuPrice, setSkuPrice] = useState<number | ''>('');
  const [skuMargin, setSkuMargin] = useState<number | ''>('');
  const [skuTags, setSkuTags] = useState('');
  const [skuImageUrl, setSkuImageUrl] = useState('');

  // Merchant settings state
  const [minIntegrationFee, setMinIntegrationFee] = useState<number | ''>(user?.minIntegrationFee ?? '');
  const [eligibilityRules, setEligibilityRules] = useState(user?.eligibilityRules ?? '');
  const [suitabilityRules, setSuitabilityRules] = useState(user?.suitabilityRules ?? '');

  const fetchSkus = useCallback(async () => {
    try {
      const data = await api.get<SKU[]>('/skus');
      setSkus(data);
    } catch (error) {
      console.error("Failed to fetch SKUs", error);
    }
  }, []);

  useEffect(() => {
    if (!user || role !== 'Merchant') {
      navigate('/login');
      return;
    }
    fetchSkus();
    setMinIntegrationFee(user.minIntegrationFee ?? '');
    setEligibilityRules(user.eligibilityRules ?? '');
    setSuitabilityRules(user.suitabilityRules ?? '');
  }, [user, role, navigate, fetchSkus]);

  const resetForm = () => {
    setSkuTitle('');
    setSkuPrice('');
    setSkuMargin('');
    setSkuTags('');
    setSkuImageUrl('');
    setEditingSku(null);
  };

  const handleAddSku = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!skuTitle || skuPrice === '' || skuMargin === '') {
      showError('Please fill in all required SKU fields.');
      return;
    }
    try {
        const payload = {
            title: skuTitle,
            price: Number(skuPrice),
            margin: Number(skuMargin),
            tags: skuTags.split(',').map(tag => tag.trim()).filter(Boolean),
            imageUrl: skuImageUrl || undefined,
        };
        const createdSku = await api.post<SKU>('/skus', payload);
        setSkus(prev => [...prev, createdSku]);
        showSuccess('SKU added successfully!');
        setIsAddSkuDialogOpen(false);
        resetForm();
    } catch (error) {
        showError('Failed to create SKU.');
    }
  };

  const handleEditSku = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSku) return;
    try {
        const payload = {
            title: skuTitle,
            price: Number(skuPrice),
            margin: Number(skuMargin),
            tags: skuTags.split(',').map(tag => tag.trim()).filter(Boolean),
            imageUrl: skuImageUrl || undefined,
        };
        const updatedSku = await api.put<SKU>(`/skus/${editingSku.id}`, payload);
        setSkus(prev => prev.map(s => s.id === editingSku.id ? updatedSku : s));
        showSuccess('SKU updated successfully!');
        setIsEditSkuDialogOpen(false);
        resetForm();
    } catch (error) {
        showError('Failed to update SKU.');
    }
  };

  const openEditDialog = (sku: SKU) => {
    setEditingSku(sku);
    setSkuTitle(sku.title);
    setSkuPrice(sku.price);
    setSkuMargin(sku.margin);
    setSkuTags(sku.tags.join(', '));
    setSkuImageUrl(sku.imageUrl || '');
    setIsEditSkuDialogOpen(true);
  };

  const handleDeleteSku = async (skuId: string, skuTitle: string) => {
    if (window.confirm(`Are you sure you want to delete the SKU "${skuTitle}"?`)) {
        try {
            await api.delete(`/skus/${skuId}`);
            setSkus(prev => prev.filter(sku => sku.id !== skuId));
            showSuccess('SKU deleted successfully.');
        } catch (error) {
            showError('Failed to delete SKU.');
        }
    }
  };

  const toggleSelectSku = (skuId: string) => {
    setSelectedSkuIds(prev => {
        const newSet = new Set(prev);
        if (newSet.has(skuId)) {
            newSet.delete(skuId);
        } else {
            newSet.add(skuId);
        }
        return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedSkuIds.size === skus.length) {
        setSelectedSkuIds(new Set());
    } else {
        setSelectedSkuIds(new Set(skus.map(s => s.id)));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedSkuIds.size === 0) return;
    if (window.confirm(`Are you sure you want to delete ${selectedSkuIds.size} selected SKUs? This action cannot be undone.`)) {
        try {
            await Promise.all(Array.from(selectedSkuIds).map(id => api.delete(`/skus/${id}`)));
            setSkus(prev => prev.filter(sku => !selectedSkuIds.has(sku.id)));
            setSelectedSkuIds(new Set());
            showSuccess('Selected SKUs deleted successfully.');
        } catch (error) {
            showError('Failed to delete some SKUs.');
        }
    }
  };

  const handleDeleteAll = async () => {
    if (skus.length === 0) return;
    if (window.confirm('Are you sure you want to delete ALL your SKUs? This action cannot be undone.')) {
        try {
            await Promise.all(skus.map(sku => api.delete(`/skus/${sku.id}`)));
            setSkus([]);
            setSelectedSkuIds(new Set());
            showSuccess('All SKUs deleted successfully.');
        } catch (error) {
            showError('Failed to delete SKUs.');
        }
    }
  };

  const handleBulkUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const requiredHeaders = ['title', 'price', 'margin'];
        const headers = results.meta.fields;
        if (!headers || !requiredHeaders.every(h => headers.includes(h))) {
          showError(`Invalid CSV format. Required headers are: ${requiredHeaders.join(', ')}`);
          e.target.value = ''; // Reset file input
          return;
        }

        let successCount = 0;
        let failCount = 0;

        // Process sequentially to avoid overwhelming server or handle errors individually
        for (const row of results.data as any[]) {
             try {
                const payload = {
                    title: row.title || 'Untitled',
                    price: parseFloat(row.price) || 0,
                    margin: parseInt(row.margin, 10) || 0,
                    tags: (row.tags || '').split(',').map((t:string) => t.trim()).filter(Boolean),
                    imageUrl: row.imageUrl || undefined,
                };
                await api.post('/skus', payload);
                successCount++;
             } catch (err) {
                 failCount++;
                 console.error("Failed to upload SKU", row, err);
             }
        }
        
        await fetchSkus(); // Refresh list
        
        if (successCount > 0) showSuccess(`${successCount} SKUs uploaded successfully!`);
        if (failCount > 0) showError(`${failCount} SKUs failed to upload.`);
        
        e.target.value = ''; // Reset file input
      },
      error: (error) => {
        showError(`CSV parsing error: ${error.message}`);
        e.target.value = ''; // Reset file input
      }
    });
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const updatedUser: User = {
      ...user,
      minIntegrationFee: minIntegrationFee === '' ? undefined : Number(minIntegrationFee),
      eligibilityRules: eligibilityRules,
      suitabilityRules: suitabilityRules,
    };

    // Remove localStorage logic
    // const allUsers = JSON.parse(localStorage.getItem('users') || '[]') as User[];
    // const updatedUsers = allUsers.map(u => u.id === user.id ? updatedUser : u);
    // localStorage.setItem('users', JSON.stringify(updatedUsers));
    
    await updateCurrentUser(updatedUser); // Update context and backend
    showSuccess('Settings saved successfully!');
    setIsSettingsDialogOpen(false);
  };


  if (!user || role !== 'Merchant') return null;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Package className="h-7 w-7 text-purple-500" /> My Products
        </h1>
        <div className="flex gap-2">
          <Dialog open={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen}>
            <DialogTrigger asChild><Button variant="outline"><Settings className="mr-2 h-4 w-4" /> Settings</Button></DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader><DialogTitle>Merchant Settings</DialogTitle><DialogDescription>Configure your integration preferences and rules.</DialogDescription></DialogHeader>
              <form onSubmit={handleSaveSettings} className="grid gap-4 py-4">
                <div className="grid gap-2"><Label htmlFor="minFee">Minimum Integration Fee ($)</Label><Input id="minFee" type="number" value={minIntegrationFee} onChange={(e) => setMinIntegrationFee(e.target.value === '' ? '' : Number(e.target.value))} /></div>
                <div className="grid gap-2"><Label htmlFor="eligibility">Eligibility Rules</Label><Textarea id="eligibility" value={eligibilityRules} onChange={(e) => setEligibilityRules(e.target.value)} placeholder="e.g., JSON or plain text rules" /></div>
                <div className="grid gap-2"><Label htmlFor="suitability">Suitability Rules</Label><Textarea id="suitability" value={suitabilityRules} onChange={(e) => setSuitabilityRules(e.target.value)} placeholder="e.g., No placements in violent content" /></div>
                <DialogFooter><Button type="submit">Save Settings</Button></DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          <Dialog open={isAddSkuDialogOpen} onOpenChange={(isOpen) => { setIsAddSkuDialogOpen(isOpen); if (!isOpen) resetForm(); }}>
            <DialogTrigger asChild><Button><PlusCircle className="mr-2 h-4 w-4" /> Add New SKU</Button></DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader><DialogTitle>Add New SKU</DialogTitle><DialogDescription>Manually add a single product to your catalog.</DialogDescription></DialogHeader>
              <SkuForm
                skuTitle={skuTitle} setSkuTitle={setSkuTitle}
                skuPrice={skuPrice} setSkuPrice={setSkuPrice}
                skuMargin={skuMargin} setSkuMargin={setSkuMargin}
                skuTags={skuTags} setSkuTags={setSkuTags}
                skuImageUrl={skuImageUrl} setSkuImageUrl={setSkuImageUrl}
                onSubmit={handleAddSku}
                buttonText="Add SKU"
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
            <Checkbox
                id="select-all"
                checked={skus.length > 0 && selectedSkuIds.size === skus.length}
                onCheckedChange={toggleSelectAll}
            />
            <Label htmlFor="select-all" className="cursor-pointer">Select All</Label>
        </div>
        <div className="flex space-x-2">
            <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteSelected}
                disabled={selectedSkuIds.size === 0}
            >
                <Trash2 className="mr-2 h-4 w-4" /> Delete Selected ({selectedSkuIds.size})
            </Button>
            <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteAll}
                disabled={skus.length === 0}
            >
                <Trash2 className="mr-2 h-4 w-4" /> Delete All
            </Button>
        </div>
      </div>

      <Dialog open={isEditSkuDialogOpen} onOpenChange={(isOpen) => { setIsEditSkuDialogOpen(isOpen); if (!isOpen) resetForm(); }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader><DialogTitle>Edit SKU</DialogTitle><DialogDescription>Update the details for this product.</DialogDescription></DialogHeader>
          <SkuForm
            skuTitle={skuTitle} setSkuTitle={setSkuTitle}
            skuPrice={skuPrice} setSkuPrice={setSkuPrice}
            skuMargin={skuMargin} setSkuMargin={setSkuMargin}
            skuTags={skuTags} setSkuTags={setSkuTags}
            skuImageUrl={skuImageUrl} setSkuImageUrl={setSkuImageUrl}
            onSubmit={handleEditSku}
            buttonText="Save Changes"
          />
        </DialogContent>
      </Dialog>

      <Card className="mb-6">
        <CardHeader><CardTitle className="flex items-center gap-2"><Upload className="h-5 w-5" /> Bulk SKU Upload (CSV)</CardTitle><CardDescription>Upload multiple products at once. Required headers: title, price, margin. Optional: tags, imageUrl.</CardDescription></CardHeader>
        <CardContent><Input type="file" accept=".csv" onChange={handleBulkUpload} /></CardContent>
      </Card>

      <h2 className="text-2xl font-semibold mb-4">Your Current SKUs</h2>
      {skus.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[40vh] bg-gray-100 dark:bg-gray-800 rounded-lg p-6">
          <Package className="h-16 w-16 text-gray-400 mb-4" />
          <p className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No SKUs uploaded yet.</p>
          <p className="text-md text-gray-500 dark:text-gray-400">Add new SKUs manually or via bulk CSV upload.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {skus.map((sku) => (
            <Card key={sku.id} className={selectedSkuIds.has(sku.id) ? 'border-primary ring-1 ring-primary' : ''}>
              <CardContent className="p-4 flex flex-col sm:flex-row items-start gap-4">
                <div className="pt-1">
                    <Checkbox
                        checked={selectedSkuIds.has(sku.id)}
                        onCheckedChange={() => toggleSelectSku(sku.id)}
                    />
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className="mb-1 text-lg">{sku.title}</CardTitle>
                  <CardDescription>Price: ${sku.price.toFixed(2)} | Margin: {sku.margin}%</CardDescription>
                  <p className="text-sm text-muted-foreground mt-2 mb-4">Tags: {sku.tags.join(', ') || 'N/A'}</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => openEditDialog(sku)}><Edit className="h-4 w-4 mr-1" /> Edit</Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteSku(sku.id, sku.title)}><Trash2 className="h-4 w-4 mr-1" /> Delete</Button>
                  </div>
                </div>
                <div className="w-full aspect-square sm:w-28 md:w-32 flex-shrink-0">
                  {sku.imageUrl ? (
                    <Dialog>
                      <DialogTrigger asChild><img src={sku.imageUrl} alt={sku.title} className="w-full h-full object-cover rounded-md cursor-pointer" /></DialogTrigger>
                      <DialogContent className="sm:max-w-2xl"><DialogHeader><DialogTitle>{sku.title}</DialogTitle></DialogHeader><img src={sku.imageUrl} alt={sku.title} className="w-full h-auto rounded-lg" /></DialogContent>
                    </Dialog>
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center rounded-md"><Package className="h-12 w-12 text-muted-foreground" /></div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyProductsPage;