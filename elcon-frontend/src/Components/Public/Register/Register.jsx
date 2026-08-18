import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { City, Country, State } from 'country-state-city';
import { getDistricts } from 'india-state-district';
import PublicPageHeader from '../Common/PublicPageHeader';
import { registerUser, getSponsorDetails } from '../../../api/authService';
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

  const countryOptions = useMemo(() => Country.getAllCountries(), []);

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

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
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
            <h2 className="register-title">Registration Form</h2>

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
                  {sponsorError && <div style={{ fontSize: "16px", color: '#dc3545', marginTop: '4px' }}>{sponsorError}</div>}
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
                      backgroundColor: sponsorId && sponsorName && !sponsorError ? '#f5f5f5' : '#fff',
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
                  <select id="country" value={country} onChange={handleCountryChange}>
                    {countryOptions.map((countryOption) => (
                      <option key={countryOption.isoCode} value={countryOption.isoCode}>
                        {countryOption.name}
                      </option>
                    ))}
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
                  <select id="joiningPackage" value={joiningPackage} onChange={(event) => setJoiningPackage(event.target.value)}>
                    <option value="" disabled>
                      Select Joining Package
                    </option>
                    {joiningPackageOptions.map((packageName) => (
                      <option key={packageName} value={packageName}>
                        {packageName}
                      </option>
                    ))}
                  </select>
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
                    onChange={(event) => setEpin(event.target.value)}
                  />
                  <span className="register-lock-icon" aria-hidden="true">
                    🔒
                  </span>
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

              <div style={{ padding: '10px 12px',marginLeft : '0px', marginBlock: '16px', backgroundColor: '#f0f4ff', border: '1px solid #d4e0ff', borderRadius: '6px', fontSize: '16px', color: '#333', fontWeight: '500' }}>
                <strong>Note:</strong> One Person, One ID Policy
              </div>

              <button type="submit" className="register-submit-btn" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit'}
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Register;


