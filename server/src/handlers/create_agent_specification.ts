import { db } from '../db';
import { agentSpecificationsTable } from '../db/schema';
import { type CreateAgentSpecificationInput, type AgentSpecification } from '../schema';

export const createAgentSpecification = async (input: CreateAgentSpecificationInput): Promise<AgentSpecification> => {
  try {
    // Insert agent specification record
    const result = await db.insert(agentSpecificationsTable)
      .values({
        name: input.name,
        description: input.description,
        goal: input.goal,
        instructions: input.instructions,
        tools: input.tools // JSON column - no conversion needed
      })
      .returning()
      .execute();

    // Return the created agent specification
    const agentSpecification = result[0];
    return agentSpecification;
  } catch (error) {
    console.error('Agent specification creation failed:', error);
    throw error;
  }
};