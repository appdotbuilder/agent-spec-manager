import { serial, text, pgTable, timestamp, json } from 'drizzle-orm/pg-core';

export const agentSpecificationsTable = pgTable('agent_specifications', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  goal: text('goal').notNull(),
  instructions: text('instructions').notNull(),
  tools: json('tools').$type<string[]>().notNull().default([]),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// TypeScript types for the table schema
export type AgentSpecification = typeof agentSpecificationsTable.$inferSelect; // For SELECT operations
export type NewAgentSpecification = typeof agentSpecificationsTable.$inferInsert; // For INSERT operations

// Important: Export all tables for proper query building
export const tables = { agentSpecifications: agentSpecificationsTable };