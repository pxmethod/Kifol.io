import { useQuery } from "@tanstack/react-query";
import { Student } from "@shared/schema";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, GraduationCap } from "lucide-react";
import { Loader2 } from "lucide-react";
import { ErrorBoundary } from "@/components/error-boundary";
import { ApiError } from "@/types/common";
import { format } from "date-fns";

/**
 * StudentDetailPage Component
 * 
 * Displays detailed information about a student and their portfolio timeline.
 *
 * @component
 * @param {Object} props - Component props
 * @param {Object} props.params - URL parameters
 * @param {string} props.params.programId - Program ID from the URL
 * @param {string} props.params.studentId - Student ID from the URL
 */
export default function StudentDetailPage({
  params,
}: {
  params: { programId: string; studentId: string };
}) {
  // Fetch student details
  const { 
    data: student,
    isLoading,
    isError,
    error
  } = useQuery<Student, ApiError>({
    queryKey: [`/api/students/${params.studentId}`],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !student) {
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
              {error?.message || "Unable to load student details"}
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
                <div className="flex items-center gap-2 text-gray-200 mt-2">
                  <GraduationCap className="h-4 w-4" />
                  <span>Grade {student.grade}</span>
                </div>
                <p className="text-gray-200 mt-2">Parent Email: {student.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline Section */}
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Timeline</h2>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Event
            </Button>
          </div>
          
          {/* Placeholder for timeline - will be implemented in next phase */}
          <div className="text-center text-muted-foreground py-12">
            Timeline events will appear here
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
