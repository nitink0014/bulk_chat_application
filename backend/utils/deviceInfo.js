
import { UAParser } from 'ua-parser-js';

const getDeviceInfo = (req) => {
    const parser = new UAParser(req.headers['user-agent'] || '');
    
    const browser = parser.getBrowser();
    const os = parser.getOS();
    const device = parser.getDevice();

    return {
        ipAddress: req.ip || null,
        userAgent: req.headers['user-agent'] || null,

        browser: {
            name: browser.name || 'Unknown',
            version: browser.version || 'Unknown',
        },

        operatingSystem: {
            name: os.name || 'Unknown',
            version: os.version || 'Unknown',
        },

        device: device.type === 'mobile'
            ? 'mobile'
            : device.type === 'tablet'
                ? 'tablet'
                : 'desktop',
    };
};

export default getDeviceInfo;
