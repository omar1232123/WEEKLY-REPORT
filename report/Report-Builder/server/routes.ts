import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.get(api.reports.list.path, async (req, res) => {
    const reports = await storage.getReports();
    res.json(reports);
  });

  app.get(api.reports.get.path, async (req, res) => {
    const report = await storage.getReport(Number(req.params.id));
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    res.json(report);
  });

  app.post(api.reports.create.path, async (req, res) => {
    try {
      const input = api.reports.create.input.parse(req.body);
      const report = await storage.createReport(input);
      res.status(201).json(report);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.put(api.reports.update.path, async (req, res) => {
    try {
      const input = api.reports.update.input.parse(req.body);
      const report = await storage.updateReport(Number(req.params.id), input);
      if (!report) {
        return res.status(404).json({ message: 'Report not found' });
      }
      res.json(report);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.delete(api.reports.delete.path, async (req, res) => {
    await storage.deleteReport(Number(req.params.id));
    res.status(204).end();
  });

  // Seed data
  seedDatabase().catch(console.error);

  return httpServer;
}

async function seedDatabase() {
  const reports = await storage.getReports();
  if (reports.length === 0) {
    await storage.createReport({
      projectName: "McKinney",
      reportDate: new Date("2025-10-03"),
      buildings: [
        {
          name: "Building 1",
          ventPct: "100%",
          ventNotes: "Vent pipe run Waiting on bath housings",
          copperPct: "100%",
          copperNotes: "",
          flexPct: "100%",
          flexNotes: "",
          airHandlerPct: "100%",
          airHandlerNotes: "",
          condenserPct: "100%",
          condenserNotes: "",
          wallCapsPct: "100%",
          wallCapsNotes: "",
          trimPct: "100%",
          trimNotes: "",
          startUpsPct: "100%",
          startUpsNotes: "",
        },
        {
          name: "Building 2",
          ventPct: "",
          ventNotes: "Vent pipe run Waiting on bath housings",
          copperPct: "",
          copperNotes: "Copper run needing nail plates and fire caulk",
          flexPct: "",
          flexNotes: "Boots hung and working on plenums, no flex run",
          airHandlerPct: "",
          airHandlerNotes: "",
          condenserPct: "",
          condenserNotes: "",
          wallCapsPct: "25%",
          wallCapsNotes: "waiting on stucco/brick",
          trimPct: "",
          trimNotes: "Waiting",
          startUpsPct: "",
          startUpsNotes: "",
        }
      ]
    });
  }
}
