/**
 * Reusable HTML email templates for all notification types.
 */

const baseTemplate = (title, bodyHtml) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${title}</title>
  <style>
    body { font-family: Arial, sans-serif; background: #f4f6f8; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 30px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .header { background: #1890ff; padding: 24px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 24px; }
    .body { padding: 32px; color: #333333; line-height: 1.6; }
    .body h2 { color: #1890ff; }
    .badge { display: inline-block; padding: 6px 16px; border-radius: 20px; font-size: 14px; font-weight: bold; margin: 8px 0; }
    .badge-success { background: #f6ffed; color: #52c41a; border: 1px solid #b7eb8f; }
    .badge-danger  { background: #fff1f0; color: #f5222d; border: 1px solid #ffa39e; }
    .badge-info    { background: #e6f7ff; color: #1890ff; border: 1px solid #91d5ff; }
    .btn { display: inline-block; margin-top: 16px; padding: 12px 28px; background: #1890ff; color: #fff; text-decoration: none; border-radius: 6px; font-size: 15px; }
    .footer { background: #f0f2f5; padding: 16px; text-align: center; font-size: 12px; color: #888888; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>📋 Book a Doctor</h1></div>
    <div class="body">${bodyHtml}</div>
    <div class="footer">
      © ${new Date().getFullYear()} Book a Doctor. All rights reserved.<br/>
      This is an automated message, please do not reply.
    </div>
  </div>
</body>
</html>
`;

// ─── Templates ─────────────────────────────────────────────────────────────────

const welcomeEmail = (name) =>
  baseTemplate(
    "Welcome to Book a Doctor",
    `<h2>Welcome, ${name}! 🎉</h2>
     <p>Your account has been created successfully. You can now browse doctors and book appointments.</p>
     <a href="${process.env.CLIENT_URL}/login" class="btn">Get Started</a>`
  );

const appointmentBookedPatient = (patientName, doctorName, date, time) =>
  baseTemplate(
    "Appointment Booked",
    `<h2>Appointment Confirmed 🗓️</h2>
     <p>Hi <strong>${patientName}</strong>,</p>
     <p>Your appointment with <strong>Dr. ${doctorName}</strong> has been booked and is pending approval.</p>
     <p><strong>Date:</strong> ${date}<br/><strong>Time:</strong> ${time}</p>
     <span class="badge badge-info">Pending Approval</span>
     <p>You will be notified once the doctor approves your appointment.</p>`
  );

const appointmentBookedDoctor = (doctorName, patientName, date, time, reason) =>
  baseTemplate(
    "New Appointment Request",
    `<h2>New Appointment Request 📩</h2>
     <p>Hi <strong>Dr. ${doctorName}</strong>,</p>
     <p>You have a new appointment request from <strong>${patientName}</strong>.</p>
     <p><strong>Date:</strong> ${date}<br/><strong>Time:</strong> ${time}<br/><strong>Reason:</strong> ${reason}</p>
     <a href="${process.env.CLIENT_URL}/doctor/appointments" class="btn">View Appointment</a>`
  );

const appointmentApproved = (patientName, doctorName, date, time) =>
  baseTemplate(
    "Appointment Approved",
    `<h2>Appointment Approved ✅</h2>
     <p>Hi <strong>${patientName}</strong>,</p>
     <p>Great news! Your appointment with <strong>Dr. ${doctorName}</strong> has been approved.</p>
     <p><strong>Date:</strong> ${date}<br/><strong>Time:</strong> ${time}</p>
     <span class="badge badge-success">Approved</span>
     <p>Please be on time and bring any relevant medical documents.</p>`
  );

const appointmentRejected = (patientName, doctorName, reason) =>
  baseTemplate(
    "Appointment Update",
    `<h2>Appointment Not Approved ❌</h2>
     <p>Hi <strong>${patientName}</strong>,</p>
     <p>Unfortunately, your appointment request with <strong>Dr. ${doctorName}</strong> was not approved.</p>
     ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ""}
     <span class="badge badge-danger">Rejected</span>
     <p>You can book another appointment at a different time.</p>
     <a href="${process.env.CLIENT_URL}/doctors" class="btn">Browse Doctors</a>`
  );

const doctorApproved = (doctorName) =>
  baseTemplate(
    "Doctor Account Approved",
    `<h2>Your Application is Approved 🎉</h2>
     <p>Hi <strong>Dr. ${doctorName}</strong>,</p>
     <p>Congratulations! Your doctor profile has been reviewed and <strong>approved</strong> by our admin team.</p>
     <span class="badge badge-success">Approved</span>
     <p>You can now start accepting appointments from patients.</p>
     <a href="${process.env.CLIENT_URL}/login" class="btn">Go to Dashboard</a>`
  );

const doctorRejected = (doctorName, reason) =>
  baseTemplate(
    "Doctor Application Update",
    `<h2>Application Status Update</h2>
     <p>Hi <strong>Dr. ${doctorName}</strong>,</p>
     <p>After review, your doctor application could not be approved at this time.</p>
     ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ""}
     <span class="badge badge-danger">Rejected</span>
     <p>Please contact support if you believe this is an error.</p>`
  );

const followUpReminder = (patientName, doctorName, followUpDate) =>
  baseTemplate(
    "Follow-up Reminder",
    `<h2>Follow-up Reminder 🔔</h2>
     <p>Hi <strong>${patientName}</strong>,</p>
     <p>This is a reminder that you have a follow-up appointment with <strong>Dr. ${doctorName}</strong> on <strong>${followUpDate}</strong>.</p>
     <a href="${process.env.CLIENT_URL}/appointments" class="btn">View Details</a>`
  );

module.exports = {
  welcomeEmail,
  appointmentBookedPatient,
  appointmentBookedDoctor,
  appointmentApproved,
  appointmentRejected,
  doctorApproved,
  doctorRejected,
  followUpReminder,
};
