import { db } from '../db';
import { agentSpecificationsTable } from '../db/schema';
import { type GetAgentSpecificationInput, type AgentSpecification } from '../schema';
import { eq } from 'drizzle-orm';

export async function getAgentSpecificationById(input: GetAgentSpecificationInput): Promise<AgentSpecification | null> {
  try {
    // Query the database for the agent specification by ID
    const results = await db.select()
      .from(agentSpecificationsTable)
      .where(eq(agentSpecificationsTable.id, input.id))
      .execute();

    // Return the first result if found, null otherwise
    if (results.length === 0) {
      return null;
    }

    return results[0];
  } catch (error) {
    console.error('Failed to get agent specification by ID:', error);
    throw error;
  }
}