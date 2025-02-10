import { useQuery, useMutation } from "@tanstack/react-query";
import { Program } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Pencil, ArrowLeft } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProgramSchema } from "@shared/schema";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Link } from "wouter";

export default function ProgramDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { toast } = useToast();
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const { data: program } = useQuery<Program>({
    queryKey: [`/api/programs/${params.id}`],
  });

  const updateProgramMutation = useMutation({
    mutationFn: async (data: { title: string; description: string }) => {
      const res = await apiRequest("PATCH", `/api/programs/${params.id}`, data);
      return res.json();
    },
    onSuccess: () => {
      // Invalidate both the specific program query and the programs list query
      queryClient.invalidateQueries({
        queryKey: [`/api/programs/${params.id}`],
      });
      queryClient.invalidateQueries({ queryKey: ["/api/programs"] });
      setEditDialogOpen(false);
      toast({
        title: "Success",
        description: "Program updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const form = useForm({
    resolver: zodResolver(
      insertProgramSchema.pick({ title: true, description: true }),
    ),
    defaultValues: {
      title: program?.title || "",
      description: program?.description || "",
    },
  });

  if (!program) {
    return null;
  }

  const onSubmit = form.handleSubmit((data) => {
    updateProgramMutation.mutate(data);
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-[#000000] text-white">
        <div className="container mx-auto px-4 py-8">
          <Link href="/">
            <Button
              variant="ghost"
              className="mb-4 text-white hover:text-white/80"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Programs
            </Button>
          </Link>
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-3xl font-bold">{program.title}</h1>
            <Button
              size="sm"
              onClick={() => setEditDialogOpen(true)}
              className="bg-white text-gray-900 hover:bg-gray-100"
            >
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
          {program.description && (
            <p className="text-gray-200 mb-8">{program.description}</p>
          )}
          <Tabs defaultValue="sessions" className="w-full">
            <TabsList>
              <TabsTrigger value="sessions">Sessions</TabsTrigger>
              <TabsTrigger value="portfolios">Student Portfolios</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Program</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={onSubmit} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updateProgramMutation.isPending}
                >
                  {updateProgramMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Save Changes
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
