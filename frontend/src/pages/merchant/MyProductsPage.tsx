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

const MyProductsPage = () => {
  const { user, role, updateCurrentUser } = useAuth();
  const navigate = useNavigate();

  const [skus, setSkus] = useState<SKU[]>([]);
  const [isAddSkuDialogOpen, setIsAddSkuDialogOpen] = useState(false);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);

  // New SKU form state
  const [newSkuTitle, setNewSkuTitle] = useState('');
  const [newSkuPrice, setNewSkuPrice] = useState<number | ''>('');
  const [newSkuMargin, setNewSkuMargin] = useState<number | ''>('');
  const [newSkuTags, setNewSkuTags] = useState('');
  const [newSkuImageUrl, setNewSkuImageUrl] = useState('');

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

    // Initialize settings from current user in context
    setMinIntegrationFee(user.minIntegrationFee ?? '');
    setEligibilityRules(user.eligibilityRules ?? '');
    setSuitabilityRules(user.suitabilityRules ?? '');
  }, [user, role, navigate]);

  const handleAddSku = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showError('You must be logged in to add an SKU.');
      return;
    }
    if (!newSkuTitle || newSkuPrice === '' || newSkuMargin === '') {
      showError('Please fill in all required SKU fields.');
      return;
    }

    const newSku: SKU = {
      id: uuidv4(),
      merchantId: user.id,
      title: newSkuTitle,
      price: Number(newSkuPrice),
      margin: Number(newSkuMargin),
      tags: newSkuTags.split(',').map(tag => tag.trim()).filter(tag => tag !== ''),
      imageUrl: newSkuImageUrl || undefined,
      createdDate: new Date().toISOString(),
      lastModifiedDate: new Date().toISOString(),
    };

    const allSkus = JSON.parse(localStorage.getItem('skus') || '[]') as SKU[];
    allSkus.push(newSku);
    localStorage.setItem('skus', JSON.stringify(allSkus));

    setSkus(prev => [...prev, newSku]);
    showSuccess('SKU added successfully!');
    setIsAddSkuDialogOpen(false);
    // Reset form
    setNewSkuTitle('');
    setNewSkuPrice('');
    setNewSkuMargin('');
    setNewSkuTags('');
    setNewSkuImageUrl('');
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
    if (!user) {
      showError('You must be logged in to upload SKUs.');
      return;
    }
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim() !== '');
      if (lines.length === 0) {
        showError('CSV file is empty.');
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const requiredHeaders = ['title', 'price', 'margin'];
      const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));

      if (missingHeaders.length > 0) {
        showError(`Missing required CSV headers: ${missingHeaders.join(', ')}. Please ensure your CSV has at least 'title', 'price', 'margin'.`);
        return;
      }

      const newSkus: SKU[] = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        if (values.length !== headers.length) {
          console.warn(`Skipping malformed row ${i + 1}: ${lines[i]}`);
          continue;
        }
        const skuData: { [key: string]: string } = {};
        headers.forEach((header, index) => {
          skuData[header] = values[index]?.trim() || '';
        });

        const price = parseFloat(skuData.price);
        const margin = parseFloat(skuData.margin);

        if (isNaN(price) || isNaN(margin) || price <= 0 || margin < 0 || margin > 100) {
          showError(`Invalid price or margin in row ${i + 1}. Skipping SKU: ${skuData.title}`);
          continue;
        }

        newSkus.push({
          id: uuidv4(),
          merchantId: user.id,
          title: skuData.title,
          price: price,
          margin: margin,
          tags: skuData.tags ? skuData.tags.split(';').map(tag => tag.trim()).filter(tag => tag !== '') : [],
          imageUrl: skuData.imageurl || undefined,
          createdDate: new Date().toISOString(),
          lastModifiedDate: new Date().toISOString(),
        });
      }

      if (newSkus.length > 0) {
        const allSkus = JSON.parse(localStorage.getItem('skus') || '[]') as SKU[];
        const updatedSkus = [...allSkus, ...newSkus];
        localStorage.setItem('skus', JSON.stringify(updatedSkus));
        setSkus(updatedSkus.filter(sku => sku.merchantId === user.id));
        showSuccess(`${newSkus.length} SKUs uploaded successfully!`);
      } else {
        showError('No valid SKUs found in the CSV file.');
      }
    };
    reader.readAsText(file);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showError('User not authenticated.');
      return;
    }

    const updatedUser: User = {
      ...user,
      minIntegrationFee: minIntegrationFee === '' ? undefined : Number(minIntegrationFee),
      eligibilityRules: eligibilityRules,
      suitabilityRules: suitabilityRules,
    };

    const allUsers = JSON.parse(localStorage.getItem('users') || '[]') as User[];
    const updatedUsers = allUsers.map(u => u.id === user.id ? updatedUser : u);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    
    // Update the user in the AuthContext as well
    updateCurrentUser(updatedUser);

    showSuccess('Merchant settings saved successfully!');
    setIsSettingsDialogOpen(false);
  };

  if (!user || role !== 'Merchant') {
    return <div className="text-center text-gray-500 dark:text-gray-400">Access Denied. Please log in as a Merchant.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Package className="h-7 w-7 text-purple-500" /> My Products
        </h1>
        <div className="flex gap-2">
          <Dialog open={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Settings className="mr-2 h-4 w-4" /> Settings
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Merchant Settings</DialogTitle>
                <DialogDescription>
                  Configure your integration preferences and rules.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSaveSettings} className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="minIntegrationFee">Minimum Integration Fee ($)</Label>
                  <Input
                    id="minIntegrationFee"
                    type="number"
                    value={minIntegrationFee}
                    onChange={(e) => setMinIntegrationFee(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="e.g., 500"
                    min="0"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="eligibilityRules">Eligibility Rules (JSON or text)</Label>
                  <Textarea
                    id="eligibilityRules"
                    value={eligibilityRules}
                    onChange={(e) => setEligibilityRules(e.target.value)}
                    placeholder='e.g., {"categories": ["fashion", "beauty"], "min_margin": 30}'
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="suitabilityRules">Suitability Rules (JSON or text)</Label>
                  <Textarea
                    id="suitabilityRules"
                    value={suitabilityRules}
                    onChange={(e) => setSuitabilityRules(e.target.value)}
                    placeholder='e.g., {"exclude_genres": ["horror", "violence"]}'
                  />
                </div>
                <DialogFooter>
                  <Button type="submit">Save Settings</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isAddSkuDialogOpen} onOpenChange={setIsAddSkuDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" /> Add New SKU
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New SKU</DialogTitle>
                <DialogDescription>
                  Manually add a single product to your catalog.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddSku} className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="skuTitle">Title</Label>
                  <Input
                    id="skuTitle"
                    value={newSkuTitle}
                    onChange={(e) => setNewSkuTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="skuPrice">Price ($)</Label>
                  <Input
                    id="skuPrice"
                    type="number"
                    value={newSkuPrice}
                    onChange={(e) => setNewSkuPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    required
                    min="0"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="skuMargin">Margin (%)</Label>
                  <Input
                    id="skuMargin"
                    type="number"
                    value={newSkuMargin}
                    onChange={(e) => setNewSkuMargin(e.target.value === '' ? '' : Number(e.target.value))}
                    required
                    min="0"
                    max="100"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="skuTags">Tags (comma-separated)</Label>
                  <Input
                    id="skuTags"
                    value={newSkuTags}
                    onChange={(e) => setNewSkuTags(e.target.value)}
                    placeholder="e.g., electronics, wearable, smart"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="skuImageUrl">Image URL (Optional)</Label>
                  <Input
                    id="skuImageUrl"
                    value={newSkuImageUrl}
                    onChange={(e) => setNewSkuImageUrl(e.target.value)}
                    placeholder="https://example.com/image.png"
                  />
                </div>
                <DialogFooter>
                  <Button type="submit">Add SKU</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-blue-500" /> Bulk Upload SKUs
          </CardTitle>
          <CardDescription>Upload your product catalog via a CSV file. Expected headers: `title, price, margin, tags, imageUrl`. Tags should be separated by a semicolon (;).</CardDescription>
        </CardHeader>
        <CardContent>
          <Input type="file" accept=".csv" onChange={handleBulkUpload} />
        </CardContent>
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
                <div className="flex-1">
                  <CardTitle className="mb-1 text-lg">{sku.title}</CardTitle>
                  <CardDescription>Price: ${sku.price.toFixed(2)} | Margin: {sku.margin}%</CardDescription>
                  <p className="text-sm text-muted-foreground mt-2 mb-4">
                    Tags: {sku.tags.join(', ') || 'N/A'}
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => showError('Editing SKUs is coming soon!')}>
                      <Edit className="h-4 w-4 mr-1" /> Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteSku(sku.id, sku.title)}>
                      <Trash2 className="h-4 w-4 mr-1" /> Delete
                    </Button>
                  </div>
                </div>
                <div className="w-full aspect-square sm:w-28 md:w-32 flex-shrink-0">
                  {sku.imageUrl ? (
                    <Dialog>
                      <DialogTrigger asChild>
                        <img
                          src={sku.imageUrl}
                          alt={sku.title}
                          className="w-full h-full object-cover rounded-md cursor-pointer hover:opacity-90 transition-opacity"
                        />
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>{sku.title}</DialogTitle>
                        </DialogHeader>
                        <img src={sku.imageUrl} alt={sku.title} className="w-full h-auto rounded-lg" />
                      </DialogContent>
                    </Dialog>
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center rounded-md">
                      <Package className="h-12 w-12 text-muted-foreground" />
                    </div>
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