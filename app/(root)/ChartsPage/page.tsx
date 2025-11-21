'use client';

import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
} from 'chart.js';
import { Chart } from 'react-chartjs-2';
import {
  getLoggedInUser,
  getUserTransactions,
  getUserAccount,
  updateAccountsBalance,
  getUserGoals,
  createGoal,
} from "@/lib/actions/user.actions";
import { formatterLeMontant } from "@/lib/utils";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

interface Transaction {
  $id: string;
  name: string;
  amount: number;
  category: string;
  typeENUM: string;
  date: string;
  accountId?: string;
}

interface Account {
  $id: string;
  userId: string;
  currency: string;
  balance: number;
}

export interface Goal {
  $id: string;
  goalName: string;
  startDate: string;
  achieved?: boolean;
  goalAmount?: number;
  progress?: number;
}

const FinancialChartsPage: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  const [newGoal, setNewGoal] = useState({
    goalName: "",
    goalAmount: "",
    startDate: ""
  });
  const [loadingGoal, setLoadingGoal] = useState(false);

 
  useEffect(() => {
    const loadData = async () => {
      const loggedIn = await getLoggedInUser();
      if (!loggedIn) {
        setUser(null);
        setLoading(false);
        return;
      }

      setUser(loggedIn);

      try {
       
        const updatedAccounts = await updateAccountsBalance(loggedIn.$id);
        setAccounts(updatedAccounts);

       
        const allTx = await getUserTransactions(loggedIn.$id);
        setTransactions(allTx);

        
        const userGoals = await getUserGoals(loggedIn.$id);
        setGoals(userGoals);
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
      }

      setLoading(false);
    };

    loadData();
  }, []);

  const handleAddGoal = async () => {
    if (!newGoal.goalName || !newGoal.goalAmount || !newGoal.startDate) {
      alert("Veuillez remplir tous les champs !");
      return;
    }

    setLoadingGoal(true);

    try {
      const created = await createGoal({
        userId: user.$id,
        goalName: newGoal.goalName,
        goalAmount: Number(newGoal.goalAmount),
        startDate: newGoal.startDate,
      });

      setGoals(prev => [...prev, created]);
      setNewGoal({ goalName: "", goalAmount: "", startDate: "" });

    } catch (err) {
      console.error("Erreur d'ajout du goal:", err);
    }

    setLoadingGoal(false);
  };

 
  

  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  const expensesByMonth = months.map((_, i) => 
    transactions
      .filter(tx => tx.typeENUM === 'expense' && new Date(tx.date).getMonth() === i)
      .reduce((sum, tx) => sum + Number(tx.amount), 0)
  );

  const incomesByMonth = months.map((_, i) => 
    transactions
      .filter(tx => tx.typeENUM === 'income' && new Date(tx.date).getMonth() === i)
      .reduce((sum, tx) => sum + Number(tx.amount), 0)
  );

  const savingsByMonth = months.map((_, i) => incomesByMonth[i] - expensesByMonth[i]);

  const monthlyPercentage = savingsByMonth.map((current, i) => {
    if (i === 0) return 0;
    const prev = savingsByMonth[i-1];
    return prev === 0 ? 100 : ((current - prev) / prev) * 100;
  });

  const comboData: ChartData<'bar' | 'line', number[], string> = {
    labels: months,
    datasets: [
      { type:'bar' as const, label:'Dépenses (€)', data: expensesByMonth, backgroundColor:'rgba(248,113,113,0.7)' },
      { type:'bar' as const, label:'Revenus (€)', data: incomesByMonth, backgroundColor:'rgba(96,165,250,0.7)' },
      { type:'line' as const, label:'Épargne (€)', data: savingsByMonth, borderColor:'rgba(34,197,94,1)', backgroundColor:'rgba(34,197,94,0.2)', tension:0.4 }
    ]
  };


  if (loading) {
    return <div className="flex items-center justify-center min-h-screen text-gray-700 text-xl">Chargement...</div>;
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-700 text-xl">
        Vous devez vous connecter pour accéder à cette page.
      </div>
    );
  }

  return (
    <div className="p-4 space-y-8 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 text-center mb-6">Aperçu Financier</h1>

     
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {accounts.map(acc => (
          <div key={acc.$id} className="bg-blue-50 p-4 rounded-lg shadow flex flex-col items-center">
            <h3 className="font-semibold mb-2">Compte: {acc.currency}</h3>
            <span className="text-xl font-bold">{formatterLeMontant(acc.balance)}</span>
          </div>
        ))}
      </div>

     
      <div className="bg-white p-3 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-2">Revenus, Dépenses et Épargne</h2>
        <Chart type="bar" data={comboData} height={150} />
        <div className="mt-4 grid grid-cols-12 gap-2 text-sm text-gray-700">
          {savingsByMonth.map((total, i) => (
            <div key={i} className="col-span-1 text-center">
              <div>{formatterLeMontant(total)}</div>
              <div className={`text-xs ${monthlyPercentage[i]>=0?'text-green-600':'text-red-600'}`}>
                {i===0?'-':`${monthlyPercentage[i].toFixed(1)}%`}
              </div>
            </div>
          ))}
        </div>
      </div>

     
      <div className="bg-white p-4 rounded-lg shadow-md w-full space-y-4">
        <h2 className="text-lg font-semibold">Ajouter un nouvel objectif</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            type="text"
            placeholder="Nom de l'objectif"
            className="border p-2 rounded"
            value={newGoal.goalName}
            onChange={(e) => setNewGoal({ ...newGoal, goalName: e.target.value })}
          />
          <input
            type="number"
            placeholder="Montant (€)"
            className="border p-2 rounded"
            value={newGoal.goalAmount}
            onChange={(e) => setNewGoal({ ...newGoal, goalAmount: e.target.value })}
          />
          <input
            type="date"
            className="border p-2 rounded"
            value={newGoal.startDate}
            onChange={(e) => setNewGoal({ ...newGoal, startDate: e.target.value })}
          />
        </div>
        <button
          onClick={handleAddGoal}
          disabled={loadingGoal}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loadingGoal ? "Ajout..." : "Ajouter l'objectif"}
        </button>
      </div>

      
      <div className="bg-white p-4 rounded-lg shadow-md w-full space-y-3">
        <h2 className="text-lg font-semibold mb-2">Objectifs depargne</h2>
        {goals.length === 0 ? (
          <p>Aucun objectif défini pour le moment.</p>
        ) : (
          <table className="min-w-full border border-gray-200">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="px-4 py-2 border-b">Nom de l objectif</th>
                <th className="px-4 py-2 border-b">Montant</th>
                <th className="px-4 py-2 border-b">Progression</th>
                <th className="px-4 py-2 border-b">Statut</th>
              </tr>
            </thead>
            <tbody>
              {goals.map((goal) => (
                <tr key={goal.$id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border-b">{goal.goalName}</td>
                  <td className="px-4 py-2 border-b">{goal.goalAmount ?? 0}€</td>
                  <td className="px-4 py-2 border-b">{goal.progress ?? 0}€</td>
                  <td className="px-4 py-2 border-b">{goal.achieved ? "Atteint ✅" : "En cours ⏳"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default FinancialChartsPage;


