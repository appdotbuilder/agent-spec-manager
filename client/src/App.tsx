import { useState, useEffect, useCallback } from 'react';
import { trpc } from '@/utils/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Plus, Bot, Sparkles, Edit, Trash2 } from 'lucide-react';
import { AgentSpecificationForm } from '@/components/AgentSpecificationForm';
import { NaturalLanguageProcessor } from '@/components/NaturalLanguageProcessor';
import { AgentSpecificationEditor } from '@/components/AgentSpecificationEditor';
// Type-only imports from server
import type { 
  AgentSpecification, 
  CreateAgentSpecificationInput,
  UpdateAgentSpecificationInput
} from '../../server/src/schema';

function App() {
  const [agentSpecs, setAgentSpecs] = useState<AgentSpecification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('browse');
  const [selectedSpec, setSelectedSpec] = useState<AgentSpecification | null>(null);
  const [editingSpec, setEditingSpec] = useState<AgentSpecification | null>(null);

  // Load agent specifications
  const loadAgentSpecs = useCallback(async () => {
    try {
      const result = await trpc.getAgentSpecifications.query();
      // STUB: Since backend returns empty array, add sample data for demo
      if (result.length === 0) {
        console.warn('Using stub data - backend returns empty array');
        const sampleData: AgentSpecification[] = [
          {
            id: 1,
            name: "Customer Support Assistant",
            description: "Handles customer inquiries, order status checks, and basic troubleshooting",
            goal: "Provide fast and accurate customer support while maintaining a friendly and professional tone",
            instructions: "Always greet customers warmly. Listen carefully to their concerns. Use available tools to look up order information or troubleshoot issues. Escalate complex problems to human agents when necessary. End conversations by asking if there's anything else you can help with.",
            tools: ["order_lookup", "knowledge_base", "email_sender", "ticket_creator"],
            created_at: new Date('2024-01-15'),
            updated_at: new Date('2024-01-15')
          },
          {
            id: 2,
            name: "Data Analysis Bot",
            description: "Analyzes sales data and generates insights for business decision making",
            goal: "Transform raw business data into actionable insights and clear visualizations",
            instructions: "Analyze provided datasets for trends, patterns, and anomalies. Create clear visualizations and summaries. Always include data sources and confidence levels in your analysis. Highlight key findings and provide actionable recommendations.",
            tools: ["data_analyzer", "chart_generator", "report_builder", "database_connector"],
            created_at: new Date('2024-01-20'),
            updated_at: new Date('2024-01-22')
          },
          {
            id: 3,
            name: "Social Media Manager",
            description: "Monitors social media mentions and engages with customers across platforms",
            goal: "Maintain positive brand presence on social media and respond to customer interactions promptly",
            instructions: "Monitor brand mentions across all social platforms. Respond to comments and messages within 2 hours during business hours. Use brand voice guidelines for all interactions. Flag negative sentiment for human review. Create engagement reports weekly.",
            tools: ["social_monitor", "response_generator", "sentiment_analyzer", "scheduler"],
            created_at: new Date('2024-01-18'),
            updated_at: new Date('2024-01-25')
          }
        ];
        setAgentSpecs(sampleData);
      } else {
        setAgentSpecs(result);
      }
    } catch (error) {
      console.error('Failed to load agent specifications:', error);
    }
  }, []);

  useEffect(() => {
    loadAgentSpecs();
  }, [loadAgentSpecs]);

  // Create new agent specification
  const handleCreateSpec = async (formData: CreateAgentSpecificationInput) => {
    setIsLoading(true);
    try {
      const response = await trpc.createAgentSpecification.mutate(formData);
      setAgentSpecs((prev: AgentSpecification[]) => [...prev, response]);
      setActiveTab('browse');
    } catch (error) {
      console.error('Failed to create agent specification:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Update agent specification
  const handleUpdateSpec = async (formData: UpdateAgentSpecificationInput) => {
    setIsLoading(true);
    try {
      const response = await trpc.updateAgentSpecification.mutate(formData);
      // STUB: Backend returns null as placeholder - handle this case
      if (response) {
        setAgentSpecs((prev: AgentSpecification[]) => 
          prev.map((spec: AgentSpecification) => spec.id === response.id ? response : spec)
        );
        setEditingSpec(null);
        setActiveTab('browse');
      } else {
        // Handle stub response - update locally for demo purposes
        console.warn('Using stub update behavior - backend returns null');
        setAgentSpecs((prev: AgentSpecification[]) => 
          prev.map((spec: AgentSpecification) => 
            spec.id === formData.id ? { ...spec, ...formData, updated_at: new Date() } : spec
          )
        );
        setEditingSpec(null);
        setActiveTab('browse');
      }
    } catch (error) {
      console.error('Failed to update agent specification:', error);
      alert('Failed to update agent specification. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Delete agent specification
  const handleDeleteSpec = async (id: number) => {
    if (!confirm('Are you sure you want to delete this agent specification?')) return;
    
    setIsLoading(true);
    try {
      const success = await trpc.deleteAgentSpecification.mutate({ id });
      // STUB: Backend returns false as placeholder - handle this case
      if (success) {
        setAgentSpecs((prev: AgentSpecification[]) => 
          prev.filter((spec: AgentSpecification) => spec.id !== id)
        );
      } else {
        // Handle stub response - delete locally for demo purposes
        console.warn('Using stub delete behavior - backend returns false');
        setAgentSpecs((prev: AgentSpecification[]) => 
          prev.filter((spec: AgentSpecification) => spec.id !== id)
        );
      }
      if (selectedSpec?.id === id) {
        setSelectedSpec(null);
      }
    } catch (error) {
      console.error('Failed to delete agent specification:', error);
      alert('Failed to delete agent specification. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle suggestion from natural language processing
  const handleUseSuggestion = () => {
    // Switch to create tab with pre-filled form
    setActiveTab('create');
  };

  // Start editing an agent specification
  const handleEditSpec = (spec: AgentSpecification) => {
    setEditingSpec(spec);
    setActiveTab('edit');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Bot className="h-8 w-8 text-indigo-600" />
            <h1 className="text-4xl font-bold text-gray-900">Agent Specification Manager</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-3">
            Create, manage, and deploy AI agent specifications with ease. 
            Use natural language to generate structured agent definitions. 🤖
          </p>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm">
            <Sparkles className="h-4 w-4" />
            Demo Mode: Backend uses stub data for demonstration
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="browse" className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              Browse Agents
            </TabsTrigger>
            <TabsTrigger value="create" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create New
            </TabsTrigger>
            <TabsTrigger value="nlp" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              AI Assistant
            </TabsTrigger>
            <TabsTrigger value="edit" disabled={!editingSpec} className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              Edit Agent
            </TabsTrigger>
          </TabsList>

          {/* Browse Agents Tab */}
          <TabsContent value="browse" className="space-y-6">
            {agentSpecs.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Bot className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Agent Specifications Yet</h3>
                  <p className="text-gray-500 mb-6">
                    Get started by creating your first agent specification or using our AI assistant! 
                  </p>
                  <div className="flex gap-4 justify-center">
                    <Button onClick={() => setActiveTab('create')} className="bg-indigo-600 hover:bg-indigo-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Manual
                    </Button>
                    <Button onClick={() => setActiveTab('nlp')} variant="outline" className="border-indigo-200">
                      <Sparkles className="h-4 w-4 mr-2" />
                      Use AI Assistant
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {agentSpecs.map((spec: AgentSpecification) => (
                  <Card key={spec.id} className="agent-card hover:shadow-lg transition-all duration-200 border-l-4 border-l-indigo-500">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg font-semibold text-gray-900 mb-1">
                            {spec.name}
                          </CardTitle>
                          <CardDescription className="text-sm">
                            {spec.description}
                          </CardDescription>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditSpec(spec)}
                            className="h-8 w-8 p-0 hover:bg-indigo-50"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteSpec(spec.id)}
                            className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-1">🎯 Goal</h4>
                          <p className="text-sm text-gray-600 line-clamp-2">{spec.goal}</p>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">🛠️ Tools</h4>
                          <div className="flex flex-wrap gap-1">
                            {spec.tools.length === 0 ? (
                              <Badge variant="outline" className="text-xs">No tools</Badge>
                            ) : (
                              spec.tools.slice(0, 3).map((tool: string, index: number) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {tool}
                                </Badge>
                              ))
                            )}
                            {spec.tools.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{spec.tools.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="pt-2 border-t">
                          <p className="text-xs text-gray-400">
                            Created: {spec.created_at.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Create Agent Tab */}
          <TabsContent value="create">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5 text-indigo-600" />
                  Create New Agent Specification
                </CardTitle>
                <CardDescription>
                  Define a new AI agent by specifying its purpose, capabilities, and tools.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AgentSpecificationForm onSubmit={handleCreateSpec} isLoading={isLoading} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Natural Language Processing Tab */}
          <TabsContent value="nlp">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-indigo-600" />
                  AI Assistant - Natural Language to Agent Spec ✨
                </CardTitle>
                <CardDescription>
                  Describe your desired agent in plain English, and we'll help structure it into a formal specification.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <NaturalLanguageProcessor onUseSuggestion={handleUseSuggestion} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Edit Agent Tab */}
          <TabsContent value="edit">
            {editingSpec && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Edit className="h-5 w-5 text-indigo-600" />
                    Edit Agent Specification: {editingSpec.name}
                  </CardTitle>
                  <CardDescription>
                    Update the agent specification details below.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AgentSpecificationEditor 
                    spec={editingSpec}
                    onSubmit={handleUpdateSpec}
                    onCancel={() => {
                      setEditingSpec(null);
                      setActiveTab('browse');
                    }}
                    isLoading={isLoading}
                  />
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default App;