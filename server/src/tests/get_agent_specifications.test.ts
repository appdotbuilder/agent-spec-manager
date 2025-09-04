import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { agentSpecificationsTable } from '../db/schema';
import { getAgentSpecifications } from '../handlers/get_agent_specifications';
import { type CreateAgentSpecificationInput } from '../schema';

// Test data for creating agent specifications
const testAgentSpec1: CreateAgentSpecificationInput = {
  name: 'Data Analyst Agent',
  description: 'An agent that analyzes data and generates insights',
  goal: 'Analyze datasets and provide actionable business insights',
  instructions: 'Use statistical analysis tools to process data and create visualizations',
  tools: ['pandas', 'matplotlib', 'seaborn']
};

const testAgentSpec2: CreateAgentSpecificationInput = {
  name: 'Customer Support Agent',
  description: 'An agent that handles customer inquiries and support tickets',
  goal: 'Provide excellent customer service and resolve issues quickly',
  instructions: 'Be polite, helpful, and escalate complex issues to human agents',
  tools: ['ticket_system', 'knowledge_base', 'email']
};

const testAgentSpec3: CreateAgentSpecificationInput = {
  name: 'Code Review Agent',
  description: 'An agent that reviews code for quality and best practices',
  goal: 'Ensure code quality and adherence to coding standards',
  instructions: 'Review code for bugs, performance issues, and style violations',
  tools: ['linter', 'security_scanner', 'test_runner']
};

describe('getAgentSpecifications', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no agent specifications exist', async () => {
    const result = await getAgentSpecifications();

    expect(result).toEqual([]);
    expect(Array.isArray(result)).toBe(true);
  });

  it('should return all agent specifications', async () => {
    // Create test agent specifications directly in database
    await db.insert(agentSpecificationsTable)
      .values([
        testAgentSpec1,
        testAgentSpec2,
        testAgentSpec3
      ])
      .execute();

    const result = await getAgentSpecifications();

    expect(result).toHaveLength(3);
    
    // Verify all expected fields are present
    result.forEach(spec => {
      expect(spec.id).toBeDefined();
      expect(typeof spec.name).toBe('string');
      expect(typeof spec.description).toBe('string');
      expect(typeof spec.goal).toBe('string');
      expect(typeof spec.instructions).toBe('string');
      expect(Array.isArray(spec.tools)).toBe(true);
      expect(spec.created_at).toBeInstanceOf(Date);
      expect(spec.updated_at).toBeInstanceOf(Date);
    });

    // Verify specific content
    const names = result.map(spec => spec.name);
    expect(names).toContain('Data Analyst Agent');
    expect(names).toContain('Customer Support Agent');
    expect(names).toContain('Code Review Agent');
  });

  it('should return agent specifications ordered by creation date (ascending)', async () => {
    // Insert specifications with slight delays to ensure different timestamps
    await db.insert(agentSpecificationsTable)
      .values(testAgentSpec1)
      .execute();

    // Small delay to ensure different timestamp
    await new Promise(resolve => setTimeout(resolve, 10));

    await db.insert(agentSpecificationsTable)
      .values(testAgentSpec2)
      .execute();

    await new Promise(resolve => setTimeout(resolve, 10));

    await db.insert(agentSpecificationsTable)
      .values(testAgentSpec3)
      .execute();

    const result = await getAgentSpecifications();

    expect(result).toHaveLength(3);
    
    // Verify ordering by creation date (ascending)
    expect(result[0].name).toBe('Data Analyst Agent');
    expect(result[1].name).toBe('Customer Support Agent');
    expect(result[2].name).toBe('Code Review Agent');
    
    // Verify timestamps are in ascending order
    expect(result[0].created_at <= result[1].created_at).toBe(true);
    expect(result[1].created_at <= result[2].created_at).toBe(true);
  });

  it('should handle agent specifications with empty tools array', async () => {
    const agentWithNoTools: CreateAgentSpecificationInput = {
      name: 'Simple Agent',
      description: 'An agent with no tools',
      goal: 'Perform basic tasks',
      instructions: 'Follow simple instructions without tools',
      tools: []
    };

    await db.insert(agentSpecificationsTable)
      .values(agentWithNoTools)
      .execute();

    const result = await getAgentSpecifications();

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Simple Agent');
    expect(result[0].tools).toEqual([]);
    expect(Array.isArray(result[0].tools)).toBe(true);
  });

  it('should handle agent specifications with multiple tools', async () => {
    const agentWithManyTools: CreateAgentSpecificationInput = {
      name: 'Multi-Tool Agent',
      description: 'An agent with many tools',
      goal: 'Use multiple tools effectively',
      instructions: 'Leverage all available tools to complete tasks',
      tools: ['tool1', 'tool2', 'tool3', 'tool4', 'tool5']
    };

    await db.insert(agentSpecificationsTable)
      .values(agentWithManyTools)
      .execute();

    const result = await getAgentSpecifications();

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Multi-Tool Agent');
    expect(result[0].tools).toHaveLength(5);
    expect(result[0].tools).toContain('tool1');
    expect(result[0].tools).toContain('tool5');
  });

  it('should return correct data types for all fields', async () => {
    await db.insert(agentSpecificationsTable)
      .values(testAgentSpec1)
      .execute();

    const result = await getAgentSpecifications();

    expect(result).toHaveLength(1);
    const spec = result[0];

    expect(typeof spec.id).toBe('number');
    expect(typeof spec.name).toBe('string');
    expect(typeof spec.description).toBe('string');
    expect(typeof spec.goal).toBe('string');
    expect(typeof spec.instructions).toBe('string');
    expect(Array.isArray(spec.tools)).toBe(true);
    expect(spec.created_at).toBeInstanceOf(Date);
    expect(spec.updated_at).toBeInstanceOf(Date);
  });
});