
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message, AgentType, ThinkingStep } from '../types';
import ThinkingProcess from './ThinkingProcess';
import { Icons } from '../constants';

interface MessageBubbleProps {
  message: Message;
  allFiles?: { id: string, name: string }[];
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, allFiles = [] }) => {
  const isUser = message.role === 'user';

  const parseContent = (raw: string) => {
    const logicMatch = raw.match(/<logic_thinking>([\s\S]*?)<\/logic_thinking>/);
    const philosophyMatch = raw.match(/<philosophy_thinking>([\s\S]*?)<\/philosophy_thinking>/);
    const finalMatch = raw.match(/Final Answer: ([\s\S]*)/);

    const steps: ThinkingStep[] = [];
    if (logicMatch) {
      steps.push({ agent: AgentType.LOGIC_ANALYST, content: logicMatch[1].trim(), timestamp: Date.now() });
    }
    if (philosophyMatch) {
      steps.push({ agent: AgentType.PHILOSOPHY_EXPERT, content: philosophyMatch[1].trim(), timestamp: Date.now() });
    }

    let displayContent = raw;
    if (finalMatch) {
      displayContent = finalMatch[1].trim();
    } else {
      displayContent = raw
        .replace(/<logic_thinking>[\s\S]*?<\/logic_thinking>/g, '')
        .replace(/<philosophy_thinking>[\s\S]*?<\/philosophy_thinking>/g, '')
        .replace(/Final Answer:/g, '')
        .trim();
    }

    return { steps, displayContent };
  };

  const { steps, displayContent } = isUser ? { steps: [], displayContent: message.content } : parseContent(message.content);

  const attachedFiles = allFiles.filter(f => message.attachedFileIds?.includes(f.id));

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[85%] md:max-w-[75%] ${isUser ? 'order-2' : ''}`}>
        {!isUser && steps.length > 0 && (
          <div className="mb-2">
            <span className="text-[10px] uppercase text-zinc-500 font-bold tracking-widest ml-1">Internal Process</span>
            <ThinkingProcess steps={steps} />
          </div>
        )}
        
        <div className={`rounded-2xl px-5 py-4 shadow-sm relative ${
          isUser 
            ? 'bg-zinc-900 text-white font-medium' 
            : 'bg-white border border-zinc-200 text-zinc-800'
        }`}>
          <div className={`text-sm md:text-base leading-relaxed prose prose-sm max-w-none ${isUser ? 'prose-invert' : ''}`}>
            {displayContent ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {displayContent}
              </ReactMarkdown>
            ) : (
              message.isStreaming && !steps.length ? 'Explicandum is processing...' : null
            )}
          </div>

          {(message.ragSources || attachedFiles.length > 0) && (
            <div className={`mt-4 pt-3 border-t flex flex-wrap gap-2 items-center ${isUser ? 'border-zinc-700' : 'border-zinc-100'}`}>
              {message.ragSources?.map((s, i) => (
                <span key={i} className={`${isUser ? 'bg-zinc-800 text-zinc-400' : 'bg-zinc-50 text-zinc-500'} text-[9px] px-2 py-0.5 rounded border ${isUser ? 'border-zinc-700' : 'border-zinc-200'}`}>{s}</span>
              ))}
              {attachedFiles.map(f => (
                <span key={f.id} className={`flex items-center gap-1 text-[9px] px-2 py-0.5 rounded border ${isUser ? 'bg-blue-900/30 text-blue-300 border-blue-800' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                  <Icons.Document />
                  {f.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
