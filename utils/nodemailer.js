// const nodemailer = require("nodemailer")
// const ErrorHandler = require("./ErrorHandler")
// const { simpleParser } = require('mailparser');
// const { SMTPServer } = require('nodemailer-inbound');
// const bodyParser = require('body-parser');

// exports.sendmail = (req,res,next) =>{
//     const transport = nodemailer.createTransport({
//         service:"gmail",
//         host:"smtp.gmail.com",
//         // post:465,
//         port:587,
//         secure:true,
//         auth:{
//             user:process.env.MAIL_EMAIL_ADDRESS,
//             pass:process.env.MAIL_PASSWORD
//         }
//     })
//     const mailoptions = {
//         // from: `${req.body.email}`,
//         from: `${req.body.email}`,
//         // to: `${req.body.email}`,
//         to: process.env.MAIL_EMAIL_ADDRESS,
//         subject: "Enquiry For Event",
//         html: `
//             <h1>Client Details</h1>
//             <p><strong>Event Details:</strong> ${req.body.eventdetails}</p>
//             <p><strong>Event Type:</strong> ${req.body.eventtype}</p>
//             <p><strong>Event Dates:</strong> ${req.body.dates}</p>
//             <p><strong>Venue:</strong> ${req.body.venue}</p>
//             <p><strong>Contact Number:</strong> ${req.body.contact}</p>
//             <p><strong>Customer Email:</strong> ${req.body.email}</p>
//             <p><strong>Applicant Name:</strong> ${req.body.applicantname}</p>
            
//             ${req.body.eventtype === 'wedding' ? `
//                 <p><strong>Bride Name (optional):</strong> ${req.body.brideName || 'Not provided'}</p>
//                 <p><strong>Groom Name (optional):</strong> ${req.body.groomName || 'Not provided'}</p>
//             ` : ''}`
//     };
    
//     transport.sendMail(mailoptions,(err,info) =>{
//         if(err) return next (new ErrorHandler(err , 500))
//         console.log(info)
//         return res.status(200).json({
//             message:"mail sent successfully",
//             url
//         })
//     })
// }

exports.sendmail = (req,res,next) =>{


const Imap = require('imap');
const MailParser = require('mailparser').simpleParser;

const imap = new Imap({
  user: 'your_email@gmail.com',
  password: 'your_password',
  host: 'imap.gmail.com',
  port: 993,
  tls: true,
  tlsOptions: { rejectUnauthorized: false }
});

function fetchUnreadMails() {
    imap.once('ready', function() {
        imap.openBox('INBOX', true, function(err, box) {
            if (err) throw err;

            const searchCriteria = ['UNSEEN'];
            const fetchOptions = { bodies: ['HEADER', 'TEXT'], markSeen: true };

            imap.search(searchCriteria, function(err, results) {
                if (err) throw err;

                const mailStream = imap.fetch(results, fetchOptions);

                mailStream.on('message', function(message) {
                    message.on('body', function(stream, info) {
                        simpleParser(stream, (err, mail) => {
                            console.log('Subject:', mail.subject);
                            console.log('Body:', mail.text);
                        });
                    });
                });

                mailStream.once('end', function() {
                    imap.end();
                });
            });
        });
    });

    imap.connect();
}

}
