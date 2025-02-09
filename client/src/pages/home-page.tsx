import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Layout, LayoutGrid, List, LogOut, Settings, User } from "lucide-react";
import { useState } from "react";

type ViewMode = "list" | "grid";

export default function HomePage() {
  const { user, logoutMutation } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  // Temporary empty state for demonstration
  const programs: any[] = [];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-md"></div>
            <span className="text-xl font-semibold">EduTrack</span>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar>
                  <AvatarFallback>
                    {user?.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => logoutMutation.mutate()} disabled={logoutMutation.isPending}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">My Programs</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center border rounded-lg p-1">
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="px-3"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="px-3"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </div>
            <Button>
              <Layout className="mr-2 h-4 w-4" />
              Add a Program
            </Button>
          </div>
        </div>

        {programs.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="pt-6 text-center">
              <h2 className="text-xl font-semibold mb-2">No Programs to show yet</h2>
              <p className="text-muted-foreground mb-4">
                Create your first program to start tracking student progress
              </p>
              <Button>
                <Layout className="mr-2 h-4 w-4" />
                Create New Program
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-4"}>
            {/* Program cards will be rendered here */}
          </div>
        )}
      </main>
    </div>
  );
}