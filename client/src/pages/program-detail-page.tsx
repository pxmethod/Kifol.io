import { useQuery, useMutation } from "@tanstack/react-query";
import { Program } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Pencil, ArrowLeft, CalendarIcon, X } from "lucide-react";
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
import { LoadingSpinner } from "@/components/loading-spinner";
import { Link, useLocation } from "wouter";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { ProgramSessions } from "@/components/program-sessions";
import { ProgramStudents } from "@/components/program-students";
import { programFormSchema, ProgramFormData } from "@/types/program";
import { ErrorBoundary } from "@/components/error-boundary";
import { ApiError } from "@/types/common";

export default function ProgramDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { toast } = useToast();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [location, setLocation] = useLocation();

  // Get current tab from URL search params
  const searchParams = typeof window !== 'undefined' 
    ? new URLSearchParams(window.location.search) 
    : new URLSearchParams();
  const currentTab = searchParams.get('tab') === 'students' ? 'students' : 'sessions';

  // Handle tab change
  const handleTabChange = (value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === 'students') {
      newParams.set('tab', 'students');
    } else {
      newParams.delete('tab');
    }
    setLocation(`/programs/${params.id}${newParams.toString() ? `?${newParams.toString()}` : ''}`);
  };

  const { 
    data: program,
    isLoading,
    isError,
    error
  } = useQuery<Program, ApiError>({
    queryKey: [`/api/programs/${params.id}`],
  });

  const updateProgramMutation = useMutation({
    mutationFn: async (data: FormData | ProgramFormData) => {
      const formData = new FormData();

      if (data instanceof FormData) {
        return fetch(`/api/programs/${params.id}`, {
          method: 'PATCH',
          body: data,
        }).then(res => {
          if (!res.ok) throw new Error('Failed to update program');
          return res.json();
        });
      }

      formData.append('title', data.title);
      formData.append('description', data.description || '');
      formData.append('startDate', data.startDate.toISOString());
      formData.append('endDate', data.endDate.toISOString());

      if (data.coverImage) {
        formData.append('coverImage', data.coverImage);
      }

      return fetch(`/api/programs/${params.id}`, {
        method: 'PATCH',
        body: formData,
      }).then(res => {
        if (!res.ok) throw new Error('Failed to update program');
        return res.json();
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`/api/programs/${params.id}`],
      });
      queryClient.invalidateQueries({ queryKey: ["/api/programs"] });
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
      coverImage: undefined,
    },
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      form.setValue('coverImage', file);
    }
  };

  const removeImage = () => {
    const formData = new FormData();
    const currentValues = form.getValues();

    formData.append('title', currentValues.title);
    formData.append('description', currentValues.description || '');
    formData.append('startDate', currentValues.startDate.toISOString());
    formData.append('endDate', currentValues.endDate.toISOString());
    formData.append('removeCoverImage', 'true');

    updateProgramMutation.mutate(formData);

    form.setValue('coverImage', undefined);
    setImagePreview(null);
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Loading program details..." />;
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
    setEditDialogOpen(false); 
  });

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        <header 
          className="relative text-white" 
          role="banner"
          style={{
            background: program.coverImage 
              ? `url(${program.coverImage}) no-repeat center center` 
              : '#000000',
            backgroundSize: 'cover',
          }}
        >
          {program.coverImage && (
            <div 
              className="absolute inset-0" 
              style={{ 
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
              }}
            />
          )}
          <div className="container mx-auto px-4 py-8 relative">
            <nav aria-label="Main navigation">
              <Link href="/">
                <Button
                  variant="link"
                  className="mb-4 text-white hover:text-white/80"
                  aria-label="Back to Programs"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" aria-hidden="true" />
                  Back to Programs
                </Button>
              </Link>
            </nav>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-bold">{program.title}</h1>
                <time className="text-gray-200 mt-2 block">
                  {format(new Date(program.startDate), "MMMM dd, yyyy")} -{" "}
                  {format(new Date(program.endDate), "MMMM dd, yyyy")}
                </time>
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
        </header>

        <main className="container mx-auto px-4 py-8">
          <Tabs 
            value={currentTab}
            onValueChange={handleTabChange}
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
        </main>

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

                <FormField
                  control={form.control}
                  name="coverImage"
                  render={({ field: { onChange, value, ...field } }) => (
                    <FormItem>
                      <FormLabel>Cover Image</FormLabel>
                      <FormControl>
                        <div className="space-y-4">
                          <Input
                            type="file"
                            accept="image/jpeg,image/png"
                            onChange={handleImageChange}
                            {...field}
                          />
                          {(imagePreview || program.coverImage) && (
                            <div className="relative w-full h-40 rounded-lg overflow-hidden">
                              <img
                                src={imagePreview || program.coverImage}
                                alt="Cover preview"
                                className="w-full h-full object-cover"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute top-2 right-2"
                                onClick={removeImage}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
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