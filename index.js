const express = require('express');
const { RtcTokenBuilder, RtcRole } = require('agora-access-token');
const app = express();
const port = process.env.PORT || 3000;

// Environment Variables
const APP_ID = process.env.AGORA_APP_ID;
const APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE;

// রুট হ্যান্ডলিং
app.get('/', (req, res) => {
    const { channelName, uid, role, expire } = req.query;

    if (!APP_ID || !APP_CERTIFICATE) {
        // 500 error code for server misconfiguration
        return res.status(500).json({ error: 'Server configuration error: Agora credentials missing.' });
    }
    if (!channelName || !uid) {
        return res.status(400).json({ error: 'Missing parameters: channelName or uid.' });
    }

    const numericUid = parseInt(uid);
    const expirationTimeInSeconds = parseInt(expire) || 3600;
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

    const agoraRole = (role && (role.toLowerCase() === 'publisher' || role.toLowerCase() === 'host'))
                       ? RtcRole.PUBLISHER
                       : RtcRole.SUBSCRIBER;

    const token = RtcTokenBuilder.buildTokenWithUid(
        APP_ID,
        APP_CERTIFICATE,
        channelName,
        numericUid,
        agoraRole,
        privilegeExpiredTs
    );

    return res.json({ token: token });
});

app.listen(port, () => {
    console.log(Render server listening on port ${port});
});
