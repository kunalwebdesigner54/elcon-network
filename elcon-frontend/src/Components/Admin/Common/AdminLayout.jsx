import { useEffect, useMemo, useState } from 'react';
import { NavLink, Link, Outlet, useLocation } from 'react-router-dom';
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
      { label: 'Repurchase Products', to: '/products-package/repurchase-products' }
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
      { label: 'Coupon Report', to: '/admin/coupon/coupon-report' },
      { label: 'Manage Discount Coupon', to: '/discount-coupon/manage' }
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
      return JSON.parse(localStorage.getItem('user')) || {};
    } catch {
      return {};
    }
  }, []);

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
          <div className="topbar-avatar" style={{ position: 'relative' }}>
            <button 
              type="button" 
              className="topbar-avatar-btn" 
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '24px' }}
            >
              👨‍💼
            </button>
            {isProfileDropdownOpen && (
              <div className="profile-dropdown" style={{
                position: 'absolute',
                top: '40px',
                right: '0',
                backgroundColor: '#fff',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                borderRadius: '4px',
                padding: '10px 0',
                minWidth: '160px',
                zIndex: 1000
              }}>
                <Link 
                  to="/settings/admin-settings" 
                  style={{ display: 'block', padding: '8px 16px', color: '#333', textDecoration: 'none' }}
                  onClick={() => setIsProfileDropdownOpen(false)}
                >
                  Admin Profile
                </Link>
                {user.adminType !== 'SUB_ADMIN' && (
                  <Link 
                    to="/sub-admins/manage" 
                    style={{ display: 'block', padding: '8px 16px', color: '#333', textDecoration: 'none' }}
                    onClick={() => setIsProfileDropdownOpen(false)}
                  >
                    Manage Sub-Admins
                  </Link>
                )}
              </div>
            )}
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

        <footer className="page-footer">Copyright © 2026 Elcon Network</footer>
      </main>
    </div>
  );
}

export default AdminLayout;