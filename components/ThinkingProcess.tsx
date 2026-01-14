
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { AgentType, ThinkingStep } from '../types';
import { Icons } from '../constants';

interface ThinkingProcessProps {
  steps: ThinkingStep[];
}

const ThinkingProcess: React.FC<ThinkingProcessProps> = ({ steps }) => {
  if (steps.length === 0) return null;

  const getAgentLabel = (agent: AgentType) => {
    switch (agent) {
      case AgentType.LOGIC_ANALYST: return "Logic Analyst";
      case AgentType.PHILOSOPHY_EXPERT: return "Philosophy Expert";
      default: return "Agent";
    }
  };

  const getAgentIcon = (agent: AgentType) => {
    switch (agent) {
      case AgentType.LOGIC_ANALYST: return <Icons.Microscope />;
      case AgentType.PHILOSOPHY_EXPERT: return <Icons.Brain />;
      default: return null;
    }
  };

  const getAgentColor = (agent: AgentType) => {
    switch (agent) {
      case AgentType.LOGIC_ANALYST: return "border-blue-200 bg-blue-50 text-blue-800";
      case AgentType.PHILOSOPHY_EXPERT: return "border-purple-200 bg-purple-50 text-purple-800";
      default: return "border-zinc-200 bg-zinc-50 text-zinc-600";
    }
  };

  return (
    <div className="flex flex-col gap-3 my-4">
      {steps.map((step, idx) => (
        <div key={idx} className={`border rounded-lg p-3 transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 ${getAgentColor(step.agent)}`}>
          <div className="flex items-center gap-2 mb-2 font-semibold text-xs uppercase tracking-wider">
            {getAgentIcon(step.agent)}
            <span>{getAgentLabel(step.agent)}</span>
          </div>
          <div className="text-sm leading-relaxed font-light italic prose prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-zinc-100">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {step.content}
            </ReactMarkdown>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ThinkingProcess;
