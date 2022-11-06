// !imports
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const parse = require('csv-parser');
const multer = require('multer');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();

//! middlewares
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(express.static('./public/'));
app.use(bodyParser.json());
app.use(cors());

//! port
const port = process.env.PORT || 9000;

//! home route
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/result.html');
});

//!multer config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads');
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '.csv');
  },
});

const upload = multer({ storage: storage }).single('csvfile');

//!csv file reading and storing on an array
let emails = [];
let names = [];
const csvParsing = async () => {
  const results = [];
  return new Promise((resolve, reject) => {
    fs.createReadStream('./uploads/csvfile.csv')
      .pipe(parse())
      .on('data', (data) => results.push(data))
      .on('error', (error) => {
        console.log(error);
        reject();
      })
      .on('end', () => {
        results.map((email) => {
          emails.push(email['Recommended Contact Email']);
          names.push(
            email['Recommended Contact First Name'] +
              ' ' +
              email['Recommended Contact Last Name']
          );
        });
        resolve();
      });
  });
};

// const test = async () => {
//   await csvParsing();
//   emails.forEach((data, index) => {
//     if (data !== '') {
//       console.log(data, index, names[index]);
//     }
//   });
// };

// test();

app.post('/submitCsv', async (req, res) => {
  upload(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      res.json('Could not read the file .. Try Again').status(500);
    } else if (err) {
      res.json('Could not read the file .. Try Again').status(500);
    }
    res.json('Csv file received !').status(200);
  });
});

let htmlData = ``;
app.post('/submitHtml', (req, res) => {
  htmlData = req.body.html;
  res.json('got it');
});

// const pattern = /\{([^}]+)\}/g;
// const hello = 'kwwwwwwwww{hello}33ppp3kkw{bbbbb}';
// const bal = hello.match(pattern);
// const bal2 = hello.replace(pattern, 'nihal');
// console.log(bal);
// console.log(bal + '   ' + bal2);

// let path = '/{id}/{name}/{age}';
// const paramsPattern = /[^{\}]+(?=})/g;
// let extractParams = path.match(paramsPattern);
// console.log('extractParams', extractParams);

//! send email route
app.post('/sendemail', async (req, res) => {
  try {
    const template = htmlData.toString('base64');
    const { subject, userName, clientId, clientSecret, accessToken } = req.body;
    await csvParsing();
    if (emails !== []) {
      emails.forEach((value, index) => {
        if (value !== '') {
          //!transport
          const pattern = /\{\{\{([^}]+)\}\}\}/g;
          const html = template.replace(pattern, names[index]);
          const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              type: 'OAuth2',
              user: userName,
              clientId: clientId,
              clientSecret: clientSecret,
              accessToken: accessToken,
            },
          });
          // const transporter = nodemailer.createTransport({
          //   host: 'smtp.example.com',
          //   port: 587,
          //   secure: false, // upgrade later with STARTTLS
          //   auth: {
          //     user: 'username',
          //     pass: 'password',
          //   },
          // });
          let mailOptions = {
            from: 'Nihal <apar.asif.an@gmail.com>',
            to: value,
            replyTo: 'apar.asif.an@gmail.com',
            subject: subject,
            html: html,
            attachments: [],
          };
          transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
              console.log(error);
              res.end('Please give correct info about your smtp sever');
            } else {
              console.log('Email sent: ' + info.response);
            }
          });
        }
      });
      fs.unlink('./uploads/csvfile.csv', function (err) {
        if (err) {
          return res.end('error');
        } else {
          console.log('deleted');
          return res.end('success').status(200);
        }
      });
    } else res.json('Error Occured !').status(400);
  } catch (error) {
    res.json('Error').status(400);
  }
});

//!not found middleware
app.use((req, res) => {
  res.json('Route Does Not Exist').status(400);
});

//!listen
app.listen(port, () => {
  console.log(`App started on Port : ${port}`);
});
