import { useGetMe, useLogin } from "@workspace/api-client-react";
import { setToken, clearToken } from "@/lib/auth";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";

export function useAuth() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { data: user, isLoading, error, refetch } = useGetMe({
    query: {
      retry: false,
      staleTime: Infinity,
    } as any,
  });

  const loginMutation = useLogin({
    mutation: {
      onSuccess: (data) => {
        setToken(data.token);
        refetch();
        setLocation("/admin/dashboard");
      }
    }
  });

  const logout = () => {
    clearToken();
    queryClient.clear();
    setLocation("/admin");
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login: loginMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,
    logout
  };
}
