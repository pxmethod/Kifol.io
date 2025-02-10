
import { useParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Edit } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

export function ProgramDetailPage() {
  const { programId } = useParams();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ title: "", description: "" });

  const { data: program } = useQuery({
    queryKey: ["/api/programs", programId],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/programs/${programId}`);
      return res.json();
    },
  });

  const updateProgramMutation = useMutation({
    mutationFn: async (data: { title: string; description: string }) => {
      const res = await apiRequest("PATCH", `/api/programs/${programId}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/programs"] });
      toast({ title: "Success", description: "Program updated successfully" });
      setIsEditing(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleEdit = () => {
    setEditForm({ title: program.title, description: program.description });
    setIsEditing(true);
  };

  const handleSave = () => {
    updateProgramMutation.mutate(editForm);
  };

  if (!program) return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-[#555555] text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{program.title}</h1>
              {program.description && (
                <p className="text-gray-200 mb-6">{program.description}</p>
              )}
            </div>
            <Button variant="ghost" onClick={handleEdit} className="text-white">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
          <Tabs defaultValue="sessions">
            <TabsList className="bg-white/10">
              <TabsTrigger value="sessions" className="data-[state=active]:bg-white data-[state=active]:text-[#555555]">
                Sessions
              </TabsTrigger>
              <TabsTrigger value="portfolios" className="data-[state=active]:bg-white data-[state=active]:text-[#555555]">
                Student Portfolios
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Program</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Title</label>
              <Input
                value={editForm.title}
                onChange={(e) =>
                  setEditForm({ ...editForm, title: e.target.value })
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">
                Description
              </label>
              <Textarea
                value={editForm.description}
                onChange={(e) =>
                  setEditForm({ ...editForm, description: e.target.value })
                }
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>Save changes</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
