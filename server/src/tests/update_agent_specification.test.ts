import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { agentSpecificationsTable } from '../db/schema';
import { type UpdateAgentSpecificationInput } from '../schema';
import { updateAgentSpecification } from '../handlers/update_agent_specification';
import { eq } from 'drizzle-orm';

describe('updateAgentSpecification', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  // Helper function to create a test agent specification
  const createTestAgent = async () => {
    const result = await db.insert(agentSpecificationsTable)
      .values({
        name: 'Test Agent',
        description: 'A test agent specification',
        goal: 'Test goal',
        instructions: 'Test instructions',
        tools: ['tool1', 'tool2']
      })
      .returning()
      .execute();
    
    return result[0];
  };

  it('should update all fields of an agent specification', async () => {
    // Create a test agent
    const testAgent = await createTestAgent();
    
    const updateInput: UpdateAgentSpecificationInput = {
      id: testAgent.id,
      name: 'Updated Agent',
      description: 'Updated description',
      goal: 'Updated goal',
      instructions: 'Updated instructions',
      tools: ['updated-tool1', 'updated-tool2', 'updated-tool3']
    };

    const result = await updateAgentSpecification(updateInput);

    // Verify the result
    expect(result).toBeDefined();
    expect(result!.id).toEqual(testAgent.id);
    expect(result!.name).toEqual('Updated Agent');
    expect(result!.description).toEqual('Updated description');
    expect(result!.goal).toEqual('Updated goal');
    expect(result!.instructions).toEqual('Updated instructions');
    expect(result!.tools).toEqual(['updated-tool1', 'updated-tool2', 'updated-tool3']);
    expect(result!.created_at).toEqual(testAgent.created_at);
    expect(result!.updated_at.getTime()).toBeGreaterThan(testAgent.updated_at.getTime());
  });

  it('should update only specific fields', async () => {
    // Create a test agent
    const testAgent = await createTestAgent();
    
    const updateInput: UpdateAgentSpecificationInput = {
      id: testAgent.id,
      name: 'Only Name Updated',
      tools: ['new-tool']
    };

    const result = await updateAgentSpecification(updateInput);

    // Verify only specified fields were updated
    expect(result).toBeDefined();
    expect(result!.id).toEqual(testAgent.id);
    expect(result!.name).toEqual('Only Name Updated');
    expect(result!.description).toEqual(testAgent.description); // Unchanged
    expect(result!.goal).toEqual(testAgent.goal); // Unchanged
    expect(result!.instructions).toEqual(testAgent.instructions); // Unchanged
    expect(result!.tools).toEqual(['new-tool']);
    expect(result!.created_at).toEqual(testAgent.created_at);
    expect(result!.updated_at.getTime()).toBeGreaterThan(testAgent.updated_at.getTime());
  });

  it('should update the database record', async () => {
    // Create a test agent
    const testAgent = await createTestAgent();
    
    const updateInput: UpdateAgentSpecificationInput = {
      id: testAgent.id,
      description: 'Database Updated Description'
    };

    await updateAgentSpecification(updateInput);

    // Query the database directly to verify update
    const updatedRecord = await db.select()
      .from(agentSpecificationsTable)
      .where(eq(agentSpecificationsTable.id, testAgent.id))
      .execute();

    expect(updatedRecord).toHaveLength(1);
    expect(updatedRecord[0].description).toEqual('Database Updated Description');
    expect(updatedRecord[0].name).toEqual(testAgent.name); // Unchanged
    expect(updatedRecord[0].updated_at.getTime()).toBeGreaterThan(testAgent.updated_at.getTime());
  });

  it('should return null for non-existent agent specification', async () => {
    const updateInput: UpdateAgentSpecificationInput = {
      id: 99999, // Non-existent ID
      name: 'Non-existent Agent'
    };

    const result = await updateAgentSpecification(updateInput);

    expect(result).toBeNull();
  });

  it('should handle empty tools array', async () => {
    // Create a test agent
    const testAgent = await createTestAgent();
    
    const updateInput: UpdateAgentSpecificationInput = {
      id: testAgent.id,
      tools: []
    };

    const result = await updateAgentSpecification(updateInput);

    expect(result).toBeDefined();
    expect(result!.tools).toEqual([]);
  });

  it('should update tools to include new tools', async () => {
    // Create a test agent
    const testAgent = await createTestAgent();
    
    const updateInput: UpdateAgentSpecificationInput = {
      id: testAgent.id,
      tools: ['web_search', 'calculator', 'file_reader', 'email_sender']
    };

    const result = await updateAgentSpecification(updateInput);

    expect(result).toBeDefined();
    expect(result!.tools).toEqual(['web_search', 'calculator', 'file_reader', 'email_sender']);
    expect(result!.tools).toHaveLength(4);
  });

  it('should preserve unchanged fields when updating single field', async () => {
    // Create a test agent with specific values
    const testAgent = await createTestAgent();
    const originalCreatedAt = testAgent.created_at;
    
    const updateInput: UpdateAgentSpecificationInput = {
      id: testAgent.id,
      goal: 'Updated Goal Only'
    };

    const result = await updateAgentSpecification(updateInput);

    // Verify other fields remain unchanged
    expect(result).toBeDefined();
    expect(result!.name).toEqual(testAgent.name);
    expect(result!.description).toEqual(testAgent.description);
    expect(result!.goal).toEqual('Updated Goal Only');
    expect(result!.instructions).toEqual(testAgent.instructions);
    expect(result!.tools).toEqual(testAgent.tools);
    expect(result!.created_at).toEqual(originalCreatedAt);
    expect(result!.updated_at.getTime()).toBeGreaterThan(testAgent.updated_at.getTime());
  });
});