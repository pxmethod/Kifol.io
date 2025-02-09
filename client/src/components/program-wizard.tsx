import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProgramSchema, insertSessionSchema } from "@shared/schema";
import { Stepper } from "./ui/stepper";
import { Button } from "@/components/ui/button";
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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { z } from "zod";

const programFormSchema = insertProgramSchema.extend({
  startDate: z.date().min(new Date(), "Start date must be in the future"),
  endDate: z.date().min(new Date(), "End date must be in the future"),
}).refine(data => data.endDate > data.startDate, {
  message: "End date must be after start date",
  path: ["endDate"],
});

const sessionFormSchema = z.array(insertSessionSchema);

type ProgramWizardProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ProgramWizard({ open, onOpenChange }: ProgramWizardProps) {
  const [step, setStep] = useState(1);
  const [programData, setProgramData] = useState<z.infer<typeof programFormSchema> | null>(null);

  const programForm = useForm({
    resolver: zodResolver(programFormSchema),
    defaultValues: {
      title: "",
      description: "",
      startDate: new Date(),
      endDate: new Date(),
      sessionCount: 1,
      studentCount: 1,
    },
  });

  const sessionForm = useForm({
    resolver: zodResolver(sessionFormSchema),
    defaultValues: {
      sessions: [{
        name: "",
        description: "",
      }],
    },
  });

  const onProgramSubmit = programForm.handleSubmit((data) => {
    setProgramData(data);
    setStep(2);
  });

  const onSessionSubmit = sessionForm.handleSubmit((data) => {
    // TODO: Submit both program and session data to the backend
    console.log("Program:", programData);
    console.log("Sessions:", data);
    onOpenChange(false);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Program</DialogTitle>
          <div className="mt-6 mb-8">
            <Stepper
              steps={["Program Details", "Session Outline"]}
              currentStep={step}
            />
          </div>
        </DialogHeader>

        {step === 1 ? (
          <Form {...programForm}>
            <form onSubmit={onProgramSubmit} className="space-y-4">
              <FormField
                control={programForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter program title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={programForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter program description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={programForm.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Start Date</FormLabel>
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
                                format(field.value, "PPP")
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
                            disabled={(date) =>
                              date < new Date()
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={programForm.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>End Date</FormLabel>
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
                                format(field.value, "PPP")
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
                            disabled={(date) =>
                              date < new Date()
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={programForm.control}
                  name="sessionCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel># of Sessions</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          {...field}
                          onChange={e => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={programForm.control}
                  name="studentCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel># of Students</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          {...field}
                          onChange={e => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end">
                <Button type="submit">Next Step</Button>
              </div>
            </form>
          </Form>
        ) : (
          <Form {...sessionForm}>
            <form onSubmit={onSessionSubmit} className="space-y-4">
              <div className="max-h-[400px] overflow-y-auto space-y-4">
                {Array.from({ length: programData?.sessionCount || 0 }).map((_, index) => (
                  <div key={index} className="space-y-4 p-4 border rounded-lg">
                    <h3 className="font-medium">Session {index + 1}</h3>
                    <FormField
                      control={sessionForm.control}
                      name={`sessions.${index}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Session Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter session name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={sessionForm.control}
                      name={`sessions.${index}.description`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Session Description</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Enter session description" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                <Button type="submit">Save Program</Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
