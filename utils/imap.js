// emailService.js

const Imap = require('imap');

const imapConfig = {
  user: 'your_email@example.com',
  password: 'your_email_password',
  host: 'imap.your_email_provider.com', // e.g., 'imap.gmail.com'
  port: 993,
  tls: true,
};

const receiveEmails = () => {
  const imap = new Imap(imapConfig);

  imap.once('ready', () => {
    imap.openBox('INBOX', true, (err, box) => {
      if (err) throw err;

      const searchCriteria = ['UNSEEN'];
      const fetchOptions = { bodies: 'TEXT', markSeen: true };

      const fetch = imap.seq.fetch(box.messages.total + ':*', fetchOptions);
      fetch.on('message', (msg) => {
        msg.on('body', (stream, info) => {
          let buffer = '';

          stream.on('data', (chunk) => {
            buffer += chunk.toString('utf8');
          });

          stream.on('end', () => {
            console.log('Received email body:', buffer);

            // Assuming the buffer contains HTML content, you can process it further
            // For example, you can extract and handle the HTML content here

            // Send the HTML content to a function that handles it
            handleHtmlContent(buffer);
          });
        });
      });

      fetch.once('end', () => {
        imap.end();
      });
    });
  });

  imap.once('error', (err) => {
    console.error('IMAP error:', err);
  });

  imap.once('end', () => {
    console.log('IMAP connection ended');
  });

  imap.connect();
};

const handleHtmlContent = (htmlContent) => {
  // Handle the HTML content as needed
  console.log('Handling HTML content:', htmlContent);
  // You can process the HTML content, extract information, or perform other actions
};

module.exports = {
  receiveEmails,
};
