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
  DialogDescription,
  DialogFooter,
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
import { Loader2, ArrowUpDown, Search, Pencil } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const studentSchema = insertStudentSchema.extend({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  parentEmail: z.string().email("Invalid parent email address"),
  grade: z.number().min(1, "Grade is required"),
});

type ProgramStudentsProps = {
  programId: number;
};

export function ProgramStudents({ programId }: ProgramStudentsProps) {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "lastName", direction: "asc" });
  const [editStudent, setEditStudent] = useState<Student | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { data: students = [] } = useQuery<Student[]>({
    queryKey: [`/api/programs/${programId}/students`],
  });

  const form = useForm({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      parentEmail: "",
      grade: 1,
    },
  });

  const addStudentMutation = useMutation({
    mutationFn: async (data: z.infer<typeof studentSchema>) => {
      const res = await apiRequest("POST", `/api/programs/${programId}/students`, {
        student: data,
      });
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

  const updateStudentMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: z.infer<typeof studentSchema> }) => {
      const res = await apiRequest("PATCH", `/api/programs/${programId}/students/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`/api/programs/${programId}/students`],
      });
      toast({
        title: "Success",
        description: "Student updated successfully",
      });
      form.reset();
      setEditStudent(null);
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
    if (editStudent) {
      updateStudentMutation.mutate({ id: editStudent.id, data });
    } else {
      addStudentMutation.mutate(data);
    }
  });

  const handleEdit = (student: Student) => {
    setEditStudent(student);
    form.reset({
      firstName: student.firstName,
      lastName: student.lastName,
      parentEmail: student.parentEmail,
      grade: student.grade,
    });
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setEditStudent(null);
    form.reset({
      firstName: "",
      lastName: "",
      parentEmail: "",
      grade: 1,
    });
    setDialogOpen(true);
  };

  const filteredStudents = students.filter(
    (student) =>
      student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.parentEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedStudents = [...filteredStudents].sort((a, b) => {
    const direction = sortConfig.direction === "asc" ? 1 : -1;
    if (sortConfig.key === "name") {
      return (a.lastName + a.firstName).localeCompare(b.lastName + b.firstName) * direction;
    }
    return a[sortConfig.key as keyof Student] > b[sortConfig.key as keyof Student] ? direction : -direction;
  });

  const handleSort = (key: string) => {
    setSortConfig({
      key,
      direction:
        sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Students</h2>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Button onClick={handleAdd}>Add Student</Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead onClick={() => handleSort("lastName")} className="cursor-pointer">
                <div className="flex items-center">
                  Name
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead onClick={() => handleSort("parentEmail")} className="cursor-pointer">
                <div className="flex items-center">
                  Parent Email
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead onClick={() => handleSort("grade")} className="cursor-pointer">
                <div className="flex items-center">
                  Grade
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedStudents.map((student) => (
              <TableRow key={student.id}>
                <TableCell>{student.lastName}, {student.firstName}</TableCell>
                <TableCell>{student.parentEmail}</TableCell>
                <TableCell>{student.grade}</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(student)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editStudent ? "Edit Student" : "Add Student"}
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter first name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter last name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="parentEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parent Email</FormLabel>
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
                <Button
                  type="submit"
                  disabled={addStudentMutation.isPending || updateStudentMutation.isPending}
                >
                  {(addStudentMutation.isPending || updateStudentMutation.isPending) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {editStudent ? "Save Changes" : "Add Student"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}