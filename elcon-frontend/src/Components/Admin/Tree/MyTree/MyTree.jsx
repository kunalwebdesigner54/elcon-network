import React from 'react';
import './MyTree.css';

const rows = [
  ['1', 'IHH192108', 'ANAMIKA SAXENA', '2', '2', '2', '1', '1', '1', '1', '1', '1'],
  ['2', 'IHH5977055', 'sukhdev rawat', '1', '1', '1', '1', '1', '1', '1', '1', '1'],
  ['3', 'IHH4500814', 'Sukhdev singh rawat', '1', '1', '1', '1', '1', '1', '1', '1', '4'],
  ['4', 'IHH4016369', 'rahul rauthan', '1', '1', '1', '1', '1', '1', '1', '4', '16'],
  ['5', 'IHH2724795', 'shusma gusain', '1', '1', '1', '1', '1', '1', '4', '16', '35'],
  ['6', 'IHH6954423', 'dinesh sharma', '1', '1', '1', '1', '1', '4', '16', '35', '68'],
  ['7', 'IHH9596855', 'GANGA BISHAN', '1', '1', '1', '1', '4', '16', '35', '68', '66'],
  ['8', 'IHH8814468', 'Narendra singh', '1', '1', '1', '4', '16', '35', '68', '66', '46'],
  ['9', 'IHH1593820', 'SUKHDEV SINGH', '1', '1', '4', '16', '35', '68', '66', '46', '33'],
  ['10', 'IHH1927504', 'Anamika', '1', '4', '16', '35', '68', '66', '46', '33', '40']
];

function MyTree() {
  const totalPages = 1;

  const [page, setPage] = React.useState(1);

  return (
    <div>
      <h1 className="page-title">My level</h1>

      <div className="panel">
        <div className="btn-row">
          <button className="btn-outline">Excel</button>
        </div>

        <div className="table-tools">
          <div />
          <label className="search-box">
            Search:
            <input className="text-input" />
          </label>
        </div>

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Sr. No.</th>
                <th>MemberID</th>
                <th>Member Name</th>
                <th>Level 1</th>
                <th>Level 2</th>
                <th>Level 3</th>
                <th>Level 4</th>
                <th>Level 5</th>
                <th>Level 6</th>
                <th>Level 7</th>
                <th>Level 8</th>
                <th>Level 9</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row[0]}>
                  {row.map((cell, index) => (
                    <td key={`${row[0]}-${index}`}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="table-footer">
          <span>Showing 1 to 10 of 366 entries</span>
          <div className="pagination">
                <button className="page-btn" onClick={() => handlePageChange(1)} disabled={page === 1}>&lt;&lt;</button>
                <button className="page-btn" onClick={() => handlePageChange(page - 1)} disabled={page === 1}>Prev</button>
                {[...Array(totalPages)].map((_, i) => {
                  const p = i + 1;
                  let s = Math.max(1, page - 1);
                  let e = Math.min(totalPages, s + 2);
                  if (e - s < 2) s = Math.max(1, e - 2);
                  if (p < s || p > e) return null;
                  return (
                    <button 
                      key={p} 
                      className={`page-btn ${page === p ? 'active' : ''}`}
                      onClick={() => handlePageChange(p)}
                    >
                      {p}
                    </button>
                  );
                })}
                <button className="page-btn" onClick={() => handlePageChange(page + 1)} disabled={page === totalPages}>Next</button>
                <button className="page-btn" onClick={() => handlePageChange(totalPages)} disabled={page === totalPages}>&gt;&gt;</button>
              </div>
        </div>
      </div>
    </div>
  );
}

export default MyTree;
