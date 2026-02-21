import { format } from "date-fns";
import { Link } from "wouter";
import { Calendar, Building2, ChevronRight, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useDeleteReport } from "@/hooks/use-reports";

interface ReportCardProps {
  id: number;
  projectName: string;
  reportDate: string | Date;
  buildingCount?: number; // Optional if we fetch list without join initially, but typically helpful
}

export function ReportCard({ id, projectName, reportDate, buildingCount = 0 }: ReportCardProps) {
  const deleteMutation = useDeleteReport();
  const dateObj = new Date(reportDate);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigation
    deleteMutation.mutate(id);
  };

  return (
    <div className="group relative bg-card rounded-2xl p-6 border border-border hover:shadow-lg hover:border-primary/20 transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
          <Building2 className="h-6 w-6" />
        </div>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost" 
              size="icon" 
              className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => e.stopPropagation()}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Report?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the report for "{projectName}".
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={(e) => e.stopPropagation()}>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDelete}
                className="bg-destructive hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <h3 className="text-lg font-bold text-foreground line-clamp-1 mb-1 font-display">{projectName}</h3>
      
      <div className="flex items-center text-sm text-muted-foreground mb-6">
        <Calendar className="mr-2 h-4 w-4 text-primary" />
        {format(dateObj, "MMMM d, yyyy")}
      </div>

      <div className="flex items-center justify-between mt-auto">
        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground">
          {buildingCount} Building{buildingCount !== 1 ? 's' : ''}
        </span>
        
        <Link href={`/report/${id}`}>
          <div className="cursor-pointer h-8 w-8 rounded-full bg-accent text-white flex items-center justify-center shadow-md shadow-accent/20 hover:scale-110 transition-transform">
            <ChevronRight className="h-4 w-4" />
          </div>
        </Link>
      </div>
      
      {/* Clickable Card Overlay */}
      <Link href={`/report/${id}`} className="absolute inset-0 z-0" />
    </div>
  );
}
