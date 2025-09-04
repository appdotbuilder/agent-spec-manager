import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Save, XCircle } from 'lucide-react';
import type { 
  AgentSpecification,
  UpdateAgentSpecificationInput 
} from '../../../server/src/schema';

interface AgentSpecificationEditorProps {
  spec: AgentSpecification;
  onSubmit: (data: UpdateAgentSpecificationInput) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function AgentSpecificationEditor({ 
  spec, 
  onSubmit, 
  onCancel,
  isLoading = false 
}: AgentSpecificationEditorProps) {
  const [formData, setFormData] = useState<Omit<UpdateAgentSpecificationInput, 'id'>>({
    name: spec.name,
    description: spec.description,
    goal: spec.goal,
    instructions: spec.instructions,
    tools: [...spec.tools] // Create a copy of the array
  });

  const [newTool, setNewTool] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSubmit({
        id: spec.id,
        ...formData
      });
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const addTool = () => {
    if (newTool.trim() && formData.tools && !formData.tools.includes(newTool.trim())) {
      setFormData((prev: Omit<UpdateAgentSpecificationInput, 'id'>) => ({
        ...prev,
        tools: [...(prev.tools || []), newTool.trim()]
      }));
      setNewTool('');
    }
  };

  const removeTool = (toolToRemove: string) => {
    setFormData((prev: Omit<UpdateAgentSpecificationInput, 'id'>) => ({
      ...prev,
      tools: (prev.tools || []).filter((tool: string) => tool !== toolToRemove)
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
          <Label htmlFor="edit-name" className="text-sm font-medium text-gray-700">
            Agent Name *
          </Label>
          <Input
            id="edit-name"
            value={formData.name || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setFormData((prev: Omit<UpdateAgentSpecificationInput, 'id'>) => ({ 
                ...prev, 
                name: e.target.value 
              }))
            }
            placeholder="e.g., Customer Support Agent, Data Analyst Bot"
            required
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="edit-description" className="text-sm font-medium text-gray-700">
            Description *
          </Label>
          <Textarea
            id="edit-description"
            value={formData.description || ''}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setFormData((prev: Omit<UpdateAgentSpecificationInput, 'id'>) => ({ 
                ...prev, 
                description: e.target.value 
              }))
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
          <Label htmlFor="edit-goal" className="text-sm font-medium text-gray-700">
            Primary Goal *
          </Label>
          <Textarea
            id="edit-goal"
            value={formData.goal || ''}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setFormData((prev: Omit<UpdateAgentSpecificationInput, 'id'>) => ({ 
                ...prev, 
                goal: e.target.value 
              }))
            }
            placeholder="What is the main objective this agent should achieve?"
            required
            className="mt-1 min-h-[80px]"
          />
        </div>

        <div>
          <Label htmlFor="edit-instructions" className="text-sm font-medium text-gray-700">
            Instructions *
          </Label>
          <Textarea
            id="edit-instructions"
            value={formData.instructions || ''}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setFormData((prev: Omit<UpdateAgentSpecificationInput, 'id'>) => ({ 
                ...prev, 
                instructions: e.target.value 
              }))
            }
            placeholder="Detailed instructions on how the agent should behave, respond, and operate"
            required
            className="mt-1 min-h-[120px]"
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
            Modify the tools and capabilities that this agent can use.
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
              disabled={!newTool.trim() || (formData.tools || []).includes(newTool.trim())}
              variant="outline"
              size="sm"
            >
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 min-h-[40px] p-3 border border-gray-200 rounded-md bg-gray-50">
            {(!formData.tools || formData.tools.length === 0) ? (
              <p className="text-sm text-gray-400 italic">No tools configured</p>
            ) : (
              formData.tools.map((tool: string) => (
                <Badge 
                  key={tool} 
                  variant="secondary" 
                  className="flex items-center gap-1 bg-indigo-100 text-indigo-800 hover:bg-indigo-200"
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

      {/* Metadata */}
      <div className="space-y-2 p-4 bg-gray-50 rounded-md">
        <h4 className="text-sm font-medium text-gray-700">Agent Information</h4>
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <span className="font-medium">Created:</span> {spec.created_at.toLocaleDateString()}
          </div>
          <div>
            <span className="font-medium">Last Updated:</span> {spec.updated_at.toLocaleDateString()}
          </div>
          <div>
            <span className="font-medium">Agent ID:</span> #{spec.id}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between pt-4 border-t">
        <Button 
          type="button"
          onClick={onCancel}
          variant="outline"
          className="min-w-[100px]"
        >
          <XCircle className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        
        <Button 
          type="submit" 
          disabled={isLoading}
          className="bg-indigo-600 hover:bg-indigo-700 min-w-[120px]"
        >
          {isLoading ? (
            'Saving...'
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </form>
  );
}