import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { SKU, User } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { Package, PlusCircle, Upload, Settings, Edit, Trash2 } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { useNavigate } from 'react-router-dom';
import Papa from 'papaparse';

const MyProductsPage = () => {
  const { user, role, updateCurrentUser } = useAuth();
  const navigate = useNavigate();

  const [skus, setSkus] = useState<SKU[]>([]);
  const [isAddSkuDialogOpen, setIsAddSkuDialogOpen] = useState(false);
  const [isEditSkuDialogOpen, setIsEditSkuDialogOpen] = useState(false);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [editingSku, setEditingSku] = useState<SKU | null>(null);

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

  useEffect(() => {
    if (!user || role !== 'Merchant') {
      navigate('/login');
      return;
    }
    const storedSkus = JSON.parse(localStorage.getItem('skus') || '[]') as SKU[];
    setSkus(storedSkus.filter(sku => sku.merchantId === user.id));
    setMinIntegrationFee(user.minIntegrationFee ?? '');
    setEligibilityRules(user.eligibilityRules ?? '');
    setSuitabilityRules(user.suitabilityRules ?? '');
  }, [user, role, navigate]);

  const resetForm = () => {
    setSkuTitle('');
    setSkuPrice('');
    setSkuMargin('');
    setSkuTags('');
    setSkuImageUrl('');
    setEditingSku(null);
  };

  const handleAddSku = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!skuTitle || skuPrice === '' || skuMargin === '') {
      showError('Please fill in all required SKU fields.');
      return;
    }
    const newSku: SKU = {
      id: uuidv4(),
      merchantId: user.id,
      title: skuTitle,
      price: Number(skuPrice),
      margin: Number(skuMargin),
      tags: skuTags.split(',').map(tag => tag.trim()).filter(Boolean),
      imageUrl: skuImageUrl || undefined,
      createdDate: new Date().toISOString(),
      lastModifiedDate: new Date().toISOString(),
    };
    const allSkus = JSON.parse(localStorage.getItem('skus') || '[]') as SKU[];
    allSkus.push(newSku);
    localStorage.setItem('skus', JSON.stringify(allSkus));
    setSkus(prev => [...prev, newSku]);
    showSuccess('SKU added successfully!');
    setIsAddSkuDialogOpen(false);
    resetForm();
  };

  const handleEditSku = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSku) return;
    const updatedSku: SKU = {
      ...editingSku,
      title: skuTitle,
      price: Number(skuPrice),
      margin: Number(skuMargin),
      tags: skuTags.split(',').map(tag => tag.trim()).filter(Boolean),
      imageUrl: skuImageUrl || undefined,
      lastModifiedDate: new Date().toISOString(),
    };
    const allSkus = JSON.parse(localStorage.getItem('skus') || '[]') as SKU[];
    const updatedSkus = allSkus.map(s => s.id === editingSku.id ? updatedSku : s);
    localStorage.setItem('skus', JSON.stringify(updatedSkus));
    setSkus(updatedSkus.filter(s => s.merchantId === user?.id));
    showSuccess('SKU updated successfully!');
    setIsEditSkuDialogOpen(false);
    resetForm();
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

  const handleDeleteSku = (skuId: string, skuTitle: string) => {
    if (window.confirm(`Are you sure you want to delete the SKU "${skuTitle}"?`)) {
      const allSkus = JSON.parse(localStorage.getItem('skus') || '[]') as SKU[];
      const updatedSkus = allSkus.filter(sku => sku.id !== skuId);
      localStorage.setItem('skus', JSON.stringify(updatedSkus));
      setSkus(updatedSkus.filter(sku => sku.merchantId === user?.id));
      showSuccess('SKU deleted successfully.');
    }
  };

  const handleBulkUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const requiredHeaders = ['title', 'price', 'margin'];
        const headers = results.meta.fields;
        if (!headers || !requiredHeaders.every(h => headers.includes(h))) {
          showError(`Invalid CSV format. Required headers are: ${requiredHeaders.join(', ')}`);
          e.target.value = ''; // Reset file input
          return;
        }

        const newSkus: SKU[] = results.data.map((row: any) => ({
          id: uuidv4(),
          merchantId: user.id,
          title: row.title || 'Untitled',
          price: parseFloat(row.price) || 0,
          margin: parseInt(row.margin, 10) || 0,
          tags: (row.tags || '').split(',').map((t:string) => t.trim()).filter(Boolean),
          imageUrl: row.imageUrl || undefined,
          createdDate: new Date().toISOString(),
          lastModifiedDate: new Date().toISOString(),
        }));

        const allSkus = JSON.parse(localStorage.getItem('skus') || '[]') as SKU[];
        const updatedSkus = [...allSkus, ...newSkus];
        localStorage.setItem('skus', JSON.stringify(updatedSkus));
        setSkus(prev => [...prev, ...newSkus]);
        showSuccess(`${newSkus.length} SKUs uploaded successfully!`);
        e.target.value = ''; // Reset file input
      },
      error: (error) => {
        showError(`CSV parsing error: ${error.message}`);
        e.target.value = ''; // Reset file input
      }
    });
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const updatedUser: User = {
      ...user,
      minIntegrationFee: minIntegrationFee === '' ? undefined : Number(minIntegrationFee),
      eligibilityRules: eligibilityRules,
      suitabilityRules: suitabilityRules,
    };

    const allUsers = JSON.parse(localStorage.getItem('users') || '[]') as User[];
    const updatedUsers = allUsers.map(u => u.id === user.id ? updatedUser : u);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    
    updateCurrentUser(updatedUser); // Update context
    showSuccess('Settings saved successfully!');
    setIsSettingsDialogOpen(false);
  };

  const SkuForm = ({ onSubmit, buttonText }: { onSubmit: (e: React.FormEvent) => void; buttonText: string }) => {
    // ... (form logic remains the same)
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
              <SkuForm onSubmit={handleAddSku} buttonText="Add SKU" />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Dialog open={isEditSkuDialogOpen} onOpenChange={(isOpen) => { setIsEditSkuDialogOpen(isOpen); if (!isOpen) resetForm(); }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader><DialogTitle>Edit SKU</DialogTitle><DialogDescription>Update the details for this product.</DialogDescription></DialogHeader>
          <SkuForm onSubmit={handleEditSku} buttonText="Save Changes" />
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
            <Card key={sku.id}>
              <CardContent className="p-4 flex flex-col sm:flex-row items-start gap-4">
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