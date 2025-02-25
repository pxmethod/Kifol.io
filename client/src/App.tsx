import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import ProgramDetailPage from "@/pages/program-detail-page";
import StudentDetailPage from "@/pages/student-detail-page";
import { ProtectedRoute } from "./lib/protected-route";
import { AuthProvider } from "./hooks/use-auth";

function Router() {
  return (
    <Switch>
      <Route path="/" component={() => <ProtectedRoute component={HomePage} />} />
      <Route 
        path="/programs/:id"
        component={({ params }) => (
          <ProtectedRoute 
            component={() => <ProgramDetailPage params={params} />}
          />
        )}
      />
      <Route 
        path="/programs/:programId/students/:studentId"
        component={({ params }) => (
          <ProtectedRoute 
            component={() => <StudentDetailPage params={params} />}
          />
        )}
      />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;