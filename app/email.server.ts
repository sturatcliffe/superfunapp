const nodemailer = require("nodemailer");
const nodemailerSendgrid = require("nodemailer-sendgrid");

const transport = nodemailer.createTransport(
  nodemailerSendgrid({
    apiKey: process.env.SG_KEY ?? "",
  })
);

const sendMail = async (
  recipientName: string,
  recipientEmail: string,
  subject: string,
  html: string
) => {
  try {
    if (process.env.SG_KEY) {
      await transport.sendMail({
        from: "no-reply@superfunapp.uk",
        to: `${recipientName} <${recipientEmail}>`,
        subject,
        html,
      });
    }
  } catch (err) {
    console.error(`Failed to send e-mail: ${err}`);
  }
};

export { sendMail };
