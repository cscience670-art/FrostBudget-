
import React from "react"; 
import HeaderBox from "@/components/HeaderBox"; 
import BoiteDeSoldeTotale from "@/components/BoiteDeSoldeTotale"; 
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


  

  return (
    <section className="home grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8 p-6 bg-gray-50 min-h-screen">

      
      <div className="flex flex-col gap-8">

      
        <header className="flex flex-col gap-6">
          <HeaderBox
            type="greeting"
            title="FrostBudget Bienvenue"
            user={loggedIn?.firstName || "Invité"}
            subtext="Accédez à votre compte et gérez vos transactions efficacement."
          />
          <div className="flex justify-center items-center my-10">
            <BoiteDeSoldeTotale
           
            />
          </div>
        </header>

        
       

        
      </div>
             <aside className="order-none lg:order-2"><RightSidebar
       user={loggedIn} /></aside>
      
     
    </section>
  );
};

export default Home;



