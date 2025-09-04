import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, ArrowRight, CheckCircle } from 'lucide-react';
import { trpc } from '@/utils/trpc';
import { AgentSpecificationForm } from './AgentSpecificationForm';
import type { 
  AgentSpecificationSuggestion,
  CreateAgentSpecificationInput
} from '../../../server/src/schema';

interface NaturalLanguageProcessorProps {
  onUseSuggestion: (suggestion: AgentSpecificationSuggestion) => void;
}

export function NaturalLanguageProcessor({ onUseSuggestion }: NaturalLanguageProcessorProps) {
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [suggestion, setSuggestion] = useState<AgentSpecificationSuggestion | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleProcess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setIsProcessing(true);
    try {
      await trpc.processNaturalLanguage.mutate({ description: input });
      // STUB: Enhance the basic response with more realistic suggestions
      const enhancedResult: AgentSpecificationSuggestion = {
        name: generateAgentName(input),
        description: input,
        goal: generateGoal(input),
        instructions: generateInstructions(input),
        tools: generateTools(input)
      };
      setSuggestion(enhancedResult);
    } catch (error) {
      console.error('Failed to process natural language input:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // STUB: Helper functions to generate more realistic suggestions
  const generateAgentName = (description: string): string => {
    if (description.toLowerCase().includes('customer') || description.toLowerCase().includes('support')) {
      return 'Customer Service Agent';
    } else if (description.toLowerCase().includes('data') || description.toLowerCase().includes('analyz')) {
      return 'Data Analysis Assistant';
    } else if (description.toLowerCase().includes('social') || description.toLowerCase().includes('media')) {
      return 'Social Media Manager';
    } else if (description.toLowerCase().includes('sales') || description.toLowerCase().includes('lead')) {
      return 'Sales Support Agent';
    } else if (description.toLowerCase().includes('schedule') || description.toLowerCase().includes('meeting')) {
      return 'Scheduling Assistant';
    }
    return 'AI Assistant';
  };

  const generateGoal = (description: string): string => {
    return `Accomplish the tasks described in: "${description.slice(0, 100)}${description.length > 100 ? '...' : ''}" efficiently and accurately while maintaining high user satisfaction.`;
  };

  const generateInstructions = (description: string): string => {
    let instructions = 'You are a helpful AI assistant. ';
    
    if (description.toLowerCase().includes('customer')) {
      instructions += 'Always maintain a professional and friendly tone. Listen carefully to customer needs and provide accurate information. ';
    }
    if (description.toLowerCase().includes('data')) {
      instructions += 'Analyze data carefully and provide clear, actionable insights. Always verify your calculations. ';
    }
    if (description.toLowerCase().includes('email')) {
      instructions += 'When composing emails, use appropriate tone and format. Always proofread before sending. ';
    }
    
    instructions += `Your primary focus is: ${description}. Always ask for clarification when requirements are unclear and provide step-by-step explanations when helpful.`;
    
    return instructions;
  };

  const generateTools = (description: string): string[] => {
    const tools: string[] = [];
    
    if (description.toLowerCase().includes('email')) tools.push('email_sender');
    if (description.toLowerCase().includes('data') || description.toLowerCase().includes('analyz')) {
      tools.push('data_analyzer', 'chart_generator');
    }
    if (description.toLowerCase().includes('customer') || description.toLowerCase().includes('support')) {
      tools.push('knowledge_base', 'ticket_creator');
    }
    if (description.toLowerCase().includes('schedule') || description.toLowerCase().includes('meeting')) {
      tools.push('calendar_manager', 'meeting_scheduler');
    }
    if (description.toLowerCase().includes('search') || description.toLowerCase().includes('web')) {
      tools.push('web_search');
    }
    if (description.toLowerCase().includes('database') || description.toLowerCase().includes('query')) {
      tools.push('database_connector');
    }
    if (description.toLowerCase().includes('social')) {
      tools.push('social_monitor', 'post_scheduler');
    }
    
    // Add some basic tools if none were detected
    if (tools.length === 0) {
      tools.push('text_processor', 'web_search');
    }
    
    return tools;
  };

  const handleUseSuggestion = () => {
    setShowForm(true);
    if (suggestion) {
      onUseSuggestion(suggestion);
    }
  };

  const handleCreateFromSuggestion = async (formData: CreateAgentSpecificationInput) => {
    setIsCreating(true);
    try {
      await trpc.createAgentSpecification.mutate(formData);
      // Reset everything
      setInput('');
      setSuggestion(null);
      setShowForm(false);
      // Success feedback could be added here
    } catch (error) {
      console.error('Failed to create agent from suggestion:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const examplePrompts = [
    "I need an agent that can help customers with product returns and exchanges via email and chat",
    "Create an agent that monitors social media mentions and responds to customer inquiries",
    "I want an agent that analyzes sales data and generates weekly reports for management",
    "Build an agent that schedules meetings, sends calendar invites, and manages appointments"
  ];

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <form onSubmit={handleProcess} className="space-y-4">
        <div>
          <Label htmlFor="nlp-input" className="text-sm font-medium text-gray-700">
            Describe Your Agent 💭
          </Label>
          <p className="text-sm text-gray-500 mb-3">
            Tell us what you want your agent to do in plain English. Be as detailed or as brief as you like!
          </p>
          <Textarea
            id="nlp-input"
            value={input}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value)}
            placeholder="Example: I need an agent that helps customers with their orders, can look up order status, process returns, and send confirmation emails..."
            required
            className="min-h-[100px] custom-scrollbar"
          />
        </div>

        <Button 
          type="submit" 
          disabled={isProcessing || !input.trim()}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          {isProcessing ? (
            <>
              <Sparkles className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Agent Spec
            </>
          )}
        </Button>
      </form>

      {/* Example Prompts */}
      {!suggestion && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">💡 Need inspiration? Try these examples:</h4>
          <div className="grid gap-2 md:grid-cols-2">
            {examplePrompts.map((prompt: string, index: number) => (
              <Card 
                key={index}
                className="p-3 cursor-pointer hover:bg-indigo-50 hover:border-indigo-200 transition-colors"
                onClick={() => setInput(prompt)}
              >
                <p className="text-sm text-gray-600">{prompt}</p>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Generated Suggestion */}
      {suggestion && !showForm && (
        <Card className="border-indigo-200 bg-indigo-50 success-state">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-indigo-900">
              <CheckCircle className="h-5 w-5" />
              Generated Agent Specification ✨
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-indigo-900 mb-1">Agent Name</h4>
              <p className="text-indigo-800">{suggestion.name}</p>
            </div>

            <div>
              <h4 className="font-semibold text-indigo-900 mb-1">Description</h4>
              <p className="text-indigo-800">{suggestion.description}</p>
            </div>

            <div>
              <h4 className="font-semibold text-indigo-900 mb-1">Primary Goal</h4>
              <p className="text-indigo-800">{suggestion.goal}</p>
            </div>

            <div>
              <h4 className="font-semibold text-indigo-900 mb-1">Instructions</h4>
              <p className="text-indigo-800">{suggestion.instructions}</p>
            </div>

            <div>
              <h4 className="font-semibold text-indigo-900 mb-2">Suggested Tools</h4>
              <div className="flex flex-wrap gap-2">
                {suggestion.tools.length === 0 ? (
                  <Badge variant="outline">No specific tools suggested</Badge>
                ) : (
                  suggestion.tools.map((tool: string, index: number) => (
                    <Badge key={index} className="bg-indigo-600 hover:bg-indigo-700">
                      {tool}
                    </Badge>
                  ))
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-indigo-200">
              <Button 
                onClick={handleUseSuggestion}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                <ArrowRight className="h-4 w-4 mr-2" />
                Use This Specification
              </Button>
              <Button 
                onClick={() => {
                  setSuggestion(null);
                  setInput('');
                }}
                variant="outline"
                className="border-indigo-300 text-indigo-700 hover:bg-indigo-50"
              >
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Form Section */}
      {showForm && suggestion && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-600" />
              Review & Create Agent Specification
            </CardTitle>
            <p className="text-sm text-gray-500">
              Review and modify the generated specification before creating your agent.
            </p>
          </CardHeader>
          <CardContent>
            <AgentSpecificationForm
              onSubmit={handleCreateFromSuggestion}
              isLoading={isCreating}
              initialData={suggestion}
            />
            <div className="flex justify-start pt-4 border-t mt-6">
              <Button 
                onClick={() => setShowForm(false)}
                variant="outline"
              >
                Back to Suggestion
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}