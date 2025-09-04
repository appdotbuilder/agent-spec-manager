import { db } from '../db';
import { agentSpecificationsTable } from '../db/schema';
import { type AgentSpecification } from '../schema';
import { asc } from 'drizzle-orm';

export const getAgentSpecifications = async (): Promise<AgentSpecification[]> => {
  try {
    // Fetch all agent specifications ordered by creation date (ascending)
    const results = await db.select()
      .from(agentSpecificationsTable)
      .orderBy(asc(agentSpecificationsTable.created_at))
      .execute();

    // Return results directly - no numeric conversions needed for this schema
    return results;
  } catch (error) {
    console.error('Failed to fetch agent specifications:', error);
    throw error;
  }
};