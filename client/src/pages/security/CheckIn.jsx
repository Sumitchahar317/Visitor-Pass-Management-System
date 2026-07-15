import { useEffect, useRef, useState } from "react";
import api from "../../api/axios"

// Import the HTML5 QR Code scanning library.
import { Html5QrcodeScanner } from "html5-qrcode";

const CheckIn = () => {
  // A ref to keep track of the scanner instance across renders so we can clear/clean it up.
  const scannerRef = useRef(null);

  const [message, setMessage] = useState("");

  // State to classify the message type ('success', 'error', or 'conflict') for styling/conditional actions.
  const [messageType, setMessageType] = useState("");

  // State to hold visitor and check-in pass details populated from the database.
  const [passInfo, setPassInfo] = useState(null);

  // State to cache the last decoded QR token in case we need to trigger a check-out.
  const [lastToken, setLastToken] = useState(null);

  // A lock flag to pause scanner parsing while the API request is loading.
  const [isPaused, setIsPaused] = useState(false);

  // Empty failure callback (we ignore failures, as the scanner reports frame read errors frequently).
  const onScanFailure = () => { };

  // Sends the scanned QR token to the check-in endpoint.
  const attemptCheckIn = async (qrToken) => {
    try {
      
      const res = await api.post("/checklogs/checkin", { qrToken, gateId: "main-gate" });

      setMessage(res.data.message);
      setMessageType("success");
      setPassInfo(res.data.pass);
    } catch (err) {
      const data = err.response?.data;

      // A 409 status means the visitor is already checked in. We offer a checkout toggle.
      if (err.response?.status === 409) {
        setMessage(`${data.message} — check them out instead?`);
        setMessageType("conflict");
      } else {
        // Fallback for general validation/expired errors.
        setMessage(data?.message || "Scan failed");
        setMessageType("error");
      }
      setPassInfo(null);
    }
  };

  // Triggered when a QR code is successfully read.
  const onScanSuccess = async (decodedText) => {
    // Stop if a request is already loading or the UI is displaying results.
    if (isPaused) return;

    // Turn on the lock, store the token, and send it to the backend.
    setIsPaused(true);
    setLastToken(decodedText);
    await attemptCheckIn(decodedText);
  };

  // Initialize the camera scanner when the component mounts.
  useEffect(() => {
    // Config: fps is frames-per-second, qrbox defines the scanning frame box size.
    const scanner = new Html5QrcodeScanner("qr-reader", { fps: 10, qrbox: 250 }, false);

    // Bind the success and failure handlers to start rendering the camera feed.
    scanner.render(onScanSuccess, onScanFailure);
    scannerRef.current = scanner;

    // React cleanup function: Clears/closes the webcam stream when the component unmounts.
    return () => {
      scanner.clear().catch((err) => console.log("Scanner cleanup failed:", err));
    };
  }, []);

  // Called when the security guard selects the 'Check Out Instead' button.
  const handleCheckOut = async () => {
    try {
      // Send checkout request using the cached token from the scanner.
      const res = await api.post("/checklogs/checkout", { qrToken: lastToken });

      // Show success feedback and update pass details.
      setMessage(res.data.message);
      setMessageType("success");
      setPassInfo(res.data.pass);
    } catch (err) {
      setMessage(err.response?.data?.message || "Check-out failed");
      setMessageType("error");
    }
  };

  // Resets the state and releases the scanner lock to prepare for the next visitor.
  const handleScanNext = () => {
    setMessage("");
    setMessageType("");
    setPassInfo(null);
    setLastToken(null);
    setIsPaused(false);
  };

  return (
    <div>
      <h2>Security Check-In</h2>

      {/* The HTML5 scanner binds to this div matching the ID supplied to the scanner initialization */}
      <div id="qr-reader" style={{ width: "100%", maxWidth: 400 }}></div>

      {/* Conditionally display results and options once a scan concludes */}
      {message && (
        <div style={{ marginTop: 16 }}>
          <p>{message}</p>

          {/* Display visitor profile details if a pass object exists in the state */}
          {passInfo && (
            <div>
              <p>Visitor: {passInfo.visitor?.name}</p>
              <p>Status: {passInfo.status}</p>
            </div>
          )}

          {/* Display the checkout toggle option if a 409 Conflict occurred */}
          {messageType === "conflict" && <button onClick={handleCheckOut}>Check Out Instead</button>}

          {/* Clear state and resume scanning */}
          <button onClick={handleScanNext}>Scan Next Visitor</button>
        </div>
      )}
    </div>
  );
};

export default CheckIn;

