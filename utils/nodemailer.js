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
                <p><strong>Bride Name (optional):</strong> ${req.body.bridename || 'Not provided'}</p>
                <p><strong>Groom Name (optional):</strong> ${req.body.groomname || 'Not provided'}</p>
            ` : ''}`
    };
    // const mailOptionsToUser = {
    //     from: process.env.MAIL_EMAIL_ADDRESS,
    //     to: req.body.email,
    //     subject: "Thank You for Reaching Out to JS Candid",
    //     html: `
    //         <p>We've received your inquiry and will be in touch shortly. Thank you for considering JS Candid for your special occasion!</p>
    //     `
    // };
    const mailOptionsToUser = {
        from: process.env.MAIL_EMAIL_ADDRESS,
        to: req.body.email,
        subject: "Thank You for Choosing JS Candid",
        html: `
            <p>Dear ${req.body.applicantname},</p>
            <p>Thank you for choosing JS Candid! Your inquiry is important to us, and we're excited about the possibility of capturing your special moments.</p>
            <p>We've noted the following details:</p>
            <ul>
                <li><strong>Event Details:</strong> ${req.body.eventdetails}</li>
                <li><strong>Event Type:</strong> ${req.body.eventtype}</li>
                <li><strong>Event Dates:</strong> ${req.body.dates}</li>
                <li><strong>Venue:</strong> ${req.body.venue}</li>
                <li><strong>Contact Number:</strong> ${req.body.contact}</li>
                <!-- Add more details as needed -->
            </ul>
            <p>Our team will reach out shortly to discuss your photography needs and provide you with more information about our services.</p>
            <p>Thank you for considering JS Candid for capturing your cherished moments!</p>
            <p>Best Regards,<br>JS Candid Team</p>
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

            // console.log(userInfo);
            return res.status(200).json({
                message: "Mail sent successfully",
                url
            });
        });
    });


}
