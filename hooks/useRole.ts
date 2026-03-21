import { useQuery } from "convex/react";

export function useRole() {
  const user = useQuery("users:getMe" as any);
  return {
    role: user?.role ?? null,
    isAdmin: user?.role === "admin",
    isAgent: user?.role === "agent",
    isCustomer: user?.role === "customer",
    isLoading: user === undefined,
  };
}
