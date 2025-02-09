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
import { Layout, LayoutGrid, List, LogOut, Settings, User, Trash2 } from "lucide-react";
import { useState } from "react";
import { ProgramWizard } from "@/components/program-wizard";
import { format } from "date-fns";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Program } from "@shared/schema";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type ViewMode = "list" | "grid";

export default function HomePage() {
  const { user, logoutMutation } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [wizardOpen, setWizardOpen] = useState(false);

  const { data: programs = [] } = useQuery<Program[]>({
    queryKey: ["/api/programs"],
  });

  const deleteProgramMutation = useMutation({
    mutationFn: async (programId: number) => {
      await apiRequest("DELETE", `/api/programs/${programId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/programs"] });
    },
  });

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
            <Button onClick={() => setWizardOpen(true)}>
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
              <Button onClick={() => setWizardOpen(true)}>
                <Layout className="mr-2 h-4 w-4" />
                Create New Program
              </Button>
            </CardContent>
          </Card>
        ) : viewMode === "list" ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Sessions</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {programs.map((program) => (
                  <TableRow key={program.id}>
                    <TableCell className="font-medium">{program.title}</TableCell>
                    <TableCell>{format(new Date(program.startDate), 'PPP')}</TableCell>
                    <TableCell>{format(new Date(program.endDate), 'PPP')}</TableCell>
                    <TableCell>{program.sessionCount}</TableCell>
                    <TableCell>{program.studentCount}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteProgramMutation.mutate(program.id)}
                        disabled={deleteProgramMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {programs.map((program) => (
              <Card key={program.id}>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold mb-2">{program.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{program.description}</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Start Date:</span>
                      <span>{format(new Date(program.startDate), 'PPP')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>End Date:</span>
                      <span>{format(new Date(program.endDate), 'PPP')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sessions:</span>
                      <span>{program.sessionCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Students:</span>
                      <span>{program.studentCount}</span>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteProgramMutation.mutate(program.id)}
                      disabled={deleteProgramMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <ProgramWizard open={wizardOpen} onOpenChange={setWizardOpen} />
    </div>
  );
}