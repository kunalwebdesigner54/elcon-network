import { useEffect, useMemo, useState } from 'react';
import { NavLink, Link, Outlet, useLocation } from 'react-router-dom';
import './AdminLayout.css';

const menuItems = [
  { key: 'dashboard', label: 'Dashboard', to: '/dashboard', icon: 'fa-solid fa-house' },
  {
    key: 'epin',
    label: 'ePin',
    icon: 'fa-solid fa-ticket',
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
    icon: 'fa-solid fa-store',
    children: [
      { label: 'Create Epin Franchise', to: '/epin-franchise/list' },
      { label: 'Product Franchise Stock', to: '/product-franchise/manage' }
    ]
  },
  {
    key: 'members',
    label: 'Members',
    icon: 'fa-solid fa-users',
    children: [
      { label: 'KYC Request', to: '/members/kyc-request' },
      { label: 'All Members List', to: '/members/all-members-list' },
      { label: 'Member Information', to: '/members/member-information' },
      { label: 'Members Location', to: '/members/active-members' },
      { label: 'All-Member-Performance', to: '/members/all-member-performance' }
    ]
  },
  {
    key: 'networkReports',
    label: 'Network Reports',
    icon: 'fa-solid fa-sitemap',
    children: [
      { label: 'Network Explorer', to: '/network-reports/network-explorer' },
      { label: 'Downline List', to: '/network-reports/downline-list' }
    ]
  },
  {
    key: 'incomeReports',
    label: 'Income Reports',
    icon: 'fa-solid fa-chart-line',
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
    icon: 'fa-solid fa-money-bill-transfer',
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
    icon: 'fa-solid fa-money-bill-wave',
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
    icon: 'fa-solid fa-box-open',
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
    icon: 'fa-solid fa-cart-shopping',
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
    icon: 'fa-solid fa-list-check',
    children: [
      { label: 'Main Wallet', to: '/transaction/main-wallet' },
      { label: 'Transaction History', to: '/transactions/transaction-history' }
    ]
  },
  {
    key: 'settings',
    label: 'Settings',
    icon: 'fa-solid fa-gear',
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
    icon: 'fa-solid fa-tag',
    children: [
      { label: 'Discount Wallet Overview', to: '/coupon/discount-wallet-overview' },
      { label: 'Manage Discount Coupon', to: '/discount-coupon/manage' },
      { label: 'Discount Wallet Transaction', to: '/coupon/discount-wallet-transaction' }
    ]
  },
  {
    key: 'newsPopup',
    label: 'News & Popup',
    icon: 'fa-solid fa-bullhorn',
    children: [
      { label: 'Add New', to: '/news-popup/add-new' },
      { label: 'List All', to: '/news-popup/list-all' }
    ]
  },
  {
    key: 'support',
    label: 'Support',
    icon: 'fa-solid fa-headset',
    children: [
      { label: 'Support Section', to: '/support/support-section' },
      { label: 'Support Tickets', to: '/support/support-tickets' },
      { label: 'Chat Integration', to: '/support/chat-integration' }
    ]
  },
  {
    key: 'rank',
    label: 'Rank',
    icon: 'fa-solid fa-star',
    to: '/rank/rank-holders-list'
  },
  { key: 'lastLogin', label: 'Last Login Date & Time', icon: 'fa-solid fa-clock', to: '/last-login-date-time' },
  { key: 'signout', label: 'Sign Out', icon: 'fa-solid fa-right-from-bracket', to: '/sign-out' }
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
    <div className={`admin-root ${isSidebarOpen ? 'sidebar-open' : 'sidebar-collapsed'}`}>
      <aside className="sidebar">
        <div className="sidebar-brand">ELCON</div>
        <div className="sidebar-user">
          <div className="sidebar-user-meta">
            <div className="sidebar-avatar"><i className="fa-regular fa-user"></i></div>
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
            <i className="fa-solid fa-xmark"></i>
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {item.icon && <i className={item.icon} style={{ width: '20px', textAlign: 'center' }}></i>}
                      <span>{item.label}</span>
                    </div>
                    <span><i className={`fa-solid ${isOpen ? 'fa-angle-down' : 'fa-angle-right'}`}></i></span>
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {item.icon && <i className={item.icon} style={{ width: '20px', textAlign: 'center' }}></i>}
                    <strong>{item.label}</strong>
                  </div>
                </NavLink>
              );
            }
            return (
              <NavLink
                key={item.key}
                to={item.to}
                className={({ isActive }) => `sidebar-link ${isActive ? 'sidebar-active' : ''}`}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {item.icon && <i className={item.icon} style={{ width: '20px', textAlign: 'center' }}></i>}
                  <span>{item.label}</span>
                </div>
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
                <i className="fa-solid fa-bars"></i>
              </button>
            )}
            <h2 className="topbar-page-title">{breadcrumb[breadcrumb.length - 1] || 'Dashboard'}</h2>
          </div>
          
          <div className="topbar-center">
             <div className="topbar-search">
               <input type="text" placeholder="Search Here ..." className="topbar-search-input" />
               <span className="topbar-search-icon"><i className="fa-solid fa-magnifying-glass"></i></span>
             </div>
          </div>

          <div className="topbar-right">
            <button className="topbar-icon-btn" aria-label="Messages"><i className="fa-regular fa-envelope"></i></button>
            <button className="topbar-icon-btn" aria-label="Notifications">
               <i className="fa-regular fa-bell"></i>
               <span className="notification-dot"></span>
            </button>
            <div className="topbar-avatar" style={{ position: 'relative' }}>
              <button 
                type="button" 
                className="topbar-avatar-btn" 
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <div className="avatar-img"><i className="fa-regular fa-user"></i></div>
                <span className="avatar-chevron"><i className="fa-solid fa-angle-down"></i></span>
              </button>
              {isProfileDropdownOpen && (
                <div className="profile-dropdown" style={{
                  position: 'absolute',
                  top: '50px',
                  right: '0',
                  backgroundColor: '#1F1E2E',
                  border: '1px solid rgba(255,255,255,0.1)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                  borderRadius: '8px',
                  padding: '10px 0',
                  minWidth: '160px',
                  zIndex: 1000
                }}>
                  <Link 
                    to="/settings/admin-settings" 
                    style={{ display: 'block', padding: '8px 16px', color: '#fff', textDecoration: 'none' }}
                    onClick={() => setIsProfileDropdownOpen(false)}
                  >
                    Admin Profile
                  </Link>
                  {user.adminType !== 'SUB_ADMIN' && (
                    <Link 
                      to="/sub-admins/manage" 
                      style={{ display: 'block', padding: '8px 16px', color: '#fff', textDecoration: 'none' }}
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      Manage Sub-Admins
                    </Link>
                  )}
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

        <footer className="page-footer">Copyright © 2026 Elcon Network</footer>
      </main>
    </div>
  );
}

export default AdminLayout;
