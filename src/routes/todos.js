const express = require("express");
const {nanoid} = require('nanoid');
const router = express.Router();
const Imap = require('imap');
const {simpleParser} = require('mailparser');

const V_DATA = 
  {
    attachments: [
      {
        type: 'attachment',
        content: [Buffer [Uint8Array]],
        contentType: 'application/pdf',
        partId: '2',
        release: null,
        contentDisposition: 'attachment',
        filename: 'CAMPAIGN.pdf',
        contentId: '<f_ljzvdbgo0>',
        cid: 'f_ljzvdbgo0',
        headers: [Map],
        checksum: '16709aa159b60e9b184965c7fe037e3c',
        size: 14588
      }
    ],
    html: '<meta http-equiv="Content-Type" content="text/html; charset=utf-8"><div dir="ltr">thanks</div>\n',
    text: 'thanks\n',
    textAsHtml: '<p>thanks</p>',
    subject: 'okay',
    date: "2023-07-12T15:22:00.000Z",
    to: {
      value: [ { address: 'poyilong@outlook.com', name: 'Po Yilong' } ],
      html: '<span class="mp_address_group"><a href="mailto:poyilong@outlook.com" class="mp_address_email">poyilong@outlook.com</a></span>',
      text: 'poyilong@outlook.com'
    },
    from: {
      value: [ { address: '000fulldev100@gmail.com', name: 'Full Dev' } ],
      html: '<span class="mp_address_group"><span class="mp_address_name">Full Dev</span> &lt;<a href="mailto:000fulldev100@gmail.com" class="mp_address_email">000fulldev100@gmail.com</a>&gt;</span>',
      text: 'Full Dev <000fulldev100@gmail.com>'
    },
    messageId: '<CAP8_JLKSQBdUKiSwt=5ZMoRtq7CJQFfdKD6FiqD-dsCWyqjT1A@mail.gmail.com>'
  }

const imapConfig = {
    user: 'poyilong@outlook.com',
    password: 'aaa2413a',
    host: 'outlook.office365.com', //imap.gmail.com
    port: 993,
    tls: true,
};

const idLength = 8;

const getEmails = () => {
    try {
      const imap = new Imap(imapConfig);
      imap.once('ready', () => {
        imap.openBox('INBOX', false, () => {
          imap.search(['ALL', ['SINCE', 'May 20, 2010']], (err, results) => {
            const f = imap.fetch(results, {bodies: ''});
            f.on('message', msg => {
              msg.on('body', stream => {
                simpleParser(stream, async (err, parsed) => {
                  const {from, subject, textAsHtml, text} = parsed;
                  console.log(parsed);
                  /* Make API call to save the data
                     Save the retrieved data into a database.
                     E.t.c
                  */
                });
              });
              msg.once('attributes', attrs => {
                const {uid} = attrs;
                imap.addFlags(uid, ['\\Seen'], () => {
                  // Mark the email as read after reading it
                  console.log('Marked as read!');
                });
              });
            });
            f.once('error', ex => {
              return Promise.reject(ex);
            });
            f.once('end', () => {
              console.log('Done fetching all messages!');
              imap.end();
            });
          });
        });
      });
  
      imap.once('error', err => {
        console.log(err);
      });
  
      imap.once('end', () => {
        console.log('Connection ended');
      });
  
      imap.connect();
    } catch (ex) {
      console.log('an error occurred');
    }
  };

router.get('/inbox', (req,res) => {

  //  let todos = req.app.db.get('todos').value();
  //  getEmails();
  try {
    const imap = new Imap(imapConfig);
    imap.once('ready', () => {
      imap.openBox('INBOX', false, () => {
        imap.search(['ALL', ['SINCE', 'May 20, 2010']], (err, results) => {
          const f = imap.fetch(results, {bodies: ''});
          f.on('message', msg => {
            msg.on('body', stream => {
              simpleParser(stream, async (err, DATA) => {
                const {from, subject, textAsHtml, text} = DATA;
                // console.log(parsed);
                /* Make API call to save the data
                   Save the retrieved data into a database.
                   E.t.c
                */
                   var email_date = new Date(DATA.date);

                   var today = new Date();
                   var diffMs = (today - email_date); // milliseconds between now & Christmas
                   var diffDays = Math.floor(diffMs / 86400000); // days
                   var diffHrs = Math.floor((diffMs % 86400000) / 3600000); // hours
                   var diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000); // minutes
                   var str_diff = diffDays + " days, " + diffHrs + " hours, " + diffMins + " minutes ago";
                   if (diffDays > 0) {
                       str_diff = diffDays + " days ago";
                   }
                   else if (diffHrs > 0)
                   {
                       str_diff = diffHrs + " hours ago"
                   }
                   else {
                       str_diff = diffMins + " minutes ago";
                   }
                   return res.send({"success": true, "data": {
                       id: DATA.messageId,
                       sender: DATA.from.text,
                       senderValue: DATA.from.value,
                       to: DATA.to.text,
                       toValue: DATA.to.value,
                       time: str_diff,
                       sentTime: DATA.date,
                       title: DATA.subject,
                       html: DATA.html,
                       textAsHtml: DATA.textAsHtml,
                       desc: DATA.text,
                       hasAttachment: true,
                       attachments: DATA.attachments,
                       unread: false
                   }
                   });
              });
            });
            msg.once('attributes', attrs => {
              const {uid} = attrs;
              imap.addFlags(uid, ['\\Seen'], () => {
                // Mark the email as read after reading it
                console.log('Marked as read!');
              });
            });
          });
          f.once('error', ex => {
            return Promise.reject(ex);
          });
          f.once('end', () => {
            console.log('Done fetching all messages!');
            imap.end();
          });
        });
      });
    });

    imap.once('error', err => {
      console.log(err);
    });

    imap.once('end', () => {
      console.log('Connection ended');
    });

    imap.connect();
  } catch (ex) {
    console.log('an error occurred');
  }

});

// router.get('/:id', (req,res) => {

//     let todo = req.app.db.get('todos').find({ 
//         id: req.params.id
//     }).value();

//     if(!todo){

//         res.sendStatus(404);

//         return res.send({
//             message: "Todo cannot be found",
//             internal_code: "Invalid id"
//         });

//     };

//     return res.send(todo);

// });

// router.post('/', (req,res) => {

//     let todo = {
//         id:nanoid(idLength),
//         ...req.body
//     };

//     try {

//         req.app.db.get("todos").push(todo).write();
        
//         return res.sendStatus(201).send("Todo saved successfully");

//     }catch(error){

//         return res.sendStatus(500).send(error);
//     }
// });

// router.put('/:id', (req,res) => {

//     //find todo.
//     let todo = req.app.db.get("todos").find({
//         id: req.params.id
//     }).value();

//     if(!todo){

//         return res.sendStatus(404);

//     };

//     //update that todo.
//     try {

//         req.app.db.get("todos").find({
//             id:req.params.id
//         })
//         .assign({ completed: !todo['completed'] })
//         .write();

//         return res.send("Todo updated");

//     } catch(error) {

//         res.sendStatus(500);

//         return res.send(error);

//     };

// });

// router.delete('/:id', (req,res) => {

//     //find todo.
//     let todo = req.app.db.get("todos").find({
//         id:req.params.id
//     }).value();

//     if(!todo){

//         return res.sendStatus(404);

//     };

//     // delete the todo.
//     try {
//         req.app.db.get("todos").remove({
//             id:req.params.id
//         })
//         .write();

//         return res.send("Todo deleted");

//     } catch(error) {

//         return res.sendStatus(500);

//     }

// });

module.exports = router;