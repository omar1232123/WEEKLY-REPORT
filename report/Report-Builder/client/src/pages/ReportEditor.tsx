import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useReport, useUpdateReport } from "@/hooks/use-reports";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PhaseRow } from "@/components/PhaseRow";
import { createReportWithBuildingsSchema, type CreateReportWithBuildings } from "@shared/schema";
import { format } from "date-fns";
import { 
  ArrowLeft, 
  Plus, 
  Save, 
  Loader2, 
  Calendar as CalendarIcon, 
  Building2,
  Trash2
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

// Fields configuration for iteration
const PHASES = [
  { label: "Vent", key: "vent" },
  { label: "Copper", key: "copper" },
  { label: "Flex", key: "flex" },
  { label: "Air Handler", key: "airHandler" },
  { label: "Condenser", key: "condenser" },
  { label: "Wall Caps", key: "wallCaps" },
  { label: "Trim", key: "trim" },
  { label: "Start Ups", key: "startUps" },
];

export default function ReportEditor() {
  const [, params] = useRoute("/report/:id");
  const id = params ? parseInt(params.id) : 0;
  const [, setLocation] = useLocation();

  const { data: report, isLoading } = useReport(id);
  const updateMutation = useUpdateReport();

  const form = useForm<CreateReportWithBuildings>({
    resolver: zodResolver(createReportWithBuildingsSchema),
    defaultValues: {
      projectName: "",
      reportDate: new Date(),
      buildings: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "buildings",
  });

  // Hydrate form when data loads
  useEffect(() => {
    if (report) {
      form.reset({
        projectName: report.projectName,
        reportDate: new Date(report.reportDate),
        buildings: report.buildings.map(b => ({
          ...b,
          // Ensure nulls are converted to undefined or empty strings if needed by components
          // But our schema allows nullable strings, and inputs handle null as empty string usually
        })),
      });
    }
  }, [report, form]);

  const onSubmit = (data: CreateReportWithBuildings) => {
    updateMutation.mutate({ id, data });
  };

  const handleAddBuilding = () => {
    if (fields.length >= 15) return;
    append({
      name: `Building ${fields.length + 1}`,
      ventPct: null, ventNotes: null,
      copperPct: null, copperNotes: null,
      flexPct: null, flexNotes: null,
      airHandlerPct: null, airHandlerNotes: null,
      condenserPct: null, condenserNotes: null,
      wallCapsPct: null, wallCapsNotes: null,
      trimPct: null, trimNotes: null,
      startUpsPct: null, startUpsNotes: null,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-muted/20 gap-4">
        <h1 className="text-2xl font-bold">Report not found</h1>
        <Button onClick={() => setLocation("/")}>Go Home</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20 pb-20 flex flex-col">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-border sticky top-0 z-20 shadow-sm">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setLocation("/")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Project Report</span>
              <h1 className="text-lg font-bold font-display text-foreground leading-none">
                {form.watch("projectName") || "Untitled Project"}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <span className="text-sm text-muted-foreground hidden sm:inline-block">
               {fields.length} / 15 Buildings
             </span>
             <Button 
               variant="outline" 
               onClick={handleAddBuilding}
               disabled={fields.length >= 15}
               className="hidden sm:flex"
             >
               <Plus className="w-4 h-4 mr-2" />
               Add Building
             </Button>
             
             <div className="h-6 w-px bg-border hidden sm:block mx-1" />

             <Button 
               onClick={form.handleSubmit(onSubmit)}
               disabled={updateMutation.isPending}
               className="bg-primary hover:bg-primary/90 text-white min-w-[100px]"
             >
               {updateMutation.isPending ? (
                 <Loader2 className="w-4 h-4 animate-spin" />
               ) : (
                 <>
                   <Save className="w-4 h-4 mr-2" />
                   Save
                 </>
               )}
             </Button>
          </div>
        </div>
      </header>

      {/* Main Form Area */}
      <main className="flex-1 overflow-hidden flex flex-col">
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col">
          
          {/* Project Details Panel */}
          <div className="bg-white border-b border-border p-6 shadow-sm z-10">
            <div className="max-w-4xl flex flex-col sm:flex-row gap-6">
              <div className="flex-1 space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Project Name</label>
                <Input 
                  {...form.register("projectName")}
                  className="font-display font-semibold text-lg h-12"
                  placeholder="Project Name"
                />
              </div>
              
              <div className="flex-1 space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Report Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full h-12 justify-start text-left font-normal",
                        !form.watch("reportDate") && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {form.watch("reportDate") ? (
                        format(form.watch("reportDate"), "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={new Date(form.watch("reportDate"))}
                      onSelect={(date) => date && form.setValue("reportDate", date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          {/* The Big Grid */}
          <div className="flex-1 overflow-auto bg-muted/20 relative">
            {fields.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                <div className="bg-white p-8 rounded-full shadow-lg mb-6">
                  <Building2 className="w-12 h-12 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold text-foreground">No buildings added yet</h3>
                <p className="text-muted-foreground max-w-md mt-2 mb-8">
                  Start by adding buildings to your project report. You can track progress for up to 15 buildings.
                </p>
                <Button onClick={handleAddBuilding} size="lg" className="bg-accent hover:bg-accent/90 text-white">
                  <Plus className="w-5 h-5 mr-2" />
                  Add First Building
                </Button>
              </div>
            ) : (
              <div className="min-w-max p-8">
                {/* Custom Grid Layout Implementation */}
                <div className="bg-white rounded-xl shadow-xl border border-border overflow-hidden">
                  
                  {/* Header Row: Phase Names (Left Column) + Building Names */}
                  <div className="flex border-b border-border bg-muted/30">
                    {/* Empty corner cell */}
                    <div className="sticky left-0 z-20 w-[180px] bg-white border-r border-border p-4 flex items-center justify-center font-bold text-muted-foreground shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                      PHASE / BUILDING
                    </div>

                    {/* Building Columns Header */}
                    {fields.map((field, index) => (
                      <div key={field.id} className="min-w-[240px] p-3 border-r border-border last:border-r-0 group relative">
                         <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="text-xs font-bold text-primary uppercase tracking-wider bg-primary/10 px-2 py-0.5 rounded-full">
                              Bldg {index + 1}
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => remove(index)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                         </div>
                         <Input
                           {...form.register(`buildings.${index}.name`)}
                           className="h-9 font-semibold text-center bg-transparent border-transparent hover:border-input focus:border-primary focus:bg-white transition-all"
                           placeholder="Building Name"
                         />
                      </div>
                    ))}
                  </div>

                  {/* Data Rows */}
                  {PHASES.map((phase) => (
                    <div key={phase.key} className="flex border-b border-border last:border-b-0 hover:bg-muted/5 transition-colors">
                      {/* Row Header (Sticky Left) */}
                      <div className="sticky left-0 z-10 w-[180px] bg-white border-r border-border p-4 flex items-center font-bold text-sm text-foreground shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                        {phase.label}
                      </div>

                      {/* Cells */}
                      {fields.map((field, index) => (
                        <div key={`${field.id}-${phase.key}`} className="min-w-[240px] p-3 border-r border-border last:border-r-0">
                          <PhaseRow 
                            label={phase.label}
                            fieldPrefix={phase.key}
                            control={form.control}
                            buildingIndex={index}
                            buildingId={field.id}
                          />
                        </div>
                      ))}
                    </div>
                  ))}
                  
                </div>
                
                {fields.length < 15 && (
                  <div className="mt-8 flex justify-center">
                    <Button variant="outline" onClick={handleAddBuilding} className="border-dashed border-2 p-6 h-auto">
                      <Plus className="w-5 h-5 mr-2" />
                      Add Another Building
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </form>
      </main>
    </div>
  );
}
