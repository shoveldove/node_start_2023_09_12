const nodemailer = require('nodemailer');
const pug = require('pug');
const juice = require('juice');
const htmlToText = require('html-to-text');
const promisify = require('es6-promisify');

const transport = nodemailer.createTransport({

    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    auth: {

        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS

    }

});

const generate_HTML = (file_name, options = {}) => {

    const html = pug.renderFile(`${__dirname}/../views/email/${file_name}.pug`, options);
    const inlined = juice(html);
    return inlined;

}

exports.send_email = async (options) => {
    
    const html = generate_HTML(options.file_name, options);
    const text = htmlToText.fromString(html); 
    const mail_options = {

        from: `Admin <admin@mulletbifpib.com>`,
        to: options.user.email,
        subject: options.subject,
        html,
        text

    };

    const send_email = promisify(transport.sendMail, transport);
    return send_email(mail_options);

}