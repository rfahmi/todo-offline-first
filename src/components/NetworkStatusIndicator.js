import React, { useState, useEffect } from 'react';

const NetworkStatusIndicator = () => {
    const [online, setOnline] = useState(navigator.onLine);

    useEffect(() => {
        const handleOnlineOffline = () => {
            setOnline(navigator.onLine);
        };

        window.addEventListener('online', handleOnlineOffline);
        window.addEventListener('offline', handleOnlineOffline);

        return () => {
            window.removeEventListener('online', handleOnlineOffline);
            window.removeEventListener('offline', handleOnlineOffline);
        };
    }, []);

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height:24,
            fontSize: 12,
            backgroundColor: online ? '#28a745' : '#444',
            color: online ? '#fff' : '#aaa'
        }}>{online ? <p>Connection established</p> : <p>Connection to server lost</p>}</div>
    );
};
export default NetworkStatusIndicator;