import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ProjectScript } from '@/types'; // FinancingCommitment removed as backend aggregates
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { DollarSign, TrendingUp, Percent, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/api/client';

// Extended type for frontend use
interface DashboardProject extends ProjectScript {
    committed_amount?: number;
}

const FinancingDashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [totalBudgetTarget, setTotalBudgetTarget] = useState(0);
  const [totalCommittedAmount, setTotalCommittedAmount] = useState(0);
  const [percentageCovered, setPercentageCovered] = useState(0);
  const [scripts, setScripts] = useState<DashboardProject[]>([]);

  useEffect(() => {
    if (!user || user.role !== 'Creator') {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
        try {
            const data = await api.get<any>('/finance/dashboard');
            
            setTotalBudgetTarget(data.total_budget_target);
            setTotalCommittedAmount(data.total_committed_amount);
            setPercentageCovered(data.percentage_covered);
            setScripts(data.projects);
        } catch (error) {
            console.error("Failed to fetch financing dashboard", error);
        }
    };

    fetchData();
  }, [user, navigate]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Financing Dashboard</h1>

      {scripts.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[60vh] bg-gray-100 dark:bg-gray-800 rounded-lg p-6">
          <FileText className="h-16 w-16 text-gray-400 mb-4" />
          <p className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No scripts uploaded yet.</p>
          <p className="text-md text-gray-500 dark:text-gray-400">Upload a script and set a budget to see financing impact here.</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Budget Target</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${totalBudgetTarget.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Sum of all budget targets from your scripts.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Committed Funds</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${totalCommittedAmount.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Funds committed from approved integration slots.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Budget Covered</CardTitle>
                <Percent className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{percentageCovered.toFixed(2)}%</div>
                <Progress value={percentageCovered} className="mt-2" />
                <p className="text-xs text-muted-foreground">
                  Percentage of your total budget target covered by commitments.
                </p>
              </CardContent>
            </Card>
          </div>

          <h2 className="text-2xl font-semibold mb-4">Your Projects Overview</h2>
          {scripts.filter(s => (s.budgetTarget || s.budget_target || 0) > 0).length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[40vh] bg-gray-100 dark:bg-gray-800 rounded-lg p-6">
              <FileText className="h-16 w-16 text-gray-400 mb-4" />
              <p className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No scripts with budget targets found.</p>
              <p className="text-md text-gray-500 dark:text-gray-400">Add a budget target to your scripts to see financing impact here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {scripts.map(script => {
                const budgetTarget = script.budgetTarget || script.budget_target || 0;
                const committedAmount = script.committed_amount || 0;
                const percentage = budgetTarget > 0 ? (committedAmount / budgetTarget) * 100 : 0;

                return (
                  <Card key={script.id}>
                    <CardHeader>
                      <CardTitle>{script.title}</CardTitle>
                      <CardDescription>Production Window: {script.productionWindow || script.production_window}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="mb-2"><strong>Budget Target:</strong> ${budgetTarget.toLocaleString()}</p>
                      <p className="mb-2"><strong>Committed:</strong> ${committedAmount.toLocaleString()}</p>
                      <div className="flex items-center gap-2">
                        <Progress value={percentage} className="flex-1" />
                        <span className="text-sm font-medium">{percentage.toFixed(2)}% Covered</span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default FinancingDashboardPage;