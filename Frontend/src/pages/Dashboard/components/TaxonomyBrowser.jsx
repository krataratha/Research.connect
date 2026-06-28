import React, { useState, useEffect } from 'react';

// Recursive Component to Render Taxonomy Nodes
function TaxonomyNode({ node, activePath, onSelect, expandedNodes, toggleExpand }) {
  const isExpanded = expandedNodes[node._id];
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="ml-4 my-1.5">
      <div className="flex items-center gap-2 py-1 px-2 rounded-lg hover:bg-slate-800/60 transition-colors duration-150 group">
        {hasChildren ? (
          <button
            onClick={() => toggleExpand(node._id)}
            className="w-5 h-5 flex items-center justify-center rounded text-slate-400 hover:text-white hover:bg-slate-750 transition-all"
          >
            {isExpanded ? '▼' : '▶'}
          </button>
        ) : (
          <span className="w-5 h-5 flex items-center justify-center text-slate-600 text-xs">•</span>
        )}
        
        <span
          onClick={() => onSelect(node)}
          className={`cursor-pointer font-medium text-sm transition-colors duration-150 ${
            activePath.some(n => n._id === node._id) 
              ? 'text-teal-400 font-semibold' 
              : 'text-slate-300 hover:text-white'
          }`}
        >
          {node.name}
        </span>
        
        {node.description && (
          <span className="text-xs text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity duration-150 ml-2 italic">
            — {node.description}
          </span>
        )}
      </div>

      {hasChildren && isExpanded && (
        <div className="border-l border-slate-800 ml-2 pl-2 animate-in slide-in-from-left-2 duration-150">
          {node.children.map((child) => (
            <TaxonomyNode
              key={child._id}
              node={child}
              activePath={activePath}
              onSelect={onSelect}
              expandedNodes={expandedNodes}
              toggleExpand={toggleExpand}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function TaxonomyBrowser() {
  const [treeData, setTreeData] = useState([]);
  const [flatNodes, setFlatNodes] = useState([]);
  const [expandedNodes, setExpandedNodes] = useState({});
  const [selectedNode, setSelectedNode] = useState(null);
  const [activePath, setActivePath] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTaxonomyTree();
  }, []);

  const fetchTaxonomyTree = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/taxonomy');
      const data = await res.json();
      if (data.status === 'success') {
        setTreeData(data.tree || []);
        
        // Flatten tree for path calculations
        const flat = [];
        const flatten = (nodes) => {
          nodes.forEach(n => {
            flat.push(n);
            if (n.children) flatten(n.children);
          });
        };
        flatten(data.tree || []);
        setFlatNodes(flat);

        // Select root by default if available
        if (data.tree && data.tree.length > 0) {
          handleSelectNode(data.tree[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching taxonomy:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (nodeId) => {
    setExpandedNodes(prev => ({
      ...prev,
      [nodeId]: !prev[nodeId]
    }));
  };

  const expandAll = () => {
    const expansions = {};
    const recurse = (nodes) => {
      nodes.forEach(n => {
        if (n.children && n.children.length > 0) {
          expansions[n._id] = true;
          recurse(n.children);
        }
      });
    };
    recurse(treeData);
    setExpandedNodes(expansions);
  };

  const collapseAll = () => {
    setExpandedNodes({});
  };

  const handleSelectNode = (node) => {
    setSelectedNode(node);
    
    // Calculate breadcrumb path
    const path = [];
    let current = node;
    
    while (current) {
      path.unshift(current);
      const parentId = current.parent;
      current = flatNodes.find(n => n._id === parentId);
    }
    
    setActivePath(path);
  };

  // Taxonomy Search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const delayDebounce = setTimeout(async () => {
      try {
        const res = await fetch(`/api/taxonomy/search?q=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        if (data.status === 'success') {
          setSearchResults(data.matches || []);
        }
      } catch (err) {
        console.error(err);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const handleSearchResultClick = (match) => {
    // Expand all parents of this node
    const expansions = { ...expandedNodes };
    let current = match;
    while (current && current.parent) {
      const parentId = current.parent._id || current.parent;
      expansions[parentId] = true;
      current = flatNodes.find(n => n._id === parentId);
    }
    setExpandedNodes(expansions);
    
    // Select the node
    const fullNode = flatNodes.find(n => n._id === match._id);
    if (fullNode) {
      handleSelectNode(fullNode);
    }
    setSearchQuery('');
    setSearchResults([]);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-white max-w-4xl mx-auto my-8 grid grid-cols-1 md:grid-cols-3 gap-6">
      
      {/* Left 2 Columns: Tree Browser */}
      <div className="md:col-span-2 flex flex-col border-r border-slate-800/50 pr-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent">
            Research Taxonomy Tree
          </h3>
          <div className="flex gap-2">
            <button 
              onClick={expandAll} 
              className="text-xs px-2 py-1 bg-slate-850 hover:bg-slate-800 rounded text-slate-300 transition-colors"
            >
              Expand All
            </button>
            <button 
              onClick={collapseAll} 
              className="text-xs px-2 py-1 bg-slate-850 hover:bg-slate-800 rounded text-slate-300 transition-colors"
            >
              Collapse All
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-4 relative">
          <input
            type="text"
            placeholder="Search taxonomy nodes (e.g. CNN)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-teal-500 rounded-xl text-sm text-white outline-none placeholder-slate-600 transition-colors"
          />
          {searchResults.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl z-20 max-h-48 overflow-y-auto">
              {searchResults.map((match) => (
                <button
                  key={match._id}
                  onClick={() => handleSearchResultClick(match)}
                  className="w-full text-left px-3 py-2 hover:bg-slate-900 text-sm transition-colors duration-150 border-b border-slate-900/50 last:border-0"
                >
                  <span className="font-semibold text-teal-400">{match.name}</span>
                  {match.parent && (
                    <span className="text-xs text-slate-500 ml-2">
                      in {match.parent.name}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Scrollable Tree */}
        <div className="flex-1 overflow-y-auto max-h-[400px] bg-slate-950/40 border border-slate-850 rounded-xl p-4">
          {loading ? (
            <div className="text-center text-slate-500 py-8 text-sm">Loading taxonomy tree...</div>
          ) : treeData.length === 0 ? (
            <div className="text-center text-slate-500 py-8 text-sm">No taxonomy data available.</div>
          ) : (
            treeData.map((node) => (
              <TaxonomyNode
                key={node._id}
                node={node}
                activePath={activePath}
                onSelect={handleSelectNode}
                expandedNodes={expandedNodes}
                toggleExpand={toggleExpand}
              />
            ))
          )}
        </div>
      </div>

      {/* Right Column: Node Details & Breadcrumbs */}
      <div className="flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Taxonomy Inspector
          </h3>
          
          {selectedNode ? (
            <div className="bg-slate-950/60 border border-slate-850 rounded-xl p-4 animate-in fade-in duration-200">
              {/* Breadcrumb path */}
              <div className="flex flex-wrap items-center text-xs text-slate-500 mb-4 gap-1">
                {activePath.map((pathNode, idx) => (
                  <React.Fragment key={pathNode._id}>
                    <span 
                      onClick={() => handleSelectNode(pathNode)}
                      className="hover:text-teal-400 cursor-pointer font-medium"
                    >
                      {pathNode.name}
                    </span>
                    {idx < activePath.length - 1 && <span>&rarr;</span>}
                  </React.Fragment>
                ))}
              </div>

              <h4 className="text-lg font-bold text-white mb-2">{selectedNode.name}</h4>
              
              <p className="text-sm text-slate-400 leading-relaxed mb-4">
                {selectedNode.description || 'No description available for this taxonomy node.'}
              </p>

              <div className="flex flex-col gap-2 text-xs text-slate-500">
                <div>Level: <span className="text-slate-300 font-mono">{selectedNode.level}</span></div>
                <div>Child categories: <span className="text-slate-300 font-mono">{selectedNode.children?.length || 0}</span></div>
              </div>
            </div>
          ) : (
            <div className="text-slate-500 text-sm text-center py-12">
              Select a node in the taxonomy tree to view its hierarchy details.
            </div>
          )}
        </div>

        <div className="bg-slate-950/20 border border-slate-850 rounded-xl p-3 text-xs text-slate-500 leading-relaxed mt-4">
          💡 **Taxonomy Classification** helps organize publications and improves matching algorithms for collaboration.
        </div>
      </div>
    </div>
  );
}
