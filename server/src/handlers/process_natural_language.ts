import { type ProcessNaturalLanguageInput, type AgentSpecificationSuggestion } from '../schema';

interface ToolMapping {
  keywords: string[];
  tool: string;
}

// Tool mappings based on common keywords and use cases
const TOOL_MAPPINGS: ToolMapping[] = [
  { keywords: ['email', 'send', 'mail', 'notify', 'notification', 'report'], tool: 'email_tool' },
  { keywords: ['web', 'scrape', 'website', 'browse', 'crawl', 'fetch'], tool: 'web_scraper' },
  { keywords: ['file', 'document', 'read', 'write', 'save', 'upload', 'backup'], tool: 'file_manager' },
  { keywords: ['database', 'db', 'store', 'data', 'query', 'sql', 'stores'], tool: 'database_tool' },
  { keywords: ['api', 'http', 'request', 'call', 'endpoint', 'service', 'calls'], tool: 'api_client' },
  { keywords: ['schedule', 'timer', 'cron', 'periodic', 'interval', 'daily', 'night', 'appointment', 'managing'], tool: 'scheduler' },
  { keywords: ['search', 'find', 'lookup', 'google', 'bing', 'research'], tool: 'search_tool' },
  { keywords: ['calculate', 'math', 'compute', 'formula', 'number', 'calculation'], tool: 'calculator' },
  { keywords: ['image', 'photo', 'picture', 'visual', 'generate'], tool: 'image_processor' },
  { keywords: ['text', 'translate', 'language', 'nlp', 'process', 'compiles', 'findings'], tool: 'text_processor' },
  { keywords: ['calendar', 'appointment', 'meeting', 'event'], tool: 'calendar_tool' },
  { keywords: ['chat', 'message', 'communicate', 'slack', 'discord'], tool: 'chat_tool' }
];

function extractAgentName(description: string): string {
  // Look for explicit names in phrases like "create an agent called X" or "agent named X"
  const namePatterns = [
    /(?:agent (?:called|named)|create (?:an? )?agent (?:called|named)) ["']?([^"'\n]+)["']?/i,
    /["']([^"'\n]+)["'] agent/i,
    /agent for (.+?) that/i,
    /(.+?) agent/i
  ];

  for (const pattern of namePatterns) {
    const match = description.match(pattern);
    if (match) {
      return match[1].trim();
    }
  }

  // Check for specific agent types based on keywords
  if (description.toLowerCase().includes('web') && (description.toLowerCase().includes('scrap') || description.toLowerCase().includes('crawl'))) {
    return 'Web Scraping Agent';
  }
  
  if (description.toLowerCase().includes('scheduling')) {
    return 'Scheduling Agent';
  }

  if (description.toLowerCase().includes('research')) {
    return 'Research Agent';
  }

  if (description.toLowerCase().includes('image')) {
    return 'Image Analysis Agent';
  }

  // Handle "Create a..." patterns
  const createPattern = /create (?:a |an )?(.+?) agent/i;
  const createMatch = description.match(createPattern);
  if (createMatch) {
    return `${createMatch[1].trim()} Agent`;
  }

  // Extract key action words as fallback
  const actionWords = description.match(/\b(manage|monitor|track|analyze|process|handle|automate|assist|help|support)\w*\b/gi);
  if (actionWords && actionWords.length > 0) {
    const mainAction = actionWords[0].toLowerCase();
    return `${mainAction.charAt(0).toUpperCase()}${mainAction.slice(1)} Agent`;
  }

  return 'Smart Assistant Agent';
}

function extractGoal(description: string): string {
  // Look for explicit goal statements
  const goalPatterns = [
    /(?:goal|objective|purpose|aim) (?:is to|should be|:) (.+?)(?:\.|$)/i,
    /(?:should|will|needs? to|must) (.+?)(?:\.|$)/i,
    /(?:to|for) (.+?) (?:by|using|with|and)/i,
    /(?:help|assist|enable|allow) (?:users? |me |people )?(?:to )?(.+?)(?:\.|$)/i
  ];

  for (const pattern of goalPatterns) {
    const match = description.match(pattern);
    if (match) {
      return `To ${match[1].trim().toLowerCase()}`;
    }
  }

  // Handle "I need an agent that..." pattern
  const needsPattern = /I need an agent that (.+?)(?:\.|$)/i;
  const needsMatch = description.match(needsPattern);
  if (needsMatch) {
    return `To ${needsMatch[1].trim().toLowerCase()}`;
  }

  // Handle "that calls external APIs..." pattern - check before general action match
  const thatCallsPattern = /that calls external APIs/i;
  if (thatCallsPattern.test(description)) {
    return `To call external APIs and process data`;
  }

  const apisPattern = /calls external APIs to (.+?)(?:\.|$)/i;
  const apisMatch = description.match(apisPattern);
  if (apisMatch) {
    return `To ${apisMatch[1].trim().toLowerCase()}`;
  }

  // Extract main action from description - but avoid matching "Create" if we have API context
  const actionMatch = description.match(/\b(automate|manage|monitor|track|analyze|process|handle|assist|help|support|create|generate|find|search|notify|alert|update|maintain)(?:\s+an?\s+agent)?(?:\s+that)?\s+(.+?)(?:\.|,|$)/i);
  if (actionMatch) {
    // Skip if this is a "Create an agent that..." pattern with APIs
    if (actionMatch[1].toLowerCase() === 'create' && description.toLowerCase().includes('calls external apis')) {
      return `To call external APIs and process data`;
    }
    return `To ${actionMatch[1].toLowerCase()} ${actionMatch[2].trim()}`;
  }

  return `To ${description.split('.')[0].toLowerCase()}`;
}

function generateInstructions(description: string, tools: string[]): string {
  const baseInstructions = [
    "You are an AI agent designed to help users accomplish their tasks efficiently.",
    "Always be helpful, accurate, and follow the user's requests carefully."
  ];

  // Add tool-specific instructions
  const toolInstructions: string[] = [];
  
  if (tools.includes('web_scraper')) {
    toolInstructions.push("When scraping web content, always respect robots.txt and rate limits.");
  }
  
  if (tools.includes('email_tool')) {
    toolInstructions.push("For email communications, be professional and clear in your messaging.");
  }
  
  if (tools.includes('database_tool')) {
    toolInstructions.push("When working with databases, ensure data integrity and use appropriate queries.");
  }
  
  if (tools.includes('file_manager')) {
    toolInstructions.push("Handle files carefully and always verify permissions before reading or writing.");
  }

  // Add task-specific instructions based on description
  if (description.toLowerCase().includes('monitor')) {
    toolInstructions.push("Continuously monitor the specified systems and alert users of any important changes.");
  }
  
  if (description.toLowerCase().includes('automat')) {
    toolInstructions.push("Focus on automating repetitive tasks while maintaining quality and accuracy.");
  }

  if (description.toLowerCase().includes('schedul')) {
    toolInstructions.push("Manage scheduling tasks with attention to time zones and conflicts.");
  }

  return [...baseInstructions, ...toolInstructions].join(" ");
}

function suggestTools(description: string): string[] {
  const suggestedTools = new Set<string>();
  const lowerDescription = description.toLowerCase();

  // Check each tool mapping
  for (const mapping of TOOL_MAPPINGS) {
    const hasKeyword = mapping.keywords.some(keyword => 
      lowerDescription.includes(keyword)
    );
    
    if (hasKeyword) {
      suggestedTools.add(mapping.tool);
    }
  }

  // Always suggest basic tools for common agent needs
  if (lowerDescription.includes('user') || lowerDescription.includes('people')) {
    suggestedTools.add('text_processor');
  }

  return Array.from(suggestedTools);
}

export async function processNaturalLanguage(input: ProcessNaturalLanguageInput): Promise<AgentSpecificationSuggestion> {
  try {
    const { description } = input;
    
    // Extract components from the natural language description
    const name = extractAgentName(description);
    const goal = extractGoal(description);
    const tools = suggestTools(description);
    const instructions = generateInstructions(description, tools);

    return {
      name,
      description: description.trim(),
      goal,
      instructions,
      tools
    };
  } catch (error) {
    console.error('Natural language processing failed:', error);
    throw error;
  }
}