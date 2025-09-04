import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { agentSpecificationsTable } from '../db/schema';
import { type CreateAgentSpecificationInput } from '../schema';
import { createAgentSpecification } from '../handlers/create_agent_specification';
import { eq } from 'drizzle-orm';

// Test input with all fields
const testInput: CreateAgentSpecificationInput = {
  name: 'Test Agent',
  description: 'An agent for testing purposes',
  goal: 'Test all functionality effectively',
  instructions: 'Follow testing best practices and validate all scenarios',
  tools: ['database_query', 'file_operations', 'api_calls']
};

// Test input with minimal required fields (tools will use default)
const minimalTestInput: CreateAgentSpecificationInput = {
  name: 'Minimal Agent',
  description: 'A minimal agent for testing',
  goal: 'Test with minimal configuration',
  instructions: 'Execute basic operations only',
  tools: [] // Include empty tools array to match TypeScript type
};

describe('createAgentSpecification', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create an agent specification with all fields', async () => {
    const result = await createAgentSpecification(testInput);

    // Basic field validation
    expect(result.name).toEqual('Test Agent');
    expect(result.description).toEqual(testInput.description);
    expect(result.goal).toEqual(testInput.goal);
    expect(result.instructions).toEqual(testInput.instructions);
    expect(result.tools).toEqual(['database_query', 'file_operations', 'api_calls']);
    expect(result.id).toBeDefined();
    expect(typeof result.id).toBe('number');
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should create an agent specification with default tools array', async () => {
    const result = await createAgentSpecification(minimalTestInput);

    // Verify all fields
    expect(result.name).toEqual('Minimal Agent');
    expect(result.description).toEqual(minimalTestInput.description);
    expect(result.goal).toEqual(minimalTestInput.goal);
    expect(result.instructions).toEqual(minimalTestInput.instructions);
    expect(result.tools).toEqual([]); // Should use default empty array
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save agent specification to database', async () => {
    const result = await createAgentSpecification(testInput);

    // Query the database to verify the record was saved
    const agentSpecs = await db.select()
      .from(agentSpecificationsTable)
      .where(eq(agentSpecificationsTable.id, result.id))
      .execute();

    expect(agentSpecs).toHaveLength(1);
    const savedSpec = agentSpecs[0];
    expect(savedSpec.name).toEqual('Test Agent');
    expect(savedSpec.description).toEqual(testInput.description);
    expect(savedSpec.goal).toEqual(testInput.goal);
    expect(savedSpec.instructions).toEqual(testInput.instructions);
    expect(savedSpec.tools).toEqual(['database_query', 'file_operations', 'api_calls']);
    expect(savedSpec.created_at).toBeInstanceOf(Date);
    expect(savedSpec.updated_at).toBeInstanceOf(Date);
  });

  it('should handle complex tools array correctly', async () => {
    const complexInput: CreateAgentSpecificationInput = {
      name: 'Complex Agent',
      description: 'An agent with complex tool configuration',
      goal: 'Handle complex operations',
      instructions: 'Use all available tools as needed',
      tools: ['web_scraper', 'data_analyzer', 'report_generator', 'notification_sender']
    };

    const result = await createAgentSpecification(complexInput);

    // Verify tools array is preserved correctly
    expect(result.tools).toEqual([
      'web_scraper', 
      'data_analyzer', 
      'report_generator', 
      'notification_sender'
    ]);

    // Verify in database
    const savedSpecs = await db.select()
      .from(agentSpecificationsTable)
      .where(eq(agentSpecificationsTable.id, result.id))
      .execute();

    expect(savedSpecs[0].tools).toEqual([
      'web_scraper', 
      'data_analyzer', 
      'report_generator', 
      'notification_sender'
    ]);
  });

  it('should create multiple agent specifications with unique IDs', async () => {
    const firstSpec = await createAgentSpecification(testInput);
    const secondSpec = await createAgentSpecification(minimalTestInput);

    // Verify both were created with different IDs
    expect(firstSpec.id).not.toEqual(secondSpec.id);
    expect(typeof firstSpec.id).toBe('number');
    expect(typeof secondSpec.id).toBe('number');

    // Verify both are in the database
    const allSpecs = await db.select()
      .from(agentSpecificationsTable)
      .execute();

    expect(allSpecs).toHaveLength(2);
    
    // Verify they have different names to confirm they're distinct records
    const specNames = allSpecs.map(spec => spec.name).sort();
    expect(specNames).toEqual(['Minimal Agent', 'Test Agent']);
  });

  it('should set timestamps correctly', async () => {
    const beforeCreation = new Date();
    const result = await createAgentSpecification(testInput);
    const afterCreation = new Date();

    // Verify timestamps are within expected range
    expect(result.created_at >= beforeCreation).toBe(true);
    expect(result.created_at <= afterCreation).toBe(true);
    expect(result.updated_at >= beforeCreation).toBe(true);
    expect(result.updated_at <= afterCreation).toBe(true);

    // Verify timestamps are equal for new records
    expect(result.created_at.getTime()).toEqual(result.updated_at.getTime());
  });
});