import { db } from '../db';
import { agentSpecificationsTable } from '../db/schema';
import { type UpdateAgentSpecificationInput, type AgentSpecification } from '../schema';
import { eq } from 'drizzle-orm';

export const updateAgentSpecification = async (input: UpdateAgentSpecificationInput): Promise<AgentSpecification | null> => {
  try {
    // Extract the ID and the fields to update
    const { id, ...updateFields } = input;

    // Only include fields that are defined (not undefined)
    const fieldsToUpdate: any = {};
    
    if (updateFields.name !== undefined) {
      fieldsToUpdate.name = updateFields.name;
    }
    
    if (updateFields.description !== undefined) {
      fieldsToUpdate.description = updateFields.description;
    }
    
    if (updateFields.goal !== undefined) {
      fieldsToUpdate.goal = updateFields.goal;
    }
    
    if (updateFields.instructions !== undefined) {
      fieldsToUpdate.instructions = updateFields.instructions;
    }
    
    if (updateFields.tools !== undefined) {
      fieldsToUpdate.tools = updateFields.tools;
    }

    // Always update the updated_at timestamp
    fieldsToUpdate.updated_at = new Date();

    // If no fields to update (besides updated_at), return null
    if (Object.keys(fieldsToUpdate).length === 1) {
      return null;
    }

    // Update the record and return the updated data
    const result = await db.update(agentSpecificationsTable)
      .set(fieldsToUpdate)
      .where(eq(agentSpecificationsTable.id, id))
      .returning()
      .execute();

    // Return null if no record was found/updated
    if (result.length === 0) {
      return null;
    }

    return result[0];
  } catch (error) {
    console.error('Agent specification update failed:', error);
    throw error;
  }
};