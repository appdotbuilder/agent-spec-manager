import { z } from 'zod';

// Agent Specification schema
export const agentSpecificationSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  goal: z.string(),
  instructions: z.string(),
  tools: z.array(z.string()),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type AgentSpecification = z.infer<typeof agentSpecificationSchema>;

// Input schema for creating agent specifications
export const createAgentSpecificationInputSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  goal: z.string().min(1, "Goal is required"),
  instructions: z.string().min(1, "Instructions are required"),
  tools: z.array(z.string()).default([])
});

export type CreateAgentSpecificationInput = z.infer<typeof createAgentSpecificationInputSchema>;

// Input schema for updating agent specifications
export const updateAgentSpecificationInputSchema = z.object({
  id: z.number(),
  name: z.string().min(1, "Name is required").optional(),
  description: z.string().min(1, "Description is required").optional(),
  goal: z.string().min(1, "Goal is required").optional(),
  instructions: z.string().min(1, "Instructions are required").optional(),
  tools: z.array(z.string()).optional()
});

export type UpdateAgentSpecificationInput = z.infer<typeof updateAgentSpecificationInputSchema>;

// Input schema for natural language processing
export const processNaturalLanguageInputSchema = z.object({
  description: z.string().min(1, "Natural language description is required")
});

export type ProcessNaturalLanguageInput = z.infer<typeof processNaturalLanguageInputSchema>;

// Schema for the structured output from natural language processing
export const agentSpecificationSuggestionSchema = z.object({
  name: z.string(),
  description: z.string(),
  goal: z.string(),
  instructions: z.string(),
  tools: z.array(z.string())
});

export type AgentSpecificationSuggestion = z.infer<typeof agentSpecificationSuggestionSchema>;

// Schema for getting a single agent specification by ID
export const getAgentSpecificationInputSchema = z.object({
  id: z.number()
});

export type GetAgentSpecificationInput = z.infer<typeof getAgentSpecificationInputSchema>;

// Schema for deleting an agent specification
export const deleteAgentSpecificationInputSchema = z.object({
  id: z.number()
});

export type DeleteAgentSpecificationInput = z.infer<typeof deleteAgentSpecificationInputSchema>;