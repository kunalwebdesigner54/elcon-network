import React, { useState } from 'react';
import './DiscountWalletOverview.css';

function DiscountWalletOverview() {
  const [filters, setFilters] = useState({
    memberId: '',
    donationStatus: '',
    fromDate: '',
    toDate: '',
    pageSize: '10'
  });

  const dummyData = [
    {
      sno: 1,
      memberId: 'EL045458',
      memberName: 'AMRUTA SHIRKE',
      donationStatus: 'COMPLETED',
      creditGiven: '1000.00',
      usedAmount: '200.00',
      availableBalance: '800.00',
      transactionDate: '04-09-2026 11:40:14 PM'
    },
    {
      sno: 2,
      memberId: 'EL456568',
      memberName: 'SONALI SHIRKE',
      donationStatus: 'COMPLETED',
      creditGiven: '1000.00',
      usedAmount: '500.00',
      availableBalance: '500.00',
      transactionDate: '03-09-2026 11:40:14 PM'
    },
    {
      sno: 3,
      memberId: 'EL879879',
      memberName: 'RAJANI PATIL',
      donationStatus: 'COMPLETED',
      creditGiven: '1000.00',
      usedAmount: '300.00',
      availableBalance: '700.00',
      transactionDate: '01-09-2026 11:40:14 PM'
    },
    {
      sno: 4,
      memberId: 'EL234355',
      memberName: 'POOJA KUMBHAR',
      donationStatus: 'PENDING',
      creditGiven: '0',
      usedAmount: '0',
      availableBalance: '0',
      transactionDate: '-'
    },
    {
      sno: 5,
      memberId: 'EI654354',
      memberName: 'ARJUN DHADGE',
      donationStatus: 'PENDING',
      creditGiven: '0',
      usedAmount: '0',
      availableBalance: '0',
      transactionDate: '-'
    }
  ];

  const updateFilter = (key) => (event) => setFilters((previous) => ({ ...previous, [key]: event.target.value }));

  return (
    <div className="discount-wallet-overview-page">
      <section className="discount-wallet-overview-panel">
        <h2 className="discount-wallet-overview-heading">Discount Wallet Overview</h2>

        <div className="stats-row">
          <div className="stat-card card-green">
            <div className="stat-title">Total<br />Members</div>
            <div className="stat-value">500</div>
          </div>
          <div className="stat-card card-blue">
            <div className="stat-title">Total Discount<br />Issued</div>
            <div className="stat-value">500000</div>
          </div>
          <div className="stat-card card-orange">
            <div className="stat-title">Total used<br />Discount</div>
            <div className="stat-value">225000</div>
          </div>
          <div className="stat-card card-purple">
            <div className="stat-title">Total un-used<br />Discount</div>
            <div className="stat-value">275000</div>
          </div>
        </div>

        <div className="discount-wallet-overview-toolbar">
          <div className="discount-wallet-overview-filter-row">
            <input 
              className="discount-wallet-overview-filter-input" 
              placeholder="MEMBER ID" 
              value={filters.memberId} 
              onChange={updateFilter('memberId')} 
            />
            <select 
              className="discount-wallet-overview-filter-input" 
              value={filters.donationStatus} 
              onChange={updateFilter('donationStatus')}
            >
              <option value="">DONATION STATUS</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="PENDING">PENDING</option>
            </select>
            <input 
              type="text"
              className="discount-wallet-overview-filter-input" 
              placeholder="DD-MM-YYYY" 
              value={filters.fromDate} 
              onChange={updateFilter('fromDate')} 
            />
            <input 
              type="text"
              className="discount-wallet-overview-filter-input" 
              placeholder="DD-MM-YYYY" 
              value={filters.toDate} 
              onChange={updateFilter('toDate')} 
            />
            <select 
              className="discount-wallet-overview-filter-input select-page-size" 
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
                <th>MEMBER ID</th>
                <th>MEMBER NAME</th>
                <th>DONATION STATUS</th>
                <th>CREDIT GIVEN</th>
                <th>USED AMOUNT</th>
                <th>AVAILABLE BALANCE</th>
                <th>LAST TRANSACTION DATE</th>
              </tr>
            </thead>
            <tbody>
              {dummyData.map((row) => (
                <tr key={row.sno}>
                  <td>{row.sno}</td>
                  <td>{row.memberId}</td>
                  <td>{row.memberName}</td>
                  <td>{row.donationStatus}</td>
                  <td>{row.creditGiven}</td>
                  <td>{row.usedAmount}</td>
                  <td>{row.availableBalance}</td>
                  <td>{row.transactionDate}</td>
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

export default DiscountWalletOverview;
