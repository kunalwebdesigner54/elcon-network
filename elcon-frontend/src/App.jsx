import RepurchaseProductsAdmin from './Components/Admin/ProductsPackage/RepurchaseProducts/RepurchaseProductsAdmin';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import AdminLayout from './Components/Admin/Common/AdminLayout';
import AdminBlankPage from './Components/Admin/Common/AdminBlankPage';
import Dashboard from './Components/Admin/Dashboard/Dashboard';
import MembersLocation from './Components/Admin/Members/MembersLocation/MembersLocation';
import KYCRequest from './Components/Admin/Members/KYCRequest/KYCRequest';
import AllMemberPerformance from './Components/Admin/Members/AllMemberPerformance/AllMemberPerformance';
import MyDirectReferral from './Components/Admin/Tree/MyDirectReferral/MyDirectReferral';
import DonationReport from './Components/Admin/NetworkReports/DonationReport/DonationReport';
import NetworkExplorer from './Components/Admin/NetworkReports/NetworkExplorer/NetworkExplorer';
import LevelIncome from './Components/Admin/Income/LevelIncome/LevelIncome';
import TicketHistory from './Components/Admin/SupportTicket/TicketHistory/TicketHistory';
import SignOut from './Components/Admin/SignOut/SignOut';
import EPinRequest from './Components/Admin/ePin/EPinRequest';
import NewsList from './Components/Admin/NewsPopup/ListAll/ListAll';
import NewsAdd from './Components/Admin/NewsPopup/AddNew/AddNew';
import GenerateEPin from './Components/UserPanel/ePin/GenerateEPin';
import UsedEPin from './Components/UserPanel/ePin/UsedEPin';
import UnusedEPin from './Components/UserPanel/ePin/UnusedEPin';
import ListAllEPin from './Components/UserPanel/ePin/ListAllEPin';
import TransferEPin from './Components/UserPanel/ePin/TransferEPin';
import TransferHistory from './Components/Admin/ePin/TransferHistory';
import EPinTransferHistory from './Components/UserPanel/ePin/EPinTransferHistory';
import DeletedEPin from './Components/UserPanel/ePin/DeletedEPin';
import AdminLogin from './Components/AdminLogin';
import ProtectedRoute from './Components/ProtectedRoute';
import AdminRoute from './Components/AdminRoute';
import UserLayout from './Components/UserPanel/Common/UserLayout';
import UserBlankPage from './Components/UserPanel/Common/UserBlankPage';
import BuyEPin from './Components/UserPanel/Common/BuyEPin';
import UserLogin from './Components/UserPanel/UserLogin/UserLogin';
import UserDashboard from './Components/UserPanel/UserDashboard/UserDashboard';
import MyProfile from './Components/UserPanel/Profile/MyProfile/MyProfile';
import UpdateProfile from './Components/UserPanel/Profile/UpdateProfile/UpdateProfile';
import UpdateBankDetails from './Components/UserPanel/Profile/UpdateBankDetails/UpdateBankDetails';
import UpdateTransPassword from './Components/UserPanel/Profile/ChangePassword/UpdateTransPassword';
import ChangePassword from './Components/UserPanel/Profile/ChangePassword/ChangePassword';
import UserKYCRequest from './Components/UserPanel/Profile/KYCRequest/KYCRequest';
import DirectList from './Components/UserPanel/Team/DirectList/DirectList';
import UserMyTree from './Components/UserPanel/Team/MyTree/MyTree';
import MyTeam from './Components/UserPanel/Team/MyTeam/MyTeam';
import SelfPaymentHistory from './Components/UserPanel/Payment/SelfPaymentHistory/SelfPaymentHistory';
import GivenHelp from './Components/UserPanel/Donations/GivenHelp';
import PaymentRequestHistory from './Components/UserPanel/Payment/PaymentRequestHistory/PaymentRequestHistory';
import DepositHistory from './Components/UserPanel/Payment/DepositHistory/DepositHistory';
import UserLevelIncome from './Components/UserPanel/Income/LevelIncome/LevelIncome';
import DonationsIncome from './Components/UserPanel/Income/DonationsIncome/DonationsIncome';
import RepurchaseIncome from './Components/UserPanel/Income/RepurchaseIncome/RepurchaseIncome';
import AdminRepurchaseIncome from './Components/Admin/Income/RepurchaseIncome/RepurchaseIncome';
import CreateTicket from './Components/UserPanel/SupportTicket/CreateTicket/CreateTicket';
import UserSignOut from './Components/UserPanel/SignOut/UserSignOut';
import PublicLayout from './Components/Public/Common/PublicLayout';
import Home from './Components/Public/Home/Home';
import AboutUs from './Components/Public/About/AboutUs';
import HelpingProcess from './Components/Public/HelpingProcess/HelpingProcess';
import OurActivity from './Components/Public/OurActivity/OurActivity';
import Gallery from './Components/Public/Gallery/Gallery';
import Contact from './Components/Public/Contact/Contact';
import Register from './Components/Public/Register/Register';
import AllMembersList from './Components/Admin/Members/AllMembersList/AllMembersList';
import ReceivedHelp from './Components/UserPanel/Payment/PaymentRequest/ReceivedHelp';
import TransactionHistory from './Components/UserPanel/Transactions/TransactionHistory/TransactionHistory';
import AdminTransactionHistory from './Components/Admin/Transactions/TransactionHistory/TransactionHistory';
import WelcomeLetter from './Components/UserPanel/PlanChartLetters/WelcomeLetter/WelcomeLetter';
import JoiningPackage from './Components/UserPanel/Product/JoiningPackage/JoiningPackage';
import ShoppingProducts from './Components/UserPanel/Product/ShoppingProducts/ShoppingProducts';
import RepurchaseProducts from './Components/UserPanel/Product/RepurchaseProducts/RepurchaseProducts';
import ProductDetails from './Components/UserPanel/Product/ProductDetails/ProductDetails';
import MyOrders from './Components/UserPanel/Product/MyOrders/MyOrders';
import OrderDetails from './Components/UserPanel/Product/MyOrders/OrderDetails';
import CouponReport from './Components/Admin/Coupon/CouponReport/CouponReport';
import DiscountCoupon from './Components/UserPanel/Coupon/DiscountCoupon/DiscountCoupon';
import JoiningPackageAdmin from './Components/Admin/ProductsPackage/JoiningPackage/JoiningPackageAdmin';
import ShoppingProductsAdmin from './Components/Admin/ProductsPackage/ShoppingProducts/ShoppingProductsAdmin';
import AddJoiningPackage from './Components/Admin/ProductsPackage/JoiningPackage/AddJoiningPackage/AddJoiningPackage';
import AddShoppingProducts from './Components/Admin/ProductsPackage/ShoppingProducts/AddShoppingProducts/AddShoppingProducts';
import AddRepurchaseProducts from './Components/Admin/ProductsPackage/RepurchaseProducts/AddRepurchaseProducts/AddRepurchaseProducts';
import EpinFranchiseList from './Components/UserPanel/ePin/EpinFranchiseList/EpinFranchiseList';
import AdminEpinFranchiseList from './Components/Admin/ePin/EpinFranchiseList/EpinFranchiseList';
import AddEpinFranchise from './Components/Admin/ePin/AddEpinFranchise/AddEpinFranchise';
import PendingDeposits from './Components/Admin/Deposits/PendingDeposits/PendingDeposits';
import ApproveDeposits from './Components/Admin/Deposits/ApproveDeposits/ApproveDeposits';
import SuccessfulDeposits from './Components/Admin/Deposits/SuccessfulDeposits/SuccessfulDeposits';
import RejectedDeposits from './Components/Admin/Deposits/RejectedDeposits/RejectedDeposits';
import AllDeposits from './Components/Admin/Deposits/AllDeposits/AllDeposits';
import TdsReport from './Components/Admin/Income/TdsReport/TdsReport';
import MyCart from './Components/UserPanel/Product/MyCart/MyCart';
import CompletePayment from './Components/UserPanel/Payment/CompletePayment/CompletePayment';
import AddDepositFunds from './Components/UserPanel/Payment/AddDepositFunds/AddDepositFunds';
import Withdraw from './Components/UserPanel/Payment/Withdraw/Withdraw';
import AdminBankAccount from './Components/Admin/Setting/BankAccount/BankAccount';
import PlanSetting from './Components/Admin/Setting/PlanSetting/PlanSetting';

import UserDatewiseIncome from './Components/UserPanel/Income/DatewiseIncome/DatewiseIncome';
import UserDailyPayoutReport from './Components/UserPanel/Income/DailyPayoutReport/DailyPayoutReport';
import AdminDatewiseIncome from './Components/Admin/Income/DatewiseIncome/DatewiseIncome';
import AdminDailyPayoutReport from './Components/Admin/Income/DailyPayoutReport/DailyPayoutReport';
import AdminLevelIncomeReports from './Components/Admin/Income/LevelIncomeReports/LevelIncomeReports';
import AllWithdrawalRequest from './Components/Admin/Payment/AllWithdrawalRequest/AllWithdrawalRequest';
import ApproveWithdrawalRequest from './Components/Admin/Payment/ApproveWithdrawalRequest/ApproveWithdrawalRequest';
import PendingWithdrawalRequest from './Components/Admin/Payment/PendingWithdrawalRequest/PendingWithdrawalRequest';
import RejectWithdrawalRequest from './Components/Admin/Payment/RejectWithdrawalRequest/RejectWithdrawalRequest';
import WithdrawalHistory from './Components/UserPanel/Payment/WithdrawalHistory/WithdrawalHistory';
import SucceedWithdrawalRequest from './Components/Admin/Payment/SucceedWithdrawalRequest/SucceedWithdrawalRequest';

import AdminRankHoldersList from './Components/Admin/Rank/AdminRankHoldersList';
import UserMyRank from './Components/UserPanel/Rank/UserMyRank';
import InvoicePage from './Components/UserPanel/Product/MyOrders/InvoicePage';
import AllOrders from './Components/Admin/ProductOrder/AllOrders/AllOrders';
import PendingOrders from './Components/Admin/ProductOrder/PendingOrders/PendingOrders';
import ConfirmOrders from './Components/Admin/ProductOrder/ConfirmOrders/ConfirmOrders';
import ProcessingOrders from './Components/Admin/ProductOrder/ProcessingOrders/ProcessingOrders';
import DispatchedOrders from './Components/Admin/ProductOrder/DispatchedOrders/DispatchedOrders';
import DeliveredOrders from './Components/Admin/ProductOrder/DeliveredOrders/DeliveredOrders';
import ReturnedOrders from './Components/Admin/ProductOrder/ReturnedOrders/ReturnedOrders';
import CancelledOrders from './Components/Admin/ProductOrder/CancelledOrders/CancelledOrders';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<UserLogin />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/invoice" element={<ProtectedRoute><InvoicePage /></ProtectedRoute>} />

        <Route path="/" element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="about-us" element={<AboutUs />} />
          <Route path="helping-process" element={<HelpingProcess />} />
          <Route path="our-activity" element={<OurActivity />} />
          <Route path="gallery" element={<Gallery />} />
          <Route path="contact" element={<Contact />} />
          <Route path="registration" element={<Register />} />
          <Route path="user-login" element={<UserLogin />} />
        </Route>

        <Route path="/user" element={<ProtectedRoute><UserLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/user/dashboard" replace />} />
          <Route path="dashboard" element={<UserDashboard />} />

          <Route path="my-profile/show-profile" element={<MyProfile />} />
          <Route path="profile/update-profile" element={<UpdateProfile />} />
          <Route path="my-profile/change-login-password" element={<ChangePassword />} />
          <Route path="my-profile/update-trans-password" element={<UpdateTransPassword />} />

          <Route path="plan-chart-letters/business-plan-chart" element={<UserBlankPage />} />
          <Route path="plan-chart-letters/welcome-letter" element={<WelcomeLetter />} />
          <Route path="plan-chart-letters/business-card" element={<UserBlankPage />} />
          <Route path="plan-chart-letters/bank-information" element={<UserBlankPage />} />

          <Route path="kyc-request" element={<UserKYCRequest />} />

          <Route path="my-network/my-direct-network" element={<DirectList />} />
          <Route path="my-network/network-explorer" element={<UserMyTree />} />
          <Route path="my-network/downline-list" element={<MyTeam />} />

          <Route path="income-report/level-income" element={<UserLevelIncome />} />
          <Route path="income-report/donations-income" element={<DonationsIncome />} />
          <Route path="income-report/Repurchase-income" element={<RepurchaseIncome />} />
          <Route path="income-report/Datewise-income" element={<UserDatewiseIncome />} />
          <Route path="income-report/Daily-Payout-Report" element={<UserDailyPayoutReport />} />

          <Route path="donations/given-help" element={<GivenHelp />} />
          <Route path="donations/recieved-help" element={<ReceivedHelp />} />
          <Route path="donations/ReceivedHelp" element={<ReceivedHelp />} />

          <Route path="product/joining-package" element={<JoiningPackage />} />
          <Route path="product/shopping-products" element={<ShoppingProducts />} />
          <Route path="product/my_cart" element={<MyCart />} />
          <Route path="product/product_details" element={<ProductDetails />} />
          <Route path="product/repurchase-products" element={<RepurchaseProducts />} />
          <Route path="product/my-orders" element={<MyOrders />} />
          <Route path="product/my-orders/details/:orderNo" element={<OrderDetails />} />
          <Route path="coupon/discount-coupon" element={<DiscountCoupon />} />
          <Route path="product/product-list" element={<JoiningPackage />} />
          <Route path="product/product-order" element={<ShoppingProducts />} />
          <Route path="product/delivery-status" element={<UserBlankPage />} />

          <Route path="epin/buy-epin" element={<BuyEPin />} />
          <Route path="epin/generate-epin" element={<GenerateEPin />} />
          <Route path="epin/used-epin" element={<UsedEPin />} />
          <Route path="epin/unused-epin" element={<UnusedEPin />} />
          <Route path="epin/list-all-epin" element={<ListAllEPin />} />
          <Route path="epin/transfer-epin" element={<TransferEPin />} />
          <Route path="epin/epin-transfer-history" element={<EPinTransferHistory />} />
          <Route path="epin/deleted-epin" element={<DeletedEPin />} />
          <Route path="epin-franchise/epin-franchise-list" element={<EpinFranchiseList />} />

          <Route path="transactions/main-wallet" element={<UserBlankPage />} />
          <Route path="transactions/transaction-history" element={<TransactionHistory />} />

          <Route path="ticket-support" element={<CreateTicket />} />
          <Route path="news-events" element={<UserBlankPage />} />
          <Route path="rank/my-rank" element={<UserMyRank />} />
          <Route path="log-out" element={<UserSignOut />} />

          <Route path="profile/my-profile" element={<MyProfile />} />
          <Route path="profile/change-password" element={<ChangePassword />} />
          <Route path="profile/update-bank-details" element={<UpdateBankDetails />} />
          <Route path="team/direct-list" element={<DirectList />} />
          <Route path="team/my-tree" element={<UserMyTree />} />
          <Route path="team/my-team" element={<MyTeam />} />
          <Route path="payment/self-payment-history" element={<SelfPaymentHistory />} />
          <Route path="payment/payment-request-history" element={<PaymentRequestHistory />} />
          <Route path="payment/withdrawal-history" element={<WithdrawalHistory />} />
          <Route path="payment/complete-payment" element={<CompletePayment />} />
          <Route path="payment/withdraw" element={<Withdraw />} />
          <Route path="deposit/history" element={<DepositHistory />} />
          <Route path="deposit/add-funds" element={<AddDepositFunds />} />
          <Route path="income/level-income" element={<UserLevelIncome />} />
          <Route path="support/create-ticket" element={<CreateTicket />} />
          <Route path="sign-out" element={<UserSignOut />} />

          <Route path="*" element={<Navigate to="/user/dashboard" replace />} />
        </Route>

        {/* NOTE: admin settings routes are nested under AdminLayout below so sidebar shows */}

        <Route path="/" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />

          <Route path="epin/epin-request" element={<EPinRequest />} />
          <Route path="epin/generate-epin" element={<GenerateEPin />} />
          <Route path="epin/unused-epin" element={<UnusedEPin />} />
          <Route path="epin/used-epin" element={<UsedEPin />} />
          <Route path="epin/all-epin" element={<ListAllEPin />} />
          <Route path="epin/delete-epin" element={<DeletedEPin />} />
          <Route path="epin/transfer-history" element={<TransferHistory />} />
          <Route path="epin/epin-franchise" element={<AdminEpinFranchiseList />} />
          <Route path="epin/epin-franchise/add-epin-franchise" element={<AddEpinFranchise />} />
          {/* Removed Admin ePin components from user panel routes. Use only user panel ePin components. */}

          <Route path="members/kyc-request" element={<KYCRequest />} />
          <Route path="members/all-members" element={<AllMembersList />} />
          <Route path="members/all-member-performance" element={<AllMemberPerformance />} />
          <Route path="members/active-members" element={<MembersLocation />} />
       

          <Route path="members/all-members-list" element={<AllMembersList />} />

          <Route path="network-reports/network-explorer" element={<NetworkExplorer />} />
          <Route path="network-reports/downline-list" element={<MyDirectReferral />} />
          <Route path="network-reports/level-income-reports" element={<LevelIncome />} />
          <Route path="network-reports/donation-report" element={<Navigate to="/income-reports/donation-report" replace />} />
          <Route path="network-reports/upgrade-reports" element={<Navigate to="/income-reports/donation-report" replace />} />

          <Route path="income-reports/level-income-reports" element={<AdminLevelIncomeReports />} />
          <Route path="income-reports/donation-report" element={<DonationReport />} />
          <Route path="income-report/Repurchase-income" element={<AdminRepurchaseIncome />} />
          <Route path="income-report/Tds-Report" element={<TdsReport />} />
          <Route path="income-report/Datewise-income" element={<AdminDatewiseIncome />} />
          <Route path="income-report/Daily-Payout-Report" element={<AdminDailyPayoutReport />} />

          <Route path="deposits/pending-deposits" element={<PendingDeposits />} />
          <Route path="deposits/approve-deposits" element={<ApproveDeposits />} />
          <Route path="deposits/successful-deposits" element={<SuccessfulDeposits />} />
          <Route path="deposits/rejected-deposits" element={<RejectedDeposits />} />
          <Route path="deposits/all-deposits" element={<AllDeposits />} />

          <Route path="coupon/coupon-report" element={<CouponReport />} />
          <Route path="admin/coupon/coupon-report" element={<CouponReport />} />

          <Route path="products-package/Joining-Package" element={<JoiningPackageAdmin />} />
          <Route path="products-package/Joining-Package/add-new" element={<AddJoiningPackage />} />
          <Route path="products-package/shopping-products" element={<ShoppingProductsAdmin />} />
          <Route path="products-package/shopping-products/add-new" element={<AddShoppingProducts />} />
          <Route path="products-package/repurchase-products" element={<RepurchaseProductsAdmin />} />
          <Route path="products-package/repurchase-products/add-new" element={<AddRepurchaseProducts />} />
          <Route path="products-package/add-products" element={<JoiningPackageAdmin />} />
          <Route path="products-package/modify-product" element={<ShoppingProductsAdmin />} />
          <Route path="products-package/rearrange-products" element={<AdminBlankPage />} />

          <Route path="product-order/all-orders" element={<AllOrders />} />
          <Route path="product-order/pending-orders" element={<PendingOrders />} />
          <Route path="product-order/confirm-orders" element={<ConfirmOrders />} />
          <Route path="product-order/processing-orders" element={<ProcessingOrders />} />
          <Route path="product-order/dispatched-orders" element={<DispatchedOrders />} />
          <Route path="product-order/delivered-orders" element={<DeliveredOrders />} />
          <Route path="product-order/returned-orders" element={<ReturnedOrders />} />
          <Route path="product-order/cancelled-orders" element={<CancelledOrders />} />

          <Route path="transaction/main-wallet" element={<AdminBlankPage />} />
          <Route path="transactions/transaction-history" element={<AdminTransactionHistory />} />
          <Route path="withdrawals/all-request" element={<AllWithdrawalRequest />} />
          <Route path="withdrawals/approved-request" element={<ApproveWithdrawalRequest />} />
          <Route path="withdrawals/pending-request" element={<PendingWithdrawalRequest />} />
          <Route path="withdrawals/reject-request" element={<RejectWithdrawalRequest />} />
          <Route path="withdrawals/succeed-request" element={<SucceedWithdrawalRequest />} />

          <Route path="settings/level-plan" element={<AdminBlankPage />} />
          <Route path="settings/manage-taxes-deduction" element={<AdminBlankPage />} />
          <Route path="admin/setting/bank-account" element={<AdminBankAccount />} />
          <Route path="admin/setting/plan-setting" element={<PlanSetting />} />

          <Route path="news-popup/add-new" element={<NewsAdd />} />
          <Route path="news-popup/list-all" element={<NewsList />} />

          <Route path="support/support-section" element={<AdminBlankPage />} />
          <Route path="support/support-tickets" element={<TicketHistory />} />
          <Route path="support/chat-integration" element={<AdminBlankPage />} />

          <Route path="rank/rank-holders-list" element={<AdminRankHoldersList />} />
          <Route path="last-login-date-time" element={<AdminBlankPage />} />
          <Route path="sign-out" element={<SignOut />} />

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;