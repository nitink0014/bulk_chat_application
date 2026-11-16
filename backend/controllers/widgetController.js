
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
// @desc Get all widgets belonging to logged-in agent
// @route GET /api/widgets
// @access Private (Agent)

export const getWidgets = async (req, res) => {
  try {
    const widgets = await Widget.find({
      owner: req.user._id,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: widgets.length,
      widgets,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// @desc Get public widget configuration
// @route GET /api/widgets/public/:publicKey
// @access Public

export const getPublicWidget = async (req, res) => {
  try {
    const { publicKey } = req.params;

    const widget = await Widget.findOne({
      publicKey,
      isActive: true,
    }).select('name publicKey allowedDomains settings');

    if (!widget) {
      return res.status(404).json({
        success: false,
        message: 'Widget not found or inactive',
      });
    }

    const origin = req.headers.origin;

    if (origin) {
      const hostname = new URL(origin).hostname;

      if (!widget.allowedDomains.includes(hostname)) {
        return res.status(403).json({
          success: false,
          message: 'This domain is not allowed',
        });
      }
    }

    return res.status(200).json({
      success: true,
      widget,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
