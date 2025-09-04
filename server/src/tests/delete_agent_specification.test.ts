import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { agentSpecificationsTable } from '../db/schema';
import { type DeleteAgentSpecificationInput, type CreateAgentSpecificationInput } from '../schema';
import { deleteAgentSpecification } from '../handlers/delete_agent_specification';
import { eq } from 'drizzle-orm';

// Test input for creating an agent specification to delete
const testCreateInput: CreateAgentSpecificationInput = {
  name: 'Test Agent',
  description: 'An agent for testing deletion',
  goal: 'Test goal',
  instructions: 'Test instructions',
  tools: ['tool1', 'tool2']
};

describe('deleteAgentSpecification', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete an existing agent specification', async () => {
    // First create an agent specification
    const createResult = await db.insert(agentSpecificationsTable)
      .values({
        name: testCreateInput.name,
        description: testCreateInput.description,
        goal: testCreateInput.goal,
        instructions: testCreateInput.instructions,
        tools: testCreateInput.tools
      })
      .returning()
      .execute();

    const createdAgent = createResult[0];

    // Delete the agent specification
    const deleteInput: DeleteAgentSpecificationInput = {
      id: createdAgent.id
    };

    const result = await deleteAgentSpecification(deleteInput);

    // Should return true indicating successful deletion
    expect(result).toBe(true);

    // Verify the agent specification was actually deleted from the database
    const deletedAgents = await db.select()
      .from(agentSpecificationsTable)
      .where(eq(agentSpecificationsTable.id, createdAgent.id))
      .execute();

    expect(deletedAgents).toHaveLength(0);
  });

  it('should return false when trying to delete non-existent agent specification', async () => {
    const deleteInput: DeleteAgentSpecificationInput = {
      id: 99999 // Non-existent ID
    };

    const result = await deleteAgentSpecification(deleteInput);

    // Should return false indicating no record was found to delete
    expect(result).toBe(false);
  });

  it('should not affect other agent specifications when deleting one', async () => {
    // Create two agent specifications
    const firstAgent = await db.insert(agentSpecificationsTable)
      .values({
        name: 'First Agent',
        description: 'First agent description',
        goal: 'First goal',
        instructions: 'First instructions',
        tools: ['tool1']
      })
      .returning()
      .execute();

    const secondAgent = await db.insert(agentSpecificationsTable)
      .values({
        name: 'Second Agent',
        description: 'Second agent description',
        goal: 'Second goal',
        instructions: 'Second instructions',
        tools: ['tool2']
      })
      .returning()
      .execute();

    // Delete the first agent
    const deleteInput: DeleteAgentSpecificationInput = {
      id: firstAgent[0].id
    };

    const result = await deleteAgentSpecification(deleteInput);

    expect(result).toBe(true);

    // Verify first agent is deleted
    const deletedAgents = await db.select()
      .from(agentSpecificationsTable)
      .where(eq(agentSpecificationsTable.id, firstAgent[0].id))
      .execute();

    expect(deletedAgents).toHaveLength(0);

    // Verify second agent still exists
    const remainingAgents = await db.select()
      .from(agentSpecificationsTable)
      .where(eq(agentSpecificationsTable.id, secondAgent[0].id))
      .execute();

    expect(remainingAgents).toHaveLength(1);
    expect(remainingAgents[0].name).toEqual('Second Agent');
    expect(remainingAgents[0].description).toEqual('Second agent description');
  });

  it('should handle deletion of agent with empty tools array', async () => {
    // Create an agent specification with empty tools array
    const createResult = await db.insert(agentSpecificationsTable)
      .values({
        name: 'Agent with no tools',
        description: 'Agent with empty tools',
        goal: 'Test goal',
        instructions: 'Test instructions',
        tools: [] // Empty tools array
      })
      .returning()
      .execute();

    const createdAgent = createResult[0];

    // Delete the agent specification
    const deleteInput: DeleteAgentSpecificationInput = {
      id: createdAgent.id
    };

    const result = await deleteAgentSpecification(deleteInput);

    expect(result).toBe(true);

    // Verify deletion
    const deletedAgents = await db.select()
      .from(agentSpecificationsTable)
      .where(eq(agentSpecificationsTable.id, createdAgent.id))
      .execute();

    expect(deletedAgents).toHaveLength(0);
  });

  it('should handle deletion with various ID types', async () => {
    // Create an agent specification
    const createResult = await db.insert(agentSpecificationsTable)
      .values({
        name: 'Test Agent for ID types',
        description: 'Testing different ID scenarios',
        goal: 'Test goal',
        instructions: 'Test instructions',
        tools: ['tool1']
      })
      .returning()
      .execute();

    const createdAgent = createResult[0];

    // Test with the actual ID (should work)
    const deleteInput: DeleteAgentSpecificationInput = {
      id: createdAgent.id
    };

    const result = await deleteAgentSpecification(deleteInput);
    expect(result).toBe(true);

    // Test deleting the same ID again (should return false)
    const secondDeleteResult = await deleteAgentSpecification(deleteInput);
    expect(secondDeleteResult).toBe(false);
  });
});