const Notification = require("../models/Notification");
const sendEmail = require("./sendEmail");

/**
 * Create an in-app notification and optionally send email.
 * @param {Object} params
 * @param {string}  params.userId          - Recipient user ID
 * @param {string}  params.type            - Notification type enum value
 * @param {string}  params.title           - Short title
 * @param {string}  params.message         - Full message body
 * @param {string}  [params.referenceId]   - Related document ID
 * @param {string}  [params.referenceModel]- Related model name
 * @param {string}  [params.email]         - Recipient email (for email notification)
 * @param {string}  [params.emailSubject]  - Email subject
 * @param {string}  [params.emailHtml]     - HTML email body
 */
const createNotification = async ({
  userId,
  type,
  title,
  message,
  referenceId = null,
  referenceModel = null,
  email = null,
  emailSubject = null,
  emailHtml = null,
}) => {
  try {
    // Create in-app notification
    const notification = await Notification.create({
      userId,
      type,
      title,
      message,
      referenceId,
      referenceModel,
    });

    // Send email if email details provided
    if (email && emailSubject && emailHtml) {
      const result = await sendEmail({
        to: email,
        subject: emailSubject,
        html: emailHtml,
      });

      if (result.success) {
        await Notification.findByIdAndUpdate(notification._id, {
          emailSent: true,
          emailSentAt: new Date(),
        });
      }
    }

    return notification;
  } catch (error) {
    console.error("Notification creation failed:", error.message);
    // Don't throw — notification failure should not break business logic
    return null;
  }
};

module.exports = { createNotification };
