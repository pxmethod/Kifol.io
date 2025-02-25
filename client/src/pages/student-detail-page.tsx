import { useQuery, useMutation } from "@tanstack/react-query";
import { Student, PortfolioEntry } from "@shared/schema";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, GraduationCap } from "lucide-react";
import { Loader2 } from "lucide-react";
import { ErrorBoundary } from "@/components/error-boundary";
import { ApiError } from "@/types/common";
import { PortfolioEntryDialog } from "@/components/portfolio-entry-dialog";
import { PortfolioTimeline } from "@/components/portfolio-timeline";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function StudentDetailPage({
  params,
}: {
  params: { programId: string; studentId: string };
}) {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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
    isLoading: isLoadingEntries,
  } = useQuery<PortfolioEntry[]>({
    queryKey: [`/api/students/${params.studentId}/portfolio`],
  });

  // Create portfolio entry mutation
  const createEntryMutation = useMutation({
    mutationFn: async (data: any) => {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("description", data.description || "");
      formData.append("type", data.type);

      if (data.mediaFiles && data.mediaFiles.length > 0) {
        data.mediaFiles.forEach((file: File) => {
          formData.append("media", file);
        });
      }

      const res = await apiRequest(
        "POST",
        `/api/students/${params.studentId}/portfolio`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`/api/students/${params.studentId}/portfolio`],
      });
      setIsDialogOpen(false);
      toast({
        title: "Success",
        description: "Portfolio entry created successfully",
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

  const handleCreateEntry = (data: any) => {
    createEntryMutation.mutate(data);
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

        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Timeline</h2>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Event
            </Button>
          </div>

          {isLoadingEntries ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <PortfolioTimeline entries={portfolioEntries} />
          )}
        </div>

        <PortfolioEntryDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onSubmit={handleCreateEntry}
          isSubmitting={createEntryMutation.isPending}
        />
      </div>
    </ErrorBoundary>
  );
}