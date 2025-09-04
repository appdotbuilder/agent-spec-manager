import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';
import type { CreateAgentSpecificationInput } from '../../../server/src/schema';

interface AgentSpecificationFormProps {
  onSubmit: (data: CreateAgentSpecificationInput) => Promise<void>;
  isLoading?: boolean;
  initialData?: Partial<CreateAgentSpecificationInput>;
}

export function AgentSpecificationForm({ 
  onSubmit, 
  isLoading = false, 
  initialData = {} 
}: AgentSpecificationFormProps) {
  const [formData, setFormData] = useState<CreateAgentSpecificationInput>({
    name: initialData.name || '',
    description: initialData.description || '',
    goal: initialData.goal || '',
    instructions: initialData.instructions || '',
    tools: initialData.tools || []
  });

  const [newTool, setNewTool] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSubmit(formData);
      // Reset form after successful submission
      setFormData({
        name: '',
        description: '',
        goal: '',
        instructions: '',
        tools: []
      });
      setNewTool('');
    } catch (error) {
      // Error handling is done in parent component
      console.error('Form submission error:', error);
    }
  };

  const addTool = () => {
    if (newTool.trim() && !formData.tools.includes(newTool.trim())) {
      setFormData((prev: CreateAgentSpecificationInput) => ({
        ...prev,
        tools: [...prev.tools, newTool.trim()]
      }));
      setNewTool('');
    }
  };

  const removeTool = (toolToRemove: string) => {
    setFormData((prev: CreateAgentSpecificationInput) => ({
      ...prev,
      tools: prev.tools.filter((tool: string) => tool !== toolToRemove)
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTool();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Basic Information</h3>
        
        <div>
          <Label htmlFor="name" className="text-sm font-medium text-gray-700">
            Agent Name *
          </Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setFormData((prev: CreateAgentSpecificationInput) => ({ ...prev, name: e.target.value }))
            }
            placeholder="e.g., Customer Support Agent, Data Analyst Bot"
            required
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="description" className="text-sm font-medium text-gray-700">
            Description *
          </Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setFormData((prev: CreateAgentSpecificationInput) => ({ ...prev, description: e.target.value }))
            }
            placeholder="Brief overview of what this agent does and its primary purpose"
            required
            className="mt-1 min-h-[80px]"
          />
        </div>
      </div>

      {/* Goals and Instructions */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Purpose & Behavior</h3>
        
        <div>
          <Label htmlFor="goal" className="text-sm font-medium text-gray-700">
            Primary Goal *
          </Label>
          <Textarea
            id="goal"
            value={formData.goal}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setFormData((prev: CreateAgentSpecificationInput) => ({ ...prev, goal: e.target.value }))
            }
            placeholder="What is the main objective this agent should achieve?"
            required
            className="mt-1 min-h-[80px]"
          />
        </div>

        <div>
          <Label htmlFor="instructions" className="text-sm font-medium text-gray-700">
            Instructions *
          </Label>
          <Textarea
            id="instructions"
            value={formData.instructions}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setFormData((prev: CreateAgentSpecificationInput) => ({ ...prev, instructions: e.target.value }))
            }
            placeholder="Detailed instructions on how the agent should behave, respond, and operate"
            required
            className="mt-1 min-h-[120px] custom-scrollbar"
          />
        </div>
      </div>

      {/* Tools */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Tools & Capabilities</h3>
        
        <div>
          <Label className="text-sm font-medium text-gray-700">
            Available Tools
          </Label>
          <p className="text-sm text-gray-500 mb-3">
            Add tools and capabilities that this agent can use to accomplish its goals.
          </p>
          
          <div className="flex gap-2 mb-3">
            <Input
              value={newTool}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTool(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="e.g., web_search, database_query, email_sender"
              className="flex-1"
            />
            <Button
              type="button"
              onClick={addTool}
              disabled={!newTool.trim() || formData.tools.includes(newTool.trim())}
              variant="outline"
              size="sm"
            >
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 min-h-[40px] p-3 border border-gray-200 rounded-md bg-gray-50">
            {formData.tools.length === 0 ? (
              <p className="text-sm text-gray-400 italic">No tools added yet</p>
            ) : (
              formData.tools.map((tool: string) => (
                <Badge 
                  key={tool} 
                  variant="secondary" 
                  className="flex items-center gap-1 bg-indigo-100 text-indigo-800 hover:bg-indigo-200 tool-badge badge-enter"
                >
                  {tool}
                  <button
                    type="button"
                    onClick={() => removeTool(tool)}
                    className="ml-1 hover:text-indigo-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-4 border-t">
        <Button 
          type="submit" 
          disabled={isLoading}
          className="bg-indigo-600 hover:bg-indigo-700 min-w-[120px]"
        >
          {isLoading ? 'Creating...' : 'Create Agent'}
        </Button>
      </div>
    </form>
  );
}