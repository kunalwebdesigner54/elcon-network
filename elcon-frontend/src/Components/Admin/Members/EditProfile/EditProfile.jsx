import './EditProfile.css';

function EditProfile() {
  return (
    <div>
      <h1 className="page-title">Edit Profile</h1>

      <div className="panel">
        <div className="form-grid-wide">
          <div>
            <label className="field-label">Member ID</label>
            <input className="text-input" />
            <div className="btn-row" style={{ marginTop: 14 }}>
              <button className="btn-primary">Show Details</button>
            </div>
          </div>

          <div>
            <label className="field-label">Member Name</label>
            <input className="text-input" />
            <div className="btn-row" style={{ marginTop: 14 }}>
              <button className="btn-primary">Show Details</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditProfile;
