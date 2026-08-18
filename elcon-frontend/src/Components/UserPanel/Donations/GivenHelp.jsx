import React, { useState, useEffect } from "react";
import "./GivenHelp.css";
import "../Payment/PaymentRequest/HelpInfo.css";
import { getDonationTarget, submitDonation } from "../../../api/donationsService";
import apiClient from "../../../api/config";

const DONATION_AMOUNTS = {
  1: 300, 2: 1000, 3: 2000, 4: 4000, 5: 8000,
  6: 16000, 7: 32000, 8: 64000, 9: 128000, 10: 256000,
};

const CopyIcon = ({ onClick }) => (
  <svg
    onClick={onClick}
    xmlns="http://www.w3.org/2000/svg"
    width="18" height="18" viewBox="0 0 24 24"
    fill="none" stroke="#00aaff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    style={{ cursor: "pointer", marginLeft: 8, verticalAlign: "middle" }}
    className="copy-icon"
  >
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const GivenHelp = () => {
  const [copied, setCopied] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [currentUser, setCurrentUser] = useState(null);
  const [nextLevel, setNextLevel] = useState(null);
  const [targetData, setTargetData] = useState(null);

  const [utrNumber, setUtrNumber] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        // Fetch full profile to get current unlockLevel
        const res = await apiClient.get("/auth/me");
        const user = res.data.data;
        setCurrentUser(user);

        const unlock = user.unlockLevel || 1;
        if (unlock >= 10) {
          setError("You have already reached the maximum donation level (10).");
          setLoading(false);
          return;
        }

        const next = unlock + 1;
        setNextLevel(next);

        const target = await getDonationTarget(next);
        setTargetData(target.data);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load donation details.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleCopy = (value, key) => {
    navigator.clipboard.writeText(value);
    setCopied(key);
    setTimeout(() => setCopied(""), 1200);
  };

  const handleSubmit = async () => {
    if (!utrNumber.trim()) {
      setError("Please enter the Transaction / UTR Number before submitting.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const result = await submitDonation(nextLevel, utrNumber.trim());
      setSuccessMsg(result.message || "Donation submitted successfully! Awaiting confirmation.");
      setUtrNumber("");
    } catch (err) {
      setError(err?.response?.data?.message || "Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const receiver = targetData || {};
  const payment = receiver.toPaymentDetails || {};
  const bank = receiver.toBankDetails || {};

  const declaration = `I hereby declare that I am giving the above amount as voluntary help / donation to the above member on my own wish. This payment is not salary, not commission, not investment, not business profit.\nI understand that this amount is non-refundable and I will not make any legal claim against company / admin / receiver in future.`;

  if (loading) {
    return (
      <div className="given-help-container">
        <h2 className="donation-title">DONATION DECLARATION FORM</h2>
        <p style={{ textAlign: "center", padding: "20px" }}>Loading donation details…</p>
      </div>
    );
  }

  return (
    <div className="given-help-container">
      <h2 className="donation-title">DONATION DECLARATION FORM</h2>

      {error && (
        <div style={{ background: "#ffeaea", color: "#c0392b", padding: "10px 16px", borderRadius: 6, marginBottom: 12 }}>
          {error}
        </div>
      )}
      {successMsg && (
        <div style={{ background: "#eafff0", color: "#1a7a3a", padding: "10px 16px", borderRadius: 6, marginBottom: 12 }}>
          {successMsg}
        </div>
      )}

      {!error && targetData && (
        <>
          <div className="donation-note">
            <span className="donation-free-will">"I am donating of my own free will"</span>
            <span className="donation-desc">
              I declare that I am gifting{" "}
              <b>₹{DONATION_AMOUNTS[nextLevel]?.toLocaleString("en-IN")}</b> (Level {nextLevel} Upgrade) as per my wish to{" "}
              <b>{receiver.toName}</b> and I will never claim this amount in future.
            </span>
          </div>

          <div className="donation-details-card">
            {/* Sender */}
            <div className="donation-section">
              <div className="section-title21">Sender Details (Help Provider)</div>
              <div className="help-info-row21"><span className="help-info-label">Member Name :</span> <span className="help-info-value">{currentUser?.name || "---"}</span></div>
              <div className="help-info-row21"><span className="help-info-label">Member ID :</span> <span className="help-info-value">{currentUser?.memberId || "---"}</span></div>
              <div className="help-info-row21"><span className="help-info-label">E-mail ID :</span> <span className="help-info-value">{currentUser?.email || "---"}</span></div>
              <div className="help-info-row21"><span className="help-info-label">Current Level :</span> <span className="help-info-value">{currentUser?.unlockLevel || 1}</span></div>
              <div className="help-info-row21"><span className="help-info-label">Upgrading To Level :</span> <span className="help-info-value" style={{ color: "#007bff", fontWeight: 600 }}>{nextLevel}</span></div>
            </div>

            {/* Receiver */}
            <div className="donation-section">
              <div className="section-title21">Receiver Details (Help Receiver)</div>
              <div className="help-info-row21"><span className="help-info-label">Member Name :</span> <span className="help-info-value">{receiver.toName || "---"}</span></div>
              <div className="help-info-row21"><span className="help-info-label">Member ID :</span> <span className="help-info-value">{receiver.toMemberId || "---"}</span></div>

              {payment.googlePay && (
                <div className="help-info-row21 align-row"><span className="help-info-label">GPay :</span>
                  <span className="help-info-value">{payment.googlePay}
                    <CopyIcon onClick={() => handleCopy(payment.googlePay, "gpay")} />
                    {copied === "gpay" && <span className="copied-msg">Copied!</span>}
                  </span>
                </div>
              )}
              {payment.phonePe && (
                <div className="help-info-row21 align-row"><span className="help-info-label">PhonePe :</span>
                  <span className="help-info-value">{payment.phonePe}
                    <CopyIcon onClick={() => handleCopy(payment.phonePe, "phonepe")} />
                    {copied === "phonepe" && <span className="copied-msg">Copied!</span>}
                  </span>
                </div>
              )}
              {payment.payTm && (
                <div className="help-info-row21 align-row"><span className="help-info-label">PayTM :</span>
                  <span className="help-info-value">{payment.payTm}
                    <CopyIcon onClick={() => handleCopy(payment.payTm, "paytm")} />
                    {copied === "paytm" && <span className="copied-msg">Copied!</span>}
                  </span>
                </div>
              )}
              {payment.upiId && (
                <div className="help-info-row21 align-row"><span className="help-info-label">UPI ID :</span>
                  <span className="help-info-value">{payment.upiId}
                    <CopyIcon onClick={() => handleCopy(payment.upiId, "upi")} />
                    {copied === "upi" && <span className="copied-msg">Copied!</span>}
                  </span>
                </div>
              )}
              {bank.bankName && <div className="help-info-row21"><span className="help-info-label">Bank Name :</span> <span className="help-info-value">{bank.bankName}</span></div>}
              {bank.accountNo && <div className="help-info-row21"><span className="help-info-label">Account No :</span> <span className="help-info-value">{bank.accountNo}</span></div>}
              {bank.holderName && <div className="help-info-row21"><span className="help-info-label">Beneficiary :</span> <span className="help-info-value">{bank.holderName}</span></div>}
              {bank.ifsc && <div className="help-info-row21"><span className="help-info-label">IFSC Code :</span> <span className="help-info-value">{bank.ifsc}</span></div>}

              {receiver.skippedMembers?.length > 0 && (
                <div className="help-info-row21" style={{ marginTop: 8 }}>
                  <span className="help-info-label" style={{ color: "#e67e22" }}>Skipped (not eligible) :</span>
                  <span className="help-info-value" style={{ color: "#e67e22" }}>{receiver.skippedMembers.join(", ")}</span>
                </div>
              )}
            </div>

            {/* Donation details */}
            <div className="donation-section">
              <div className="section-title21">Donation / Help Details</div>
              <div className="help-info-row21"><span className="help-info-label">Amount :</span> <span className="help-info-value amount">₹ {DONATION_AMOUNTS[nextLevel]?.toLocaleString("en-IN")}.00</span></div>
              <div className="help-info-row21"><span className="help-info-label">Upgrade Level :</span> <span className="help-info-value">Level {nextLevel}</span></div>
            </div>

            {/* Declaration + submission */}
            <div className="donation-section">
              <div className="section-title21">Declaration By Sender</div>
              <div className="help-info-row22">
                <span className="help-info-label">Declaration :</span>
                <span className="help-info-value declaration-text">{declaration}</span>
              </div>
              <div className="help-info-row21 pay-slip-row">
                <span className="help-info-label">Trans. No (UTR) :</span>
                <input
                  type="text"
                  className="input-txn"
                  placeholder="Enter UTR / Transaction Number"
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value)}
                />
              </div>
            </div>

            <div className="submit-row">
              <button className="help-submit-btn" onClick={handleSubmit} disabled={submitting}>
                {submitting ? "Submitting…" : "Submit Donation"}
              </button>
            </div>
          </div>

          {/* Level progress indicator */}
          <div className="rank-steps">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className={`rank-step${i + 1 <= (currentUser?.unlockLevel || 1) ? " active" : ""}${i + 1 === nextLevel ? " next-level" : ""}`}
                title={`Level ${i + 1} — ₹${DONATION_AMOUNTS[i + 1]?.toLocaleString("en-IN")}`}
              >
                {i + 1}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default GivenHelp;
