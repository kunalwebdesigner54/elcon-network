import { useState, useEffect } from 'react';
import { getTreeNode } from '../../../../api/membersService';
import femaleAvatar from '../../../../Assets/Icons/network-female.svg';
import maleAvatar from '../../../../Assets/Icons/network-male.svg';
import './NetworkExplorer.css';

function NetworkTreeNode({ node, onToggleExpand, computedDepth = 0 }) {
  if (!node) return null;

  const isExpanded = node.isExpanded || false;
  const hasChildren = node.hasChildren;
  const isLoading = node.isLoading || false;
  const avatar = String(node.gender || '').toLowerCase() === 'female' ? femaleAvatar : maleAvatar;
  
  return (
    <li className="org-tree-li">
      <div className="node-card">
        <div className="node-avatar">
          <img src={avatar} alt="" />
        </div>
        <div className="node-name" title={node.name}>{node.name}</div>
        <div className="node-id">ID: {node.memberId}</div>
        
        <div className="node-stats">
          <div className="node-stat-row">
            <span>ULevel: {node.upgradeLevel || 0}</span>
            <span className="stat-divider">|</span>
            <span>Directs: {node.totalDirect || 0}</span>
          </div>
          <div className="node-stat-row">
            <span>LDepth: {computedDepth}</span>
            <span className="stat-divider">|</span>
            <span>Team: {node.teamSize || 0}</span>
          </div>
        </div>

        {hasChildren && (
          <div 
            className="node-expand-btn"
            onClick={() => onToggleExpand(node)}
            title={isExpanded ? "Collapse" : "Expand"}
          >
            {isLoading ? '...' : (isExpanded ? '-' : '+')}
          </div>
        )}
      </div>

      {isExpanded && node.children && node.children.length > 0 && (
        <ul className="org-tree-ul">
          {node.children.map((child) => (
            <NetworkTreeNode
              key={child.memberId}
              node={child}
              onToggleExpand={onToggleExpand}
              computedDepth={computedDepth + 1}
            />
          ))}
        </ul>
      )}
    </li>
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
    <div style={{ minHeight: '100vh', padding: '12px' }}>
      <h1 className="page-title" style={{ fontSize: '42px', marginBottom: '14px' }}>
        Network Explorer
      </h1>

      <div className="panel" style={{ borderRadius: '28px', padding: '24px' }}>
        {error && <div style={{ color: '#e74c3c', marginBottom: '14px' }}>{error}</div>}
        
        {/* Filter Row */}
        <div className="network-search-wrapper">
          <input
            type="text"
            placeholder="Search Member ID..."
            value={searchMemberId}
            onChange={(e) => setSearchMemberId(e.target.value)}
            className="network-search-input"
          />
          <button
            onClick={handleSearch}
            className="network-search-btn"
          >
            SEARCH
          </button>
        </div>

        {/* Instructions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <span style={{ fontSize: '14px', color: '#a0aec0' }}>
            Click on + Sign to Expand Tree and load directs dynamically.
          </span>
        </div>

        {/* Tree Container */}
        <div className="network-tree-container tree-root">
          {loading && !rootNode ? (
            <div style={{ color: '#666', padding: '20px', textAlign: 'center' }}>Loading network data...</div>
          ) : rootNode ? (
            <div className="org-tree">
              <ul className="org-tree-ul">
                <NetworkTreeNode
                  node={rootNode}
                  onToggleExpand={toggleExpand}
                  computedDepth={0}
                />
              </ul>
            </div>
          ) : (
            <div style={{ color: '#999', padding: '20px', textAlign: 'center' }}>No network data available</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default NetworkExplorer;






