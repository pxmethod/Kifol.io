import { useQuery, useMutation } from "@tanstack/react-query";
import { Program } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Pencil, ArrowLeft, CalendarIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { ProgramSessions } from "@/components/program-sessions";
import { ProgramStudents } from "@/components/program-students";
import { programFormSchema, ProgramFormData } from "@/types/program";
import { ErrorBoundary } from "@/components/error-boundary";
import { ApiError } from "@/types/common";

/**
 * ProgramDetailPage Component
 * 
 * Displays detailed information about an educational program and allows editing.
 * Shows program sessions and enrolled students in separate tabs.
 *
 * @component
 * @param {Object} props - Component props
 * @param {Object} props.params - URL parameters
 * @param {string} props.params.id - Program ID from the URL
 */
export default function ProgramDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { toast } = useToast();
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Fetch program details
  const { 
    data: program,
    isLoading,
    isError,
    error
  } = useQuery<Program, ApiError>({
    queryKey: [`/api/programs/${params.id}`],
  });

  // Update program mutation
  const updateProgramMutation = useMutation({
    mutationFn: async (data: ProgramFormData) => {
      const res = await apiRequest("PATCH", `/api/programs/${params.id}`, data);
      return res.json();
    },
    onSuccess: () => {
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

  const form = useForm<ProgramFormData>({
    resolver: zodResolver(programFormSchema),
    values: {
      title: program?.title || "",
      description: program?.description || "",
      startDate: program ? new Date(program.startDate) : new Date(),
      endDate: program ? new Date(program.endDate) : new Date(),
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !program) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Link href="/">
            <Button variant="link">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Programs
            </Button>
          </Link>
          <div className="mt-8 text-center">
            <h2 className="text-xl font-semibold mb-2">Error Loading Program</h2>
            <p className="text-muted-foreground mb-4">
              {error?.message || "Unable to load program details"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const onSubmit = form.handleSubmit((data) => {
    updateProgramMutation.mutate(data);
  });

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        {/* Header Section */}
        <div className="bg-[#000000] text-white">
          <div className="container mx-auto px-4 py-8">
            <Link href="/">
              <Button
                variant="link"
                className="mb-4 text-white hover:text-white/80"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Programs
              </Button>
            </Link>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-bold">{program.title}</h1>
                <p className="text-gray-200 mt-2">
                  {format(new Date(program.startDate), "MMMM dd, yyyy")} -{" "}
                  {format(new Date(program.endDate), "MMMM dd, yyyy")}
                </p>
              </div>
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
              <p className="text-gray-200">{program.description}</p>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="container mx-auto px-4 py-8">
          <Tabs 
            defaultValue={window.location.search.includes('tab=students') ? 'students' : 'sessions'} 
            className="w-full"
          >
            <TabsList>
              <TabsTrigger value="sessions">Sessions</TabsTrigger>
              <TabsTrigger value="students">Students</TabsTrigger>
            </TabsList>
            <TabsContent value="sessions" className="mt-8">
              <ProgramSessions programId={parseInt(params.id)} />
            </TabsContent>
            <TabsContent value="students" className="mt-8">
              <ProgramStudents programId={parseInt(params.id)} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Edit Dialog */}
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
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Start Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground",
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "MMMM dd, yyyy")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>End Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground",
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "MMMM dd, yyyy")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
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
    </ErrorBoundary>
  );
}