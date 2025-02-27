import { useAuth } from "@/hooks/use-auth";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Redirect } from "wouter";

type ProtectedRouteProps = {
  component: React.ComponentType<any>;
};

export function ProtectedRoute({ component: Component }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Loading your account..." />;
  }

  if (!user) {
    return <Redirect to="/auth" />;
  }

  return <Component />;
}