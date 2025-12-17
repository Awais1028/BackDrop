import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, Percent } from 'lucide-react';
import { api } from '@/api/client';

const FinancingPage = () => {
  const { user, role } = useAuth();
  const navigate = useNavigate();

  const [totalCommitted, setTotalCommitted] = useState(0);
  const [totalBudgets, setTotalBudgets] = useState(0);
  const [marketplaceMargin, setMarketplaceMargin] = useState(0);

  useEffect(() => {
    if (!user || role !== 'Operator') {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
        try {
            const data = await api.get<any>('/finance/operator/overview');
            setTotalCommitted(data.total_committed);
            setTotalBudgets(data.total_budgets);
            setMarketplaceMargin(data.marketplace_margin);
        } catch (error) {
            console.error("Failed to fetch operator financing overview", error);
        }
    };

    fetchData();
  }, [user, role, navigate]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Financing & Margin</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Committed Funds</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalCommitted.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Across all projects in the marketplace.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Project Budgets</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalBudgets.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Sum of all declared budget targets.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estimated Marketplace Margin</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${marketplaceMargin.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Based on a 10% platform fee (prototype).</p>
          </CardContent>
        </Card>
      </div>
      {/* A table of all commitments could be added here in the future */}
    </div>
  );
};

export default FinancingPage;