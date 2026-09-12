import { useEffect, useMemo, useState } from 'react';
import { NavLink, Link, Outlet, useLocation } from 'react-router-dom';
import './AdminLayout.css';

const menuItems = [
  { key: 'dashboard', label: 'Dashboard', to: '/dashboard' },
  {
    key: 'epin',
    label: 'ePin',
    children: [
      { label: 'Generate ePin', to: '/epin/generate-epin' },
      { label: 'Unused ePin', to: '/epin/unused-epin' },
      { label: 'Used ePin', to: '/epin/used-epin' },
      { label: 'All ePin', to: '/epin/all-epin' },
      { label: 'Transfer History', to: '/epin/transfer-history' }
    ]
  },
  {
    key: 'franchise',
    label: 'Franchise Manage',
    children: [
      { label: 'Create Epin Franchise', to: '/epin-franchise/list' },
      { label: 'Product Franchise Stock', to: '/product-franchise/manage' }
    ]
  },
  {
    key: 'members',
    label: 'Members',
    children: [
      { label: 'KYC Request', to: '/members/kyc-request' },
      { label: 'All Members List', to: '/members/all-members-list' },
      { label: 'Member Information', to: '/members/member-information' },
      { label: 'Members Location', to: '/members/active-members' },
      { label: 'All-Member-Performance', to: '/members/all-member-performance' },
      
      
    
    ]
  },
  {
    key: 'networkReports',
    label: 'Network Reports',
    children: [
      { label: 'Network Explorer', to: '/network-reports/network-explorer' },
      { label: 'Downline List', to: '/network-reports/downline-list' },
    
    ]
  },
  {
    key: 'incomeReports',
    label: 'Income Reports',
    children: [
      { label: 'Level Income Reports', to: '/income-reports/level-income-reports' },
      { label: 'Repurchase Income Reports', to: '/income-reports/repurchase-income-reports' },
      { label: 'Donations Report', to: '/income-reports/donation-report' },
        { label: 'TDS Report', to: '/income-report/Tds-Report' },
        { label: 'Datewise Income', to: '/income-report/Datewise-income' },
        { label: 'Daily Payout Report', to: '/income-report/Daily-Payout-Report' }
    ]
  },
  {
    key: 'deposits',
    label: 'Deposits',
    children: [
      { label: 'Pending Deposits', to: '/deposits/pending-deposits' },
      { label: 'Approve Deposits', to: '/deposits/approve-deposits' },
      { label: 'Successful Deposits', to: '/deposits/successful-deposits' },
      { label: 'Rejected Deposits', to: '/deposits/rejected-deposits' },
      { label: 'All Deposits', to: '/deposits/all-deposits' }
    ]
  },
   {
    key: 'withdrawals',
    label: 'Withdrawals',
    children: [
      { label: 'All Request', to: '/withdrawals/all-request' },
      { label: 'Approved Request', to: '/withdrawals/approved-request' },
      { label: 'Pending Request', to: '/withdrawals/pending-request' },
      { label: 'Reject Request', to: '/withdrawals/reject-request' },
      { label: 'Succeed Request', to: '/withdrawals/succeed-request' }
    ]
  },
  {
    key: 'productsPackage',
    label: 'Products/Package',
    children: [
      { label: 'Joining Package', to: '/products-package/Joining-Package' },
      { label: 'ePin Packages', to: '/products-package/epin-packages' },
      { label: 'Shopping Products', to: '/products-package/shopping-products' },
      { label: 'Repurchase Products', to: '/products-package/repurchase-products' },
      { label: 'Manage Categories', to: '/products-package/manage-categories' }
    ]
  },
  {
    key: 'productOrder',
    label: 'Product Order',
    children: [
      { label: 'All Orders', to: '/product-order/all-orders' },
      { label: 'Sales GST Report', to: '/product-order/gst-report' },
      { label: 'GST Sales Summary', to: '/product-order/gst-summary' },
      { label: 'Pending Orders', to: '/product-order/pending-orders' },
      { label: 'Confirm Orders', to: '/product-order/confirm-orders' },
      { label: 'Processing Orders', to: '/product-order/processing-orders' },
      { label: 'Dispatched Orders', to: '/product-order/dispatched-orders' },
      { label: 'Delivered Orders', to: '/product-order/delivered-orders' },
      { label: 'Returned Orders', to: '/product-order/returned-orders' },
      { label: 'Cancelled Orders', to: '/product-order/cancelled-orders' }
    ]
  },
  {
    key: 'transaction',
    label: 'Transaction',
    children: [
      { label: 'Main Wallet', to: '/transaction/main-wallet' },
      { label: 'Transaction History', to: '/transactions/transaction-history' }
    ]
  },
 
  {
    key: 'settings',
    label: 'Settings',
    children: [
      { label: 'Level Plan', to: '/settings/level-plan' },
      { label: 'Manage Taxes & Deduction', to: '/settings/manage-taxes-deduction' },
      { label: 'Bank Account', to: '/admin/setting/bank-account' },
      { label: 'Plan Setting', to: '/admin/setting/plan-setting' },
      { label: 'Terms and Conditions', to: '/admin/setting/terms-and-conditions' },
      { label: 'Admin Settings', to: '/settings/admin-settings' },
      { label: 'Manage Sub-Admins', to: '/sub-admins/manage' }
    ]
  },
  {
    key: 'coupon',
    label: 'Coupon',
    children: [
      { label: 'Discount Wallet Overview', to: '/coupon/discount-wallet-overview' },

      { label: 'Manage Discount Coupon', to: '/discount-coupon/manage' },
      { label: 'Discount Wallet Transaction', to: '/coupon/discount-wallet-transaction' }
    ]
  },
  {
    key: 'newsPopup',
    label: 'News & Popup',
    children: [
      { label: 'Add New', to: '/news-popup/add-new' },
      { label: 'List All', to: '/news-popup/list-all' }
    ]
  },
  {
    key: 'support',
    label: 'Support',
    children: [
      { label: 'Support Section', to: '/support/support-section' },
      { label: 'Support Tickets', to: '/support/support-tickets' },
      { label: 'Chat Integration', to: '/support/chat-integration' }
    ]
  },
  {
    key: 'rank',
    label: 'Rank',
    to: '/rank/rank-holders-list'
  },
  { key: 'lastLogin', label: 'Last Login Date & Time', to: '/last-login-date-time' },
  { key: 'signout', label: 'Sign Out', to: '/sign-out' }
];

function toTitleCase(text) {
  return text
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function buildBreadcrumb(pathname) {
  const breadcrumbLabelMap = {
    'active-members': 'Members Location'
  };

  const segments = pathname.split('/').filter(Boolean);
  if (!segments.length) {
    return ['Dashboard'];
  }

  return segments.map((segment) => breadcrumbLabelMap[segment] || toTitleCase(segment));
}

function AdminLayout() {
  // const navigate = useNavigate(); // Removed unused variable
  const location = useLocation();
  const breadcrumb = useMemo(() => buildBreadcrumb(location.pathname), [location.pathname]);
  const showBackButton = location.pathname !== '/dashboard';
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const [openSection, setOpenSection] = useState(null);

  const user = useMemo(() => {
    try {
      return JSON.parse(sessionStorage.getItem('user')) || {};
    } catch {
      return {};
    }
  }, []);
  const adminName = user.name || (user.adminType === 'SUB_ADMIN' ? 'Sub Administrator' : 'Administrator');
  const adminUserId = user.memberId || user.id || user._id || 'N/A';

  const filteredMenuItems = useMemo(() => {
    if (user.adminType === 'SUB_ADMIN') {
      const perms = user.permissions || [];
      return menuItems.filter(item => {
        if (item.key === 'dashboard' || item.key === 'signout' || item.key === 'lastLogin') return true;
        
        const permissionMap = {
          'epin': 'epin_management',
          'franchise': 'epin_management',
          'members': ['kyc_verification', 'address_update', 'user_management'],
          'networkReports': ['reports', 'user_management'],
          'incomeReports': 'reports',
          'deposits': 'wallet_management',
          'withdrawals': 'wallet_management',
          'productsPackage': 'product_management',
          'productOrder': 'product_management',
          'transaction': 'wallet_management',
          'settings': 'SUPER_ADMIN_ONLY', // Sub-admins usually shouldn't access settings, but let's say 'user_management'
          'coupon': 'wallet_management',
          'newsPopup': 'product_management',
          'support': 'support',
          'rank': 'reports'
        };

        const reqPerm = permissionMap[item.key];
        if (!reqPerm) return false;
        if (reqPerm === 'SUPER_ADMIN_ONLY') return false;

        if (Array.isArray(reqPerm)) {
          return reqPerm.some(p => perms.includes(p));
        }
        return perms.includes(reqPerm);
      });
    }
    return menuItems;
  }, [user]);


  const toggleSection = (key) => {
    setOpenSection((prev) => (prev === key ? null : key));
  };

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  useEffect(() => {
    if (window.innerWidth <= 992) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname]);

  return (
    <div className={`admin-root ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 28C22.6274 28 28 22.6274 28 16C28 9.37258 22.6274 4 16 4C9.37258 4 4 9.37258 4 16C4 22.6274 9.37258 28 16 28Z" stroke="#A855F7" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M21 11L11 21" stroke="#EAB308" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {isSidebarOpen && (
              <div className="sidebar-brand-text">
                <h1>CRM</h1>
                <p>Your Customers, Your Power.</p>
              </div>
            )}
          </div>
        </div>
        <div className="sidebar-user">
          <div className="sidebar-user-meta">
            <div className="sidebar-avatar">👤</div>
            <div className="sidebar-user-details">
              <span className="sidebar-user-name">{adminName}</span>
              <span className="sidebar-user-id">ID: {adminUserId}</span>
            </div>
          </div>
          <button
            type="button"
            className="sidebar-toggle-btn"
            aria-label="Close sidebar"
            onClick={() => setIsSidebarOpen(false)}
          >
            ✕
          </button>
        </div>
        <div className="sidebar-section-title">MAIN NAVIGATION</div>

        <nav className="sidebar-nav">
          {filteredMenuItems.map((item) => {
            if (item.children) {
              const isOpen = openSection === item.key;
              return (
                <div key={item.key} className="sidebar-group">
                  <button
                    type="button"
                    className="sidebar-link sidebar-toggle"
                    onClick={() => toggleSection(item.key)}
                  >
                    <span>{item.label}</span>
                    <span>{isOpen ? '⌄' : '›'}</span>
                  </button>
                  {isOpen && (
                    <div className="sidebar-submenu">
                      {item.children.map((child) => (
                        <NavLink
                          key={child.to}
                          to={child.to}
                          className={({ isActive }) =>
                            `sidebar-sublink ${isActive ? 'sidebar-active' : ''}`
                          }
                        >
                          <span>{child.label}</span>
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            if (item.key === 'dashboard') {
              return (
                <NavLink
                  key={item.key}
                  to={item.to}
                  className={({ isActive }) => `sidebar-link ${isActive ? 'sidebar-active' : ''}`}
                >
                  <span><strong>{item.label}</strong></span>
                </NavLink>
              );
            }
            return (
              <NavLink
                key={item.key}
                to={item.to}
                className={({ isActive }) => `sidebar-link ${isActive ? 'sidebar-active' : ''}`}
              >
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </aside>

      <main className="admin-main">
        <header className="topbar">
          <div className="topbar-left">
            <button
              type="button"
              className="topbar-menu"
              aria-label="Toggle sidebar"
              onClick={toggleSidebar}
            >
              {isSidebarOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
              )}
            </button>
            <h2 className="topbar-page-title">{breadcrumb[breadcrumb.length - 1]}</h2>
          </div>
          
          <div className="topbar-search">
            <input type="text" placeholder="Search Here ..." className="topbar-search-input" />
            <svg className="topbar-search-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </div>

          <div className="topbar-right">
            <button className="topbar-icon-btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
            </button>
            <button className="topbar-icon-btn topbar-bell">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
              <span className="topbar-bell-dot"></span>
            </button>
            
            <div className="topbar-avatar" style={{ position: 'relative' }}>
              <button 
                type="button" 
                className="topbar-avatar-btn" 
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              >
                <div className="topbar-avatar-img-placeholder">
                   <img src="https://i.pravatar.cc/150?img=11" alt="avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </button>
              {isProfileDropdownOpen && (
                <div className="profile-dropdown" style={{
                  position: 'absolute',
                  top: '100%',
                  right: '0',
                  marginTop: '8px',
                  backgroundColor: 'var(--bg-card)',
                  boxShadow: 'var(--glass-shadow)',
                  borderRadius: '8px',
                  border: '1px solid var(--glass-border)',
                  padding: '10px 0',
                  minWidth: '160px',
                  zIndex: 1000
                }}>
                  <Link 
                    to="/settings/admin-settings" 
                    style={{ display: 'block', padding: '8px 16px', color: 'var(--text-main)', textDecoration: 'none' }}
                    onClick={() => setIsProfileDropdownOpen(false)}
                  >
                    Admin Profile
                  </Link>
                </div>
              )}
            </div>
          </div>
        </header>

        <section className="page-container">
          <div className="page-breadcrumb-row">
            <span className="crumb-home">Home</span>
            <span className="crumb-divider">/</span>
            <span>{breadcrumb[breadcrumb.length - 1]}</span>
          </div>
          <Outlet />
        </section>

        <footer className="page-footer">© Copyright <span style={{color: 'var(--secondary)', fontWeight: 'bold'}}>CRM</span> 2025. All rights reserved</footer>
      </main>
    </div>
  );
}

export default AdminLayout;
