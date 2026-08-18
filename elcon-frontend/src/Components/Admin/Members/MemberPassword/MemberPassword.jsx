import './MemberPassword.css';

function MemberPassword() {
  return (
    <div>
      <h1 className="page-title">Change Member Password</h1>

      <div className="panel">
        <div className="form-grid" style={{ maxWidth: '100%' }}>
          <label className="field-label">Member ID</label>
          <input className="text-input" />

          <label className="field-label">New Password</label>
          <input className="text-input" type="password" />

          <label className="field-label">Confirm Password</label>
          <input className="text-input" type="password" />
        </div>

        <div className="btn-row">
          <button className="btn-primary">Update</button>
          <button className="btn-secondary">Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default MemberPassword;
