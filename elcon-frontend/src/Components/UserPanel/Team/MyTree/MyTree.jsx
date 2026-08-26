import '../../Common/UserLayout.css';
import { useState, useEffect } from 'react';
import './MyTree.css';
import { getTreeNode } from '../../../../api/membersService';
import femaleAvatar from '../../../../Assets/Icons/network-female.svg';
import maleAvatar from '../../../../Assets/Icons/network-male.svg';

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
            Depth: {computedDepth}
          </div>
          <div className="node-stat-row">
            Directs: {node.activeDirect || 0}/{node.totalDirect || 0}
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
        
        <div className="network-search-wrapper">
          <input
            type="text" 
            placeholder="Search Member ID..." 
            aria-label="Member ID"
            className="network-search-input"
            value={searchMemberId} 
            onChange={(e) => setSearchMemberId(e.target.value)}
          />
          <button className="network-search-btn" type="button" onClick={handleSearch}>SEARCH</button>
        </div>

        <div className="network-actions-row">
          <div className="network-tree-help">Click on ⊕ sign to expand tree</div>
        </div>

        <div className="network-tree-container tree-root" role="tree" aria-label="Network Tree">
          {loading && !rootNode ? (
            <p style={{ padding: '16px', textAlign: 'center' }}>Loading network data...</p>
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
            <p style={{ padding: '16px', textAlign: 'center' }}>No network members yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default MyTree;



