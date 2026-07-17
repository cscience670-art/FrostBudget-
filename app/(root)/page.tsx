import React from "react"; 
import HeaderBox from "@/components/HeaderBox"; 
import BoiteDeSoldeTotale from "@/components/BoiteDeSoldeTotale"; 
import AgeOfIce from "@/components/AgeOfIce"; 
import { RightSidebar } from "@/components/RightSidebar"; 
import { getLoggedInUser } from "@/lib/actions/user.actions"; 

interface SearchParamProps { 
  searchParams: { 
    id: string; 
    page: string; 
  }; 
} 

const Home = async ({ searchParams: { id, page } }: SearchParamProps) => {
  const currentPage = Number(page) || 1;

  const loggedIn = await getLoggedInUser();
  if (!loggedIn) return null;

  // Par défaut, nous simulons 35 jours (un iceberg solide et stable).
  // Vous pourrez connecter cette valeur à votre base de données plus tard.
  const simulatedAgeOfMoney = 35;

  return (
    <section className="home grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8 p-6 bg-gray-50 min-h-screen">
      
      {/* Contenu principal de l'application */}
      <div className="flex flex-col gap-8">
        
        <header className="flex flex-col gap-6">
          <HeaderBox
            type="greeting"
            title="Bienvenue sur FrostBudget"
            user={loggedIn?.firstName || "Invité"}
            subtext="Accédez à votre compte et gérez vos transactions efficacement."
          />
          
          {/* Intégration de la fonctionnalité de l'Âge de la Glace */}
          <div className="flex justify-center items-center my-6">
            <BoiteDeSoldeTotale />
          </div>
          
          <div className="mt-2">
            <AgeOfIce days={simulatedAgeOfMoney} />
          </div>

          
        </header>

        {/* Vous pourrez ajouter les tableaux des dernières transactions ici à l'avenir */}

      </div>

      {/* Barre latérale droite */}
      <aside className="order-none lg:order-2">
        <RightSidebar user={loggedIn} />
      </aside>
      
    </section>
  );
};

export default Home;

