import React from "react";
import HeaderBox from "@/components/HeaderBox";
import HibernationGoals from "@/components/HibernationGoals";
import { getLoggedInUser } from "@/lib/actions/user.actions";

const HibernationPage = async () => {
  const loggedIn = await getLoggedInUser();
  if (!loggedIn) return null;

  return (
    <section className="home flex flex-col gap-8 p-6 bg-gray-50 min-h-screen">
      
      {/* En-tête de la page avec l'identité visuelle du système */}
      <header className="flex flex-col gap-4">
        <HeaderBox
          type="title"
          title="Fonds d'Hibernation"
          subtext="Anticipez vos dépenses annuelles et sécurisez vos réserves financières à long terme en gelant vos flux mensuels."
        />
      </header>

      {/* Composant interactif pour la gestion des objectifs d'hibernation */}
      <div className="mt-4">
        <HibernationGoals userId={loggedIn.$id} />
      </div>

    </section>
  );
};

export default HibernationPage;