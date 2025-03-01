import { useQuery, useMutation } from "@tanstack/react-query";
import { PortfolioEntry, insertPortfolioEntrySchema } from "@shared/schema";
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
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon, Loader2, Trophy, Book, Star, Award, Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { z } from "zod";

// Modified schema to handle Date object in the form
const timelineFormSchema = z.object({
  title: insertPortfolioEntrySchema.shape.title,
  description: insertPortfolioEntrySchema.shape.description,
  achievementDate: z.date().max(new Date(), "Cannot select future dates"),
  type: insertPortfolioEntrySchema.shape.type,
  feedback: insertPortfolioEntrySchema.shape.feedback.optional(),
});

type TimelineFormData = z.infer<typeof timelineFormSchema>;

const ENTRY_TYPES = [
  { value: "achievement", label: "Achievement", icon: Trophy },
  { value: "assessment", label: "Assessment", icon: Book },
  { value: "milestone", label: "Milestone", icon: Star },
  { value: "award", label: "Award", icon: Award },
];

type StudentTimelineProps = {
  studentId: number;
};

// Create a singleton for dialog state management
let globalDialogState = {
  isOpen: false,
  setIsOpen: null as null | ((isOpen: boolean) => void),
};

// Add Event Button Component
function AddEventButton() {
  return (
    <Button
      onClick={() => globalDialogState.setIsOpen?.(true)}
      aria-label="Add new timeline event"
    >
      <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
      Add Event
    </Button>
  );
}

export function StudentTimeline({ studentId }: StudentTimelineProps) {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);

  // Register the dialog state setter
  globalDialogState.setIsOpen = setDialogOpen;

  const { data: entries = [], isLoading } = useQuery<PortfolioEntry[]>({
    queryKey: [`/api/students/${studentId}/portfolio`],
  });

  const form = useForm<TimelineFormData>({
    resolver: zodResolver(timelineFormSchema),
    defaultValues: {
      title: "",
      description: "",
      achievementDate: new Date(),
      type: "achievement",
      feedback: "",
    },
  });

  const addEntryMutation = useMutation({
    mutationFn: async (data: TimelineFormData) => {
      // Convert form data to API format
      const apiData = {
        ...data,
        achievementDate: data.achievementDate.toISOString().split('T')[0],
      };

      const res = await apiRequest(
        "POST",
        `/api/students/${studentId}/portfolio`,
        apiData
      );

      // Check if response is valid before parsing JSON
      if (!res.ok) {
        const text = await res.text();
        // If the response contains HTML, it's likely an error page
        if (text.includes('<!DOCTYPE html>')) {
          throw new Error('Server returned an HTML error page instead of JSON. Please check the server logs.');
        }
        throw new Error(`Server error: ${text}`);
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`/api/students/${studentId}/portfolio`],
      });
      toast({
        title: "Success",
        description: "Timeline entry added successfully",
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
    addEntryMutation.mutate(data);
  });

  const getEntryIcon = (type: string) => {
    const entry = ENTRY_TYPES.find((t) => t.value === type);
    const Icon = entry?.icon || Trophy;
    return <Icon className="h-8 w-8" />;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {entries.length === 0 ? (
        <div className="text-center py-8 border rounded-lg bg-muted/10">
          <h3 className="text-lg font-semibold mb-2">No Timeline Entries Yet</h3>
          <p className="text-muted-foreground mb-4">
            Start tracking this student's progress by adding their first achievement or milestone.
          </p>
          <StudentTimeline.AddEventButton />
        </div>
      ) : (
        <div className="space-y-8">
          {entries
            .sort((a, b) => new Date(b.achievementDate).getTime() - new Date(a.achievementDate).getTime())
            .map((entry) => (
              <div
                key={entry.id}
                className="flex gap-4 items-start border-l-2 border-primary/20 pl-4 pb-8 relative"
              >
                <div className="absolute -left-4 p-1 rounded-full bg-background border-2 border-primary">
                  {getEntryIcon(entry.type)}
                </div>
                <div className="pt-1 space-y-2">
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-lg font-semibold">{entry.title}</h3>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(entry.achievementDate), "MMMM d, yyyy")}
                    </span>
                  </div>
                  {entry.description && (
                    <p className="text-muted-foreground">{entry.description}</p>
                  )}
                  {entry.feedback && (
                    <p className="text-sm">
                      <span className="font-medium">Feedback:</span>{" "}
                      {entry.feedback}
                    </p>
                  )}
                </div>
              </div>
            ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Timeline Entry</DialogTitle>
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
                      <Input placeholder="Enter entry title" {...field} value={field.value || ''} />
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
                          <SelectValue placeholder="Select entry type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ENTRY_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center gap-2">
                              <type.icon className="h-4 w-4" />
                              {type.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="achievementDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
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
                          disabled={(date) => date > new Date()}
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
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter description"
                        className="resize-none"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="feedback"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Feedback (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter feedback"
                        className="resize-none"
                        {...field}
                        value={field.value || ''}
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
  );
}

// Export the AddEventButton as a static property
StudentTimeline.AddEventButton = AddEventButton;