import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";
import { eq, desc, and, gte, lte, sql } from "drizzle-orm";
import { competitors, updates, classifications, sources, digests } from "@shared/schema";

let pool: any;
let db: any;

if (process.env.DATABASE_URL) {
  neonConfig.webSocketConstructor = ws;
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzle({ client: pool, schema });
} else {
  console.log("DATABASE_URL not found - using mock database");
  pool = {
    query: async () => ({ rows: [], rowCount: 0 }),
    connect: () => Promise.resolve(),
    end: () => Promise.resolve(),
  };

  const mockTableData = {
    competitors: [{ id: 1, name: "Competitor 1" }, { id: 2, name: "Competitor 2" }],
    sources: [{ id: 1, name: "Source 1", competitorId: 1, isActive: true }, { id: 2, name: "Source 2", competitorId: 2, isActive: true }],
    updates: [
      { id: 1, content: "Update 1", sourceId: 1, competitorId: 1, severity: "low", createdAt: new Date() },
      { id: 2, content: "Update 2", sourceId: 2, competitorId: 2, severity: "high", createdAt: new Date() },
    ],
    classifications: [
      { id: 1, updateId: 1, competitorId: 1, category: "feature", impact: "low" },
      { id: 2, updateId: 2, competitorId: 2, category: "pricing", impact: "high" },
    ],
    digests: [{ id: 1, classifiedUpdates: [1, 2], createdAt: new Date() }]
  };

  const baseChain = {
    innerJoin: (otherTable: any, on: any) => baseChain,
    leftJoin: (otherTable: any, on: any) => baseChain,
    where: (condition: any) => baseChain,
    orderBy: (order: any) => baseChain,
    limit: (num: number) => baseChain,
    then: (cb: Function) => {
      // Default behavior: return all data for the table
      cb(tableData);
    },
  };

  let tableData: any[] = [];
  
  const mockSelect = (fields?: any) => ({
    from: (table: any) => {
      // Map table to data
      if (table === competitors) tableData = mockTableData.competitors;
      else if (table === sources) tableData = mockTableData.sources;
      else if (table === updates) tableData = mockTableData.updates;
      else if (table === classifications) tableData = mockTableData.classifications;
      else if (table === digests) tableData = mockTableData.digests;
      else {
        // Handle count queries
        if (fields && fields.count) {
          return {
            where: (condition: any) => ({
              then: (cb: Function) => {
                let count = 0;
                if (table === competitors) count = mockTableData.competitors.length;
                else if (table === sources) count = mockTableData.sources.length;
                else if (table === updates) count = mockTableData.updates.length;
                else if (table === classifications) count = mockTableData.classifications.length;
                cb([{ count }]);
              }
            }),
            then: (cb: Function) => {
              let count = 0;
              if (table === competitors) count = mockTableData.competitors.length;
              else if (table === sources) count = mockTableData.sources.length;
              else if (table === updates) count = mockTableData.updates.length;
              else if (table === classifications) count = mockTableData.classifications.length;
              cb([{ count }]);
            }
          };
        }
        
        // Handle field-specific queries
        const mockData: any[] = [];
        if (table === competitors) mockData.push({ count: mockTableData.competitors.length });
        else if (table === sources) mockData.push({ count: mockTableData.sources.length });
        else if (table === updates) mockData.push({ count: mockTableData.updates.length });
        else if (table === classifications) mockData.push({ count: mockTableData.classifications.length });
        return { then: (cb: Function) => cb(mockData) };
      }
      
      return {
        innerJoin: (otherTable: any, on: any) => ({
          where: (condition: any) => ({ then: (cb: Function) => cb(tableData) }),
          orderBy: (order: any) => ({ limit: (num: number) => ({ then: (cb: Function) => cb(tableData) }) }),
          then: (cb: Function) => cb(tableData)
        }),
        leftJoin: (otherTable: any, on: any) => ({
          leftJoin: (otherTable2: any, on2: any) => ({
            orderBy: (order: any) => ({ limit: (num: number) => ({ then: (cb: Function) => cb(tableData) }) }),
            then: (cb: Function) => cb(tableData)
          }),
          where: (condition: any) => ({ then: (cb: Function) => cb(tableData) }),
          orderBy: (order: any) => ({ limit: (num: number) => ({ then: (cb: Function) => cb(tableData) }) }),
          then: (cb: Function) => cb(tableData)
        }),
        where: (condition: any) => ({
          orderBy: (order: any) => ({ limit: (num: number) => ({ then: (cb: Function) => cb(tableData) }) }),
          then: (cb: Function) => cb(tableData)
        }),
        orderBy: (order: any) => ({
          limit: (num: number) => ({ then: (cb: Function) => cb(tableData) })
        }),
        then: (cb: Function) => cb(tableData)
      };
    }
  });

  const mockInsert = () => ({
    values: (values: any) => ({
      returning: () => Promise.resolve(values),
    }),
  });

  const mockUpdate = () => ({
    set: (setValues: any) => ({
      where: (whereCondition: any) => ({
        returning: () => Promise.resolve([setValues]),
      }),
    }),
  });

  const mockDelete = () => ({
    where: (whereCondition: any) => Promise.resolve([]),
  });
  
  db = {
    select: mockSelect,
    insert: mockInsert,
    update: mockUpdate,
    delete: mockDelete,
  };
}

export { pool, db };
