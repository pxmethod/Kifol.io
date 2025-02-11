import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Session, insertSessionSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Pencil, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const sessionSchema = insertSessionSchema.extend({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
});

type ProgramSessionsProps = {
  programId: number;
};

export function ProgramSessions({ programId }: ProgramSessionsProps) {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editSession, setEditSession] = useState<Session | null>(null);

  const { data: sessions = [] } = useQuery<Session[]>({
    queryKey: [`/api/programs/${programId}/sessions`],
  });

  const form = useForm({
    resolver: zodResolver(sessionSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const createSessionMutation = useMutation({
    mutationFn: async (data: z.infer<typeof sessionSchema>) => {
      const res = await apiRequest("POST", `/api/programs/${programId}/sessions`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/programs/${programId}/sessions`] });
      toast({
        title: "Success",
        description: "Session created successfully",
      });
      form.reset();
      setDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateSessionMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: z.infer<typeof sessionSchema> }) => {
      const res = await apiRequest("PATCH", `/api/programs/${programId}/sessions/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/programs/${programId}/sessions`] });
      toast({
        title: "Success",
        description: "Session updated successfully",
      });
      form.reset();
      setEditSession(null);
      setDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = form.handleSubmit((data) => {
    if (editSession) {
      updateSessionMutation.mutate({ id: editSession.id, data });
    } else {
      createSessionMutation.mutate(data);
    }
  });

  const handleEdit = (session: Session) => {
    setEditSession(session);
    form.reset({
      name: session.name,
      description: session.description || "",
    });
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setEditSession(null);
    form.reset({
      name: "",
      description: "",
    });
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Sessions</h2>
      </div>

      <div className="grid gap-4">
        {sessions.map((session) => (
          <Card key={session.id}>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{session.name}</h3>
                  {session.description && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {session.description}
                    </p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(session)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button onClick={handleAdd} className="w-full mt-6">
        Add Session
      </Button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editSession ? "Edit Session" : "Add Session"}
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={onSubmit} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter session name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter session description"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    createSessionMutation.isPending ||
                    updateSessionMutation.isPending
                  }
                >
                  {(createSessionMutation.isPending ||
                    updateSessionMutation.isPending) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {editSession ? "Save Changes" : "Create Session"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}