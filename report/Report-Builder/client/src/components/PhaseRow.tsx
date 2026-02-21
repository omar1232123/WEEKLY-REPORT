import { Control, Controller } from "react-hook-form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const percentages = ["0%", "10%", "20%", "25%", "30%", "40%", "50%", "60%", "70%", "75%", "80%", "90%", "100%"];

interface PhaseRowProps {
  label: string;
  fieldPrefix: string; // e.g. "vent" for ventPct and ventNotes
  control: Control<any>;
  buildingIndex: number;
  buildingId: string; // Used for unique keys
}

export function PhaseRow({ label, fieldPrefix, control, buildingIndex, buildingId }: PhaseRowProps) {
  const pctName = `buildings.${buildingIndex}.${fieldPrefix}Pct` as const;
  const notesName = `buildings.${buildingIndex}.${fieldPrefix}Notes` as const;

  return (
    <div className="flex flex-col space-y-2 min-w-[200px]">
      {/* Only show label on mobile/stacked view, hidden in table desktop view if handled by row header */}
      <span className="text-xs font-semibold text-muted-foreground md:hidden">{label}</span>
      
      <Controller
        control={control}
        name={pctName}
        render={({ field }) => (
          <Select onValueChange={field.onChange} value={field.value || ""}>
            <SelectTrigger className="h-9 w-full bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
              <SelectValue placeholder="%" />
            </SelectTrigger>
            <SelectContent>
              {percentages.map((p) => (
                <SelectItem key={p} value={p}>{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
      
      <Controller
        control={control}
        name={notesName}
        render={({ field }) => (
          <Textarea 
            {...field} 
            value={field.value || ""} 
            placeholder="Notes..." 
            className="min-h-[60px] resize-none text-xs bg-muted/30 focus:bg-white transition-colors"
          />
        )}
      />
    </div>
  );
}
