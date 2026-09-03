import { useEffect, useMemo, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import './UserLayout.css';
import { getProfile } from '../../../api/authService';
import { getUser } from '../../../utils/auth';

const menuItems = [
  { key: 'dashboard', label: 'Dashboard', to: '/user/dashboard' },
  {
    key: 'myProfile',
    label: 'My Profile',
    children: [
      { label: 'View Profile', to: '/user/my-profile/show-profile' },
      { label: 'Update Profile', to: '/user/profile/update-profile' },
      { label: 'Change Login Password', to: '/user/my-profile/change-login-password' },
      { label: 'Update Trans. Password', to: '/user/my-profile/update-trans-password' }
    ]
  },
  {
    key: 'myNetwork',
    label: 'My Network',
    children: [
      { label: 'My Direct Network', to: '/user/my-network/my-direct-network' },
      { label: 'Network Explorer', to: '/user/my-network/network-explorer' },
      { label: 'Downline List', to: '/user/my-network/downline-list' }
    ]
  },
  {
    key: 'incomeReport',
    label: 'Income Report',
    children: [
      { label: 'Level Income', to: '/user/income-report/level-income' },
      { label: 'Repurchase Income', to: '/user/income-report/Repurchase-income' },
        { label: 'Datewise Income', to: '/user/income-report/Datewise-income' },
        { label: 'Daily Payout Report', to: '/user/income-report/Daily-Payout-Report' }
    ]
  },
  {
    key: 'donations',
    label: 'Donations',
    children: [
      { label: 'Given Help', to: '/user/donations/given-help' },
      { label: 'Recieved Help', to: '/user/donations/recieved-help' },
      { label: 'Donations Report', to: '/user/income-report/donations-income' }
    ]
  },
  {
    key: 'product',
    label: 'Products',
    children: [
      { label: 'Joining Package', to: '/user/product/joining-package' },
      { label: 'Shopping Products', to: '/user/product/shopping-products' },
      { label: 'Repurchase Products', to: '/user/product/repurchase-products' },
      { label: 'My Orders', to: '/user/product/my-orders' },
        { label: 'My Cart', to: '/user/product/my_cart' },
      { label: 'Delivery Status', to: '/user/product/delivery-status' }
    ]
  },
  {
    key: 'epin',
    label: 'ePin',
    children: [
      { label: 'Generate ePin', to: '/user/epin/generate-epin' },
      { label: 'Used ePin', to: '/user/epin/used-epin' },
      { label: 'Unused ePin', to: '/user/epin/unused-epin' },
      { label: 'List Of All ePin', to: '/user/epin/list-all-epin' },
      { label: 'Franchise List', to: '/user/epin-franchise/epin-franchise-list' },
      { label: 'Transfer ePin', to: '/user/epin/transfer-epin' },
      { label: 'ePin Transfer History', to: '/user/epin/epin-transfer-history' },
      { label: 'Franchise Delivery Report', to: '/user/epin/franchise-delivery-report' }
    ]
  },
  {
    key: 'productFranchise',
    label: 'Product Franchise',
    children: [
      { label: 'My Product Stock', to: '/user/product-franchise/stock' },
      { label: 'Sell Product', to: '/user/product-franchise/sell' },
      { label: 'Sales Report', to: '/user/product-franchise/sales-report' }
    ]
  },
  {
    key: 'planChartLetters',
    label: 'Plan Chart & Letters',
    children: [
      { label: 'Business Plan Chart', to: '/user/plan-chart-letters/business-plan-chart' },
      { label: 'Welcome Letter', to: '/user/plan-chart-letters/welcome-letter' },
      { label: 'Business Card', to: '/user/plan-chart-letters/business-card' },
      { label: 'Bank Information', to: '/user/plan-chart-letters/bank-information' }
    ]
  },
  {
    key: 'transactions',
    label: 'Transactions',
    children: [
      { label: 'Main Wallet', to: '/user/transactions/main-wallet' },
      { label: 'Transaction History', to: '/user/transactions/transaction-history' }
    ]
  },
  { key: 'kycRequest', label: 'KYC Request', to: '/user/kyc-request' },
    {
      key: 'deposit',
      label: 'Deposit',
      children: [
        { label: 'Deposit History', to: '/user/deposit/history' },
        { label: 'Withdrawal History', to: '/user/payment/withdrawal-history' }
      ]
    },
    {
      key: 'coupon',
      label: 'Coupon',
      children: [
        { label: 'Discount Coupon', to: '/user/coupon/discount-coupon' },
        { label: 'Transaction History', to: '/user/coupon/transaction-history' }
      ]
    },
  { key: 'ticketSupport', label: 'Ticket Support', to: '/user/ticket-support' },
  { key: 'newsEvents', label: 'News & Events', to: '/user/news-events' },
  { key: 'rank', label: 'My Rank', to: '/user/rank/my-rank' },
  { key: 'logout', label: 'Log Out', to: '/user/log-out' }
];

function toTitleCase(text) {
  return text
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function buildBreadcrumb(pathname) {
  const BREADCRUMB_OVERRIDES = {
    'donations-income': 'Donations Report',
  };

  const path = pathname.replace('/user/', '');
  const segments = path.split('/').filter(Boolean);
  if (!segments.length) {
    return 'Dashboard';
  }

  const lastSegment = segments[segments.length - 1];
  return BREADCRUMB_OVERRIDES[lastSegment] || toTitleCase(lastSegment);
}

function getDefaultOpenSection(pathname) {
  const matchedSection = menuItems.find((item) =>
    item.children?.some((child) => pathname.startsWith(child.to))
  );

  return matchedSection?.key ?? null;
}

function UserLayout() {
  
  const location = useLocation();
  const breadcrumb = useMemo(() => buildBreadcrumb(location.pathname), [location.pathname]);
  const showBackButton = location.pathname !== '/user/dashboard';
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [openSection, setOpenSection] = useState(() => getDefaultOpenSection(location.pathname));
  const [memberId, setMemberId] = useState('');
  const [userName, setUserName] = useState('');

  useEffect(() => {
    setOpenSection(getDefaultOpenSection(location.pathname));
  }, [location.pathname]);

  const toggleSection = (key) => {
    setOpenSection((prev) => (prev === key ? null : key));
  };

  useEffect(() => {
    if (window.innerWidth <= 992) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname]);

  useEffect(() => {
    // Intercept impersonation tokens from URL query parameters
    const queryParams = new URLSearchParams(window.location.search);
    const impersonateToken = queryParams.get('impersonateToken');
    const impersonateUser = queryParams.get('impersonateUser');

    if (impersonateToken && impersonateUser) {
      sessionStorage.setItem('impersonateToken', impersonateToken);
      sessionStorage.setItem('impersonateUser', impersonateUser);
      // Remove sensitive data from URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    // Try to read cached user from auth utility
    try {
      const stored = getUser();
      if (stored) {
        if (stored.memberId) setMemberId(stored.memberId);
        if (stored.name) setUserName(stored.name);
      }
    } catch (err) {
      // ignore
    }

    // Refresh profile from API to ensure authoritative memberId
    (async () => {
      try {
        const res = await getProfile();
        if (res?.success && res.data) {
          if (res.data.memberId) setMemberId(res.data.memberId);
          if (res.data.name) setUserName(res.data.name);
        }
      } catch (err) {
        // ignore
      }
    })();
  }, []);

  return (
    <div className={`user-root ${isSidebarOpen ? 'user-sidebar-open' : 'user-sidebar-collapsed'}`}>
      <aside className="user-sidebar">
        <div className="user-brand">ELCON</div>
        <div className="user-member-card">
          <div className="user-member-meta">
            <div className="user-member-avatar">👤</div>
            <div>
              <div className="member-label">Member ID</div>
              <div className="member-value">{memberId || '---'}</div>
            </div>
          </div>
          <button
            type="button"
            className="user-sidebar-toggle"
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            ✕
          </button>
        </div>
        <div className="user-nav-title">MAIN NAVIGATION</div>

        <nav className="user-nav">
          {menuItems.map((item) => {
            if (item.children) {
              const isOpen = openSection === item.key;
              return (
                <div key={item.key} className="user-nav-group">
                  <button
                    type="button"
                    className="user-nav-link user-nav-toggle"
                    onClick={() => toggleSection(item.key)}
                  >
                    <span>{item.label}</span>
                    <span>{isOpen ? '⌄' : '›'}</span>
                  </button>
                  {isOpen && (
                    <div className="user-submenu">
                      {item.children.map((child) => (
                        <NavLink
                          key={child.to}
                          to={child.to}
                          className={({ isActive }) =>
                            `user-submenu-link ${isActive ? 'user-nav-active' : ''}`
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
                  className={({ isActive }) => `user-nav-link ${isActive ? 'user-nav-active' : ''}`}
                >
                  <strong>{item.label}</strong>
                </NavLink>
              );
            }
            return (
              <NavLink
                key={item.key}
                to={item.to}
                className={({ isActive }) => `user-nav-link ${isActive ? 'user-nav-active' : ''}`}
              >
                {item.label}
              </NavLink>
            );
          })}
        </nav>
      </aside>

      <main className="user-main">
        <header className="user-topbar">
          <div className={`user-topbar-left ${showBackButton ? 'has-back' : ''}`}>
          
          {!isSidebarOpen && (
            <button
              type="button"
              className="user-menu-btn"
              onClick={() => setIsSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              ☰
            </button>
          )}
            <span className="user-top-title" style={{ fontSize: '15px', fontWeight: '600', lineHeight: '1.2' }}>
              {userName ? `Welcome, ${userName} !` : 'Welcome !'}
            </span>
          </div>
          <div className="user-topbar-right">
            <button className="user-topbar-cart-btn" type="button" aria-label="Cart">🛒</button>
          
          </div>
        </header>

        <section className="user-page-wrap">
          <div className="user-breadcrumb-row user-breadcrumb-right">
            <span className="user-breadcrumb-home">Home</span>
            <span>/</span>
            <span>{breadcrumb}</span>
          </div>
          <Outlet />
        </section>

        <footer className="user-footer">Copyright © 2026 Elcon Network</footer>
      </main>
    </div>
  );
}

export default UserLayout;
