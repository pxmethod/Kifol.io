import { useQuery, useMutation } from "@tanstack/react-query";
import { Student, PortfolioEntry, insertPortfolioEntrySchema } from "@shared/schema";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Upload, X, Image as ImageIcon } from "lucide-react";
import { Loader2 } from "lucide-react";
import { ErrorBoundary } from "@/components/error-boundary";
import { ApiError } from "@/types/common";
import { format } from "date-fns";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import * as z from 'zod';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const portfolioTypes = [
  "achievement",
  "project",
  "assessment",
  "milestone",
  "reflection",
] as const;

// Schema for the form
const portfolioEntryFormSchema = insertPortfolioEntrySchema.extend({
  mediaFile: z.instanceof(File).optional(),
});

type PortfolioEntryFormData = z.infer<typeof portfolioEntryFormSchema>;

export default function StudentDetailPage({
  params,
}: {
  params: { programId: string; studentId: string };
}) {
  const { toast } = useToast();
  const [addEventDialogOpen, setAddEventDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Fetch student details
  const { 
    data: student,
    isLoading: isLoadingStudent,
    isError: isStudentError,
    error: studentError
  } = useQuery<Student, ApiError>({
    queryKey: [`/api/students/${params.studentId}`],
  });

  // Fetch portfolio entries
  const { 
    data: portfolioEntries = [],
    isLoading: isLoadingEntries
  } = useQuery<PortfolioEntry[]>({
    queryKey: [`/api/students/${params.studentId}/portfolio`],
  });

  const form = useForm<PortfolioEntryFormData>({
    resolver: zodResolver(portfolioEntryFormSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "achievement",
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      form.setValue("mediaFile", file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const clearPreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    form.setValue("mediaFile", undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Add portfolio entry mutation
  const addEntryMutation = useMutation({
    mutationFn: async (data: PortfolioEntryFormData) => {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined) {
          if (key === "mediaFile") {
            formData.append("media", value as File);
          } else {
            formData.append(key, value as string);
          }
        }
      });

      const res = await apiRequest(
        "POST",
        `/api/students/${params.studentId}/portfolio`,
        formData,
        { isFormData: true }
      );
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`/api/students/${params.studentId}/portfolio`],
      });
      toast({
        title: "Success",
        description: "Portfolio entry added successfully",
      });
      clearPreview();
      form.reset();
      setAddEventDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: PortfolioEntryFormData) => {
    addEntryMutation.mutate(data);
  };

  if (isLoadingStudent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isStudentError || !student) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Link href={`/programs/${params.programId}`}>
            <Button variant="link">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Program
            </Button>
          </Link>
          <div className="mt-8 text-center">
            <h2 className="text-xl font-semibold mb-2">Error Loading Student</h2>
            <p className="text-muted-foreground mb-4">
              {studentError?.message || "Unable to load student details"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        {/* Header Section */}
        <div className="bg-[#000000] text-white">
          <div className="container mx-auto px-4 py-8">
            <Link href={`/programs/${params.programId}`}>
              <Button
                variant="link"
                className="mb-4 text-white hover:text-white/80"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Program
              </Button>
            </Link>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-bold">{student.name}</h1>
                <p className="text-gray-200 mt-2">Parent Email: {student.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline Section */}
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Timeline</h2>
            <Button onClick={() => setAddEventDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Event
            </Button>
          </div>

          {isLoadingEntries ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            </div>
          ) : portfolioEntries.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">
              No portfolio entries yet. Click "Add Event" to create one.
            </div>
          ) : (
            <div className="space-y-4">
              {portfolioEntries
                .sort((a, b) => {
                  const dateA = a.achievementDate ? new Date(a.achievementDate).getTime() : 0;
                  const dateB = b.achievementDate ? new Date(b.achievementDate).getTime() : 0;
                  return dateB - dateA;
                })
                .map((entry) => (
                  <div
                    key={entry.id}
                    className="bg-card rounded-lg p-6 border shadow-sm"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-4 w-full">
                        <div>
                          <h3 className="text-lg font-semibold">{entry.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {entry.achievementDate ? format(new Date(entry.achievementDate), "MMMM dd, yyyy") : ""} ·{" "}
                            <span className="capitalize">{entry.type}</span>
                          </p>
                        </div>
                        {entry.description && (
                          <p className="text-sm">{entry.description}</p>
                        )}
                        {entry.mediaUrl && (
                          <div className="relative rounded-lg overflow-hidden max-h-[400px]">
                            <img
                              src={entry.mediaUrl}
                              alt={entry.title}
                              className="w-full h-auto object-contain"
                            />
                          </div>
                        )}
                        {entry.feedback && (
                          <div className="p-4 bg-muted rounded-md">
                            <p className="text-sm font-medium mb-1">Feedback</p>
                            <p className="text-sm">{entry.feedback}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Add Event Dialog */}
        <Dialog open={addEventDialogOpen} onOpenChange={setAddEventDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Portfolio Entry</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter title" {...field} />
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
                          placeholder="Enter description"
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {portfolioTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              <span className="capitalize">{type}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormItem>
                  <FormLabel>Media (Optional)</FormLabel>
                  <div className="mt-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                    {!previewUrl ? (
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full h-32 flex flex-col items-center justify-center gap-2"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="h-8 w-8" />
                        <span>Click to upload media</span>
                      </Button>
                    ) : (
                      <div className="relative rounded-lg overflow-hidden">
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="w-full h-auto max-h-[200px] object-contain"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2 bg-background/80 hover:bg-background"
                          onClick={clearPreview}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </FormItem>

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      clearPreview();
                      setAddEventDialogOpen(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={addEntryMutation.isPending}
                  >
                    {addEntryMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Add Entry
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