import React, { useEffect, useRef } from 'react';

interface MermaidProps {
  chart: string;
}

const Mermaid: React.FC<MermaidProps> = ({ chart }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && window.mermaid) {
      window.mermaid.initialize({ 
        startOnLoad: true, 
        theme: 'dark',
        securityLevel: 'loose',
      });
      
      const renderChart = async () => {
        try {
            // Clean up common LLM artifacts (markdown code blocks, etc.)
            let cleanChart = chart
                .replace(/```mermaid/g, '')
                .replace(/```/g, '')
                .trim();

            // Unique ID for repeated renders
            const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
            const { svg } = await window.mermaid.render(id, cleanChart);
            if (containerRef.current) {
                containerRef.current.innerHTML = svg;
            }
        } catch (error) {
            console.error("Mermaid render error:", error);
            if(containerRef.current) {
                containerRef.current.innerHTML = `
                  <div class="flex flex-col gap-2 p-4 border border-red-500/50 bg-red-900/10 rounded text-red-300">
                    <p class="font-bold">Diagram Render Error</p>
                    <p class="text-xs opacity-80">The AI generated invalid syntax.</p>
                  </div>
                  <pre class="mt-2 text-[10px] text-gray-500 overflow-auto p-2 bg-black/50 rounded max-h-32">${chart}</pre>
                `;
            }
        }
      };

      renderChart();
    }
  }, [chart]);

  return <div ref={containerRef} className="mermaid flex justify-center p-4 bg-slate-900 rounded-lg overflow-x-auto" />;
};

export default Mermaid;

declare global {
  interface Window {
    mermaid: any;
  }
}
