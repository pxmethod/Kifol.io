import { useQuery } from "@tanstack/react-query";
import { Student } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";

/**
 * StudentDetailPage Component
 * 
 * Displays detailed information about a student including their profile
 * and a timeline of their educational journey.
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
  } = useQuery<Student>({
    queryKey: [`/api/programs/${params.programId}/students/${params.studentId}`],
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
          <Link href={`/programs/${params.programId}?tab=students`}>
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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Navigation */}
        <Link href={`/programs/${params.programId}?tab=students`}>
          <Button variant="link">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Program
          </Button>
        </Link>

        {/* Student Profile Header */}
        <div className="mt-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold">{student.name}</h1>
              <p className="text-muted-foreground mt-1">Grade {student.grade}</p>
              <p className="text-muted-foreground">{student.email}</p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Timeline Event
            </Button>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Timeline Section */}
        <div className="mt-8">
          <div className="relative border-l-2 border-border pl-6 space-y-8">
            {/* Placeholder for timeline events */}
            <div className="relative">
              <div className="absolute -left-[27px] w-3 h-3 bg-primary rounded-full" />
              <div className="bg-card rounded-lg p-4 border">
                <p className="text-sm text-muted-foreground mb-1">
                  {format(new Date(), "MMMM dd, yyyy")}
                </p>
                <h3 className="font-medium mb-2">Timeline Coming Soon</h3>
                <p className="text-muted-foreground">
                  The timeline feature is currently under development.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}