const nodemailer = require("nodemailer");
const config = require("../../config");

// template mail
const createMail = {
  mailActive: (username, idUser, codeActive) => {
    return `
    Hi ${username},
    
    Thanks for using our service, please access ${config.URL_SERVER}/auth/active?id=${idUser}&code=${codeActive} to activate your account.
    
    Thank you,
    Car0 team`;
  },
  mailResetPassword: () => {},
};

// config mailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  port: 587,
  secure: false,
  requireTLS: true,
  auth: {
    user: config.MAIL_ADDRESS,
    pass: config.MAIL_PASSWORD,
  },
});

// create mail Option
const mailActive = (mailAddress, username, idUser, codeActive) => ({
  from: config.MAIL_ADDRESS,
  to: mailAddress,
  subject: "Active account",
  text: createMail.mailActive(username, idUser, codeActive),
});

const sendMail = async (mailOptions) => {
  console.log("SEND MAIL");
  // send mail
  try {
    const res = await transporter.sendMail(mailOptions);
    console.log("[MAIL]: Send mail success");
  } catch (e) {
    console.log(`[MAIL-FAIL]: ${e.message}`);
  }
};

// sendMail(
//   mailActive("phanlehoaibaok10@gmail.com", "baobao", "ajsafah", "12345")
// );

module.exports = {
  sendMailActive: (mailAddress, username, idUser, codeActive) => {
    sendMail(mailActive(mailAddress, username, idUser, codeActive));
  },
};
