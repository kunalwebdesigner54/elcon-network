import React, { useState, useEffect } from "react";
import "./GivenHelp.css";
import "../Payment/PaymentRequest/HelpInfo.css";
import { getDonationTarget, submitDonation, getMyStatus, getMyDonations } from "../../../api/donationsService";
import apiClient from "../../../api/config";
import { formatDate } from '../../../utils/dateFormatter';

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

const STATUS_COLORS = {
  APPROVED: "#1db954",
  COMPLETED: "#1db954",
  PENDING: "#f39c12",
  WAITING_FOR_RECEIVER_CONFIRMATION: "#f39c12",
  REJECTED: "#e74c3c",
};

const GivenHelp = () => {
  const [copied, setCopied] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [currentUser, setCurrentUser] = useState(null);
  const [nextLevel, setNextLevel] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [targetData, setTargetData] = useState(null);

  const [utrNumber, setUtrNumber] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Donation history state
  const [donationHistory, setDonationHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        // Fetch full profile to get current unlockLevel
        const res = await apiClient.get("/auth/me");
        const user = res.data.data;
        setCurrentUser(user);

        const statusRes = await getMyStatus();
        const { currentLevel, nextLevel: next, activeDonation } = statusRes.data;
        // Update user's unlock level in state to match actual backend logic for the UI dots
        user.unlockLevel = currentLevel;

        if (currentLevel >= 10) {
          setError("You have already reached the maximum donation level (10).");
          setLoading(false);
          return;
        }

        setNextLevel(next);
        setSelectedLevel(next);

        if (activeDonation) {
          setTargetData({ isActiveDonation: true, ...activeDonation });
        } else {
          const target = await getDonationTarget(next);
          setTargetData(target.data);
        }

        // Always fetch donation history to allow viewing past donations
        fetchDonationHistory();
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load donation details.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const fetchDonationHistory = async () => {
    try {
      setHistoryLoading(true);
      const data = await getMyDonations();
      const sentDonations = data?.data?.sent || [];
      setDonationHistory(sentDonations);
    } catch (err) {
      console.error("Failed to load donation history:", err);
    } finally {
      setHistoryLoading(false);
    }
  };

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

  const handleLevelClick = (level) => {
    if (level <= parseInt(nextLevel, 10)) {
      setSelectedLevel(level);
      setError("");
      setSuccessMsg("");
    }
  };

  const receiver = targetData || {};
  const payment = receiver.toPaymentDetails || {};
  const bank = receiver.toBankDetails || {};

  const declaration = `I hereby declare that I am giving the above amount as voluntary help / donation to the above member on my own wish. This payment is not salary, not commission, not investment, not business profit.\nI understand that this amount is non-refundable and I will not make any legal claim against company / admin / receiver in future.`;

  if (loading) {
    return (
      <div>
        <h1 className="user-page-title">Given Help</h1>
        <div className="given-help-container">
          <h2 className="donation-title">DONATION DECLARATION FORM</h2>
          <p style={{ textAlign: "center", padding: "20px" }}>Loading donation details…</p>
        </div>
      </div>
    );
  }

  // Find historic donation if viewing a past level
  const pastDonation = selectedLevel < parseInt(nextLevel, 10) 
    ? donationHistory.find(d => d.level === parseInt(selectedLevel, 10))
    : null;

  return (
    <div>
      <h1 className="user-page-title">Given Help</h1>
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
            {selectedLevel < parseInt(nextLevel, 10) ? (
              // Read-only view for past donations
              pastDonation ? (
                <div className="donation-details-card">
                  <div style={{ textAlign: "center", marginBottom: "16px", color: "#27ae60", fontWeight: "bold", fontSize: "1.1rem" }}>
                    ✓ Level {selectedLevel} Donation Completed
                  </div>
                  
                  {/* Sender */}
                  <div className="donation-section">
                    <div className="section-title21">Sender Details (Help Provider)</div>
                    <div className="help-info-row21"><span className="help-info-label">Member Name :</span> <span className="help-info-value">{currentUser?.name || "---"}</span></div>
                    <div className="help-info-row21"><span className="help-info-label">Member ID :</span> <span className="help-info-value">{currentUser?.memberId || "---"}</span></div>
                    <div className="help-info-row21"><span className="help-info-label">Mobile No :</span> <span className="help-info-value">{currentUser?.contactNo || "---"}</span></div>
                    <div className="help-info-row21"><span className="help-info-label">E-mail ID :</span> <span className="help-info-value">{currentUser?.email || "---"}</span></div>
                  </div>

                  {/* Receiver */}
                  <div className="donation-section">
                    <div className="section-title21">Receiver Details (Help Receiver)</div>
                    <div className="help-info-row21"><span className="help-info-label">Member Name :</span> <span className="help-info-value">{pastDonation.toName || "---"}</span></div>
                    <div className="help-info-row21"><span className="help-info-label">Member ID :</span> <span className="help-info-value">{pastDonation.toMemberId || "---"}</span></div>
                  </div>

                  {/* Donation details */}
                  <div className="donation-section">
                    <div className="section-title21">Donation / Help Details</div>
                    <div className="help-info-row21"><span className="help-info-label">Amount :</span> <span className="help-info-value amount">₹ {pastDonation.amount?.toLocaleString("en-IN")}.00</span></div>
                    <div className="help-info-row21"><span className="help-info-label">Upgrade Level :</span> <span className="help-info-value">Level {selectedLevel}</span></div>
                    <div className="help-info-row21"><span className="help-info-label">Donation Date :</span> <span className="help-info-value">{pastDonation.dateRaw ? new Date(pastDonation.dateRaw).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : (pastDonation.date || '---')}</span></div>
                    <div className="help-info-row21"><span className="help-info-label">Trans. No (UTR) :</span> <span className="help-info-value">{pastDonation.utrNumber}</span></div>
                    <div className="help-info-row21"><span className="help-info-label">Donation Status :</span> <span className="help-info-value" style={{ color: STATUS_COLORS[pastDonation.status], fontWeight: 600 }}>{pastDonation.status?.replace(/_/g, ' ')}</span></div>
                  </div>
                  
                  <div style={{ textAlign: "center", marginTop: "24px", color: "#ccc", fontSize: "0.9rem" }}>
                    You have already completed the donation for Level {selectedLevel}. You cannot re-donate to this level.
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "40px" }}>Loading history for Level {selectedLevel}…</div>
              )
            ) : targetData.isActiveDonation ? (
              // Pending active donation view
              <div style={{ background: "#fff3cd", color: "#856404", padding: "20px", borderRadius: "8px", border: "1px solid #ffeeba", textAlign: "center", marginBottom: "20px" }}>
                <h3 style={{ margin: "0 0 10px 0" }}>Donation Pending Approval</h3>
                <p style={{ margin: "0 0 5px 0" }}>Your donation of <b>₹{targetData.amount?.toLocaleString("en-IN")}</b> for Level <b>{targetData.level}</b> to <b>{targetData.toName}</b> is currently <b>{targetData.status?.replace(/_/g, ' ')}</b>.</p>
                <p style={{ margin: 0 }}>Please wait for the receiver to approve it. Once approved, you will be upgraded to Level {targetData.level}.</p>
              </div>
            ) : (
              // Active new donation view
              <>
                <div className="donation-note">
                  <span className="donation-free-will">"I am donating of my own free will"</span>{" "}
                  <span className="donation-desc">
                    I declare that I am gifting{" "}
                    <b>₹{DONATION_AMOUNTS[nextLevel]?.toLocaleString("en-IN")}</b> to{" "}
                    <b>{receiver.toName}</b> and I will never claim this amount in future.
                  </span>
                </div>

                <div className="donation-details-card">
                  {/* Sender */}
                  <div className="donation-section">
                    <div className="section-title21">Sender Details (Help Provider)</div>
                    <div className="help-info-row21"><span className="help-info-label">Member Name :</span> <span className="help-info-value">{currentUser?.name || "---"}</span></div>
                    <div className="help-info-row21"><span className="help-info-label">Member ID :</span> <span className="help-info-value">{currentUser?.memberId || "---"}</span></div>
                    <div className="help-info-row21"><span className="help-info-label">Mobile No :</span> <span className="help-info-value">{currentUser?.contactNo || "---"}</span></div>
                    <div className="help-info-row21"><span className="help-info-label">E-mail ID :</span> <span className="help-info-value">{currentUser?.email || "---"}</span></div>
                    <div className="help-info-row21"><span className="help-info-label">Current Level :</span> <span className="help-info-value">{currentUser?.unlockLevel ?? 0}</span></div>
                    <div className="help-info-row21"><span className="help-info-label">Upgrading To Level :</span> <span className="help-info-value" style={{ color: "#007bff", fontWeight: 600 }}>{nextLevel}</span></div>
                  </div>

                  {/* Receiver */}
                  <div className="donation-section">
                    <div className="section-title21">Receiver Details (Help Receiver)</div>
                    <div className="help-info-row21"><span className="help-info-label">Member Name :</span> <span className="help-info-value">{receiver.toName || "---"}</span></div>
                    <div className="help-info-row21"><span className="help-info-label">Member ID :</span> <span className="help-info-value">{receiver.toMemberId || "---"}</span></div>
                    <div className="help-info-row21"><span className="help-info-label">Contact No :</span> <span className="help-info-value">{receiver.toPhone || "---"}</span></div>

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
                        <span className="help-info-label" style={{ color: "#e67e22" }}>Skipped ID :</span>
                        <span className="help-info-value" style={{ color: "#e67e22" }}>
                          {typeof receiver.skippedMembers[0] === 'object' ? receiver.skippedMembers[0].memberId : receiver.skippedMembers[0]}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Donation details */}
                  <div className="donation-section">
                    <div className="section-title21">Donation / Help Details</div>
                    <div className="help-info-row21"><span className="help-info-label">Amount :</span> <span className="help-info-value amount">₹ {DONATION_AMOUNTS[nextLevel]?.toLocaleString("en-IN")}.00</span></div>
                    <div className="help-info-row21"><span className="help-info-label">Upgrade Level :</span> <span className="help-info-value">Level {nextLevel}</span></div>
                    <div className="help-info-row21"><span className="help-info-label">Donation Date :</span> <span className="help-info-value">{formatDate(new Date())}</span></div>
                    <div className="help-info-row21"><span className="help-info-label">Donation Status :</span> <span className="help-info-value" style={{ color: "#f39c12", fontWeight: 600 }}>PENDING</span></div>
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
              </>
            )}

            {/* Level progress indicator */}
            <div className="rank-steps">
              {[...Array(10)].map((_, i) => {
                const lvl = i + 1;
                const isCompleted = lvl < parseInt(nextLevel, 10);
                const isActive = lvl === parseInt(nextLevel, 10);
                const isSelected = lvl === parseInt(selectedLevel, 10);
                return (
                  <div
                    key={i}
                    className={`rank-step${lvl <= (currentUser?.unlockLevel ?? 0) ? " active" : ""}${isActive ? " next-level" : ""}`}
                    style={{
                      cursor: (isCompleted || isActive) ? 'pointer' : 'not-allowed',
                      border: isSelected && isCompleted ? '2px solid #333' : undefined,
                      transform: isSelected && isCompleted ? 'scale(1.1)' : undefined
                    }}
                    title={`Level ${lvl} — ₹${DONATION_AMOUNTS[lvl]?.toLocaleString("en-IN")}`}
                    onClick={() => handleLevelClick(lvl)}
                  >
                    {lvl}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Donation History — shown when form is locked (active donation pending) */}
      {targetData?.isActiveDonation && parseInt(selectedLevel, 10) === parseInt(nextLevel, 10) && (
        <div className="given-help-history-section">
          <h2 className="section-title21">Donation History</h2>
          {historyLoading ? (
            <p style={{ textAlign: "center", padding: "20px" }}>Loading history…</p>
          ) : donationHistory.length === 0 ? (
            <p style={{ textAlign: "center", padding: "20px", color: "#888" }}>No donation history found.</p>
          ) : (
            <div className="user-table-wrapper">
              <table className="user-table">
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>Level</th>
                    <th>Amount</th>
                    <th>To Member</th>
                    <th>UTR</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {donationHistory.map((row, idx) => (
                    <tr key={row.donationId || idx}>
                      <td>{idx + 1}</td>
                      <td>{row.level}</td>
                      <td>₹{row.amount?.toLocaleString("en-IN")}</td>
                      <td>
                        <div>{row.toName}</div>
                        <div style={{ fontSize: "0.8rem", color: "#888" }}>{row.toMemberId}</div>
                      </td>
                      <td>{row.utrNumber || "---"}</td>
                      <td>{row.dateRaw ? new Date(row.dateRaw).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : (row.date || '---')}</td>
                      <td>
                        <span style={{ color: STATUS_COLORS[row.status] || "#888", fontWeight: 600 }}>
                          {row.status?.replace(/_/g, ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GivenHelp;
