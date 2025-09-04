import { db } from '../db';
import { agentSpecificationsTable } from '../db/schema';
import { type DeleteAgentSpecificationInput } from '../schema';
import { eq } from 'drizzle-orm';

export async function deleteAgentSpecification(input: DeleteAgentSpecificationInput): Promise<boolean> {
  try {
    // Delete the agent specification by ID
    const result = await db.delete(agentSpecificationsTable)
      .where(eq(agentSpecificationsTable.id, input.id))
      .execute();

    // Return true if a row was deleted, false if no matching record was found
    return result.rowCount !== null && result.rowCount > 0;
  } catch (error) {
    console.error('Agent specification deletion failed:', error);
    throw error;
  }
}