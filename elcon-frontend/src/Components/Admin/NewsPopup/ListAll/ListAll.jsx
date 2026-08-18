import { useEffect, useState } from 'react';
import './ListAll.css';
import { getNewsPopupList } from '../../../../api/managementService';

const RowActions = () => (
  <div className="np-actions">
    <button className="np-btn np-edit">✎</button>
    <button className="np-btn np-delete">🗑</button>
  </div>
)

export default function ListAll(){
  const [items, setItems] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const response = await getNewsPopupList();
        setItems(response.items || []);
      } catch (error) {
        setItems([]);
      }
    })();
  }, []);

  return (
    <div className="np-page container">
      <h2 className="np-title">News & Popup List</h2>

      <div className="np-toolbar">
        <label>List</label>
        <select className="np-select"><option>All</option><option>News</option><option>Popup</option></select>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Title</th>
              <th>Type</th>
              <th>Display on</th>
              <th>Publish Date</th>
              <th>Upto Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={item.id}>
                <td data-label="#">{index + 1}</td>
                <td data-label="Title">{item.title}</td>
                <td data-label="Type">{item.type}</td>
                <td data-label="Display on">{item.displayOn}</td>
                <td data-label="Publish Date">{item.publishDate}</td>
                <td data-label="Upto Date">{item.uptoDate}</td>
                <td data-label="Status"><span className="np-badge np-published">{item.status}</span></td>
                <td data-label="Action"><RowActions/></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
