import React, { useState } from 'react';
import './DiscountWalletStatement.css';

function DiscountWalletStatement() {
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
      memberId: 'EI645456',
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
      memberId: 'EI645456',
      memberName: 'AMRUTA SHIRKE',
      transactionType: 'DISCOUNT USED',
      credit: '0',
      debit: '100',
      balance: '900',
      transactionDate: '03-09-2026 11:40:14 PM',
      reference: 'ORD434314'
    },
    {
      sno: 3,
      txnId: 'DWT250003',
      memberId: 'EI645456',
      memberName: 'AMRUTA SHIRKE',
      transactionType: 'DISCOUNT USED',
      credit: '0',
      debit: '200',
      balance: '700',
      transactionDate: '01-09-2026 11:40:14 PM',
      reference: 'ORD330040'
    },
    {
      sno: 4,
      txnId: 'DWT250002',
      memberId: 'EI645456',
      memberName: 'AMRUTA SHIRKE',
      transactionType: 'DISCOUNT USED',
      credit: '0',
      debit: '200',
      balance: '600',
      transactionDate: '28-08-2026 11:40:14 PM',
      reference: 'ORD334996'
    },
    {
      sno: 5,
      txnId: 'DWT250001',
      memberId: 'EI645456',
      memberName: 'AMRUTA SHIRKE',
      transactionType: 'REWARD CREDIT',
      credit: '0',
      debit: '300',
      balance: '300',
      transactionDate: '27-08-2026 11:40:14 PM',
      reference: 'ORD334635'
    }
  ];

  const updateFilter = (key) => (event) => setFilters((previous) => ({ ...previous, [key]: event.target.value }));

  return (
    <div className="discount-wallet-statement-page">
      <section className="discount-wallet-statement-panel">
        <h2 className="discount-wallet-statement-heading">Discount Wallet Statement</h2>
        <div className="member-panel-badge">MEMBER PANEL</div>

        <div className="stats-row">
          <div className="stat-card card-green">
            <div className="stat-title">E-wallet<br />Balance</div>
            <div className="stat-value">0</div>
          </div>
          <div className="stat-card card-blue">
            <div className="stat-title">Total Discount<br />Issued</div>
            <div className="stat-value">1000</div>
          </div>
          <div className="stat-card card-orange">
            <div className="stat-title">Total used<br />Discount</div>
            <div className="stat-value">700</div>
          </div>
          <div className="stat-card card-purple">
            <div className="stat-title">Total un-used<br />Discount</div>
            <div className="stat-value">300</div>
          </div>
        </div>

        <div className="discount-wallet-statement-toolbar">
          <div className="discount-wallet-statement-filter-row">
            <select 
              className="discount-wallet-statement-filter-input" 
              value={filters.transactionType} 
              onChange={updateFilter('transactionType')}
            >
              <option value="">TRANSACTION TYPE</option>
              <option value="REWARD CREDIT">REWARD CREDIT</option>
              <option value="DISCOUNT USED">DISCOUNT USED</option>
            </select>
            <input 
              className="discount-wallet-statement-filter-input" 
              placeholder="MEMBER ID" 
              value={filters.memberId} 
              onChange={updateFilter('memberId')} 
            />
            <input 
              className="discount-wallet-statement-filter-input" 
              placeholder="REFERENCE" 
              value={filters.reference} 
              onChange={updateFilter('reference')} 
            />
            <input 
              type="text"
              className="discount-wallet-statement-filter-input" 
              placeholder="DD-MM-YYYY" 
              value={filters.fromDate} 
              onChange={updateFilter('fromDate')} 
            />
            <input 
              type="text"
              className="discount-wallet-statement-filter-input" 
              placeholder="DD-MM-YYYY" 
              value={filters.toDate} 
              onChange={updateFilter('toDate')} 
            />
            <select 
              className="discount-wallet-statement-filter-input select-page-size" 
              value={filters.pageSize} 
              onChange={updateFilter('pageSize')}
            >
              <option value="10">10/50/100</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
            
            <div className="filter-buttons">
              <button type="button" className="btn-primary search-btn">SERCH</button>
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
                <th>TXN ID</th>
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

export default DiscountWalletStatement;
