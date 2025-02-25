import { useQuery } from "@tanstack/react-query";
import { Student } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail } from "lucide-react";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { GraduationCap } from "lucide-react";
import { ErrorBoundary } from "@/components/error-boundary";

/**
 * StudentDetailPage Component
 * 
 * Displays detailed information about a student including their portfolio timeline.
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
    queryKey: [`/api/students/${params.studentId}`],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (isError || !student) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Error Loading Student</h2>
            <p className="text-muted-foreground mb-4">
              {error instanceof Error ? error.message : "Unable to load student details"}
            </p>
            <Link href={`/programs/${params.programId}`}>
              <Button variant="link">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Program
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleEmailParent = () => {
    window.location.href = `mailto:${student.email}`;
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        {/* Header Bar */}
        <div className="border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <Link href={`/programs/${params.programId}`}>
                <Button variant="ghost">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Program
                </Button>
              </Link>
              <h1 className="text-2xl font-bold">{student.name}'s Portfolio</h1>
              <Button onClick={handleEmailParent}>
                <Mail className="h-4 w-4 mr-2" />
                Email Parent
              </Button>
            </div>
          </div>
        </div>

        {/* Student Information */}
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto">
            <Card className="p-6 mb-8">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <GraduationCap className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">{student.name}</h2>
                  <p className="text-muted-foreground">Grade {student.grade}</p>
                  <p className="text-sm text-muted-foreground">{student.email}</p>
                </div>
              </div>
            </Card>

            {/* Timeline Section */}
            <div className="relative">
              <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-px bg-border" />
              <div className="space-y-8">
                {/* Timeline content will be added here */}
                <div className="text-center text-muted-foreground py-8">
                  No portfolio entries yet
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
