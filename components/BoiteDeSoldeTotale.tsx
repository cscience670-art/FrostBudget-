"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import CompteurAnime from "./CompteurAnime";

import {
  getLoggedInUser,
  getUserAccount,
  getUserTransactions
} from "@/lib/actions/user.actions";

interface Account {
  $id: string;
  balance: number;
}

interface Transaction {
  amount: number;
  typeENUM: "income" | "expense";
}

const BoiteDeSoldeTotale = () => {
  const router = useRouter();

  const [balance, setBalance] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);


  const loadData = async () => {
    try {
      const user = await getLoggedInUser();
      if (!user) return;

     
      const userAccounts: Account[] = await getUserAccount(user.$id);
      if (userAccounts.length > 0) {
        setBalance(Number(userAccounts[0].balance));
      }

    
      const transactions: Transaction[] = await getUserTransactions(user.$id);

      const totalInc = transactions
        .filter((t) => t.typeENUM === "income")
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const totalExp = transactions
        .filter((t) => t.typeENUM === "expense")
        .reduce((sum, t) => sum + Number(t.amount), 0);

      setTotalIncome(totalInc);
      setTotalExpense(totalExp);

    } catch (error) {
      console.error("Erreur chargement:", error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <section className="solde-total p-6 bg-white rounded-lg shadow-md mx-auto w-fit">
      <div className="flex flex-col gap-8">

        <div className="grid grid-cols-4 gap-10 text-center">

          {/* Balance */}
          <div className="flex flex-col items-center gap-2">
            <Image src="/icons/wallet.png" width={70} height={70} alt="wallet" />
            <span className="text-sm font-semibold text-gray-600">Balance</span>
            <CompteurAnime montant={balance} />
          </div>

          {/* Total Income */}
          <div className="flex flex-col items-center gap-2">
            <Image src="/icons/income2.png" width={70} height={70} alt="income" />
            <span className="text-sm font-semibold text-gray-600">Total Income</span>
            <CompteurAnime montant={totalIncome} />
          </div>

          {/* Total Expense */}
          <div className="flex flex-col items-center gap-2">
            <Image src="/icons/expenses.png" width={70} height={70} alt="expenses" />
            <span className="text-sm font-semibold text-gray-600">Total Expense</span>
            <CompteurAnime montant={totalExpense} />
          </div>

          <div className="flex flex-col items-center gap-2">
            <Image src="/icons/earn-money.png" width={170} height={110} alt="extra" />
          </div>

        </div>

        
        <div className="flex justify-center mt-6">
          <button
            onClick={() => router.push("/Expense")}
            className="bg-green-400 hover:bg-green-500 text-white text-sm font-medium py-2 px-6 rounded-md shadow-md transition-colors"
          >
            Make an Expense
          </button>
        </div>

      </div>
    </section>
  );
};

export default BoiteDeSoldeTotale;

