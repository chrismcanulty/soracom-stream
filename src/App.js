import React, { useState, useEffect } from "react";
import axios from "axios";
import SoracomCamera from "./components/SoracomCamera";

const DEVICE_ID = "7CDDE906A6C1";
const SORACOM_AUTH_ENDPOINT = "https://api.soracom.io/v1/auth";

const STREAM_API_URL = `https://api.soracom.io/v1/sora_cam/devices/${DEVICE_ID}/atom_cam/live_stream/start`;

const fetchAuthToken = async () => {
  try {
    const response = await axios.post(SORACOM_AUTH_ENDPOINT, {
      authKeyId: process.env.REACT_APP_SORACOM_AUTH_KEY_ID,
      authKey: process.env.REACT_APP_SORACOM_AUTH_KEY,
    }, {
      headers: { "Content-Type": "application/json" },
    });
    return {
      apiKey: response.data.apiKey,
      authToken: response.data.token,
    };
  } catch (error) {
    console.error("Error fetching auth token:", error);
    return null;
  }
};

const App = () => {
  const [streamUrl, setStreamUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [authToken, setAuthToken] = useState("");


  const fetchStreamUrl = async () => {

    const creds = await fetchAuthToken();
    if (!creds) return;

    setApiKey(creds.apiKey);
    setAuthToken(creds.authToken);

    try {
      const response = await axios.post(STREAM_API_URL, null, {
        headers: {
          "X-Soracom-API-Key": creds.apiKey,
          "X-Soracom-Token": creds.authToken,
        },
      });

      const url = response.data?.url || response.data?.stream_url;
      if (url) {
        console.log("✅ Stream URL received:", url);
        setStreamUrl(url);
      } else {
        console.error("❌ No stream URL found in API response:", response.data);
      }
    } catch (error) {
      console.error("⚠️ Error fetching stream URL:", error);
    }
  };

  useEffect(() => {
    fetchStreamUrl(); // Fetch on mount

    const interval = setInterval(() => {
      fetchStreamUrl(); // Refresh every 5 min
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <h1>Live Camera Feed</h1>
      <SoracomCamera streamUrl={streamUrl} apiKey={apiKey} authToken={authToken} />
    </div>
  );
};

export default App;
