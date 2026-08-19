import { useState, useEffect } from 'react';
import { getTeamTree } from '../../../../api/donationsService';
import './NetworkExplorer.css';

function NetworkTreeNode({ node, expandedNodes, toggleNode, searchTerm, searchLevel }) {
  const isExpanded = expandedNodes[node.id] || false;
  const hasChildren = node.children && node.children.length > 0;
  const nodeId = node.memberId || node.id;
  const matches = (!searchTerm || nodeId.toUpperCase().includes(searchTerm.toUpperCase())) &&
                  (!searchLevel || node.level === parseInt(searchLevel));

  if (!matches && searchTerm) return null;

  return (
    <div style={{ marginLeft: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: '4px 0' }}>
        {hasChildren ? (
          <span
            onClick={() => toggleNode(nodeId)}
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
        <span style={{ fontSize: '14px', color: '#333', fontWeight: matches ? '600' : '400' }}>
          {hasChildren && <span style={{ marginRight: '4px' }}>📁</span>}
          <strong>{nodeId}</strong> - {node.name || node.userName || 'N/A'}
        </span>
      </div>
      {hasChildren && isExpanded && (
        <div>
          {node.children.map((child) => (
            <NetworkTreeNode
              key={child.memberId || child.id}
              node={child}
              expandedNodes={expandedNodes}
              toggleNode={toggleNode}
              searchTerm={searchTerm}
              searchLevel={searchLevel}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function NetworkExplorer() {
  const [searchMemberId, setSearchMemberId] = useState('');
  const [searchLevel, setSearchLevel] = useState('');
  const [expandedNodes, setExpandedNodes] = useState({});
  const [treeData, setTreeData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTeamTree();
  }, []);

  const fetchTeamTree = async () => {
    try {
      setLoading(true);
      const data = await getTeamTree();
      setTreeData(Array.isArray(data) ? data : (data.data ? (Array.isArray(data.data) ? data.data : [data.data]) : []));
      setError('');
    } catch (err) {
      setError('Failed to load network tree data');
      console.error(err);
      setTreeData([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleNode = (nodeId) => {
    setExpandedNodes((prev) => ({
      ...prev,
      [nodeId]: !prev[nodeId]
    }));
  };

  const expandAll = () => {
    const newExpandedNodes = {};
    const traverse = (node) => {
      const nodeId = node.memberId || node.id;
      if (node.children && node.children.length > 0) {
        newExpandedNodes[nodeId] = true;
        node.children.forEach(traverse);
      }
    };
    treeData.forEach(traverse);
    setExpandedNodes(newExpandedNodes);
  };

  const collapseAll = () => {
    setExpandedNodes({});
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', padding: '12px' }}>
      <h1 className="page-title" style={{ fontSize: '42px', marginBottom: '14px' }}>
        Network Explorer
      </h1>

      <div className="panel" style={{ borderRadius: '28px', padding: '24px' }}>
        {error && <div style={{ color: '#e74c3c', marginBottom: '14px' }}>{error}</div>}
        {loading && <div style={{ color: '#666', marginBottom: '14px' }}>Loading...</div>}
        
        {!loading && (
          <>
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
              <select
                value={searchLevel}
                onChange={(e) => setSearchLevel(e.target.value)}
                style={{
                  padding: '8px 12px',
                  fontSize: '14px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  width: '120px',
                  fontFamily: 'inherit',
                  cursor: 'pointer'
                }}
              >
                <option value="">Level</option>
                <option value="1">Level 1</option>
                <option value="2">Level 2</option>
                <option value="3">Level 3</option>
                <option value="4">Level 4</option>
                <option value="5">Level 5</option>
              </select>
              <button
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
                onMouseEnter={(e) => (e.target.style.backgroundColor = '#355a7e')}
                onMouseLeave={(e) => (e.target.style.backgroundColor = '#4a7ba7')}
              >
                SEARCH
              </button>
            </div>

            {/* Instructions and Expand/Collapse Buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span style={{ fontSize: '14px', color: '#666' }}>
                Click on + Sign to Expand Tree{' '}
                <span
                  onClick={expandAll}
                  style={{ color: '#4a7ba7', cursor: 'pointer', fontWeight: '600', marginLeft: '8px' }}
                >
                  Open All
                </span>
                {' | '}
                <span
                  onClick={collapseAll}
                  style={{ color: '#4a7ba7', cursor: 'pointer', fontWeight: '600', marginLeft: '4px' }}
                >
                  Close All
                </span>
              </span>
            </div>

            {/* Tree Container */}
            <div
              className="network-tree-container"
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
              {treeData && treeData.length > 0 ? (
                treeData.map((node) => (
                  <NetworkTreeNode
                    key={node.memberId || node.id}
                    node={node}
                    expandedNodes={expandedNodes}
                    toggleNode={toggleNode}
                    searchTerm={searchMemberId}
                    searchLevel={searchLevel}
                  />
                ))
              ) : (
                <div style={{ color: '#999', padding: '20px' }}>No network data available</div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default NetworkExplorer;

