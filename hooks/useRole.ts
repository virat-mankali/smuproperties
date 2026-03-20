import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

export function useRole() {
  const user = useQuery(api.users.getMe);
  return {
    role: user?.role ?? null,
    isAdmin: user?.role === "admin",
    isAgent: user?.role === "agent",
    isCustomer: user?.role === "customer",
    isLoading: user === undefined,
  };
}
