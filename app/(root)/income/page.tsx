// app/incomes/page.tsx
import React from "react";

import HeaderBox from "@/components/HeaderBox";
import RecentIncomes from "@/components/RecentIncomes";
import { getLoggedInUser } from "@/lib/actions/user.actions";
import {getUserTransactions} from "@/lib/actions/user.actions"
import {createTransaction} from "@/lib/actions/user.actions"

const IncomePage = async () => {
  const loggedIn = await getLoggedInUser();

  if (!loggedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-700 text-xl">
        Vous devez vous connecter pour accéder à cette page.
      </div>
    );
  }


  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <HeaderBox
        type="greeting"
        title="FrostBudget Bienvenue"
        user={loggedIn.firstName || "Invité"}
        subtext="Bienvenue! Vous êtes connecté avec succès."
      />

      {/* Recherche */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <input placeholder="Rechercher un revenu..." className="flex-1 p-2 border rounded" />
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
          Rechercher
        </button>
      </div>

      <RecentIncomes userId={loggedIn.$id} />

      
    </div>
  );
};

export default IncomePage;

