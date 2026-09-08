import React, { useState } from 'react';
import './DiscountWalletTransaction.css';

function DiscountWalletTransaction() {
  const [filters, setFilters] = useState({
    transactionType: '',
    memberId: '',
    reference: '',
    fromDate: '',
    toDate: '',
    pageSize: '10'
  });

  const dummyData = [
    {
      sno: 1,
      txnId: 'DWT250005',
      memberId: 'EL845458',
      memberName: 'AMRUTA SHIRKE',
      transactionType: 'REWARD CREDIT',
      credit: '1000',
      debit: '-',
      balance: '1000',
      transactionDate: '04-09-2026 11:40:14 PM',
      reference: 'DON278728'
    },
    {
      sno: 2,
      txnId: 'DWT250004',
      memberId: 'EL456566',
      memberName: 'SONALI SHIRKE',
      transactionType: 'DISCOUNT USED',
      credit: '0',
      debit: '300',
      balance: '700',
      transactionDate: '03-09-2026 11:40:14 PM',
      reference: 'ORD434314'
    },
    {
      sno: 3,
      txnId: 'DWT250003',
      memberId: 'EL879879',
      memberName: 'RAJANI PATIL',
      transactionType: 'DISCOUNT USED',
      credit: '0',
      debit: '200',
      balance: '800',
      transactionDate: '01-09-2026 11:40:14 PM',
      reference: 'ORD330040'
    },
    {
      sno: 4,
      txnId: 'DWT250002',
      memberId: 'EL234355',
      memberName: 'POOJA KUTE',
      transactionType: 'DISCOUNT USED',
      credit: '0',
      debit: '500',
      balance: '500',
      transactionDate: '28-08-2026 11:40:14 PM',
      reference: 'ORD334996'
    },
    {
      sno: 5,
      txnId: 'DWT250001',
      memberId: 'EI654354',
      memberName: 'ARJUN DHADGE',
      transactionType: 'REWARD CREDIT',
      credit: '1000',
      debit: '0',
      balance: '1000',
      transactionDate: '27-08-2026 11:40:14 PM',
      reference: 'ORD334835'
    }
  ];

  const updateFilter = (key) => (event) => setFilters((previous) => ({ ...previous, [key]: event.target.value }));

  return (
    <div className="discount-wallet-page">
      <section className="discount-wallet-panel">
        <h2 className="discount-wallet-heading">DISCOUNT WALLET TRANSACTION</h2>

        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-title">Total<br />Members</div>
            <div className="stat-value">500</div>
          </div>
          <div className="stat-card">
            <div className="stat-title">Total Discount<br />Issued</div>
            <div className="stat-value">500000</div>
          </div>
          <div className="stat-card">
            <div className="stat-title">Total used<br />Discount</div>
            <div className="stat-value">225000</div>
          </div>
          <div className="stat-card">
            <div className="stat-title">Total un-used<br />Discount</div>
            <div className="stat-value">275000</div>
          </div>
        </div>

        <div className="discount-wallet-toolbar">
          <div className="discount-wallet-filter-row">
            <input 
              className="discount-wallet-filter-input" 
              placeholder="TRANSACTION TYPE" 
              value={filters.transactionType} 
              onChange={updateFilter('transactionType')} 
            />
            <input 
              className="discount-wallet-filter-input" 
              placeholder="MEMBER ID" 
              value={filters.memberId} 
              onChange={updateFilter('memberId')} 
            />
            <input 
              className="discount-wallet-filter-input" 
              placeholder="REFERENCE" 
              value={filters.reference} 
              onChange={updateFilter('reference')} 
            />
            <input 
              type="text"
              className="discount-wallet-filter-input" 
              placeholder="DD-MM-YYYY" 
              value={filters.fromDate} 
              onChange={updateFilter('fromDate')} 
            />
            <input 
              type="text"
              className="discount-wallet-filter-input" 
              placeholder="DD-MM-YYYY" 
              value={filters.toDate} 
              onChange={updateFilter('toDate')} 
            />
            <select 
              className="discount-wallet-filter-input select-page-size" 
              value={filters.pageSize} 
              onChange={updateFilter('pageSize')}
            >
              <option value="10">10/50/100</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
            
            <div className="filter-buttons">
              <button type="button" className="btn-primary search-btn">SEARCH</button>
              <button type="button" className="btn-outline reset-btn">RESET</button>
              <button type="button" className="btn-outline excel-btn">Excel</button>
              <button type="button" className="btn-outline pdf-btn">PDF</button>
            </div>
          </div>
        </div>

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Txn ID</th>
                <th>MEMBER ID</th>
                <th>MEMBER NAME</th>
                <th>TRANSACTION TYPE</th>
                <th>CREDIT</th>
                <th>DEBIT</th>
                <th>BALANCE</th>
                <th>TRANSACTION DATE</th>
                <th>REFERENCE</th>
              </tr>
            </thead>
            <tbody>
              {dummyData.map((row) => (
                <tr key={row.sno}>
                  <td>{row.sno}</td>
                  <td>{row.txnId}</td>
                  <td>{row.memberId}</td>
                  <td>{row.memberName}</td>
                  <td>{row.transactionType}</td>
                  <td>{row.credit}</td>
                  <td>{row.debit}</td>
                  <td>{row.balance}</td>
                  <td>{row.transactionDate}</td>
                  <td>{row.reference}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="table-footer">
          <div className="total-entries">
            Total Entries : {dummyData.length}
          </div>
          <div className="pagination">
            <button type="button" className="page-btn">«</button>
            <button type="button" className="page-btn">1</button>
            <button type="button" className="page-btn active-page">2</button>
            <button type="button" className="page-btn">3</button>
            <button type="button" className="page-btn">»</button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default DiscountWalletTransaction;
