
import Widget from '../models/Widget.js';
import Visitor from '../models/Visitor.js';
import PushSubscription from '../models/PushSubscription.js';
import getDeviceInfo from '../utils/deviceInfo.js';
import mongoose from 'mongoose';

import {
    sendPushNotification,
} from '../services/pushNotificationService.js';


// ============================================
// TRACK WEBSITE VISITOR
// ============================================

// @desc    Track a website visitor and notify agent
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

        // 1. Validate required fields
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

        // 2. Find active widget
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

        // 3. Validate allowed domains
        const allowedDomains = widget.allowedDomains.map(
            domain => domain.toLowerCase()
        );

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

            if (!allowedDomains.includes(originHostname)) {
                return res.status(403).json({
                    success: false,
                    message: 'This website domain is not allowed',
                });
            }
        }

        // 4. Validate customer website URL
        let pageUrl = null;

        if (currentPage) {
            try {
                const parsedPage = new URL(currentPage);

                if (!['http:', 'https:'].includes(parsedPage.protocol)) {
                    return res.status(400).json({
                        success: false,
                        message: 'Invalid current page URL',
                    });
                }

                const pageHostname = parsedPage.hostname.toLowerCase();

                if (!allowedDomains.includes(pageHostname)) {
                    return res.status(403).json({
                        success: false,
                        message: 'This customer website domain is not allowed',
                    });
                }

                pageUrl = parsedPage.href;

            } catch {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid current page URL',
                });
            }
        }

        // 5. Validate referrer
        let validReferrer = null;

        if (referrer) {
            try {
                const parsedReferrer = new URL(referrer);

                if (['http:', 'https:'].includes(parsedReferrer.protocol)) {
                    validReferrer = parsedReferrer.href;
                }
            } catch {
                validReferrer = null;
            }
        }

        // 6. Get device information
        const deviceInfo = getDeviceInfo(req);
        const now = new Date();

        const visitorQuery = {
            widget: widget._id,
            visitorId: visitorId.trim(),
        };

        // 7. Check whether visitor already exists
        let visitor = await Visitor.findOne(visitorQuery);
        let isNewVisitor = false;

        // 8. Create new visitor
        if (!visitor) {
            try {
                visitor = await Visitor.create({
                    ...visitorQuery,
                    ipAddress: deviceInfo.ipAddress,
                    userAgent: deviceInfo.userAgent,
                    browser: deviceInfo.browser,
                    operatingSystem: deviceInfo.operatingSystem,
                    device: deviceInfo.device,
                    currentPage: pageUrl,
                    referrer: validReferrer,
                    isOnline: true,
                    firstSeen: now,
                    lastSeen: now,
                });

                isNewVisitor = true;

            } catch (error) {
                // Handle simultaneous requests
                if (error.code !== 11000) {
                    throw error;
                }

                visitor = await Visitor.findOne(visitorQuery);
            }
        }

        // 9. Update existing visitor
        if (!isNewVisitor) {
            visitor = await Visitor.findOneAndUpdate(
                visitorQuery,
                {
                    $set: {
                        ipAddress: deviceInfo.ipAddress,
                        userAgent: deviceInfo.userAgent,
                        browser: deviceInfo.browser,
                        operatingSystem: deviceInfo.operatingSystem,
                        device: deviceInfo.device,
                        currentPage: pageUrl,
                        referrer: validReferrer,
                        isOnline: true,
                        lastSeen: now,
                    },
                },
                {
                    new: true,
                    runValidators: true,
                }
            );
        }

        // 10. Send notification to widget owner
        if (isNewVisitor && visitor) {
            try {
                const subscriptions = await PushSubscription.find({
                    agent: widget.owner,
                }).lean();

                if (subscriptions.length > 0) {
                    const payload = {
                        title: 'New Website Visitor',
                        body: 'Someone is browsing your website.',
                        url: '/agent/dashboard',
                        tag: `bulkchat-visitor-${visitor._id}`,
                        data: {
                            visitorId: visitor._id.toString(),
                        },
                    };

                    const results = await Promise.allSettled(
                        subscriptions.map(subscription =>
                            sendPushNotification(subscription, payload)
                        )
                    );

                    console.log(
                        'Website visit notification attempts:',
                        results.length
                    );
                } else {
                    console.log(
                        'No push subscriptions found for widget owner:',
                        widget.owner.toString()
                    );
                }

            } catch (notificationError) {
                console.error(
                    'Website Visit Notification Error:',
                    notificationError
                );
            }
        }

        // 11. Response
        return res.status(200).json({
            success: true,
            message: 'Visitor tracked successfully',
            visitorId: visitor.visitorId,
            isNewVisitor,
        });

    } catch (error) {
        console.error('Track Visitor Error:', error);

        return res.status(500).json({
            success: false,
            message: 'Failed to track visitor',
        });
    }
};


// ============================================
// GET ALL VISITORS
// ============================================

// @desc    Get all visitors belonging to logged-in agent
// @route   GET /api/visitors
// @access  Private (Agent)

export const getVisitors = async (req, res) => {
    try {
        // 1. Find widgets owned by logged-in agent
        const widgets = await Widget.find({
            owner: req.user._id,
        }).select('_id');

        const widgetIds = widgets.map(widget => widget._id);

        // 2. Mark visitors offline after 60 seconds
        const inactiveTime = new Date(Date.now() - 60 * 1000);

        await Visitor.updateMany(
            {
                widget: { $in: widgetIds },
                isOnline: true,
                lastSeen: { $lt: inactiveTime },
            },
            {
                $set: {
                    isOnline: false,
                },
            }
        );

        // 3. Fetch visitors
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


// ============================================
// GET VISITOR BY ID
// ============================================

// @desc    Get visitor by ID
// @route   GET /api/visitors/:id
// @access  Private (Agent)

export const getVisitorById = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Validate MongoDB ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid visitor ID',
            });
        }

        // 2. Find widgets owned by logged-in agent
        const widgets = await Widget.find({
            owner: req.user._id,
        }).select('_id');

        const widgetIds = widgets.map(widget => widget._id);

        // 3. Find visitor belonging to agent's widgets
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
