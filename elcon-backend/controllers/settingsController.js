const SiteSetting = require('../models/SiteSetting');
const User = require('../models/User');

const defaultPlanSetting = {
  levelIncome: ['00.00', '20.00', '20.00', '20.00', '20.00', '20.00', '20.00', '20.00', '20.00', '20.00'],
  repurchaseIncome: ['10.00', '10.00', '10.00', '10.00', '10.00', '10.00', '10.00', '10.00', '10.00', '10.00'],
  donationIncome: ['300.00', '1000.00', '2000.00', '4000.00', '8000.00', '16000.00', '32000.00', '64000.00', '128000.00', '-'],
  tdsCharge: '5 %',
  adminCharges: '5 %',
  shippingCharges: '₹ 50',
  idRenewalCharge: '₹ 350',
};

const defaultBankAccount = {
  bankName: 'State Bank Of India',
  bankBranch: 'Pashan Pune',
  accountHolderName: 'Elcon Network',
  accountNo: '458578525894',
  accountType: 'Current Account',
  ifscCode: 'SBIN004736',
  upiId: 'Elcon.network@oksbi',
};

const ensureSeed = async () => {
  const plan = await SiteSetting.findOne({ settingKey: 'plan-setting' });
  if (!plan) await SiteSetting.create({ settingKey: 'plan-setting', data: defaultPlanSetting });
  const bank = await SiteSetting.findOne({ settingKey: 'bank-account' });
  if (!bank) await SiteSetting.create({ settingKey: 'bank-account', data: defaultBankAccount });
};

exports.getPlanSetting = async (req, res) => {
  try {
    await ensureSeed();
    const setting = await SiteSetting.findOne({ settingKey: 'plan-setting' });
    res.json({ success: true, planSetting: setting?.data || defaultPlanSetting });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updatePlanSetting = async (req, res) => {
  try {
    const { transactionPassword, ...planData } = req.body || {};

    const adminUser = await User.findById(req.user.id).select('+transactionPassword');
    if (!adminUser) {
      return res.status(404).json({ success: false, message: 'Admin user not found' });
    }

    const isMatch = await adminUser.matchTransactionPassword(transactionPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid transaction password' });
    }

    const setting = await SiteSetting.findOneAndUpdate(
      { settingKey: 'plan-setting' },
      { data: { ...defaultPlanSetting, ...planData } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    res.json({ success: true, planSetting: setting.data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getBankAccount = async (req, res) => {
  try {
    await ensureSeed();
    const setting = await SiteSetting.findOne({ settingKey: 'bank-account' });
    res.json({ success: true, bankAccount: setting?.data || defaultBankAccount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateBankAccount = async (req, res) => {
  try {
    const setting = await SiteSetting.findOneAndUpdate(
      { settingKey: 'bank-account' },
      { data: { ...defaultBankAccount, ...(req.body || {}) } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    res.json({ success: true, bankAccount: setting.data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const defaultTermsAndConditions = {
  content: '<h2>Terms and Conditions</h2><p>Default terms and conditions.</p>',
};

exports.getTermsAndConditions = async (req, res) => {
  try {
    const setting = await SiteSetting.findOne({ settingKey: 'terms-and-conditions' });
    if (!setting) {
      await SiteSetting.create({ settingKey: 'terms-and-conditions', data: defaultTermsAndConditions });
    }
    const currentSetting = await SiteSetting.findOne({ settingKey: 'terms-and-conditions' });
    res.json({ success: true, termsAndConditions: currentSetting?.data || defaultTermsAndConditions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateTermsAndConditions = async (req, res) => {
  try {
    const setting = await SiteSetting.findOneAndUpdate(
      { settingKey: 'terms-and-conditions' },
      { data: req.body },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    res.json({ success: true, termsAndConditions: setting.data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const defaultGlobalSettings = {
  registrationEnabled: true,
  defaultCouponAmount: 1000,
  couponDistributionEnabled: false,
  memberEpinGenerationEnabled: true,
  adminEpinGenerationEnabled: true,
  epinTransferEnabled: true,
  epinExpiryEnabled: false,
  autoEpinGeneration: false,
  walletSource: 'E-Wallet',
  enableOTP: true,
  dailyGenerationLimit: 10,
  minWalletBalance: 500,
  showTopEarners: true,
};

exports.getGlobalSettings = async (req, res) => {
  try {
    let setting = await SiteSetting.findOne({ settingKey: 'global-settings' });
    if (!setting) {
      setting = await SiteSetting.create({ settingKey: 'global-settings', data: defaultGlobalSettings });
    }
    res.json({ success: true, globalSettings: setting?.data || defaultGlobalSettings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateGlobalSettings = async (req, res) => {
  try {
    const setting = await SiteSetting.findOneAndUpdate(
      { settingKey: 'global-settings' },
      { data: { ...defaultGlobalSettings, ...(req.body || {}) } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    res.json({ success: true, globalSettings: setting.data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const defaultBranding = {
  logo: '',
  banners: []
};

exports.getBranding = async (req, res) => {
  try {
    let setting = await SiteSetting.findOne({ settingKey: 'website-branding' });
    if (!setting) {
      setting = await SiteSetting.create({ settingKey: 'website-branding', data: defaultBranding });
    }
    res.json({ success: true, branding: setting?.data || defaultBranding });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateBranding = async (req, res) => {
  try {
    const setting = await SiteSetting.findOneAndUpdate(
      { settingKey: 'website-branding' },
      { data: { ...defaultBranding, ...(req.body || {}) } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    res.json({ success: true, branding: setting.data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};