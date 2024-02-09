const nodemailer = require("nodemailer")
const ErrorHandler = require("./ErrorHandler")

exports.sendmail = (req,res,next) =>{
    const transport = nodemailer.createTransport({
        service:"gmail",
        host:"smtp.gmail.com",
        port:465,
        secure:true,
        auth:{
            user:process.env.MAIL_EMAIL_ADDRESS,
            pass:process.env.MAIL_PASSWORD
        }
    })
    const mailOptionsToAdmin = {
        from: req.body.email,
        to: process.env.MAIL_EMAIL_ADDRESS,
        subject: "Enquiry For Event",
        html: `
            <h1>Client Details</h1>
            <p><strong>Event Details:</strong> ${req.body.eventdetails}</p>
            <p><strong>Event Type:</strong> ${req.body.eventtype}</p>
            <p><strong>Event Dates:</strong> ${req.body.dates}</p>
            <p><strong>Venue:</strong> ${req.body.venue}</p>
            <p><strong>Contact Number:</strong> ${req.body.contact}</p>
            <p><strong>Customer Email:</strong> ${req.body.email}</p>
            <p><strong>Applicant Name:</strong> ${req.body.applicantname}</p>
            
            ${req.body.eventtype === 'wedding' ? `
                <p><strong>Bride Name (optional):</strong> ${req.body.brideName || 'Not provided'}</p>
                <p><strong>Groom Name (optional):</strong> ${req.body.groomName || 'Not provided'}</p>
            ` : ''}`
    };
    const mailOptionsToUser = {
        from: process.env.MAIL_EMAIL_ADDRESS,
        to: req.body.email,
        subject: "Thank You for Your Enquiry",
        html: `
            <p>Thank you for your enquiry. We have received your details and will contact you shortly.</p>
        `
    };

    
    // transport.sendMail(mailoptions,(err,info) =>{
    //     if(err) return next (new ErrorHandler(err , 500))
    //     console.log(info)
    //     return res.status(200).json({
    //         message:"mail sent successfully",
    //         url
    //     })
    // })
    transport.sendMail(mailOptionsToAdmin, (err, info) => {
        if (err) return next(new ErrorHandler(err, 500));

        // Send thank-you email to the user
        transport.sendMail(mailOptionsToUser, (userErr, userInfo) => {
            if (userErr) return next(new ErrorHandler(userErr, 500));

            console.log(userInfo);
            return res.status(200).json({
                message: "Mail sent successfully",
                url
            });
        });
    });


}
