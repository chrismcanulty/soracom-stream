import React, { useEffect, useRef } from "react";
import * as dashjs from "dashjs";

const SoracomCamera = ({ streamUrl, apiKey, authToken }) => {
    const videoRef = useRef(null);
    const playerRef = useRef(null);

    useEffect(() => {
        if (!streamUrl || !videoRef.current || !apiKey || !authToken) return;

        // Clean up existing player
        if (playerRef.current) {
            playerRef.current.reset();
            playerRef.current = null;
        }

        const player = dashjs.MediaPlayer().create();
        playerRef.current = player;

        // Use extend to inject custom headers
        player.extend("RequestModifier", () => {
            return {
                modifyRequestHeader: (xhr) => {
                    console.log("🔐 Injecting headers into request");
                    xhr.setRequestHeader("X-Soracom-API-Key", apiKey);
                    xhr.setRequestHeader("X-Soracom-Token", authToken);
                    return xhr;
                },
                modifyRequestURL: (url) => url,
            };
        }, true); // true = override default

        player.initialize(videoRef.current, streamUrl, true);

        return () => {
            player.reset();
            playerRef.current = null;
        };
    }, [streamUrl, apiKey, authToken]);

    return (
        <div>
            <h2>Soracom ATOM Cam Live Stream</h2>
            {streamUrl ? (
                <video
                    ref={videoRef}
                    controls
                    autoPlay
                    muted
                    width="640"
                    height="360"
                    style={{ border: "1px solid #ccc" }}
                />
            ) : (
                <p>Loading stream...</p>
            )}
        </div>
    );
};

export default SoracomCamera;
