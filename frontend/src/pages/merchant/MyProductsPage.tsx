import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { SKU, MerchantProfile } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { ShoppingBag, PlusCircle, Edit, Trash2, Upload, DollarSign, ListChecks } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { useNavigate } from 'react-router-dom';

const MyProductsPage = () => {
  const { user, role } = useAuth();
  const navigate = useNavigate();

  const [skus, setSkus] = useState<SKU[]>([]);
  const [merchantProfile, setMerchantProfile] = useState<MerchantProfile | null>(null);
  const [isAddSkuDialogOpen, setIsAddSkuDialogOpen] = useState(false);
  const [isEditSkuDialogOpen, setIsEditSkuDialogOpen] = useState(false);
  const [isBulkUploadDialogOpen, setIsBulkUploadDialogOpen] = useState(false);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);

  // SKU form state
  const [currentSku, setCurrentSku] = useState<SKU | null>(null);
  const [skuTitle, setSkuTitle] = useState('');
  const [skuPrice, setSkuPrice] = useState<number | ''>('');
  const [skuMargin, setSkuMargin] = useState<number | ''>('');
  const [skuTags, setSkuTags] = useState('');

  // Bulk upload state
  const [csvData, setCsvData] = useState('');

  // Merchant settings state
  const [minIntegrationFee, setMinIntegrationFee] = useState<number | ''>('');
  const [eligibilityRules, setEligibilityRules] = useState('');
  const [suitabilityRules, setSuitabilityRules] = useState('');

  useEffect(() => {
    if (!user || role !== 'Merchant') {
      navigate('/login');
      return;
    }

    // Load SKUs
    const storedSkus = JSON.parse(localStorage.getItem('skus') || '[]') as SKU[];
    setSkus(storedSkus.filter(sku => sku.merchantId === user.id));

    // Load Merchant Profile
    const storedProfiles = JSON.parse(localStorage.getItem('merchantProfiles') || '[]') as MerchantProfile[];
    const currentProfile = storedProfiles.find(profile => profile.userId === user.id);
    if (currentProfile) {
      setMerchantProfile(currentProfile);
      setMinIntegrationFee(currentProfile.minIntegrationFee);
      setEligibilityRules(currentProfile.eligibilityRules);
      setSuitabilityRules(currentProfile.suitabilityRules);
    } else {
      // If no profile exists, create a default one
      const newProfile: MerchantProfile = {
        id: uuidv4(),
        userId: user.id,
        minIntegrationFee: 0,
        eligibilityRules: '',
        suitabilityRules: '',
        createdDate: new Date().toISOString(),
        lastModifiedDate: new Date().toISOString(),
      };
      storedProfiles.push(newProfile);
      localStorage.setItem('merchantProfiles', JSON.stringify(storedProfiles));
      setMerchantProfile(newProfile);
      setMinIntegrationFee(newProfile.minIntegrationFee);
      setEligibilityRules(newProfile.eligibilityRules);
      setSuitabilityRules(newProfile.suitabilityRules);
    }
  }, [user, role, navigate]);

  const resetSkuForm = () => {
    setCurrentSku(null);
    setSkuTitle('');
    setSkuPrice('');
    setSkuMargin('');
    setSkuTags('');
  };

  const handleAddSku = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showError('User not authenticated.');
      return;
    }
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
      tags: skuTags.split(',').map(tag => tag.trim()).filter(tag => tag !== ''),
      createdDate: new Date().toISOString(),
      lastModifiedDate: new Date().toISOString(),
    };

    const allSkus = JSON.parse(localStorage.getItem('skus') || '[]') as SKU[];
    allSkus.push(newSku);
    localStorage.setItem('skus', JSON.stringify(allSkus));
    setSkus(prev => [...prev, newSku]);
    showSuccess('SKU added successfully!');
    setIsAddSkuDialogOpen(false);
    resetSkuForm();
  };

  const handleEditSku = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !currentSku) {
      showError('User not authenticated or no SKU selected.');
      return;
    }
    if (!skuTitle || skuPrice === '' || skuMargin === '') {
      showError('Please fill in all required SKU fields.');
      return;
    }

    const updatedSku: SKU = {
      ...currentSku,
      title: skuTitle,
      price: Number(skuPrice),
      margin: Number(skuMargin),
      tags: skuTags.split(',').map(tag => tag.trim()).filter(tag => tag !== ''),
      lastModifiedDate: new Date().toISOString(),
    };

    const allSkus = JSON.parse(localStorage.getItem('skus') || '[]') as SKU[];
    const updatedSkus = allSkus.map(s => s.id === updatedSku.id ? updatedSku : s);
    localStorage.setItem('skus', JSON.stringify(updatedSkus));
    setSkus(updatedSkus.filter(s => s.merchantId === user.id));
    showSuccess('SKU updated successfully!');
    setIsEditSkuDialogOpen(false);
    resetSkuForm();
  };

  const openEditSkuDialog = (sku: SKU) => {
    setCurrentSku(sku);
    setSkuTitle(sku.title);
    setSkuPrice(sku.price);
    setSkuMargin(sku.margin);
    setSkuTags(sku.tags.join(', '));
    setIsEditSkuDialogOpen(true);
  };

  const handleDeleteSku = (skuId: string, skuTitle: string) => {
    if (window.confirm(`Are you sure you want to delete the SKU "${skuTitle}"?`)) {
      const allSkus = JSON.parse(localStorage.getItem('skus') || '[]') as SKU[];
      const filteredSkus = allSkus.filter(s => s.id !== skuId);
      localStorage.setItem('skus', JSON.stringify(filteredSkus));
      setSkus(filteredSkus.filter(s => s.merchantId === user?.id));
      showSuccess('SKU deleted successfully!');
    }
  };

  const handleBulkUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showError('User not authenticated.');
      return;
    }
    if (!csvData.trim()) {
      showError('Please paste CSV data into the textarea.');
      return;
    }

    const lines = csvData.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const newSkus: SKU[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      if (values.length !== headers.length) {
        showError(`Skipping line ${i + 1}: Mismatched column count.`);
        continue;
      }

      const sku: Partial<SKU> = {
        id: uuidv4(),
        merchantId: user.id,
        createdDate: new Date().toISOString(),
        lastModifiedDate: new Date().toISOString(),
      };

      headers.forEach((header, index) => {
        const value = values[index];
        if (header === 'title') sku.title = value;
        else if (header === 'price') sku.price = parseFloat(value);
        else if (header === 'margin') sku.margin = parseInt(value, 10);
        else if (header === 'tags') sku.tags = value.split(';').map(tag => tag.trim()).filter(tag => tag !== '');
      });

      if (sku.title && sku.price !== undefined && !isNaN(sku.price) && sku.margin !== undefined && !isNaN(sku.margin)) {
        newSkus.push(sku as SKU);
      } else {
        showError(`Skipping line ${i + 1}: Invalid or missing data for SKU.`);
      }
    }

    if (newSkus.length > 0) {
      const allSkus = JSON.parse(localStorage.getItem('skus') || '[]') as SKU[];
      const updatedSkus = [...allSkus, ...newSkus];
      localStorage.setItem('skus', JSON.stringify(updatedSkus));
      setSkus(updatedSkus.filter(s => s.merchantId === user.id));
      showSuccess(`${newSkus.length} SKUs uploaded successfully!`);
    } else {
      showError('No valid SKUs found in the provided CSV data.');
    }

    setIsBulkUploadDialogOpen(false);
    setCsvData('');
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !merchantProfile) {
      showError('User or merchant profile not loaded.');
      return;
    }

    const updatedProfile: MerchantProfile = {
      ...merchantProfile,
      minIntegrationFee: Number(minIntegrationFee),
      eligibilityRules: eligibilityRules,
      suitabilityRules: suitabilityRules,
      lastModifiedDate: new Date().toISOString(),
    };

    const allProfiles = JSON.parse(localStorage.getItem('merchantProfiles') || '[]') as MerchantProfile[];
    const updatedProfiles = allProfiles.map(p => p.id === updatedProfile.id ? updatedProfile : p);
    localStorage.setItem('merchantProfiles', JSON.stringify(updatedProfiles));
    setMerchantProfile(updatedProfile);
    showSuccess('Merchant settings updated successfully!');
    setIsSettingsDialogOpen(false);
  };

  if (!user || role !== 'Merchant') {
    return <div className="text-center text-gray-500 dark:text-gray-400">Access Denied. Please log in as a Merchant.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <ShoppingBag className="h-7 w-7 text-purple-500" /> My Products
        </h1>
        <div className="flex gap-2">
          <Dialog open={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <ListChecks className="mr-2 h-4 w-4" /> Merchant Settings
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Merchant Settings</DialogTitle>
                <DialogDescription>
                  Manage your minimum integration fee and product eligibility rules.
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
                    required
                    min="0"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="eligibilityRules">Eligibility Rules (e.g., JSON or comma-separated)</Label>
                  <Textarea
                    id="eligibilityRules"
                    value={eligibilityRules}
                    onChange={(e) => setEligibilityRules(e.target.value)}
                    placeholder='{"categories": ["electronics", "food"], "min_margin": 20}'
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="suitabilityRules">Suitability Rules (e.g., text description)</Label>
                  <Textarea
                    id="suitabilityRules"
                    value={suitabilityRules}
                    onChange={(e) => setSuitabilityRules(e.target.value)}
                    placeholder='No violent content, family-friendly'
                  />
                </div>
                <Button type="submit">Save Settings</Button>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isBulkUploadDialogOpen} onOpenChange={setIsBulkUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="mr-2 h-4 w-4" /> Bulk Upload SKUs
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Bulk Upload SKUs</DialogTitle>
                <DialogDescription>
                  Paste your SKU data in CSV format. Headers should include `title`, `price`, `margin`, `tags`.
                  Tags can be semicolon-separated (e.g., `tag1;tag2`).
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleBulkUpload} className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="csvData">CSV Data</Label>
                  <Textarea
                    id="csvData"
                    value={csvData}
                    onChange={(e) => setCsvData(e.target.value)}
                    placeholder={`title,price,margin,tags\nOrganic Coffee Blend,15.99,40,coffee;organic\nSmartwatch X200,299.99,25,tech;wearable`}
                    rows={10}
                    required
                  />
                </div>
                <DialogFooter>
                  <Button type="submit">Upload SKUs</Button>
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
                  Enter the details for your product.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddSku} className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="skuTitle">Title</Label>
                  <Input
                    id="skuTitle"
                    value={skuTitle}
                    onChange={(e) => setSkuTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="skuPrice">Price ($)</Label>
                    <Input
                      id="skuPrice"
                      type="number"
                      value={skuPrice}
                      onChange={(e) => setSkuPrice(e.target.value === '' ? '' : Number(e.target.value))}
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="skuMargin">Margin (%)</Label>
                    <Input
                      id="skuMargin"
                      type="number"
                      value={skuMargin}
                      onChange={(e) => setSkuMargin(e.target.value === '' ? '' : Number(e.target.value))}
                      required
                      min="0"
                      max="100"
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="skuTags">Tags (comma-separated)</Label>
                  <Input
                    id="skuTags"
                    value={skuTags}
                    onChange={(e) => setSkuTags(e.target.value)}
                    placeholder="e.g., coffee, organic, beverage"
                  />
                </div>
                <Button type="submit">Add SKU</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {skus.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[60vh] bg-gray-100 dark:bg-gray-800 rounded-lg p-6">
          <ShoppingBag className="h-16 w-16 text-gray-400 mb-4" />
          <p className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No products uploaded yet.</p>
          <p className="text-md text-gray-500 dark:text-gray-400">Click "Add New SKU" or "Bulk Upload SKUs" to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {skus.map((sku) => (
            <Card key={sku.id}>
              <CardHeader>
                <CardTitle>{sku.title}</CardTitle>
                <CardDescription>
                  Price: ${sku.price.toFixed(2)} | Margin: {sku.margin}%
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Tags: {sku.tags.length > 0 ? sku.tags.join(', ') : 'None'}
                </p>
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" onClick={() => openEditSkuDialog(sku)}>
                    <Edit className="h-4 w-4" /> Edit
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDeleteSku(sku.id, sku.title)}>
                    <Trash2 className="h-4 w-4" /> Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isEditSkuDialogOpen} onOpenChange={setIsEditSkuDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit SKU</DialogTitle>
            <DialogDescription>
              Update the details for your product.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSku} className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="editSkuTitle">Title</Label>
              <Input
                id="editSkuTitle"
                value={skuTitle}
                onChange={(e) => setSkuTitle(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="editSkuPrice">Price ($)</Label>
                <Input
                  id="editSkuPrice"
                  type="number"
                  value={skuPrice}
                  onChange={(e) => setSkuPrice(e.target.value === '' ? '' : Number(e.target.value))}
                  required
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="editSkuMargin">Margin (%)</Label>
                <Input
                  id="editSkuMargin"
                  type="number"
                  value={skuMargin}
                  onChange={(e) => setSkuMargin(e.target.value === '' ? '' : Number(e.target.value))}
                  required
                  min="0"
                  max="100"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="editSkuTags">Tags (comma-separated)</Label>
              <Input
                id="editSkuTags"
                value={skuTags}
                onChange={(e) => setSkuTags(e.target.value)}
                placeholder="e.g., coffee, organic, beverage"
              />
            </div>
            <Button type="submit">Save Changes</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyProductsPage;