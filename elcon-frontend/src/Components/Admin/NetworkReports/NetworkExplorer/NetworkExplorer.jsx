import { useState, useEffect } from 'react';
import { getTreeNode } from '../../../../api/membersService';
import './NetworkExplorer.css';

function NetworkTreeNode({ node, onToggleExpand }) {
  if (!node) return null;

  const isExpanded = node.isExpanded || false;
  const hasChildren = node.hasChildren;
  const isLoading = node.isLoading || false;
  
  return (
    <ul className="tree-ul">
      <li className="tree-li">
        <div style={{ display: 'flex', alignItems: 'center', padding: '4px 0' }}>
          {hasChildren ? (
            <span
              onClick={() => onToggleExpand(node)}
              style={{
                cursor: 'pointer',
                userSelect: 'none',
                fontSize: '14px',
                fontWeight: 'bold',
                width: '16px',
                display: 'flex',
                alignItems: 'center',
                marginRight: '4px'
              }}
            >
              {isExpanded ? '⊟' : '⊕'}
            </span>
          ) : (
            <span style={{ width: '16px', marginRight: '4px' }}></span>
          )}
          <span style={{ fontSize: '14px', color: '#333' }}>
            {hasChildren && <span style={{ marginRight: '4px' }}>📁</span>}
            <strong>{node.memberId}</strong> - {node.name} 
            <span style={{color: '#666', fontSize: '12px', marginLeft: '8px'}}>
              (Depth: {node.levelDepth}, Directs: {node.activeDirect}/{node.totalDirect})
            </span>
            {isLoading && <span style={{ marginLeft: '8px', color: '#888', fontSize: '12px' }}>Loading...</span>}
          </span>
        </div>
        {isExpanded && node.children && node.children.length > 0 && (
          <div style={{ marginLeft: '4px' }}>
            {node.children.map((child) => (
              <NetworkTreeNode
                key={child.memberId}
                node={child}
                onToggleExpand={onToggleExpand}
              />
            ))}
          </div>
        )}
      </li>
    </ul>
  );
}

function NetworkExplorer() {
  const [searchMemberId, setSearchMemberId] = useState('');
  const [rootNode, setRootNode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchNode = async (memberId = '') => {
    try {
      const response = await getTreeNode(memberId);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to load member');
    } catch (err) {
      throw err;
    }
  };

  const loadRoot = async (memberId = '') => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchNode(memberId);
      data.isExpanded = true; // Auto expand root
      setRootNode(data);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to load network tree data');
      setRootNode(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoot();
  }, []);

  const handleSearch = () => {
    if (searchMemberId.trim()) {
      loadRoot(searchMemberId.trim());
    } else {
      loadRoot(); // loads logged-in user or admin default
    }
  };

  const updateNodeInTree = (currentNode, targetId, updater) => {
    if (currentNode.memberId === targetId) {
      return updater({ ...currentNode });
    }
    if (currentNode.children) {
      return {
        ...currentNode,
        children: currentNode.children.map(child => updateNodeInTree(child, targetId, updater))
      };
    }
    return currentNode;
  };

  const toggleExpand = async (node) => {
    if (node.isExpanded) {
      // Collapse
      setRootNode(prev => updateNodeInTree(prev, node.memberId, n => ({ ...n, isExpanded: false })));
      return;
    }

    // Expand
    // If we already have children populated (except for the root which we just fetched), just expand
    if (node.children && node.children.length > 0) {
      setRootNode(prev => updateNodeInTree(prev, node.memberId, n => ({ ...n, isExpanded: true })));
      return;
    }

    // Otherwise fetch children
    setRootNode(prev => updateNodeInTree(prev, node.memberId, n => ({ ...n, isLoading: true })));
    try {
      const data = await fetchNode(node.memberId);
      setRootNode(prev => updateNodeInTree(prev, node.memberId, n => ({ 
        ...n, 
        isLoading: false, 
        isExpanded: true, 
        children: data.children 
      })));
    } catch (err) {
      setRootNode(prev => updateNodeInTree(prev, node.memberId, n => ({ ...n, isLoading: false })));
      alert('Failed to load downlines: ' + (err?.response?.data?.message || err.message));
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', padding: '12px' }}>
      <h1 className="page-title" style={{ fontSize: '42px', marginBottom: '14px' }}>
        Network Explorer
      </h1>

      <div className="panel" style={{ borderRadius: '28px', padding: '24px' }}>
        {error && <div style={{ color: '#e74c3c', marginBottom: '14px' }}>{error}</div>}
        
        {/* Filter Row */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '14px', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="Member ID"
              value={searchMemberId}
              onChange={(e) => setSearchMemberId(e.target.value)}
              style={{
                padding: '8px 12px',
                fontSize: '14px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                width: '150px',
                fontFamily: 'inherit'
              }}
            />
          </div>
          
          <button
            onClick={handleSearch}
            style={{
              padding: '8px 20px',
              fontSize: '14px',
              fontWeight: '600',
              backgroundColor: '#4a7ba7',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
          >
            SEARCH
          </button>
        </div>

        {/* Instructions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <span style={{ fontSize: '14px', color: '#666' }}>
            Click on + Sign to Expand Tree and load directs dynamically.
          </span>
        </div>

        {/* Tree Container */}
        <div
          className="network-tree-container tree-root"
          style={{
            backgroundColor: '#fff',
            border: '1px solid #ddd',
            borderRadius: '4px',
            padding: '12px',
            maxHeight: '600px',
            overflowY: 'auto',
            fontSize: '14px',
            lineHeight: '1.8'
          }}
        >
          {loading && !rootNode ? (
            <div style={{ color: '#666', padding: '20px' }}>Loading network data...</div>
          ) : rootNode ? (
            <NetworkTreeNode
              node={rootNode}
              onToggleExpand={toggleExpand}
            />
          ) : (
            <div style={{ color: '#999', padding: '20px' }}>No network data available</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default NetworkExplorer;


