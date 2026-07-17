import React from "react";
import HeaderBox from "@/components/HeaderBox";
import RecentBudgets from "@/components/RecentBudgets";
import { getLoggedInUser } from "@/lib/actions/user.actions";

const BudgetPage = async () => {
  const loggedIn = await getLoggedInUser();
  if (!loggedIn) return null;

  return (
    <section className="home flex flex-col gap-8 p-6 bg-gray-50 min-h-screen">
      
      {/* En-tête de la page */}
      <header className="flex flex-col gap-4">
        <HeaderBox
          type="title"
          title="Mon Budget Polaire"
          subtext="Appliquez la méthode zéro-budget d'YNAB pour allouer efficacement chaque euro de votre glacier."
        />
      </header>

      {/* Intégration du gestionnaire de budget YNAB */}
      <div className="mt-4">
        <RecentBudgets userId={loggedIn.$id} />
      </div>

    </section>
  );
};

export default BudgetPage;