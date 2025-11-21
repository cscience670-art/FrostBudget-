'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatterLeMontant } from "@/lib/utils";
import { Bar } from 'react-chartjs-2';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

import { 
  getUserTransactions, 
  createTransaction, 
  getUserAccount,
  updateAccountsBalance 
} from "@/lib/actions/user.actions";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const incomeCategories = [
  "Salary","Bonus","Monthly Profits","Government Support","Freelance Services",
  "Programming","Design","Marketing","E-commerce","Business Profit",
  "Stock Profit","Real Estate Profit","Rent Income","Family Transfer",
  "Financial Help","Debt Refund","Selling Items","Selling Products",
  "Selling Services","Rewards","Prizes",
];

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);


function CategoryInput({ value, onChange }: any) {
  const [query, setQuery] = useState("");
  const [showList, setShowList] = useState(false);

  const filtered = incomeCategories.filter((c) =>
    c.toLowerCase().startsWith(query.toLowerCase())
  );

  return (
    <div className="relative w-full">
      <Input
        value={value}
        onChange={(e) => {
          setQuery(e.target.value);
          onChange(e.target.value);
          setShowList(true);
        }}
        placeholder="Category…"
        className="w-full"
      />

      {showList && query.length > 0 && (
        <ul className="absolute z-50 bg-white border w-full mt-1 max-h-40 overflow-y-auto rounded shadow">
          {filtered.length > 0 ? (
            filtered.map((cat, i) => (
              <li
                key={i}
                onClick={() => {
                  onChange(cat);
                  setQuery(cat);
                  setShowList(false);
                }}
                className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
              >
                {cat}
              </li>
            ))
          ) : (
            <li className="px-3 py-2 text-gray-500 text-sm">
              No match — Add new
            </li>
          )}
        </ul>
      )}
    </div>
  );
}

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

interface RecentIncomesProps {
  userId: string;
}

const RecentIncomes: React.FC<RecentIncomesProps> = ({ userId }) => {
  const [incomes, setIncomes] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newIncome, setNewIncome] = useState({
    name: '',
    amount: '',
    category: '',
    date: ''
  });

  
  const chartRef = useRef<any>(null);

  const loadData = async () => {
    try {
      const userAccounts = await getUserAccount(userId);
      setAccounts(userAccounts);

      const transactions = await getUserTransactions(userId);
      const onlyIncome = transactions.filter((t: any) => t.typeENUM === "income");
      setIncomes(onlyIncome);
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
    }
  };

  useEffect(() => {
    if (userId) loadData();
  }, [userId]);


  const handleAddIncome = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newIncome.name || !newIncome.amount || !newIncome.category || !newIncome.date)
      return;

    try {
      const accountId = accounts[0]?.$id;
      if (!accountId) {
        console.error("Aucun compte trouvé pour l'utilisateur.");
        return;
      }

      const transaction = await createTransaction({
        userId,
        accountId,
        name: newIncome.name,
        amount: Number(newIncome.amount),
        category: newIncome.category,
        typeENUM: "income",
        date: newIncome.date
      });

      setIncomes(prev => [...prev, transaction]);

      const updated = await updateAccountsBalance(userId);
      setAccounts(updated);

      setNewIncome({ name: '', amount: '', category: '', date: '' });
      setShowForm(false);

    } catch (error) {
      console.error("Erreur lors de l'ajout du revenu:", error);
    }
  };


  const generatePDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Liste des Revenus", 14, 20);

    const tableColumn = ["Nom", "Montant", "Date", "Catégorie"];
    const tableRows: any[] = [];

    incomes.forEach((tx) => {
      const rowData = [
        tx.name,
        formatterLeMontant(tx.amount),
        new Date(tx.date).toLocaleDateString(),
        tx.category,
      ];
      tableRows.push(rowData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 30,
    });

    doc.save("income.pdf");
  };

  const downloadChartPDF = () => {
    if (!chartRef.current) return;

    const chartCanvas = chartRef.current.canvas;
    const chartImage = chartCanvas.toDataURL("image/png", 1.0);

    const pdf = new jsPDF("p", "mm", "a4");

    const pdfWidth = 190;
    const pdfHeight = (chartCanvas.height * pdfWidth) / chartCanvas.width;

    pdf.addImage(chartImage, "PNG", 10, 10, pdfWidth, pdfHeight);

    pdf.save("graphique_income.pdf");
  };


  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  const incomeByMonth = months.map((_, i) =>
    incomes.filter(tx => new Date(tx.date).getMonth() === i)
           .reduce((sum, tx) => sum + Number(tx.amount), 0)
  );

  const monthlyPercentage = incomeByMonth.map((total, i) => {
    if (i === 0) return 0;
    if (incomeByMonth[i - 1] === 0) return 100;
    return ((total - incomeByMonth[i - 1]) / incomeByMonth[i - 1]) * 100;
  });

  const chartData = {
    labels: months,
    datasets: [
      {
        label: "Revenus (€)",
        data: incomeByMonth,
        backgroundColor: incomeByMonth.map((total, i) =>
          i > 0 && total > incomeByMonth[i - 1] ? "green" : "red"
        ),
      },
    ],
  };


  return (
    <div className="recent-incomes p-6 bg-white rounded-lg shadow-md space-y-6">

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map(acc => (
          <div key={acc.$id} className="bg-blue-50 p-4 rounded-lg shadow flex flex-col items-center">
            <h3 className="font-semibold mb-2">Compte: {acc.currency}</h3>
            <span className="text-xl font-bold">{formatterLeMontant(acc.balance)}</span>
          </div>
        ))}
      </div>

      <Button
        onClick={downloadChartPDF}
        className="bg-blue-600 hover:bg-blue-700 text-white"
      >
        📊 Télécharger Graph PDF
      </Button>

      <div>
        <h2 className="text-xl font-semibold mb-4">Revenu Mensuel</h2>
        <Bar ref={chartRef} data={chartData} />
        <div className="mt-4 grid grid-cols-12 gap-2 text-sm text-gray-700">
          {incomeByMonth.map((total, i) => (
            <div key={i} className="col-span-1 text-center">
              <div>{formatterLeMontant(total)}</div>
              <div className={`text-xs ${monthlyPercentage[i] >= 0 ? "text-green-600" : "text-red-600"}`}>
                {i === 0 ? "-" : `${monthlyPercentage[i].toFixed(1)}%`}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end mb-4">
        <Button
          onClick={generatePDF}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          📄 Télécharger PDF
        </Button>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Tous les Revenus</h2>
        <Table>
          <TableHeader className="bg-gray-100">
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Montant</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Catégorie</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {incomes.map(tx => (
              <TableRow key={tx.$id}>
                <TableCell>{tx.name}</TableCell>
                <TableCell className="text-green-500">{formatterLeMontant(tx.amount)}</TableCell>
                <TableCell>{new Date(tx.date).toLocaleDateString()}</TableCell>
                <TableCell>{tx.category}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-center">
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {showForm ? "Annuler" : "➕ Ajouter un Revenu"}
        </Button>
      </div>

      {showForm && (
        <form
          onSubmit={handleAddIncome}
          className="mt-4 p-4 border rounded-xl bg-gray-50 shadow-md space-y-4 max-w-md mx-auto"
        >
          <Input
            placeholder="Nom du revenu"
            value={newIncome.name}
            onChange={(e) => setNewIncome({ ...newIncome, name: e.target.value })}
          />
          <Input
            type="number"
            placeholder="Montant"
            value={newIncome.amount}
            onChange={(e) => setNewIncome({ ...newIncome, amount: e.target.value })}
          />
          <CategoryInput
            value={newIncome.category}
            onChange={(v: any) => setNewIncome({ ...newIncome, category: v })}
          />
          <Input
            type="date"
            value={newIncome.date}
            onChange={(e) => setNewIncome({ ...newIncome, date: e.target.value })}
          />
          <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
            Enregistrer le Revenu
          </Button>
        </form>
      )}
    </div>
  );
};

export default RecentIncomes;

