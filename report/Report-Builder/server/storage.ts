import { db } from "./db";
import {
  reports,
  buildings,
  type Report,
  type Building,
  type CreateReportWithBuildings,
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";
import { ReportWithBuildingsResponse } from "@shared/routes";

export interface IStorage {
  getReports(): Promise<Report[]>;
  getReport(id: number): Promise<ReportWithBuildingsResponse | undefined>;
  createReport(data: CreateReportWithBuildings): Promise<ReportWithBuildingsResponse>;
  updateReport(id: number, data: CreateReportWithBuildings): Promise<ReportWithBuildingsResponse | undefined>;
  deleteReport(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getReports(): Promise<Report[]> {
    return await db.select().from(reports).orderBy(desc(reports.reportDate));
  }

  async getReport(id: number): Promise<ReportWithBuildingsResponse | undefined> {
    const [report] = await db.select().from(reports).where(eq(reports.id, id));
    if (!report) return undefined;
    
    const reportBuildings = await db.select().from(buildings).where(eq(buildings.reportId, id));
    
    return {
      ...report,
      buildings: reportBuildings,
    };
  }

  async createReport(data: CreateReportWithBuildings): Promise<ReportWithBuildingsResponse> {
    const [report] = await db.insert(reports).values({
      projectName: data.projectName,
      reportDate: data.reportDate ? new Date(data.reportDate) : new Date(),
    }).returning();
    
    const buildingsToInsert = data.buildings.map(b => ({
      ...b,
      reportId: report.id,
    }));
    
    let insertedBuildings: Building[] = [];
    if (buildingsToInsert.length > 0) {
      insertedBuildings = await db.insert(buildings).values(buildingsToInsert).returning();
    }
    
    return {
      ...report,
      buildings: insertedBuildings,
    };
  }

  async updateReport(id: number, data: CreateReportWithBuildings): Promise<ReportWithBuildingsResponse | undefined> {
    const [report] = await db.update(reports)
      .set({
        projectName: data.projectName,
        reportDate: data.reportDate ? new Date(data.reportDate) : new Date(),
      })
      .where(eq(reports.id, id))
      .returning();
      
    if (!report) return undefined;
    
    // Replace all buildings
    await db.delete(buildings).where(eq(buildings.reportId, id));
    
    const buildingsToInsert = data.buildings.map(b => ({
      ...b,
      reportId: id,
    }));
    
    let insertedBuildings: Building[] = [];
    if (buildingsToInsert.length > 0) {
      insertedBuildings = await db.insert(buildings).values(buildingsToInsert).returning();
    }
    
    return {
      ...report,
      buildings: insertedBuildings,
    };
  }

  async deleteReport(id: number): Promise<void> {
    await db.delete(buildings).where(eq(buildings.reportId, id));
    await db.delete(reports).where(eq(reports.id, id));
  }
}

export const storage = new DatabaseStorage();
