const nodeMailer=require("nodemailer")
exports.sendEmail=async(options)=>{
    const transporter= nodeMailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        auth:{
            user:'abhinavg@gmail.com',
            pass:'golu@2000',
        },
        service:"gmail"
    })
    const mailOptions= {
        from:'Nodemailer Contact',
        to: options.email,
        subject: options.subject,
        text: options.message
    }
    await transporter.sendMail(mailOptions)
}