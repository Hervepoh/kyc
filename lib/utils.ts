import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import bcrypt from "bcryptjs";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}




export async function checkContractExists(contractNumber: string): Promise<boolean> {
  const res = await fetch(`/api/cms/${contractNumber}`, {
    method: 'POST',
  });

  if (!res.ok) return false;

  const data = await res.json();
  return data.exists === true;
}

export const fetchCustomer = async (query: string) => {
  try {
    const res = await fetch(`/api/cms?query=${encodeURIComponent(query)}`,{
      method: 'POST',
    });
    // if (!res.ok) throw new Error('Customer not found');
    if (!res.ok) return { data: [], message:"Customer not found"};
    const data = await res.json();
     return {data , message:""};
  } catch (error:any) {
    console.error('Erreur lors de la recherche:', error);
    return { data: [], message: error.message || 'Erreur lors de la recherche:'};
    // afficher message d’erreur à l’utilisateur
  }
};

