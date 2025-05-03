const nodemailer = require('nodemailer');

async function enviarEmail(destinatario, assunto, texto) {
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    let mailOptions = {
        from: process.env.EMAIL_USER,
        to: destinatario,
        subject: assunto,
        text: texto
    };

    await transporter.sendMail(mailOptions);
}

module.exports = { enviarEmail };