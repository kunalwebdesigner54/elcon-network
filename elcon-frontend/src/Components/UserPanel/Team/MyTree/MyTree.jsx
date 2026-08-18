import '../../Common/UserLayout.css';
import { useMemo, useState, useEffect } from 'react';
import './MyTree.css';
import { getTeamTree } from '../../../../api/donationsService';

// Convert nested API tree to flat rows with parentId for the existing tree renderer
function flattenTree(node, parentId = null, level = 0, acc = []) {
  if (!node) return acc;
  acc.push({
    memberId: node.memberId,
    memberName: node.name,
    parentId: parentId || '',
    level,
    unlockLevel: node.unlockLevel,
    status: node.status,
  });
  (node.children || []).forEach((child) => flattenTree(child, node.memberId, level + 1, acc));
  return acc;
}

function MyTree() {
  const [allRows, setAllRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [memberIdQuery, setMemberIdQuery] = useState('');
  const [levelQuery, setLevelQuery] = useState('');
  const [appliedMemberId, setAppliedMemberId] = useState('');
  const [appliedLevel, setAppliedLevel] = useState('');
  const [expandedNodes, setExpandedNodes] = useState(() => new Set());

  useEffect(() => {
    getTeamTree()
      .then((data) => {
        const flat = flattenTree(data.data);
        setAllRows(flat);
      })
      .catch((err) => setError(err?.response?.data?.message || 'Failed to load team tree.'))
      .finally(() => setLoading(false));
  }, []);

  const filteredRows = useMemo(() => {
    return allRows.filter((row) => {
      const memberMatch = !appliedMemberId || row.memberId.toLowerCase().includes(appliedMemberId.toLowerCase());
      const levelMatch = !appliedLevel || String(row.level) === appliedLevel;
      return memberMatch && levelMatch;
    });
  }, [allRows, appliedLevel, appliedMemberId]);

  const rowById = useMemo(() => {
    const map = new Map();
    filteredRows.forEach((row) => map.set(row.memberId, row));
    return map;
  }, [filteredRows]);

  const childrenMap = useMemo(() => {
    const map = new Map();
    filteredRows.forEach((row) => {
      if (!map.has(row.memberId)) map.set(row.memberId, []);
    });
    filteredRows.forEach((row) => {
      if (row.parentId && rowById.has(row.parentId)) {
        map.get(row.parentId).push(row.memberId);
      }
    });
    return map;
  }, [filteredRows, rowById]);

  const rootIds = useMemo(() => {
    return filteredRows
      .filter((row) => !row.parentId || !rowById.has(row.parentId))
      .map((row) => row.memberId);
  }, [filteredRows, rowById]);

  const expandableIds = useMemo(() => {
    return Array.from(childrenMap.entries())
      .filter(([, children]) => children.length > 0)
      .map(([id]) => id);
  }, [childrenMap]);

  const handleSearch = () => {
    setAppliedMemberId(memberIdQuery.trim());
    setAppliedLevel(levelQuery);
    setExpandedNodes(new Set());
  };

  const handleOpenAll = () => setExpandedNodes(new Set(expandableIds));
  const handleCloseAll = () => setExpandedNodes(new Set());

  const toggleNode = (memberId) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      next.has(memberId) ? next.delete(memberId) : next.add(memberId);
      return next;
    });
  };

  const renderTree = (memberId, depth = 0) => {
    const item = rowById.get(memberId);
    if (!item) return null;
    const children = childrenMap.get(memberId) || [];
    const hasChildren = children.length > 0;
    const isExpanded = expandedNodes.has(memberId);

    return (
      <div key={memberId}>
        <div className="network-tree-row" style={{ paddingLeft: `${12 + depth * 24}px` }}>
          {hasChildren ? (
            <button
              type="button"
              className="network-node-toggle"
              onClick={() => toggleNode(memberId)}
              aria-label={isExpanded ? 'Collapse node' : 'Expand node'}
            >
              {isExpanded ? '-' : '+'}
            </button>
          ) : (
            <span className="network-node-spacer" />
          )}
          <span className="network-node-label">
            {item.memberId} — {item.memberName}
            <span style={{ marginLeft: 8, fontSize: '0.8em', color: '#888' }}>
              (Lvl {item.unlockLevel})
            </span>
          </span>
        </div>
        {hasChildren && isExpanded && children.map((childId) => renderTree(childId, depth + 1))}
      </div>
    );
  };

  return (
    <div>
      <h1 className="user-page-title">Network Explorer</h1>
      <div className="user-panel">
        {loading && <p style={{ padding: '16px' }}>Loading team tree…</p>}
        {error && <p style={{ color: 'red', padding: '16px' }}>{error}</p>}

        {!loading && !error && (
          <>
            <div className="network-filters">
              <input
                type="text" placeholder="MEMBER ID" aria-label="Member ID"
                value={memberIdQuery} onChange={(e) => setMemberIdQuery(e.target.value)}
              />
              <select aria-label="Level" value={levelQuery} onChange={(e) => setLevelQuery(e.target.value)}>
                <option value="">LEVEL</option>
                {[0,1,2,3,4,5,6,7,8,9].map((l) => <option key={l} value={l}>{l === 0 ? 'Root' : l}</option>)}
              </select>
              <button className="user-btn-blue" type="button" onClick={handleSearch}>Search</button>
            </div>

            <div className="network-actions-row">
              <div className="network-tree-help">Click on + sign to expand tree</div>
              <div className="network-tree-toggle" role="group" aria-label="Tree Controls">
                <button type="button" className="user-btn-outline" onClick={handleOpenAll}>Open All</button>
                <button type="button" className="user-btn-outline" onClick={handleCloseAll}>Close All</button>
              </div>
            </div>

            <div className="network-tree-card" role="tree" aria-label="Network Tree">
              {rootIds.length
                ? rootIds.map((rootId) => renderTree(rootId))
                : <p style={{ padding: '16px' }}>No network members yet.</p>
              }
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default MyTree;
