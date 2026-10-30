import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Square, 
  Plus, 
  Trash2, 
  Bot, 
  Search, 
  Workflow, 
  Database, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Download, 
  Sparkles,
  Settings,
  Terminal,
  Zap,
  Code2,
  FileText
} from 'lucide-react';

const INITIAL_NODES = [
  {
    id: 'node-1',
    type: 'trigger',
    title: 'GitHub PR Webhook',
    status: 'idle',
    position: { x: 50, y: 120 },
    config: { event: 'pull_request.opened', repo: 'main-repo' }
  },
  {
    id: 'node-2',
    type: 'tool',
    title: 'Code Fetcher',
    status: 'idle',
    position: { x: 320, y: 120 },
    config: { target: 'diff_files', limit: 10 }
  },
  {
    id: 'node-3',
    type: 'llm',
    title: 'Gemini Reviewer Agent',
    status: 'idle',
    position: { x: 590, y: 120 },
    config: { 
      model: 'gemini-2.5-flash', 
      systemPrompt: 'You are a Senior Code Reviewer. Analyze the code diff for security and bugs.' 
    }
  },
  {
    id: 'node-4',
    type: 'output',
    title: 'GitHub Comment Sink',
    status: 'idle',
    position: { x: 860, y: 120 },
    config: { action: 'post_comment', target: 'pr_thread' }
  }
];

const INITIAL_EDGES = [
  { id: 'e1-2', source: 'node-1', target: 'node-2' },
  { id: 'e2-3', source: 'node-2', target: 'node-3' },
  { id: 'e3-4', source: 'node-3', target: 'node-4' }
];

export default function App() {
  const [nodes, setNodes] = useState(INITIAL_NODES);
  const [edges, setEdges] = useState(INITIAL_EDGES);
  const [selectedNodeId, setSelectedNodeId] = useState('node-3');
  const [isRunning, setIsRunning] = useState(false);
  const [executionLogs, setExecutionLogs] = useState([]);
  const [apiKey, setApiKey] = useState('');
  const [customPrompt, setCustomPrompt] = useState('Write a concise 3-bullet point review of a pull request adding JWT authentication.');
  const [llmOutput, setLlmOutput] = useState('');
  const [isExecutingLlm, setIsExecutingLlm] = useState(false);

  const selectedNode = nodes.find(n => n.id === selectedNodeId);

  const addLog = (message, level = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setExecutionLogs(prev => [...prev, { id: Math.random().toString(), timestamp, message, level }]);
  };

  const handleRunWorkflow = async () => {
    setIsRunning(true);
    setExecutionLogs([]);
    addLog('Starting AgentFlow Topological Execution Engine...', 'info');

    for (let i = 0; i < nodes.length; i++) {
      const currentNode = nodes[i];
      
      setNodes(prev => prev.map(n => n.id === currentNode.id ? { ...n, status: 'running' } : n));
      addLog(`Executing Node [${currentNode.title}] (${currentNode.type})...`, 'info');

      await new Promise(res => setTimeout(res, 1200));

      setNodes(prev => prev.map(n => n.id === currentNode.id ? { ...n, status: 'success' } : n));
      addLog(`Node [${currentNode.title}] executed successfully.`, 'success');
    }

    addLog('Multi-Agent Workflow execution complete with 0 errors.', 'success');
    setIsRunning(false);
  };

  const handleRunSingleNode = async () => {
    if (!selectedNode || selectedNode.type !== 'llm') return;
    setIsExecutingLlm(true);
    setLlmOutput('Connecting to Gemini API...');

    try {
      if (!apiKey) {
        await new Promise(res => setTimeout(res, 1000));
        setLlmOutput(
          `[Simulated Output - Enter Gemini API Key for live execution]\n\n` +
          `1. Security: JWT secret generation should use cryptographically secure random bytes.\n` +
          `2. Error Handling: Add middleware catch-all for expired token verification errors.\n` +
          `3. Best Practice: Ensure token expiration time is configurable via environment variables.`
        );
      } else {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: customPrompt }] }]
            })
          }
        );
        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || JSON.stringify(data, null, 2);
        setLlmOutput(text);
      }
    } catch (err) {
      setLlmOutput(`Error executing node: ${err.message}`);
    } finally {
      setIsExecutingLlm(false);
    }
  };

  const handleAddNode = (type) => {
    const id = `node-${Date.now()}`;
    const titles = {
      trigger: 'Custom Webhook Trigger',
      tool: 'Vector DB Search Tool',
      llm: 'Gemini Task Agent',
      output: 'Slack Alert Sink'
    };
    
    const newNode = {
      id,
      type,
      title: titles[type] || 'New Agent Node',
      status: 'idle',
      position: { x: 100 + (nodes.length * 40) % 400, y: 250 + (nodes.length * 30) % 200 },
      config: { created: new Date().toISOString() }
    };

    setNodes(prev => [...prev, newNode]);
    setSelectedNodeId(id);
    addLog(`Added new node: ${newNode.title}`, 'info');
  };

  const handleDeleteNode = (id) => {
    setNodes(prev => prev.filter(n => n.id !== id));
    setEdges(prev => prev.filter(e => e.source !== id && e.target !== id));
    if (selectedNodeId === id) setSelectedNodeId(null);
    addLog(`Deleted node ID: ${id}`, 'warn');
  };

  return (
    <div className="flex h-screen w-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
      {/* Sidebar Controls */}
      <aside className="w-80 border-r border-slate-800 bg-slate-900/60 p-4 flex flex-col justify-between">
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-500/30">
              <Workflow className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-none">AgentFlow</h1>
              <p className="text-xs text-slate-400 mt-1">Multi-Agent Visual Workspace</p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Add Workflow Nodes</label>
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => handleAddNode('trigger')}
                className="flex items-center gap-2 p-2.5 rounded-md bg-slate-800 hover:bg-slate-700 text-xs border border-slate-700 text-slate-200 transition"
              >
                <Zap className="w-4 h-4 text-amber-400" /> Trigger
              </button>
              <button 
                onClick={() => handleAddNode('tool')}
                className="flex items-center gap-2 p-2.5 rounded-md bg-slate-800 hover:bg-slate-700 text-xs border border-slate-700 text-slate-200 transition"
              >
                <Database className="w-4 h-4 text-emerald-400" /> Tool
              </button>
              <button 
                onClick={() => handleAddNode('llm')}
                className="flex items-center gap-2 p-2.5 rounded-md bg-slate-800 hover:bg-slate-700 text-xs border border-slate-700 text-slate-200 transition"
              >
                <Bot className="w-4 h-4 text-indigo-400" /> LLM Agent
              </button>
              <button 
                onClick={() => handleAddNode('output')}
                className="flex items-center gap-2 p-2.5 rounded-md bg-slate-800 hover:bg-slate-700 text-xs border border-slate-700 text-slate-200 transition"
              >
                <FileText className="w-4 h-4 text-sky-400" /> Output Sink
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Gemini API Key (Optional)</label>
            <input 
              type="password"
              placeholder="AIzaSy..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 text-slate-200 placeholder-slate-600"
            />
            <p className="text-[10px] text-slate-500">Leave blank to use built-in execution simulator.</p>
          </div>
        </div>

        <div className="space-y-2">
          <button 
            onClick={handleRunWorkflow}
            disabled={isRunning}
            className={`w-full py-3 rounded-lg font-medium text-sm flex items-center justify-center gap-2 shadow-lg transition ${
              isRunning 
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
            }`}
          >
            {isRunning ? <Clock className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
            {isRunning ? 'Executing Workflow...' : 'Run Full Workflow'}
          </button>
        </div>
      </aside>

      {/* Main Canvas Area */}
      <main className="flex-1 flex flex-col relative bg-slate-950">
        {/* Canvas Grid Background */}
        <div className="flex-1 relative overflow-hidden bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px]">
          
          {/* SVG Connections Layer */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {edges.map(edge => {
              const sourceNode = nodes.find(n => n.id === edge.source);
              const targetNode = nodes.find(n => n.id === edge.target);
              if (!sourceNode || !targetNode) return null;

              const x1 = sourceNode.position.x + 180;
              const y1 = sourceNode.position.y + 40;
              const x2 = targetNode.position.x;
              const y2 = targetNode.position.y + 40;

              return (
                <path 
                  key={edge.id}
                  d={`M ${x1} ${y1} C ${x1 + 60} ${y1}, ${x2 - 60} ${y2}, ${x2} ${y2}`}
                  fill="none"
                  stroke={sourceNode.status === 'running' ? '#818cf8' : '#334155'}
                  strokeWidth="2"
                  strokeDasharray={sourceNode.status === 'running' ? '6' : '0'}
                  className={sourceNode.status === 'running' ? 'animate-pulse' : ''}
                />
              );
            })}
          </svg>

          {/* Interactive Nodes */}
          {nodes.map(node => {
            const isSelected = selectedNodeId === node.id;
            return (
              <div
                key={node.id}
                onClick={() => setSelectedNodeId(node.id)}
                style={{ transform: `translate(${node.position.x}px, ${node.position.y}px)` }}
                className={`absolute w-48 rounded-xl border p-3.5 shadow-xl transition cursor-pointer select-none ${
                  isSelected 
                    ? 'border-indigo-500 bg-slate-900 shadow-indigo-500/10 ring-2 ring-indigo-500/20' 
                    : 'border-slate-800 bg-slate-900/90 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    {node.type === 'trigger' && <Zap className="w-4 h-4 text-amber-400" />}
                    {node.type === 'tool' && <Database className="w-4 h-4 text-emerald-400" />}
                    {node.type === 'llm' && <Bot className="w-4 h-4 text-indigo-400" />}
                    {node.type === 'output' && <FileText className="w-4 h-4 text-sky-400" />}
                    <span className="text-xs font-semibold truncate text-slate-200">{node.title}</span>
                  </div>
                  {node.status === 'success' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                  {node.status === 'running' && <Clock className="w-3.5 h-3.5 text-indigo-400 animate-spin" />}
                </div>

                <div className="text-[10px] text-slate-400 font-mono bg-slate-950 p-1.5 rounded border border-slate-800/80">
                  Type: {node.type.toUpperCase()}
                </div>
              </div>
            );
          })}
        </div>

        {/* Execution Terminal Panel */}
        <div className="h-48 border-t border-slate-800 bg-slate-950 p-3 flex flex-col font-mono text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="flex items-center gap-2 text-slate-400 font-semibold">
              <Terminal className="w-4 h-4 text-indigo-400" /> Execution Console
            </span>
            <button 
              onClick={() => setExecutionLogs([])}
              className="text-[10px] text-slate-500 hover:text-slate-300"
            >
              Clear Logs
            </button>
          </div>
          <div className="flex-1 overflow-y-auto mt-2 space-y-1">
            {executionLogs.length === 0 ? (
              <span className="text-slate-600 italic">Click "Run Full Workflow" to monitor real-time node outputs.</span>
            ) : (
              executionLogs.map(log => (
                <div key={log.id} className="flex gap-2">
                  <span className="text-slate-600">[{log.timestamp}]</span>
                  <span className={
                    log.level === 'success' ? 'text-emerald-400' :
                    log.level === 'warn' ? 'text-amber-400' : 'text-slate-300'
                  }>
                    {log.message}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Inspector Drawer */}
      <aside className="w-80 border-l border-slate-800 bg-slate-900/60 p-4 flex flex-col justify-between">
        {selectedNode ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-sm text-slate-200">Node Inspector</h2>
              <button 
                onClick={() => handleDeleteNode(selectedNode.id)}
                className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-rose-400 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-semibold text-slate-400 uppercase">Node Title</label>
                <input 
                  type="text" 
                  value={selectedNode.title}
                  onChange={(e) => {
                    const newTitle = e.target.value;
                    setNodes(prev => prev.map(n => n.id === selectedNode.id ? { ...n, title: newTitle } : n));
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 mt-1 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {selectedNode.type === 'llm' && (
                <div className="space-y-3 pt-2 border-t border-slate-800">
                  <div>
                    <label className="text-[10px] font-semibold text-slate-400 uppercase">Test Prompt</label>
                    <textarea 
                      rows={3}
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-200 mt-1 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <button 
                    onClick={handleRunSingleNode}
                    disabled={isExecutingLlm}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-indigo-300 rounded border border-slate-700 flex items-center justify-center gap-1.5 transition"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    {isExecutingLlm ? 'Generating...' : 'Test Gemini Node'}
                  </button>

                  {llmOutput && (
                    <div>
                      <label className="text-[10px] font-semibold text-slate-400 uppercase">Node Output</label>
                      <div className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-xs font-mono text-slate-300 mt-1 max-h-40 overflow-y-auto whitespace-pre-wrap">
                        {llmOutput}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 text-center text-xs">
            <Settings className="w-8 h-8 mb-2 opacity-50" />
            Select any node on the canvas to inspect or modify its parameters.
          </div>
        )}
      </aside>
    </div>
  );
}
