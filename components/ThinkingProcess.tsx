
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
      case AgentType.LOGIC_ANALYST: return "text-zinc-600 border-l-2 border-zinc-200";
      case AgentType.PHILOSOPHY_EXPERT: return "text-zinc-600 border-l-2 border-zinc-200";
      default: return "text-zinc-600 border-l-2 border-zinc-200";
    }
  };

  return (
    <div className="flex flex-col gap-4 my-4">
      {steps.map((step, idx) => (
        <div key={idx} className={`pl-4 ${getAgentColor(step.agent)}`}>
          <div className="flex items-center gap-2 mb-1.5 font-bold text-[10px] uppercase tracking-widest opacity-50">
            {getAgentIcon(step.agent)}
            <span>{getAgentLabel(step.agent)}</span>
          </div>
          <div className="text-sm leading-[1.8] text-zinc-500 prose prose-sm max-w-none prose-p:leading-[1.8] prose-zinc">
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
