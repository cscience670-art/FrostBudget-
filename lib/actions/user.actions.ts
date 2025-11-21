'use server';

import { ID, Query, Client, Account } from 'node-appwrite';
import { createAdminClient, createSessionClient } from '../appwrite';
import { cookies } from 'next/headers';
import { parseStringify } from '../utils';


const {
  APPWRITE_DATABASE_ID: DATABASE_ID,
  USERS_COLLECTION_ID: USER_COLLECTION_ID,
  TRANSACTIONS_COLLECTION_ID: TRANSACTION_COLLECTION_ID,
  GOALS_COLLECTION_ID: GOAL_COLLECTION_ID,
  ACCOUNTS_COLLECTION_ID:ACCOUNT_COLLECTION_ID,
  CATEGORRYS_COLLECTION_ID:CATEGORRY_COLLECTION_ID
} = process.env;





export const signUp = async ({ email, password, firstName, lastName, username }: any) => {
  try {
    const { account, database } = await createAdminClient();

   
    const userId = ID.unique();

    
    await account.create(userId, email, password, username);

   
    const userDoc = await database.createDocument(
      DATABASE_ID!,
      USER_COLLECTION_ID!,
      userId,
      {
        username,
        firstName,
        lastName,
        email,
        passwordHash: password, 
        isVerified: false,
      }
    );

   
    const userAccount = await database.createDocument(
      DATABASE_ID!,
      ACCOUNT_COLLECTION_ID!,
      ID.unique(),
      {
        userId,
        currency: 'USD',
        balance: 0,
      }
    );

    
    const session = await account.createEmailPasswordSession(email, password);

    cookies().set('appwrite-session', session.secret, {
      path: '/',
      httpOnly: true,
      sameSite: 'strict',
      secure: true,
    });

    return {
      success: true,
      data: parseStringify({ user: userDoc, account: userAccount }),
    };
  } catch (error: any) {
    console.error('Erreur de création du compte:', error);
    return {
      success: false,
      error: error.message || 'errror success false',
    };
  }
};


export const signIn = async ({ email, password }: any) => {
  try {
    const { account, database } = await createAdminClient();

 
    const session = await account.createEmailPasswordSession(email, password);

   
    cookies().set("appwrite-session", session.secret, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: true,
    });

  
    const userList = await database.listDocuments(
      DATABASE_ID!,
      USER_COLLECTION_ID!,
      [Query.equal("email", email)]
    );

    if (userList.total === 0) {
      return {
        success: false,
        error: "لم يتم العثور على بيانات المستخدم.",
      };
    }

    return {
      success: true,
      data: parseStringify(userList.documents[0]),
    };

  } catch (error: any) {
    console.error("Erreur de connexion:", error);
    return {
      success: false,
      error: error.message || "تعذر تسجيل الدخول",
    };
  }
};



export const logoutAccount = async () => {
  try {
    const { account } = await createSessionClient();
    cookies().delete('appwrite-session');
    await account.deleteSession('current');
  } catch (error) {
    console.error('Erreur de déconnexion:', error);
  }
};


export const getLoggedInUser = async () => {
  try {
    const { account } = await createSessionClient();
    const userResult = await account.get();

    const { database } = await createAdminClient();
    const user = await database.listDocuments(DATABASE_ID!, USER_COLLECTION_ID!, [
      Query.equal('email', userResult.email),
    ]);

    return parseStringify(user.documents[0]);
  } catch {
    return null;
  }
};

export const createTransaction = async ({
  userId,
  accountId,   
  name,
  amount,
  category,
  typeENUM,
  date
}: any) => {
  try {
    const { database } = await createAdminClient();

    const transaction = await database.createDocument(
      DATABASE_ID!,
      TRANSACTION_COLLECTION_ID!,
      ID.unique(),
      {
        userId,
        accountId,   
        name,
        amount,
        category,
        typeENUM,
        date
      }
    );

    return parseStringify(transaction);

  } catch (error) {
    console.error("Erreur lors de la création de la transaction:", error);
    throw error;
  }
};


export const getUserTransactions = async (userId: string) => {
  try {
    const { database } = await createAdminClient();

    const list = await database.listDocuments(
      DATABASE_ID!,
      TRANSACTION_COLLECTION_ID!,
      [
        Query.equal("userId", userId),
        Query.orderAsc("$createdAt") 
      ]
    );

    return parseStringify(list.documents);

  } catch (error) {
    console.error("Erreur lors du chargement des transactions:", error);
    throw error;
  }
};

/* ==========================================================
   GOALS ACTIONS
========================================================== */

export const getUserGoals = async (userId: string) => {
  try {
    

    const { database } = await createAdminClient();

    const list = await database.listDocuments(
      DATABASE_ID!,
      GOAL_COLLECTION_ID!,
      [
        Query.equal("userId", userId),
        Query.orderAsc("$createdAt") 
      ]
    );

    return parseStringify(list.documents);

  } catch (error) {
    console.error("Erreur lors du chargement des goals:", error);
    throw error;
  }
};

export const createGoal = async ({
  userId,
  goalName,
  goalAmount,
  startDate
}: any) => {
  try {
    const { database } = await createAdminClient();

    const goal = await database.createDocument(
      DATABASE_ID!,
      GOAL_COLLECTION_ID!,
      ID.unique(),
      {
        userId,
        goalName,
        goalAmount,
        startDate,
        achieved: false,
        progress: 0,
        goalId: Math.floor(Math.random() * 10000)
      }
    );

    return parseStringify(goal);

  } catch (error) {
    console.error("Erreur lors de la création du goal:", error);
    throw error;
  }
};




export const getUserAccount = async (userId: string) => {
  try {
    const { database } = await createAdminClient();

    const list = await database.listDocuments(
      DATABASE_ID!,
      ACCOUNT_COLLECTION_ID!,
      [
        Query.equal("userId", userId),
        Query.orderAsc("$createdAt") 
      ]
    );

  
    return parseStringify(list.documents);

  } catch (error) {
    console.error("Erreur lors du chargement des comptes:", error);
    throw error;
  }
};

export const updateAccountsBalance = async (userId: string) => {
  try {
    const { database } = await createAdminClient();

    
    const accounts = await getUserAccount(userId);
    const transactions = await getUserTransactions(userId);

 
    for (const account of accounts) {

      const accountTx = transactions.filter((tx: any) => tx.accountId === account.$id);

      const balance = accountTx.reduce((total: number, tx: any) => {
        if (tx.typeENUM === "income") return total + Number(tx.amount);
        if (tx.typeENUM === "expense") return total - Number(tx.amount);
        return total;
      }, 0);

      await database.updateDocument(
        DATABASE_ID!,
        ACCOUNT_COLLECTION_ID!,
        account.$id,
        {
          balance
        }
      );
    }

    
    const updatedAccounts = await getUserAccount(userId);
    return updatedAccounts;

  } catch (error) {
    console.error("Erreur lors de la mise à jour des comptes:", error);
    throw error;
  }
};






