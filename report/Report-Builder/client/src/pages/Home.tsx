import { useState } from "react";
import { useReports, useCreateReport } from "@/hooks/use-reports";
import { ReportCard } from "@/components/ReportCard";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, FileSpreadsheet } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "wouter";

const createSchema = z.object({
  projectName: z.string().min(1, "Project name is required"),
});

export default function Home() {
  const { data: reports, isLoading } = useReports();
  const createMutation = useCreateReport();
  const [open, setOpen] = useState(false);
  const [, setLocation] = useLocation();

  const form = useForm<{ projectName: string }>({
    resolver: zodResolver(createSchema),
    defaultValues: { projectName: "" },
  });

  const onSubmit = (data: { projectName: string }) => {
    createMutation.mutate(
      {
        projectName: data.projectName,
        reportDate: new Date().toISOString(), // Default to today
        buildings: [], // Start empty
      },
      {
        onSuccess: (newReport) => {
          setOpen(false);
          form.reset();
          setLocation(`/report/${newReport.id}`);
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-muted/20 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-lg">
              <FileSpreadsheet className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-xl font-display font-bold text-foreground">
              SiteTracker
            </h1>
          </div>
          
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">
                <Plus className="w-4 h-4 mr-2" />
                New Project
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create New Project Report</DialogTitle>
                <DialogDescription>
                  Start a new weekly report. You can add buildings and details in the next step.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Project Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g. Riverside Apartments Phase 2"
                      {...form.register("projectName")}
                      className="col-span-3"
                      autoFocus
                    />
                    {form.formState.errors.projectName && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.projectName.message}
                      </p>
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    type="submit" 
                    disabled={createMutation.isPending}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {createMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Project"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold font-display text-foreground">Weekly Reports</h2>
          <p className="text-muted-foreground mt-2">Manage and track progress across all your active construction sites.</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : reports && reports.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {reports.map((report) => (
              <ReportCard
                key={report.id}
                id={report.id}
                projectName={report.projectName}
                reportDate={report.reportDate}
                // Note: The list endpoint returns raw reports, so we don't have building count here unless we change the API.
                // For now, assume 0 or handle fetching details if critical.
                buildingCount={0} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-border">
            <div className="mx-auto h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <FileSpreadsheet className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground">No reports yet</h3>
            <p className="text-muted-foreground max-w-sm mx-auto mt-2 mb-6">
              Get started by creating your first project report to track building progress.
            </p>
            <Button 
              onClick={() => setOpen(true)}
              variant="outline"
              className="border-primary text-primary hover:bg-primary/5"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create First Report
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
