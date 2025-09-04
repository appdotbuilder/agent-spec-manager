import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';

// Import schemas
import { 
  createAgentSpecificationInputSchema,
  updateAgentSpecificationInputSchema,
  getAgentSpecificationInputSchema,
  deleteAgentSpecificationInputSchema,
  processNaturalLanguageInputSchema
} from './schema';

// Import handlers
import { createAgentSpecification } from './handlers/create_agent_specification';
import { getAgentSpecifications } from './handlers/get_agent_specifications';
import { getAgentSpecificationById } from './handlers/get_agent_specification_by_id';
import { updateAgentSpecification } from './handlers/update_agent_specification';
import { deleteAgentSpecification } from './handlers/delete_agent_specification';
import { processNaturalLanguage } from './handlers/process_natural_language';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),
  
  // Agent Specification CRUD operations
  createAgentSpecification: publicProcedure
    .input(createAgentSpecificationInputSchema)
    .mutation(({ input }) => createAgentSpecification(input)),
  
  getAgentSpecifications: publicProcedure
    .query(() => getAgentSpecifications()),
  
  getAgentSpecificationById: publicProcedure
    .input(getAgentSpecificationInputSchema)
    .query(({ input }) => getAgentSpecificationById(input)),
  
  updateAgentSpecification: publicProcedure
    .input(updateAgentSpecificationInputSchema)
    .mutation(({ input }) => updateAgentSpecification(input)),
  
  deleteAgentSpecification: publicProcedure
    .input(deleteAgentSpecificationInputSchema)
    .mutation(({ input }) => deleteAgentSpecification(input)),
  
  // Natural language processing
  processNaturalLanguage: publicProcedure
    .input(processNaturalLanguageInputSchema)
    .mutation(({ input }) => processNaturalLanguage(input)),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();