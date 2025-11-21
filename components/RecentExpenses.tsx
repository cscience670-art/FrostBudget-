'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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

export const expenseCategories = [
  "Rent","Electricity Bill","Water Bill","Gas Bill","Internet","Phone Bill",
  "Transportation","Fuel","Car Maintenance","Insurance","Groceries","Restaurants",
  "Cafes","Fast Food","Delivery","Medicine","Hospital","Medical Analysis","Optics",
  "Therapy","Health Insurance","Books","Private Lessons","Online Courses",
  "Educational Subscriptions","Cinema","Streaming Subscriptions","Games","Travel",
  "Hobbies","Clothes","Shoes","Perfume","Personal Care","Kids Supplies","School",
  "Kindergarten","Toys","Loans","Installments","Taxes","Fines","Gifts","Donations",
  "Home Supplies","Home Maintenance","Emergency"
];

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);


function CategoryInput({ value, onChange }: any) {
  const [query, setQuery] = useState("");
  const [showList, setShowList] = useState(false);

  const filtered = expenseCategories.filter((c) =>
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

interface Expense {
  $id: string;
  name: string;
  amount: number;
  date: string;
  category: string;
  typeENUM: string;
  accountId?: string;
}

interface Account {
  $id: string;
  userId: string;
  currency: string;
  balance: number;
}

interface RecentExpensesProps {
  userId: string;
}

const RecentExpenses: React.FC<RecentExpensesProps> = ({ userId }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [newExpense, setNewExpense] = useState({ name: '', amount: '', date: '', category: '' });
  const chartRef = useRef<any>(null);


  const loadData = async () => {
    try {
      const userAccounts = await getUserAccount(userId);
      setAccounts(userAccounts);

      const transactions = await getUserTransactions(userId);
      const onlyExpenses = transactions.filter((tx: any) => tx.typeENUM === "expense");
      setExpenses(onlyExpenses);
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
    }
  };

  useEffect(() => {
    if (userId) loadData();
  }, [userId]);

  
  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newExpense.name || !newExpense.amount || !newExpense.date || !newExpense.category) return;

    try {
      const accountId = accounts[0]?.$id;
      if (!accountId) {
        console.error("Aucun compte trouvé pour l'utilisateur.");
        return;
      }

      const newTx = await createTransaction({
        userId,
        accountId,
        name: newExpense.name,
        amount: Number(newExpense.amount),
        category: newExpense.category,
        typeENUM: "expense",
        date: newExpense.date
      });

      setExpenses(prev => [...prev, newTx]);

      const updatedAccounts = await updateAccountsBalance(userId);
      setAccounts(updatedAccounts);

      setNewExpense({ name: '', amount: '', date: '', category: '' });
    } catch (error) {
      console.error("Erreur lors de l'ajout de la dépense:", error);
    }
  };

 
  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Liste des Revenus", 14, 20);

    const tableColumn = ["Nom", "Montant", "Date", "Catégorie"];
    const tableRows: any[] = [];

    expenses.forEach((tx) => {
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

    doc.save("Expense.pdf");
  };

  const downloadChartPDF = () => {
    if (!chartRef.current) return;

    const chartCanvas = chartRef.current.canvas;
    const chartImage = chartCanvas.toDataURL("image/png", 1.0);

    const pdf = new jsPDF("p", "mm", "a4");

    const pdfWidth = 190;
    const pdfHeight = (chartCanvas.height * pdfWidth) / chartCanvas.width;

    pdf.addImage(chartImage, "PNG", 10, 10, pdfWidth, pdfHeight);
    pdf.save("graphique_Expense.pdf");
  };

  
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  const expenseByMonth = months.map((_, i) =>
    expenses.filter(tx => new Date(tx.date).getMonth() === i)
            .reduce((sum, tx) => sum + Number(tx.amount), 0)
  );

  const monthlyPercentage = expenseByMonth.map((total, i) => {
    if (i === 0) return 0;
    if (expenseByMonth[i - 1] === 0) return 100;
    return ((total - expenseByMonth[i - 1]) / expenseByMonth[i - 1]) * 100;
  });

  const chartData = {
    labels: months,
    datasets: [
      {
        label: "Dépenses (€)",
        data: expenseByMonth,
        backgroundColor: expenseByMonth.map((total, i) =>
          i > 0 && total > expenseByMonth[i - 1] ? "red" : "green"
        ),
      },
    ],
  };

  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen">

     
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

      {/* 🔵 الرسم البياني */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Mois et Dépenses</h2>
        <Bar ref={chartRef} data={chartData} />
        <div className="mt-4 grid grid-cols-12 gap-2 text-sm text-gray-700">
          {expenseByMonth.map((total, i) => (
            <div key={i} className="col-span-1 text-center">
              <div>{formatterLeMontant(total)}</div>
              <div className={`text-xs ${monthlyPercentage[i] >= 0 ? "text-green-600" : "text-red-600"}`}>
                {i === 0 ? "-" : `${monthlyPercentage[i].toFixed(1)}%`}
              </div>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleAddExpense} className="bg-white p-4 rounded-lg shadow-md space-y-4">
        <h3 className="text-lg font-medium">Ajouter une dépense</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            placeholder="Nom"
            value={newExpense.name}
            onChange={e => setNewExpense({ ...newExpense, name: e.target.value })}
          />
          <Input
            placeholder="Montant"
            type="number"
            value={newExpense.amount}
            onChange={e => setNewExpense({ ...newExpense, amount: e.target.value })}
          />
          <Input
            type="date"
            value={newExpense.date}
            onChange={e => setNewExpense({ ...newExpense, date: e.target.value })}
          />
          <CategoryInput
            value={newExpense.category}
            onChange={(val: string) => setNewExpense({ ...newExpense, category: val })}
          />
        </div>
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
          Ajouter
        </Button>
      </form>

      <div className="flex justify-end mb-4">
        <Button 
          onClick={generatePDF}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          📄 Télécharger PDF
        </Button>
      </div>

      
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h3 className="text-lg font-medium mb-2">Dépenses récentes</h3>
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
            {expenses.map(tx => (
              <TableRow key={tx.$id}>
                <TableCell>{tx.name}</TableCell>
                <TableCell className="text-red-500">{formatterLeMontant(tx.amount)}</TableCell>
                <TableCell>{new Date(tx.date).toLocaleDateString()}</TableCell>
                <TableCell>{tx.category}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default RecentExpenses;
