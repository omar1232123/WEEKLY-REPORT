import { z } from "zod";
import { insertReportSchema, reports, buildings, createReportWithBuildingsSchema } from "./schema";

export const errorSchemas = {
  validation: z.object({ message: z.string(), field: z.string().optional() }),
  notFound: z.object({ message: z.string() }),
};

const reportWithBuildingsSchema = z.object({
  id: z.number(),
  projectName: z.string(),
  reportDate: z.union([z.date(), z.string()]),
  buildings: z.array(z.object({
    id: z.number(),
    reportId: z.number(),
    name: z.string(),
    ventPct: z.string().nullable(),
    ventNotes: z.string().nullable(),
    copperPct: z.string().nullable(),
    copperNotes: z.string().nullable(),
    flexPct: z.string().nullable(),
    flexNotes: z.string().nullable(),
    airHandlerPct: z.string().nullable(),
    airHandlerNotes: z.string().nullable(),
    condenserPct: z.string().nullable(),
    condenserNotes: z.string().nullable(),
    wallCapsPct: z.string().nullable(),
    wallCapsNotes: z.string().nullable(),
    trimPct: z.string().nullable(),
    trimNotes: z.string().nullable(),
    startUpsPct: z.string().nullable(),
    startUpsNotes: z.string().nullable(),
  }))
});

export const api = {
  reports: {
    list: {
      method: 'GET' as const,
      path: '/api/reports' as const,
      responses: {
        200: z.array(z.custom<typeof reports.$inferSelect>()),
      }
    },
    get: {
      method: 'GET' as const,
      path: '/api/reports/:id' as const,
      responses: {
        200: reportWithBuildingsSchema,
        404: errorSchemas.notFound,
      }
    },
    create: {
      method: 'POST' as const,
      path: '/api/reports' as const,
      input: createReportWithBuildingsSchema,
      responses: {
        201: reportWithBuildingsSchema,
        400: errorSchemas.validation,
      }
    },
    update: {
      method: 'PUT' as const,
      path: '/api/reports/:id' as const,
      input: createReportWithBuildingsSchema,
      responses: {
        200: reportWithBuildingsSchema,
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      }
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/reports/:id' as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      }
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

export type ReportWithBuildingsResponse = z.infer<typeof reportWithBuildingsSchema>;
