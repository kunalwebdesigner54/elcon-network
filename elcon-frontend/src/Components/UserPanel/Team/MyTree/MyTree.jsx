import '../../Common/UserLayout.css';
import { useState, useEffect } from 'react';
import './MyTree.css';
import { getTreeNode } from '../../../../api/membersService';

function NetworkTreeNode({ node, onToggleExpand }) {
  if (!node) return null;

  const isExpanded = node.isExpanded || false;
  const hasChildren = node.hasChildren;
  const isLoading = node.isLoading || false;
  
  return (
    <div style={{ marginLeft: '20px' }}>
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
        <div>
          {node.children.map((child) => (
            <NetworkTreeNode
              key={child.memberId}
              node={child}
              onToggleExpand={onToggleExpand}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function MyTree() {
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
      data.isExpanded = true; 
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
      loadRoot();
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
      setRootNode(prev => updateNodeInTree(prev, node.memberId, n => ({ ...n, isExpanded: false })));
      return;
    }

    if (node.children && node.children.length > 0) {
      setRootNode(prev => updateNodeInTree(prev, node.memberId, n => ({ ...n, isExpanded: true })));
      return;
    }

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
    <div>
      <h1 className="user-page-title">Network Explorer</h1>
      <div className="user-panel">
        {error && <p style={{ color: 'red', padding: '16px' }}>{error}</p>}
        
        <div className="network-filters">
          <input
            type="text" placeholder="MEMBER ID" aria-label="Member ID"
            value={searchMemberId} onChange={(e) => setSearchMemberId(e.target.value)}
          />
          <button className="user-btn-blue" type="button" onClick={handleSearch}>Search</button>
        </div>

        <div className="network-actions-row">
          <div className="network-tree-help">Click on ⊕ sign to expand tree</div>
        </div>

        <div className="network-tree-card" role="tree" aria-label="Network Tree" style={{ backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '4px', padding: '12px', maxHeight: '600px', overflowY: 'auto' }}>
          {loading && !rootNode ? (
            <p style={{ padding: '16px' }}>Loading network data...</p>
          ) : rootNode ? (
            <NetworkTreeNode
              node={rootNode}
              onToggleExpand={toggleExpand}
            />
          ) : (
            <p style={{ padding: '16px' }}>No network members yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default MyTree;
