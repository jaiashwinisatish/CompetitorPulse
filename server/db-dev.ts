// Mock database for development without DATABASE_URL
export const pool = {
  query: async () => ({ rows: [], rowCount: 0 }),
  connect: () => Promise.resolve(),
  end: () => Promise.resolve(),
} as any;

export const db = {
  select: () => ({
    from: () => Promise.resolve([]),
    leftJoin: () => ({
      where: () => Promise.resolve([]),
      orderBy: () => Promise.resolve([]),
      limit: () => Promise.resolve([]),
      then: (cb: any) => cb([]),
    }),
  }),
  insert: () => ({ values: () => Promise.resolve([]), returning: () => Promise.resolve([]) }),
  update: () => ({ set: () => Promise.resolve([]), where: () => Promise.resolve([]), returning: () => Promise.resolve([]) }),
  delete: () => ({ where: () => Promise.resolve([]) }),
} as any;

console.log("Using mock database - no real database connection");
