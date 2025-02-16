import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Student, insertStudentSchema } from "@shared/schema";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, GraduationCap, List, LayoutGrid, Search } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

type ViewMode = "list" | "grid";

const studentSchema = insertStudentSchema.extend({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  grade: z.number().min(1, "Grade is required"),
});

type ProgramStudentsProps = {
  programId: number;
};

export function ProgramStudents({ programId }: ProgramStudentsProps) {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: students = [] } = useQuery<Student[]>({
    queryKey: [`/api/programs/${programId}/students`],
  });

  const form = useForm({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      name: "",
      email: "",
      grade: 1,
    },
  });

  const addStudentMutation = useMutation({
    mutationFn: async (data: z.infer<typeof studentSchema>) => {
      const res = await apiRequest(
        "POST",
        `/api/programs/${programId}/students`,
        {
          student: data,
        },
      );
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`/api/programs/${programId}/students`],
      });
      toast({
        title: "Success",
        description: "Student added successfully",
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

  const onSubmit = form.handleSubmit((data) => {
    addStudentMutation.mutate(data);
  });

  const filteredStudents = students.filter((student) =>
    searchQuery
      ? student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email.toLowerCase().includes(searchQuery.toLowerCase())
      : true,
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Students</h2>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-[250px]"
            />
          </div>
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
          <Button onClick={() => setDialogOpen(true)}>Add Student</Button>
        </div>
      </div>

      {filteredStudents.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="pt-6 text-center">
            <h3 className="text-xl font-semibold mb-2">No Students Found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery
                ? "Try adjusting your search terms"
                : "Add students to this program to get started"}
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <GraduationCap className="mr-2 h-4 w-4" />
              Add First Student
            </Button>
          </CardContent>
        </Card>
      ) : viewMode === "list" ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Parent's Email Address</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">{student.name}</TableCell>
                  <TableCell>{student.email}</TableCell>
                  <TableCell>{student.grade}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map((student) => (
            <Card key={student.id}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h3 className="font-medium">{student.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {student.email}
                    </p>
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4" />
                      <span className="text-sm">Grade {student.grade}</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Student</DialogTitle>
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
                      <Input
                        placeholder="Enter first and last name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parent's Email Address</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Enter parent email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="grade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Grade</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) || 1)
                        }
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
                <Button type="submit" disabled={addStudentMutation.isPending}>
                  {addStudentMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Add Student
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
