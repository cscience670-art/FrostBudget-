"use client";


import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatterLeMontant } from "@/lib/utils";
import { 
  CloudSnow, 
  RefreshCw, 
  TrendingDown, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  HelpCircle
} from "lucide-react";

// Types correspondants à votre schéma de base de données
interface MonthlyBudget {
  $id: string;
  userId: string;
  categoryId: string;
  categoryName: string; // Nom de la catégorie associée
  allocatedAmount: number; // Budget alloué
  activityAmount: number; // Dépenses réelles constatées
  month_year: string;
}

interface UserCashOnHand {
  $id: string;
  userId: string;
  toBeBudgeted: number; // Glace Fondue / Argent disponible
}

interface RecentBudgetsProps {
  userId: string;
}

const RecentBudgets: React.FC<RecentBudgetsProps> = ({ userId }) => {
  const [budgets, setBudgets] = useState<MonthlyBudget[]>([]);
  const [cashOnHand, setCashOnHand] = useState<UserCashOnHand | null>(null);
  const [loading, setLoading] = useState(true);

  // États pour le Modal de réajustement (Blizzard Realignment)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetBudget, setTargetBudget] = useState<MonthlyBudget | null>(null);
  const [sourceBudgetId, setSourceBudgetId] = useState<string>("");
  const [transferAmount, setTransferAmount] = useState<string>("");

  // États pour l'ajout d'une nouvelle ligne budgétaire
  const [newAllocated, setNewAllocated] = useState({
    categoryId: '',
    categoryName: '',
    amount: ''
  });

  // Simulation des catégories disponibles (récupérées normalement depuis la table Category)
  const availableCategories = [
    { id: "cat_1", name: "Alimentation" },
    { id: "cat_2", name: "Loyer & Factures" },
    { id: "cat_3", name: "Loisirs & Sorties" },
    { id: "cat_4", name: "Santé" },
    { id: "cat_5", name: "Abonnements" }
  ];

  // Chargement initial des données
  const loadBudgetData = async () => {
    setLoading(true);
    try {
      // Simulation des données de la base de données (Appwrite / SQL)
      // Dans votre code final, vous appellerez vos actions Appwrite en passant par les ID de collection définis dans vos variables d'environnement.
      
      setCashOnHand({
        $id: "cash_1",
        userId: userId,
        toBeBudgeted: 450.00 // Exemple : 450€ non distribués (Glace Fondue)
      });

      setBudgets([
        {
          $id: "b_1",
          userId: userId,
          categoryId: "cat_1",
          categoryName: "Alimentation",
          allocatedAmount: 300,
          activityAmount: 350, // Dépassement ! (Alerte rouge)
          month_year: "2026-07-01"
        },
        {
          $id: "b_2",
          userId: userId,
          categoryId: "cat_2",
          categoryName: "Loyer & Factures",
          allocatedAmount: 800,
          activityAmount: 800,
          month_year: "2026-07-01"
        },
        {
          $id: "b_3",
          userId: userId,
          categoryId: "cat_3",
          categoryName: "Loisirs & Sorties",
          allocatedAmount: 200,
          activityAmount: 50, // Excédent disponible pour le réalignement
          month_year: "2026-07-01"
        }
      ]);
    } catch (error) {
      console.error("Erreur de chargement du budget:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) loadBudgetData();
  }, [userId]);

  // Ajouter ou modifier une enveloppe budgétaire (Allouer de l'argent de l'Icebox)
  const handleAllocate = (e: React.FormEvent) => {
    e.preventDefault();
    const amountToAllocate = Number(newAllocated.amount);

    if (!newAllocated.categoryId || amountToAllocate <= 0 || !cashOnHand) return;
    if (amountToAllocate > cashOnHand.toBeBudgeted) {
      alert("Vous n'avez pas assez de Glace Fondue disponible !");
      return;
    }

    const selectedCat = availableCategories.find(c => c.id === newAllocated.categoryId);
    if (!selectedCat) return;

    // Mise à jour de l'état local (à lier à Appwrite en production)
    const existingIndex = budgets.findIndex(b => b.categoryId === selectedCat.id);
    
    if (existingIndex > -1) {
      const updated = [...budgets];
      updated[existingIndex].allocatedAmount += amountToAllocate;
      setBudgets(updated);
    } else {
      setBudgets(prev => [...prev, {
        $id: `b_${Date.now()}`,
        userId,
        categoryId: selectedCat.id,
        categoryName: selectedCat.name,
        allocatedAmount: amountToAllocate,
        activityAmount: 0,
        month_year: "2026-07-01"
      }]);
    }

    // Soustraire du solde de l'Icebox
    setCashOnHand({
      ...cashOnHand,
      toBeBudgeted: cashOnHand.toBeBudgeted - amountToAllocate
    });

    setNewAllocated({ categoryId: '', categoryName: '', amount: '' });
  };

  // Exécuter le Blizzard Realignment (Transférer l'argent entre catégories)
  const executeRealignment = () => {
    const amount = Number(transferAmount);
    if (!targetBudget || !sourceBudgetId || amount <= 0) return;

    const sourceIndex = budgets.findIndex(b => b.$id === sourceBudgetId);
    const targetIndex = budgets.findIndex(b => b.$id === targetBudget.$id);

    if (sourceIndex === -1 || targetIndex === -1) return;

    const source = budgets[sourceIndex];
    // S'assurer que la source a assez d'argent disponible (Alloué - Dépensé)
    const sourceAvailable = source.allocatedAmount - source.activityAmount;

    if (amount > sourceAvailable) {
      alert("Le montant du transfert dépasse les fonds disponibles dans la catégorie source !");
      return;
    }

    const updated = [...budgets];
    // Transférer les fonds
    updated[sourceIndex].allocatedAmount -= amount;
    updated[targetIndex].allocatedAmount += amount;

    setBudgets(updated);
    setIsModalOpen(false);
    setTargetBudget(null);
    setTransferAmount("");
    setSourceBudgetId("");
  };

  // Ouvrir le modal Blizzard Realignment pour une catégorie spécifique
  const openRealignmentModal = (budget: MonthlyBudget) => {
    setTargetBudget(budget);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <CloudSnow className="animate-spin text-cyan-500 w-8 h-8" />
        <span className="ml-2 text-gray-500">Gel des données en cours...</span>
      </div>
    );
  }

  const iceboxValue = cashOnHand?.toBeBudgeted || 0;

  return (
    <div className="space-y-8">
      
      {/* ❄️ ZONE 1 : L'Icebox Bucket (Glace Fondue) */}
      <div className={`p-6 rounded-2xl border transition-all duration-500 shadow-lg ${
        iceboxValue > 0 
          ? "bg-gradient-to-r from-blue-50 to-cyan-100 border-cyan-200 text-cyan-900" 
          : "bg-gradient-to-r from-green-50 to-emerald-100 border-emerald-200 text-emerald-900"
      }`}>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center md:text-left">
            <h2 className="text-lg font-bold flex items-center justify-center md:justify-start gap-2">
              <span>❄️ La Glace Fondue (Icebox)</span>
            </h2>
            <p className="text-xs opacity-80">
              {iceboxValue > 0 
                ? "Distribuez cet argent restant dans vos enveloppes pour atteindre l'équilibre YNAB !"
                : "Excellent travail ! Chaque centime de votre glacier a trouvé sa place."}
            </p>
          </div>
          <div className="flex items-center gap-4 bg-white/60 backdrop-blur-md px-6 py-3 rounded-xl border border-white/50 shadow-inner">
            <span className="text-sm font-semibold">Disponible à allouer :</span>
            <span className={`text-3xl font-black ${iceboxValue > 0 ? "text-cyan-600" : "text-emerald-600 animate-bounce"}`}>
              {formatterLeMontant(iceboxValue)}
            </span>
          </div>
        </div>
      </div>

      {/* 📊 ZONE 2 : Tableau des enveloppes de budget */}
      <div className="bg-white rounded-2xl border shadow-md overflow-hidden">
        <div className="p-5 border-b bg-gray-50 flex items-center justify-between">
          <h3 className="font-bold text-gray-800">Vos Enveloppes Mensuelles</h3>
          <span className="text-xs text-gray-500">Mois de Juillet 2026</span>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/50">
              <TableHead>Catégorie</TableHead>
              <TableHead className="text-right">Budget Alloué</TableHead>
              <TableHead className="text-right">Dépenses Réelles</TableHead>
              <TableHead className="text-right">Solde Disponible</TableHead>
              <TableHead className="text-center">Statut du Glacier</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {budgets.map((b) => {
              const available = b.allocatedAmount - b.activityAmount;
              const isOverspent = available < 0;

              return (
                <TableRow key={b.$id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="font-medium text-gray-800 p-4">{b.categoryName}</td>
                  <td className="text-right p-4 font-semibold text-blue-600">
                    {formatterLeMontant(b.allocatedAmount)}
                  </td>
                  <td className="text-right p-4 text-gray-600">
                    {formatterLeMontant(b.activityAmount)}
                  </td>
                  <td className={`text-right p-4 font-bold ${isOverspent ? "text-red-500" : "text-green-600"}`}>
                    {formatterLeMontant(available)}
                  </td>
                  <td className="p-4 text-center">
                    {isOverspent ? (
                      <Button
                        onClick={() => openRealignmentModal(b)}
                        size="sm"
                        className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-full flex items-center gap-1 mx-auto"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Glace Brisée - Réaligner 🌬️
                      </Button>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 font-medium">
                        <CheckCircle className="w-3 h-3" />
                        Solide
                      </span>
                    )}
                  </td>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* ➕ ZONE 3 : Ajouter / Allouer des fonds à une enveloppe */}
      {iceboxValue > 0 && (
        <div className="bg-white p-6 rounded-2xl border shadow-md max-w-lg mx-auto">
          <h4 className="font-bold text-gray-800 mb-4 text-center">Allouer de la Glace Fondue 🧊</h4>
          <form onSubmit={handleAllocate} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-500">Choisir une enveloppe</label>
              <select
                value={newAllocated.categoryId}
                onChange={(e) => setNewAllocated({ ...newAllocated, categoryId: e.target.value })}
                className="w-full border rounded-lg p-2 text-sm bg-white"
                required
              >
                <option value="">Sélectionner une catégorie...</option>
                {availableCategories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-500">Montant à transférer depuis l'Icebox (€)</label>
              <Input
                type="number"
                placeholder="Ex: 100"
                value={newAllocated.amount}
                onChange={(e) => setNewAllocated({ ...newAllocated, amount: e.target.value })}
                required
              />
            </div>
            <Button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-700 text-white">
              Geler dans l'enveloppe
            </Button>
          </form>
        </div>
      )}

      {/* 🌬️ MODAL : Blizzard Realignment (Tension / Réalignement Flexible) */}
      {isModalOpen && targetBudget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border p-6 max-w-md w-full shadow-2xl relative mx-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-2">
              <span>🌬️ Blizzard Realignment</span>
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Votre enveloppe <strong className="text-red-500">{targetBudget.categoryName}</strong> est brisée. Sélectionnez une autre enveloppe solide pour la réparer.
            </p>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500">Prendre de l'argent depuis :</label>
                <select
                  value={sourceBudgetId}
                  onChange={(e) => setSourceBudgetId(e.target.value)}
                  className="w-full border rounded-lg p-2 text-sm bg-white"
                >
                  <option value="">Choisir une enveloppe solide...</option>
                  {budgets
                    .filter(b => b.$id !== targetBudget.$id && (b.allocatedAmount - b.activityAmount) > 0)
                    .map((b) => (
                      <option key={b.$id} value={b.$id}>
                        {b.categoryName} (Disponible: {formatterLeMontant(b.allocatedAmount - b.activityAmount)})
                      </option>
                    ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500">Montant à transférer (€) :</label>
                <Input
                  type="number"
                  placeholder="Ex: 50"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Button 
                  onClick={() => setIsModalOpen(false)} 
                  variant="outline" 
                  className="w-full"
                >
                  Annuler
                </Button>
                <Button 
                  onClick={executeRealignment}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Réaligner le Blizzard
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default RecentBudgets;
