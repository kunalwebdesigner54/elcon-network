import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { City, Country, State } from 'country-state-city';
import { getDistricts } from 'india-state-district';
import PublicPageHeader from '../Common/PublicPageHeader';
import { registerUser, getSponsorDetails, getJoiningPackages, verifyEpin } from '../../../api/authService';
import { getGlobalSettings } from '../../../api/managementService';
import Swal from 'sweetalert2';
import './Register.css';

const INDIA_COUNTRY_CODE = 'IN';
const joiningPackageOptions = [
  'Elcon Anion Sanitary Pads - 8',
  'Elcon Anion Sanitary Pads - 32',
  'Elcon Diabe Care - 8',
  'Elcon Omega -3',
  'Elcon Calcium',
  'Elcon Smart Watch',
  'Foce Watch',
  'Gold Head Phone',
  'Bose Head Phonos',
  'HP LAPTOP'
];

function Register() {
  const navigate = useNavigate();
  const [sponsorId, setSponsorId] = useState('');
  const [sponsorName, setSponsorName] = useState('');
  const [applicantName, setApplicantName] = useState('');
  const [contactNo, setContactNo] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [aadharNo, setAadharNo] = useState('');
  const [address, setAddress] = useState('');
  const [country, setCountry] = useState(INDIA_COUNTRY_CODE);
  const [state, setState] = useState('');
  const [district, setDistrict] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [joiningPackage, setJoiningPackage] = useState('');
  const [epin, setEpin] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sponsorLoading, setSponsorLoading] = useState(false);
  const [sponsorError, setSponsorError] = useState('');
  const [registrationEnabled, setRegistrationEnabled] = useState(true);
  const [checkingSettings, setCheckingSettings] = useState(true);
  const [packageList, setPackageList] = useState([]);
  const [selectedPackageObj, setSelectedPackageObj] = useState(null);
  const [epinCheckStatus, setEpinCheckStatus] = useState(null);

  const countryOptions = useMemo(() => Country.getAllCountries(), []);

  // Fetch joining packages dynamically with costs
  useEffect(() => {
    getJoiningPackages()
      .then((res) => {
        if (res.success && Array.isArray(res.packages) && res.packages.length > 0) {
          setPackageList(res.packages);
        } else {
          setPackageList(joiningPackageOptions.map(name => ({ name, price: 350 })));
        }
      })
      .catch(() => {
        setPackageList(joiningPackageOptions.map(name => ({ name, price: 350 })));
      });
  }, []);

  const verifyEpinMatch = async (epinVal, pkgName) => {
    if (!epinVal || epinVal.trim().length < 4) {
      setEpinCheckStatus(null);
      return;
    }

    setEpinCheckStatus({ loading: true, message: 'Verifying E-Pin...' });

    try {
      const res = await verifyEpin({ epin: epinVal.trim(), packageName: pkgName });
      setEpinCheckStatus({
        loading: false,
        valid: res.valid,
        matched: res.matched,
        message: res.message,
        epinAmount: res.epinAmount,
        packageAmount: res.packageAmount,
      });
    } catch (err) {
      const msg = err?.response?.data?.message || 'Invalid E-Pin or already used.';
      setEpinCheckStatus({
        loading: false,
        valid: false,
        matched: false,
        message: `⚠️ ${msg}`,
      });
    }
  };

  const handlePackageChange = (e) => {
    const val = e.target.value;
    setJoiningPackage(val);
    const found = packageList.find((p) => p.name === val) || null;
    setSelectedPackageObj(found);
    if (epin.trim()) {
      verifyEpinMatch(epin.trim(), val);
    }
  };

  const handleEpinChange = (e) => {
    const val = e.target.value;
    setEpin(val);
    if (val.trim().length >= 4) {
      verifyEpinMatch(val.trim(), joiningPackage);
    } else {
      setEpinCheckStatus(null);
    }
  };

  // Auto-fetch sponsor name when sponsor ID is entered
  useEffect(() => {
    // Prefill sponsorId from URL query `ref` if present (share links use ?ref=MEMBERID)
    try {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get('ref') || params.get('sponsor');
      if (ref) setSponsorId(ref);
    } catch (err) {
      // ignore
    }

    if (!sponsorId || sponsorId.trim() === '') {
      setSponsorName('');
      setSponsorError('');
      return;
    }

    const fetchSponsor = async () => {
      setSponsorLoading(true);
      setSponsorError('');
      try {
        const response = await getSponsorDetails(sponsorId);
        if (response.success && response.data) {
          setSponsorName(response.data.name || '');
          setSponsorError('');
        }
      } catch (err) {
        const errorMessage = err?.response?.data?.message || 'Sponsor not found';
        setSponsorError(errorMessage);
        setSponsorName('');
      } finally {
        setSponsorLoading(false);
      }
    };

    // Debounce to avoid too many API calls while typing
    const timer = setTimeout(fetchSponsor, 500);
    return () => clearTimeout(timer);
  }, [sponsorId]);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await getGlobalSettings();
        if (res.success && res.globalSettings) {
          setRegistrationEnabled(res.globalSettings.registrationEnabled !== false);
        }
      } catch (err) {
        console.error('Failed to fetch global settings', err);
      } finally {
        setCheckingSettings(false);
      }
    };
    fetchSettings();
  }, []);

  const stateOptions = useMemo(() => {
    if (!country) return [];
    return State.getStatesOfCountry(country);
  }, [country]);

  const districtOptions = useMemo(() => {
    if (!country || !state) return [];

    if (country === INDIA_COUNTRY_CODE) {
      return getDistricts(state);
    }

    const cityNames = City.getCitiesOfState(country, state).map((item) => item.name);
    return [...new Set(cityNames)];
  }, [country, state]);

  const cityOptions = useMemo(() => {
    if (!country || !state) return [];
    return City.getCitiesOfState(country, state);
  }, [country, state]);

  const handleCountryChange = (event) => {
    setCountry(event.target.value);
    setState('');
    setDistrict('');
    setCity('');
  };

  const handleStateChange = (event) => {
    setState(event.target.value);
    setDistrict('');
    setCity('');
  };

  const handleDistrictChange = (event) => {
    setDistrict(event.target.value);
    setCity('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!joiningPackage || joiningPackage.trim() === '') {
      setError('Please select a Joining Package');
      return;
    }

    if (!epin || epin.trim() === '') {
      setError('Please enter a valid E-Pin');
      return;
    }

    if (epinCheckStatus && epinCheckStatus.matched === false) {
      setError(epinCheckStatus.message || 'E-Pin amount and selected Package amount must match!');
      return;
    }

    if (password !== confirmPassword) {
      setError('Password and confirm password do not match');
      return;
    }

    if (!acceptedTerms) {
      setError('You must agree to the Terms & Conditions');
      return;
    }

    setLoading(true);

    try {
      const data = await registerUser({
        sponsorId,
        sponsorName,
        name: applicantName,
        contactNo,
        dateOfBirth,
        email,
        aadharNo,
        address,
        country,
        state,
        district,
        city,
        pincode,
        joiningPackage,
        epin,
        password,
        acceptedTerms,
      });

	sessionStorage.setItem('token', data.token);
	sessionStorage.setItem('user', JSON.stringify(data.user));

      const registeredUser = data.user || {};
      const memberId = registeredUser.memberId || 'Pending';
      const memberName = registeredUser.name || applicantName;

      await Swal.fire({
        title: 'Registration Successful!',
        html: `
          <div style="font-size: 16px; margin-bottom: 15px;">Welcome to Elcon Network!</div>
          <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); margin-top: 15px; text-align: left;">
            <div style="margin-bottom: 8px; font-size: 15px;">
              <span style="color: #aaa; margin-right: 8px;">Name:</span>
              <strong style="color: #fff;">${memberName}</strong>
            </div>
            <div style="font-size: 15px;">
              <span style="color: #aaa; margin-right: 8px;">Member ID:</span>
              <strong style="color: #00e5ff; font-size: 18px;">${memberId}</strong>
            </div>
          </div>
          <div style="margin-top: 15px; font-size: 13px; color: #888;">Please save your Member ID for future login.</div>
        `,
        icon: 'success',
        confirmButtonText: 'CONTINUE',
        confirmButtonColor: '#00e5ff',
        background: '#1a1f2c',
        color: '#fff'
      });

      navigate('/user/dashboard');
    } catch (requestError) {
      const message = requestError?.response?.data?.message || 'Registration failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PublicPageHeader title="Registration" />
      <section className="public-page">
        <div className="public-container">
          <div className="register-card">
            <h2 className="register-title" style={{ color: '#fff' }}>Registration Form</h2>

            {checkingSettings ? (
              <div style={{ color: '#fff', textAlign: 'center', padding: '20px' }}>Loading...</div>
            ) : !registrationEnabled ? (
              <div style={{ padding: '30px', textAlign: 'center' }}>
                <h3 style={{ color: '#ff4d4f', marginBottom: '15px' }}>Registration Temporarily Paused</h3>
                <p style={{ color: '#ddd' }}>
                  We are currently not accepting new registrations. Please check back later or contact support if you need assistance.
                </p>
              </div>
            ) : (
              <>
                {error ? <div className="register-error-message">{error}</div> : null}

                <form className="register-form" noValidate onSubmit={handleSubmit}>
              <div className="register-grid">
                <div className="register-field">
                  <label htmlFor="sponsorId">
                    Sponsor ID <span className="register-required">*</span>
                  </label>
                  <input
                    id="sponsorId"
                    type="text"
                    placeholder="Enter sponsor ID"
                    value={sponsorId}
                    onChange={(event) => setSponsorId(event.target.value)}
                  />
                  {sponsorError && <div style={{ fontSize: '14px', color: '#dc3545', marginTop: '4px' }}>{sponsorError}</div>}
                </div>

                <div className="register-field">
                  <label htmlFor="sponsorName">
                    Sponsor Name
                    {sponsorLoading && <span style={{ marginLeft: '8px', color: '#666' }}>Loading...</span>}
                  </label>
                  <input
                    id="sponsorName"
                    type="text"
                    placeholder="Sponsor name will auto-populate"
                    value={sponsorName}
                    onChange={(event) => setSponsorName(event.target.value)}
                    readOnly={sponsorId && sponsorName && !sponsorError}
                    style={{
                      backgroundColor: sponsorId && sponsorName && !sponsorError ? 'rgba(0, 0, 0, 0.2)' : undefined,
                      cursor: sponsorId && sponsorName && !sponsorError ? 'not-allowed' : 'text'
                    }}
                  />
                </div>

                <div className="register-field register-full-row">
                  <label htmlFor="applicantName">
                    Applicant Name <span className="register-required">*</span>
                  </label>
                  <input
                    id="applicantName"
                    type="text"
                    placeholder="Enter applicant's name as per AadhaarCard"
                    value={applicantName}
                    onChange={(event) => setApplicantName(event.target.value)}
                  />
                </div>

                <div className="register-field">
                  <label htmlFor="contactNo">
                    Contact No <span className="register-required">*</span>
                  </label>
                  <input
                    id="contactNo"
                    type="tel"
                    placeholder="Enter contact number"
                    value={contactNo}
                    onChange={(event) => setContactNo(event.target.value)}
                  />
                </div>

                <div className="register-field">
                  <label htmlFor="dateOfBirth">Date of Birth</label>
                  <input
                    id="dateOfBirth"
                    type="date"
                    value={dateOfBirth}
                    onChange={(event) => setDateOfBirth(event.target.value)}
                  />
                </div>

                <div className="register-field">
                  <label htmlFor="email">
                    Email <span className="register-required">*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                  />
                </div>

                <div className="register-field">
                  <label htmlFor="aadharNo">
                    Aadhaar No <span className="register-required">*</span>
                  </label>
                  <input
                    id="aadharNo"
                    type="text"
                    placeholder="Enter Aadhaar number"
                    value={aadharNo}
                    onChange={(event) => setAadharNo(event.target.value)}
                  />
                </div>

                <div className="register-field register-full-row">
                  <label htmlFor="address">Address</label>
                  <textarea
                    id="address"
                    rows="3"
                    placeholder="Enter your address"
                    value={address}
                    onChange={(event) => setAddress(event.target.value)}
                  />
                </div>

                <div className="register-field">
                  <label htmlFor="country">Country</label>
                  <select id="country" value={country} onChange={handleCountryChange} disabled style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)', cursor: 'not-allowed', color: '#fff' }}>
                    <option value="IN">India</option>
                  </select>
                </div>

                <div className="register-field">
                  <label htmlFor="state">State</label>
                  <select
                    id="state"
                    value={state}
                    onChange={handleStateChange}
                    disabled={!country}
                  >
                    <option value="" disabled>
                      Select state
                    </option>
                    {stateOptions.map((stateOption) => (
                      <option key={stateOption.isoCode} value={stateOption.isoCode}>
                        {stateOption.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="register-field">
                  <label htmlFor="district">District</label>
                  <select
                    id="district"
                    value={district}
                    onChange={handleDistrictChange}
                    disabled={!state}
                  >
                    <option value="" disabled>
                      {!state ? 'Select state first' : 'Select district'}
                    </option>
                    {districtOptions.map((districtOption) => (
                      <option key={districtOption} value={districtOption}>
                        {districtOption}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="register-field">
                  <label htmlFor="city">City</label>
                  <select
                    id="city"
                    value={city}
                    onChange={(event) => setCity(event.target.value)}
                    disabled={!state}
                  >
                    <option value="" disabled>
                      {!state ? 'Select state first' : 'Select city'}
                    </option>
                    {cityOptions.map((cityOption) => (
                      <option
                        key={`${cityOption.name}-${cityOption.latitude}-${cityOption.longitude}`}
                        value={cityOption.name}
                      >
                        {cityOption.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="register-field">
                  <label htmlFor="pincode">Pincode</label>
                  <input
                    id="pincode"
                    type="text"
                    placeholder="Enter your pincode"
                    value={pincode}
                    onChange={(event) => setPincode(event.target.value)}
                  />
                </div>

                <div className="register-field">
                  <label htmlFor="joiningPackage">
                    Joining Package <span className="register-required">*</span>
                  </label>
                  <select id="joiningPackage" value={joiningPackage} onChange={handlePackageChange}>
                    <option value="" disabled>
                      Select Joining Package
                    </option>
                    {packageList.map((pkg) => (
                      <option key={pkg.name} value={pkg.name}>
                        {pkg.name} (₹{pkg.price})
                      </option>
                    ))}
                  </select>
                  {selectedPackageObj && (
                    <div style={{ fontSize: '13px', color: '#00e5ff', marginTop: '5px', fontWeight: '600' }}>
                      Package Amount: ₹{selectedPackageObj.price}
                    </div>
                  )}
                </div>

                <div className="register-field register-lock-field">
                  <label htmlFor="epin">
                    E Pin <span className="register-required">*</span>
                  </label>
                  <input
                    id="epin"
                    type="text"
                    placeholder="Enter E pin"
                    value={epin}
                    onChange={handleEpinChange}
                  />
                  <span className="register-lock-icon" aria-hidden="true">
                    🔒
                  </span>
                  {epinCheckStatus && (
                    <div
                      style={{
                        fontSize: '13px',
                        marginTop: '6px',
                        fontWeight: '600',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        backgroundColor: epinCheckStatus.matched ? 'rgba(30, 126, 52, 0.15)' : 'rgba(220, 53, 69, 0.15)',
                        color: epinCheckStatus.matched ? '#28a745' : '#ff4d4f',
                        border: `1px solid ${epinCheckStatus.matched ? 'rgba(40, 167, 69, 0.4)' : 'rgba(255, 77, 79, 0.4)'}`,
                      }}
                    >
                      {epinCheckStatus.loading ? 'Verifying E-Pin...' : epinCheckStatus.message}
                    </div>
                  )}
                </div>

                <div className="register-field register-lock-field">
                  <label htmlFor="password">
                    Password <span className="register-required">*</span>
                  </label>
                  <input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                  />
                  <span className="register-lock-icon" aria-hidden="true">
                    🔒
                  </span>
                </div>

                <div className="register-field register-lock-field">
                  <label htmlFor="confirmPassword">
                    Confirm Password <span className="register-required">*</span>
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                  />
                  <span className="register-lock-icon" aria-hidden="true">
                    🔒
                  </span>
                </div>
              </div>

              <label className="register-terms">
                <input type="checkbox" checked={acceptedTerms} onChange={(event) => setAcceptedTerms(event.target.checked)} /> I agree to the <a href="/">Terms &amp; Conditions.</a>
              </label>

              <div style={{ padding: '10px 12px',marginLeft : '0px', marginBlock: '16px', backgroundColor: '#f0f4ff', border: '1px solid #d4e0ff', borderRadius: '6px', fontSize: '14px', color: '#333', fontWeight: '500' }}>
                <strong>Note:</strong> One Person, One ID Policy
              </div>

              <button type="submit" className="register-submit-btn" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit'}
              </button>
            </form>
            </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Register;


