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
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  CalendarIcon,
  Loader2,
  Trophy,
  Book,
  Star,
  Award,
  Plus,
  Trash2,
  Upload,
  Edit2,
} from "lucide-react";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { z } from "zod";

const now = new Date();
now.setHours(0, 0, 0, 0);

const timelineFormSchema = z.object({
  title: insertPortfolioEntrySchema.shape.title.min(1, "Title is required"),
  description: insertPortfolioEntrySchema.shape.description,
  achievementDate: z.date().max(now, "Cannot select future dates"),
  type: insertPortfolioEntrySchema.shape.type,
  mediaFile: z.instanceof(File).optional(),
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

let globalDialogState = {
  isOpen: false,
  setIsOpen: null as null | ((isOpen: boolean) => void),
};

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

function EditEventDialog({
  event,
  isOpen,
  onClose,
}: {
  event: PortfolioEntry;
  isOpen: boolean;
  onClose: () => void;
}) {
  const { toast } = useToast();
  const form = useForm<TimelineFormData>({
    resolver: zodResolver(timelineFormSchema),
    defaultValues: {
      title: event.title,
      description: event.description || "",
      achievementDate: new Date(event.achievementDate),
      type: event.type,
      mediaFile: undefined,
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: TimelineFormData) => {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("description", data.description || "");
      formData.append(
        "achievementDate",
        data.achievementDate.toISOString().split("T")[0],
      );
      formData.append("type", data.type);

      if (data.mediaFile) {
        formData.append("media", data.mediaFile);
      }

      const res = await fetch(`/api/portfolio/${event.id}`, {
        method: "PATCH",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Failed to update portfolio entry");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`/api/students/${event.studentId}/portfolio`],
      });
      toast({
        title: "Success",
        description: "Timeline entry updated successfully",
      });
      form.reset();
      onClose();
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
    updateMutation.mutate(data);
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Timeline Entry</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Title<span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter entry title"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        form.trigger("title");
                      }}
                      value={field.value || ""}
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
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="mediaFile"
              render={({ field: { onChange, value, ...field } }) => (
                <FormItem>
                  <FormLabel>Media Upload (Optional)</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-4">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            onChange(file);
                          }
                        }}
                        className="hidden"
                        id="media-upload"
                        {...field}
                      />
                      <label
                        htmlFor="media-upload"
                        className="flex items-center gap-2 px-4 py-2 border rounded-md cursor-pointer hover:bg-secondary"
                      >
                        <Upload className="h-4 w-4" />
                        Choose File
                      </label>
                      {value && (
                        <span className="text-sm text-muted-foreground">
                          {(value as File).name}
                        </span>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.watch("mediaFile") && (
              <div className="mt-4">
                <img
                  src={URL.createObjectURL(form.watch("mediaFile")!)}
                  alt="Preview"
                  className="max-h-[200px] w-auto object-contain rounded-md"
                />
              </div>
            )}

            <div className="flex justify-end gap-2 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  updateMutation.isPending ||
                  !form.getValues("title")?.trim()
                }
              >
                {updateMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Update Entry
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function EventDetailDialog({
  event,
  isOpen,
  onClose,
}: {
  event: PortfolioEntry | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: async (eventId: number) => {
      const res = await apiRequest("DELETE", `/api/portfolio/${eventId}`);
      if (!res.ok) {
        throw new Error("Failed to delete event");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`/api/students/${event?.studentId}/portfolio`],
      });
      toast({
        title: "Success",
        description: "Timeline event deleted successfully",
      });
      setDeleteDialogOpen(false);
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (!event) return null;

  const handleDelete = () => {
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    deleteMutation.mutate(event.id);
  };

  const handleClose = () => {
    if (deleteDialogOpen) {
      setDeleteDialogOpen(false);
    } else {
      onClose();
    }
  };

  return (
    <>
      <Dialog open={isOpen && !deleteDialogOpen && !editDialogOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{event.title}</DialogTitle>
            <DialogDescription>
              {format(new Date(event.achievementDate), "MMMM d, yyyy")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {event.description && (
              <div>
                <h4 className="text-sm font-medium mb-1">Description</h4>
                <p className="text-sm text-muted-foreground">
                  {event.description}
                </p>
              </div>
            )}

            <div>
              <h4 className="text-sm font-medium mb-1">Type</h4>
              <p className="text-sm text-muted-foreground capitalize">
                {event.type}
              </p>
            </div>

            {event.media_url && (
              <div>
                <h4 className="text-sm font-medium mb-2">Media</h4>
                <div className="grid grid-cols-2 gap-2">
                  <img
                    src={event.media_url}
                    alt="Event media"
                    className="w-full h-auto rounded-md"
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex justify-between items-center">
            <div className="flex gap-2">
              <Button
                variant="destructive"
                onClick={handleDelete}
                className="bg-red-600 text-white hover:bg-red-700"
                disabled={deleteMutation.isPending}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Event
              </Button>
              <Button
                variant="outline"
                onClick={() => setEditDialogOpen(true)}
              >
                <Edit2 className="h-4 w-4 mr-2" />
                Edit Event
              </Button>
            </div>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this
              timeline event.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {deleteMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Yes, Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {editDialogOpen && (
        <EditEventDialog
          event={event}
          isOpen={editDialogOpen}
          onClose={() => {
            setEditDialogOpen(false);
            onClose();
          }}
        />
      )}
    </>
  );
}

export function StudentTimeline({ studentId }: StudentTimelineProps) {
  const { toast } = useToast();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<PortfolioEntry | null>(
    null,
  );

  globalDialogState.setIsOpen = setAddDialogOpen;

  const { data: entries = [], isLoading } = useQuery<PortfolioEntry[]>({
    queryKey: [`/api/students/${studentId}/portfolio`],
  });

  const form = useForm<TimelineFormData>({
    resolver: zodResolver(timelineFormSchema),
    defaultValues: {
      title: "",
      description: "",
      achievementDate: now,
      type: "achievement",
      mediaFile: undefined,
    },
    mode: "onChange",
  });

  const addEntryMutation = useMutation({
    mutationFn: async (data: TimelineFormData) => {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("description", data.description || "");
      formData.append(
        "achievementDate",
        data.achievementDate.toISOString().split("T")[0],
      );
      formData.append("type", data.type);

      if (data.mediaFile) {
        formData.append("media", data.mediaFile);
      }

      const res = await fetch(`/api/students/${studentId}/portfolio`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Failed to create portfolio entry");
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
      setAddDialogOpen(false);
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
    return <Icon className="h-5 w-5" />;
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
          <h3 className="text-lg font-semibold mb-2">
            No Timeline Entries Yet
          </h3>
          <p className="text-muted-foreground mb-4">
            Start tracking this student's progress by adding their first
            achievement or milestone.
          </p>
          <StudentTimeline.AddEventButton />
        </div>
      ) : (
        <div className="relative">
          <div className="absolute top-0 bottom-0 left-4 w-0.5 bg-primary/20"></div>

          <div className="space-y-8 relative">
            {entries
              .sort(
                (a, b) =>
                  new Date(b.achievementDate).getTime() -
                  new Date(a.achievementDate).getTime(),
              )
              .map((entry) => (
                <div
                  key={entry.id}
                  className="flex gap-4 items-start pl-12 pb-8 relative cursor-pointer hover:bg-gray-50 rounded-lg p-4 transition-colors"
                  onClick={() => setSelectedEvent(entry)}
                  role="button"
                  tabIndex={0}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      setSelectedEvent(entry);
                    }
                  }}
                >
                  <div className="absolute left-0 p-1 rounded-full bg-background border-2 border-primary z-10">
                    {getEntryIcon(entry.type)}
                  </div>
                  <div className="pt-1 space-y-2 w-full">
                    <div className="space-y-1">
                      <h3 className="text-lg font-semibold">{entry.title}</h3>
                      <span className="text-sm text-muted-foreground block">
                        {format(
                          new Date(entry.achievementDate),
                          "MMMM d, yyyy",
                        )}
                      </span>
                    </div>
                    {entry.description && (
                      <p className="text-muted-foreground">
                        {entry.description}
                      </p>
                    )}
                    {entry.media_url && (
                      <div className="mt-2">
                        <img
                          src={entry.media_url}
                          alt={`Media for ${entry.title}`}
                          className="w-[200px] h-[150px] object-cover rounded-md"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      <Dialog open={addDialogOpen} onOpenChange={(isOpen) => {
        setAddDialogOpen(isOpen);
        if (!isOpen) {
          form.reset();
        }
      }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
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
                    <FormLabel>
                      Title<span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter entry title"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          form.trigger("title");
                        }}
                        value={field.value || ""}
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
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="mediaFile"
                render={({ field: { onChange, value, ...field } }) => (
                  <FormItem>
                    <FormLabel>Media Upload (Optional)</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-4">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              onChange(file);
                            }
                          }}
                          className="hidden"
                          id="media-upload"
                          {...field}
                        />
                        <label
                          htmlFor="media-upload"
                          className="flex items-center gap-2 px-4 py-2 border rounded-md cursor-pointer hover:bg-secondary"
                        >
                          <Upload className="h-4 w-4" />
                          Choose File
                        </label>
                        {value && (
                          <span className="text-sm text-muted-foreground">
                            {(value as File).name}
                          </span>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.watch("mediaFile") && (
                <div className="mt-4">
                  <img
                    src={URL.createObjectURL(form.watch("mediaFile")!)}
                    alt="Preview"
                    className="max-h-[200px] w-auto object-contain rounded-md"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    form.reset();
                    setAddDialogOpen(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    addEntryMutation.isPending ||
                    !form.getValues("title")?.trim()
                  }
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

      <EventDetailDialog
        event={selectedEvent}
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </div>
  );
}

StudentTimeline.AddEventButton = AddEventButton;