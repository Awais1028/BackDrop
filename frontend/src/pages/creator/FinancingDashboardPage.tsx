import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ProjectScript, IntegrationSlot, FinancingCommitment } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { DollarSign, TrendingUp, Percent } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FinancingDashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [totalBudgetTarget, setTotalBudgetTarget] = useState(0);
  const [totalCommittedAmount, setTotalCommittedAmount] = useState(0);
  const [percentageCovered, setPercentageCovered] = useState(0);
  const [scripts, setScripts] = useState<ProjectScript[]>([]);

  useEffect(() => {
    if (!user || user.role !== 'Creator') {
      navigate('/login'); // Redirect if not logged in or not a Creator
      return;
    }

    const storedScripts = JSON.parse(localStorage.getItem('projectScripts') || '[]') as ProjectScript[];
    const creatorScripts = storedScripts.filter(script => script.creatorId === user.id);
    setScripts(creatorScripts);

    let currentTotalBudgetTarget = 0;
    creatorScripts.forEach(script => {
      if (script.budgetTarget) {
        currentTotalBudgetTarget += script.budgetTarget;
      }
    });
    setTotalBudgetTarget(currentTotalBudgetTarget);

    const storedSlots = JSON.parse(localStorage.getItem('integrationSlots') || '[]') as IntegrationSlot[];
    const creatorSlotIds = storedSlots
      .filter(slot => creatorScripts.some(script => script.id === slot.projectId))
      .map(slot => slot.id);

    const storedCommitments = JSON.parse(localStorage.getItem('financingCommitments') || '[]') as FinancingCommitment[];
    const creatorCommitments = storedCommitments.filter(commitment =>
      creatorSlotIds.includes(commitment.slotId)
    );

    let currentTotalCommittedAmount = 0;
    creatorCommitments.forEach(commitment => {
      currentTotalCommittedAmount += commitment.committedAmount;
    });
    setTotalCommittedAmount(currentTotalCommittedAmount);

    if (currentTotalBudgetTarget > 0) {
      setPercentageCovered((currentTotalCommittedAmount / currentTotalBudgetTarget) * 100);
    } else {
      setPercentageCovered(0);
    }
  }, [user, navigate]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Financing Dashboard</h1>

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
      {scripts.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400">No scripts with budget targets found. Upload a script and set a budget to see financing impact.</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {scripts.map(script => {
            const scriptSlots = JSON.parse(localStorage.getItem('integrationSlots') || '[]') as IntegrationSlot[];
            const relevantSlots = scriptSlots.filter(slot => slot.projectId === script.id);
            const relevantSlotIds = relevantSlots.map(slot => slot.id);

            const storedCommitments = JSON.parse(localStorage.getItem('financingCommitments') || '[]') as FinancingCommitment[];
            const scriptCommitments = storedCommitments.filter(commitment =>
              relevantSlotIds.includes(commitment.slotId)
            );

            const scriptCommittedAmount = scriptCommitments.reduce((sum, c) => sum + c.committedAmount, 0);
            const scriptPercentageCovered = script.budgetTarget && script.budgetTarget > 0
              ? (scriptCommittedAmount / script.budgetTarget) * 100
              : 0;

            return (
              <Card key={script.id}>
                <CardHeader>
                  <CardTitle>{script.title}</CardTitle>
                  <CardDescription>Production Window: {script.productionWindow}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="mb-2"><strong>Budget Target:</strong> ${script.budgetTarget?.toLocaleString() || 'N/A'}</p>
                  <p className="mb-2"><strong>Committed:</strong> ${scriptCommittedAmount.toLocaleString()}</p>
                  <div className="flex items-center gap-2">
                    <Progress value={scriptPercentageCovered} className="flex-1" />
                    <span className="text-sm font-medium">{scriptPercentageCovered.toFixed(2)}% Covered</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FinancingDashboardPage;