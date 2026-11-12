
import { UAParser } from 'ua-parser-js';

const getDeviceInfo = (req) => {
    const parser = new UAParser(req.headers['user-agent'] || '');
    const result = parser.getResult();

    return {
        ipAddress:
            req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
            req.socket.remoteAddress ||
            null,

        userAgent: req.headers['user-agent'] || null,

        browser: {
            name: result.browser.name || 'Unknown',
            version: result.browser.version || 'Unknown',
        },

        operatingSystem: {
            name: result.os.name || 'Unknown',
            version: result.os.version || 'Unknown',
        },

        device: result.device.type || 'desktop',
    };
};

export default getDeviceInfo;
