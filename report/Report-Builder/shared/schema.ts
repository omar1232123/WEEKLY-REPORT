import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  projectName: text("project_name").notNull(),
  reportDate: timestamp("report_date").notNull().defaultNow(),
});

export const buildings = pgTable("buildings", {
  id: serial("id").primaryKey(),
  reportId: integer("report_id").notNull(),
  name: text("name").notNull(),
  
  ventPct: text("vent_pct"),
  ventNotes: text("vent_notes"),
  
  copperPct: text("copper_pct"),
  copperNotes: text("copper_notes"),
  
  flexPct: text("flex_pct"),
  flexNotes: text("flex_notes"),
  
  airHandlerPct: text("air_handler_pct"),
  airHandlerNotes: text("air_handler_notes"),
  
  condenserPct: text("condenser_pct"),
  condenserNotes: text("condenser_notes"),
  
  wallCapsPct: text("wall_caps_pct"),
  wallCapsNotes: text("wall_caps_notes"),
  
  trimPct: text("trim_pct"),
  trimNotes: text("trim_notes"),
  
  startUpsPct: text("start_ups_pct"),
  startUpsNotes: text("start_ups_notes"),
});

export const insertReportSchema = createInsertSchema(reports).omit({ id: true });
export const insertBuildingSchema = createInsertSchema(buildings).omit({ id: true });

// We create a report and its buildings together
export const createReportWithBuildingsSchema = insertReportSchema.extend({
  buildings: z.array(insertBuildingSchema.omit({ reportId: true }))
});

export type Report = typeof reports.$inferSelect;
export type InsertReport = z.infer<typeof insertReportSchema>;
export type Building = typeof buildings.$inferSelect;
export type InsertBuilding = z.infer<typeof insertBuildingSchema>;
export type CreateReportWithBuildings = z.infer<typeof createReportWithBuildingsSchema>;
export type ReportWithBuildings = Report & { buildings: Building[] };
