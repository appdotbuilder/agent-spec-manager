import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { agentSpecificationsTable } from '../db/schema';
import { type GetAgentSpecificationInput } from '../schema';
import { getAgentSpecificationById } from '../handlers/get_agent_specification_by_id';
import { eq } from 'drizzle-orm';

// Test data for agent specification
const testAgentSpec = {
  name: 'Test Agent',
  description: 'A test agent for unit testing',
  goal: 'To test the get agent specification functionality',
  instructions: 'Follow the test procedures carefully',
  tools: ['test_tool_1', 'test_tool_2']
};

describe('getAgentSpecificationById', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return agent specification when found', async () => {
    // Create a test agent specification
    const insertResult = await db.insert(agentSpecificationsTable)
      .values(testAgentSpec)
      .returning()
      .execute();

    const createdAgent = insertResult[0];

    // Test getting the agent specification by ID
    const input: GetAgentSpecificationInput = {
      id: createdAgent.id
    };

    const result = await getAgentSpecificationById(input);

    // Verify the result
    expect(result).not.toBeNull();
    expect(result!.id).toEqual(createdAgent.id);
    expect(result!.name).toEqual(testAgentSpec.name);
    expect(result!.description).toEqual(testAgentSpec.description);
    expect(result!.goal).toEqual(testAgentSpec.goal);
    expect(result!.instructions).toEqual(testAgentSpec.instructions);
    expect(result!.tools).toEqual(testAgentSpec.tools);
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should return null when agent specification not found', async () => {
    const input: GetAgentSpecificationInput = {
      id: 999999 // Non-existent ID
    };

    const result = await getAgentSpecificationById(input);

    expect(result).toBeNull();
  });

  it('should handle empty tools array correctly', async () => {
    // Create agent specification with empty tools array
    const agentSpecWithEmptyTools = {
      ...testAgentSpec,
      tools: []
    };

    const insertResult = await db.insert(agentSpecificationsTable)
      .values(agentSpecWithEmptyTools)
      .returning()
      .execute();

    const createdAgent = insertResult[0];

    const input: GetAgentSpecificationInput = {
      id: createdAgent.id
    };

    const result = await getAgentSpecificationById(input);

    expect(result).not.toBeNull();
    expect(result!.tools).toEqual([]);
    expect(Array.isArray(result!.tools)).toBe(true);
  });

  it('should handle multiple agent specifications correctly', async () => {
    // Create multiple agent specifications
    const agent1 = await db.insert(agentSpecificationsTable)
      .values({
        name: 'Agent 1',
        description: 'First agent',
        goal: 'Goal 1',
        instructions: 'Instructions 1',
        tools: ['tool1']
      })
      .returning()
      .execute();

    const agent2 = await db.insert(agentSpecificationsTable)
      .values({
        name: 'Agent 2', 
        description: 'Second agent',
        goal: 'Goal 2',
        instructions: 'Instructions 2',
        tools: ['tool2']
      })
      .returning()
      .execute();

    // Test getting the first agent
    const result1 = await getAgentSpecificationById({ id: agent1[0].id });
    expect(result1).not.toBeNull();
    expect(result1!.name).toEqual('Agent 1');
    expect(result1!.tools).toEqual(['tool1']);

    // Test getting the second agent
    const result2 = await getAgentSpecificationById({ id: agent2[0].id });
    expect(result2).not.toBeNull();
    expect(result2!.name).toEqual('Agent 2');
    expect(result2!.tools).toEqual(['tool2']);
  });

  it('should verify database state after retrieval', async () => {
    // Create test agent specification
    const insertResult = await db.insert(agentSpecificationsTable)
      .values(testAgentSpec)
      .returning()
      .execute();

    const createdAgent = insertResult[0];

    // Get agent specification via handler
    await getAgentSpecificationById({ id: createdAgent.id });

    // Verify the original data is still in the database unchanged
    const directQuery = await db.select()
      .from(agentSpecificationsTable)
      .where(eq(agentSpecificationsTable.id, createdAgent.id))
      .execute();

    expect(directQuery).toHaveLength(1);
    expect(directQuery[0].name).toEqual(testAgentSpec.name);
    expect(directQuery[0].description).toEqual(testAgentSpec.description);
    expect(directQuery[0].goal).toEqual(testAgentSpec.goal);
    expect(directQuery[0].instructions).toEqual(testAgentSpec.instructions);
    expect(directQuery[0].tools).toEqual(testAgentSpec.tools);
  });
});