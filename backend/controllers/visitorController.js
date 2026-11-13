
import Widget from '../models/Widget.js';
import Visitor from '../models/Visitor.js';
import getDeviceInfo from '../utils/deviceInfo.js';
import mongoose from 'mongoose';
// @desc    Track a website visitor
// @route   POST /api/visitors/track
// @access  Public (Widget Public Key)

export const trackVisitor = async (req, res) => {
    try {
        const {
            publicKey,
            visitorId,
            currentPage,
            referrer,
        } = req.body;

        // Validate required fields
        if (!publicKey || !visitorId) {
            return res.status(400).json({
                success: false,
                message: 'Public key and visitor ID are required',
            });
        }

        if (
            typeof visitorId !== 'string' ||
            visitorId.trim().length === 0 ||
            visitorId.length > 128
        ) {
            return res.status(400).json({
                success: false,
                message: 'Invalid visitor ID',
            });
        }

        // Find widget
        const widget = await Widget.findOne({
            publicKey,
            isActive: true,
        });

        if (!widget) {
            return res.status(404).json({
                success: false,
                message: 'Invalid or inactive widget',
            });
        }

        // Verify website origin when provided by the browser
        const origin = req.get('origin');

        if (origin) {
            let originHostname;

            try {
                originHostname = new URL(origin).hostname.toLowerCase();
            } catch {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid website origin',
                });
            }

            const allowedDomains = widget.allowedDomains.map(
                (domain) => domain.toLowerCase()
            );

            if (!allowedDomains.includes(originHostname)) {
                return res.status(403).json({
                    success: false,
                    message: 'This website domain is not allowed',
                });
            }
        }

        // Validate current page URL
        let pageUrl = null;

        if (currentPage) {
            try {
                const parsedPage = new URL(currentPage);

                if (!['http:', 'https:'].includes(parsedPage.protocol)) {
                    throw new Error('Invalid protocol');
                }

                pageUrl = parsedPage.href;
            } catch {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid current page URL',
                });
            }
        }

        // Get browser, OS, device and IP information
        const deviceInfo = getDeviceInfo(req);

        const now = new Date();

        // Create visitor or update existing visitor
        await Visitor.findOneAndUpdate(
            {
                widget: widget._id,
                visitorId: visitorId.trim(),
            },
            {
                $set: {
                    ipAddress: deviceInfo.ipAddress,
                    userAgent: deviceInfo.userAgent,
                    browser: deviceInfo.browser,
                    operatingSystem: deviceInfo.operatingSystem,
                    device: deviceInfo.device,
                    currentPage: pageUrl,
                    referrer: referrer || null,
                    isOnline: true,
                    lastSeen: now,
                },
                $setOnInsert: {
                    firstSeen: now,
                },
            },
            {
                new: true,
                upsert: true,
                runValidators: true,
                setDefaultsOnInsert: true,
            }
        );

        return res.status(200).json({
            success: true,
            message: 'Visitor tracked successfully',
            visitorId: visitorId.trim(),
        });

    } catch (error) {
        console.error('Track Visitor Error:', error);

        return res.status(500).json({
            success: false,
            message: 'Failed to track visitor',
        });
    }
};

// @desc    Get all visitors belonging to logged-in agent
// @route   GET /api/visitors
// @access  Private (Agent)

export const getVisitors = async (req, res) => {
    try {
        // Find all widgets owned by the logged-in agent
        const widgets = await Widget.find({
            owner: req.user._id,
        }).select('_id');

        const widgetIds = widgets.map((widget) => widget._id);

        // Find visitors belonging to those widgets
        const visitors = await Visitor.find({
            widget: { $in: widgetIds },
        })
            .populate('widget', 'name websiteUrl')
            .sort({ lastSeen: -1 });

        return res.status(200).json({
            success: true,
            totalVisitors: visitors.length,
            visitors,
        });

    } catch (error) {
        console.error('Get Visitors Error:', error);

        return res.status(500).json({
            success: false,
            message: 'Failed to fetch visitors',
        });
    }
};
export const getVisitorById = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate MongoDB ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid visitor ID',
            });
        }

        // Find widgets owned by logged-in agent
        const widgets = await Widget.find({
            owner: req.user._id,
        }).select('_id');

        const widgetIds = widgets.map((widget) => widget._id);

        // Find visitor belonging to agent's widgets
        const visitor = await Visitor.findOne({
            _id: id,
            widget: { $in: widgetIds },
        }).populate('widget', 'name websiteUrl');

        if (!visitor) {
            return res.status(404).json({
                success: false,
                message: 'Visitor not found',
            });
        }

        return res.status(200).json({
            success: true,
            visitor,
        });

    } catch (error) {
        console.error('Get Visitor By ID Error:', error);

        return res.status(500).json({
            success: false,
            message: 'Failed to fetch visitor details',
        });
    }
};