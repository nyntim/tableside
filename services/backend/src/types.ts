import type { Database } from '@tableside/db';

export type AppBindings = {
  HYPERDRIVE: { connectionString: string };
};

export type AppContext = {
  Bindings: AppBindings;
  Variables: {
    db: Database;
  };
};

export type GetDb = (connectionString: string) => Database;
