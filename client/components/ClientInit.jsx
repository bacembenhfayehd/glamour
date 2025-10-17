import { useAuth } from "@/app/hooks/useAuth";

export function ClientInit({ children }) {
  useAuth(); 
  return children;
}