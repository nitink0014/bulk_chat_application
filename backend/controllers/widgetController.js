
import crypto from 'crypto';
import Widget from '../models/Widget.js';

// @desc    Create a new website widget
// @route   POST /api/widgets
// @access  Private (Agent)

export const createWidget = async (req, res) => {
  try {
    const { name, websiteUrl, allowedDomains } = req.body;

    if (!name || !websiteUrl) {
      return res.status(400).json({
        success: false,
        message: 'Widget name and website URL are required',
      });
    }

    let parsedUrl;

    try {
      parsedUrl = new URL(websiteUrl);
    } catch {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid website URL',
      });
    }

    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return res.status(400).json({
        success: false,
        message: 'Only HTTP and HTTPS websites are allowed',
      });
    }

    const domains = allowedDomains?.length
      ? allowedDomains
      : [parsedUrl.hostname];

    const publicKey = crypto.randomBytes(24).toString('hex');

    const widget = await Widget.create({
      owner: req.user._id,
      name,
      websiteUrl: parsedUrl.origin,
      publicKey,
      allowedDomains: domains,
    });

    res.status(201).json({
      success: true,
      message: 'Widget created successfully',
      widget,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
