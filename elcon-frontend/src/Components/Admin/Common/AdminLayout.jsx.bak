import { useEffect, useMemo, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import './AdminLayout.css';

const menuItems = [
  { key: 'dashboard', label: 'Dashboard', to: '/dashboard' },
  {
    key: 'epin',
    label: 'ePin',
    children: [
      { label: 'ePin Request', to: '/epin/epin-request' },
      { label: 'Generate ePin', to: '/epin/generate-epin' },
      { label: 'Unused ePin', to: '/epin/unused-epin' },
      { label: 'Used ePin', to: '/epin/used-epin' },
      { label: 'All ePin', to: '/epin/all-epin' },
      { label: 'Delete ePin', to: '/epin/delete-epin' },
      { label: 'Transfer History', to: '/epin/transfer-history' },
      { label: 'ePin Franchise', to: '/epin/epin-franchise' }
    ]
  },
  {
    key: 'members',
    label: 'Members',
    children: [
      { label: 'KYC Request', to: '/members/kyc-request' },
      { label: 'All Members List', to: '/members/all-members-list' },
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
      { label: 'Level Income Reports', to: '/network-reports/level-income-reports' }
    ]
  },
  {
    key: 'incomeReports',
    label: 'Income Reports',
    children: [
      { label: 'Level Income Reports', to: '/income-reports/level-income-reports' },
      { label: 'Repurchase Income', to: '/income-report/Repurchase-income' },
      { label: 'Donation Report', to: '/income-reports/donation-report' },
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
    key: 'productsPackage',
    label: 'Products/Package',
    children: [
      { label: 'Joining Package', to: '/products-package/Joining-Package' },
      { label: 'Shopping Products', to: '/products-package/shopping-products' },
      { label: 'Repurchase Products', to: '/products-package/repurchase-products' }
    ]
  },
  {
    key: 'productOrder',
    label: 'Product Order',
    children: [
      { label: 'New Orders', to: '/product-order/new-orders' },
      { label: 'Pending Orders', to: '/product-order/pending-orders' },
      { label: 'Delivered Orders', to: '/product-order/delivered-orders' },
      { label: 'Rejected Orders', to: '/product-order/rejected-orders' },
      { label: 'All Orders', to: '/product-order/all-orders' }
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
    key: 'settings',
    label: 'Settings',
    children: [
      { label: 'Level Plan', to: '/settings/level-plan' },
      { label: 'Manage Taxes & Deduction', to: '/settings/manage-taxes-deduction' },
      { label: 'Bank Account', to: '/admin/setting/bank-account' },
      { label: 'Plan Setting', to: '/admin/setting/plan-setting' }
    ]
  },
  {
    key: 'coupon',
    label: 'Coupon',
    children: [
      { label: 'Coupon Report', to: '/admin/coupon/coupon-report' }
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

  const [openSection, setOpenSection] = useState(null);

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
    <div className={`admin-root ${isSidebarOpen ? 'sidebar-open' : 'sidebar-collapsed'}`}>
      <aside className="sidebar">
        <div className="sidebar-brand">IHH</div>
        <div className="sidebar-user">
          <div className="sidebar-user-meta">
            <div className="sidebar-avatar">👤</div>
            <span>Administrator</span>
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
          {menuItems.map((item) => {
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
                          {child.label}
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
                  <strong>{item.label}</strong>
                </NavLink>
              );
            }
            return (
              <NavLink
                key={item.key}
                to={item.to}
                className={({ isActive }) => `sidebar-link ${isActive ? 'sidebar-active' : ''}`}
              >
                {item.label}
              </NavLink>
            );
          })}
        </nav>
      </aside>

      <main className="admin-main">
        <header className="topbar">
          <div className={`topbar-left ${showBackButton ? 'has-back' : ''}`}>
            {!isSidebarOpen && (
              <button
                type="button"
                className="topbar-menu"
                aria-label="Open sidebar"
                onClick={toggleSidebar}
              >
                ☰
              </button>
            )}
          </div>
          <div className="topbar-avatar">👨‍💼</div>
        </header>

        <section className="page-container">
          <div className="page-breadcrumb-row">
            <span className="crumb-home">Home</span>
            <span className="crumb-divider">/</span>
            <span>{breadcrumb[breadcrumb.length - 1]}</span>
          </div>
          <Outlet />
        </section>

        <footer className="page-footer">Copyright © 2026 P2P Investment</footer>
      </main>
    </div>
  );
}

export default AdminLayout;