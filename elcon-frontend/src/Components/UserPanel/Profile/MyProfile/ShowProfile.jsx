import '../../Common/UserLayout.css';
import '../../../Public/Register/Register.css';
import userprofile from '../../../../Assets/Pictures/images.png';
import { useEffect, useState } from 'react';
import { getProfile } from '../../../../api/authService';

function ShowProfile() {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await getProfile();
        if (response.success) {
          setProfileData(response.data);
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch profile');
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <section className="public-page">
        <div className="public-container">
          <h2 className="register-title" style={{ marginBottom: 24 }}>My Profile</h2>
          <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="public-page">
        <div className="public-container">
          <h2 className="register-title" style={{ marginBottom: 24 }}>My Profile</h2>
          <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>Error: {error}</div>
        </div>
      </section>
    );
  }

  if (!profileData) {
    return (
      <section className="public-page">
        <div className="public-container">
          <h2 className="register-title" style={{ marginBottom: 24 }}>My Profile</h2>
          <div style={{ padding: '20px', textAlign: 'center' }}>No profile data found</div>
        </div>
      </section>
    );
  }

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    }).toUpperCase();
  };

  return (
    <section className="public-page">
      <div className="public-container">
        <h2 className="register-title" style={{ marginBottom: 24 }}>My Profile</h2>
        <div className="show-profile-card">
          <div className="show-profile-grid">
            {/* PHOTO + NAME */}
            <div className="show-profile-photo-box">
              <div className="show-profile-photo">
                <img style={{ border: '1px solid black', borderRadius: '50%' }} src={userprofile} alt="Profile" />
              </div>
              <div className="show-profile-name-bar">
                NAME : {profileData.name}({profileData.memberId})
              </div>
            </div>
            {/* MEMBER PROFILE DETAILS */}
            <div className="show-profile-section">
              <div className="show-profile-section-header">MEMBER PROFILE DETAILS</div>
              <div className="show-profile-section-body">
                <div><b>MEMBER ID</b> <span>{profileData.memberId}</span></div>
                <div><b>FULL NAME</b> <span>{profileData.name}</span></div>
                <div><b>DOB</b> <span>{formatDate(profileData.dateOfBirth)}</span></div>
                <div><b>MOBILE</b> <span>{profileData.contactNo || 'N/A'}</span></div>
                <div><b>EMAIL</b> <span>{profileData.email}</span></div>
                <div><b>JOINING DATE</b> <span>{formatDate(profileData.createdAt)}</span></div>
                <div><b>STATUS</b> <span>ACTIVE</span></div>
              </div>
            </div>
            {/* ADDRESS DETAILS */}
            <div className="show-profile-section">
              <div className="show-profile-section-header">ADDRESS DETAILS</div>
              <div className="show-profile-section-body">
                <div><b>ADDRESS</b> <span>{profileData.address || 'N/A'}</span></div>
                <div><b>STATE</b> <span>{profileData.state || 'N/A'}</span></div>
                <div><b>DISTRICT</b> <span>{profileData.district || 'N/A'}</span></div>
                <div><b>CITY</b> <span>{profileData.city || 'N/A'}</span></div>
                <div><b>PINCODE</b> <span>{profileData.pincode || 'N/A'}</span></div>
              </div>
            </div>
            {/* BANK DETAILS */}
            <div className="show-profile-section">
              <div className="show-profile-section-header">BANK DETAILS</div>
              <div className="show-profile-section-body">
                <div><b>BANK NAME</b> <span>{profileData.bankDetails?.bankName || 'N/A'}</span></div>
                <div><b>HOLDER NAME</b> <span>{profileData.bankDetails?.holderName || 'N/A'}</span></div>
                <div><b>ACC NUMBER</b> <span>{profileData.bankDetails?.accountNo || 'N/A'}</span></div>
                <div><b>IFSC CODE</b> <span>{profileData.bankDetails?.ifsc || 'N/A'}</span></div>
                <div><b>BANK BRANCH</b> <span>{profileData.bankDetails?.bankBranch || 'N/A'}</span></div>
                <div><b>PAN NO</b> <span>{profileData.bankDetails?.panNo || 'N/A'}</span></div>
              </div>
            </div>
            {/* ONLINE PAYMENT DETAILS */}
            <div className="show-profile-section">
              <div className="show-profile-section-header">ONLINE PAYMENT DETAILS</div>
              <div className="show-profile-section-body">
                <div><b>GOOGLE PAY</b> <span>{profileData.paymentDetails?.googlePay || 'N/A'}</span></div>
                <div><b>PHONEPE NO.</b> <span>{profileData.paymentDetails?.phonePe || 'N/A'}</span></div>
                <div><b>PAYTM NO.</b> <span>{profileData.paymentDetails?.payTm || 'N/A'}</span></div>
                <div><b>UPI ID</b> <span>{profileData.paymentDetails?.upiId || 'N/A'}</span></div>
              </div>
              <div className="show-profile-section-header show-profile-section-header-sub">KYC DETAILS</div>
              <div className="show-profile-section-body">
                <div><b>AADHAAR NO</b> <span>{profileData.aadharNo || 'N/A'}</span></div>
                <div><b>PAN NO</b> <span>{profileData.bankDetails?.panNo || 'N/A'}</span></div>
              </div>
            </div>
            {/* NOMINEE DETAILS */}
            <div className="show-profile-section">
              <div className="show-profile-section-header">NOMINEE DETAILS</div>
              <div className="show-profile-section-body">
                <div><b>NOMINEE NAME</b> <span>{profileData.nomineeDetails?.nomineeName || 'N/A'}</span></div>
                <div><b>RELATION</b> <span>{profileData.nomineeDetails?.nomineeRelation || 'N/A'}</span></div>
                <div><b>AGE</b> <span>{profileData.nomineeDetails?.nomineeAge || 'N/A'}</span></div>
                <div><b>MOBILE</b> <span>{profileData.nomineeDetails?.nomineeMobile || 'N/A'}</span></div>
              </div>
            </div>
            {/* SPONSOR DETAILS */}
            <div className="show-profile-section">
              <div className="show-profile-section-header">SPONSOR DETAILS</div>
              <div className="show-profile-section-body">
                <div><b>SPONSOR ID</b> <span>{profileData.sponsorId || 'N/A'}</span></div>
                <div><b>SPONSOR NAME</b> <span>{profileData.sponsorName || 'N/A'}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ShowProfile;
