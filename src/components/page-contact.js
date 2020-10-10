import {
  Button,
  CircularProgress,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  TextField,
  useTheme
} from '@material-ui/core';
import { graphql } from 'gatsby';
import React, { useRef } from 'react';
import { sendMail } from '../util/util';
import { parseWPHTMLString } from '../util/wp-parser';
import Layout from './layout';

export default function Contact({ path, data }) {
  const theme = useTheme();

  const [snackOpen, setSnackOpen] = React.useState(false);
  const [snackMsg, setSnackMsg] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [subject, setSubject] = React.useState('');

  const nameFirstRef = useRef(null);
  const nameLastRef = useRef(null);
  const emailRef = useRef(null);
  const commentRef = useRef(null);

  const handleEmailSubmit = () => {
    // Prevent repetitive submissions
    if (loading) return;

    // Hacky access of material-ui input values for speed
    const mailData = {
      first: nameFirstRef.current.children[1].firstElementChild.value,
      last: nameLastRef.current.children[1].firstElementChild.value,
      email: emailRef.current.children[1].firstElementChild.value,
      body: commentRef.current.children[1].firstElementChild.value,
      subject
    };

    let emailReg = /(?:[a-z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+\/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/g;

    if (
      mailData.first === '' ||
      mailData.last === '' ||
      mailData.email === '' ||
      mailData.body === '' ||
      mailData.subject === ''
    ) {
      setSnackMsg('Please fill out all fields');
      setSnackOpen(true);
      return;
    } else if (!emailReg.exec(mailData.email)) {
      setSnackMsg('Please enter a valid email address');
      setSnackOpen(true);
      return;
    }

    setLoading(true);

    sendMail(mailData)
      .then((res) => {
        setSnackMsg('Email sent, thanks for contacting us!');
        setSnackOpen(true);
        nameFirstRef.current.children[1].firstElementChild.value = '';
        nameLastRef.current.children[1].firstElementChild.value = '';
        emailRef.current.children[1].firstElementChild.value = '';
        commentRef.current.children[1].firstElementChild.value = '';
        setLoading(false);
      })
      .catch((e) => {
        console.log(e);
        setSnackMsg('Email error, please try again later.');
        setSnackOpen(true);
        setLoading(false);
      });
  };

  return (
    <Layout path={path}>
      <div style={{ minHeight: 'calc(100vh - 64px - 530px)' }}>
        <h1 className="header-text text-center">{data.wordpressPage.title}</h1>
        <div className="entry-content">
          {parseWPHTMLString(data.wordpressPage.content)}
          <div>
            <form id="contact-form" style={{ width: '100%' }}>
              <div id="contact-name">
                <TextField
                  required
                  name="first"
                  type="text"
                  id="nameFirst"
                  label="First Name"
                  ref={nameFirstRef}
                  style={{ width: '45%' }}
                />
                <TextField
                  required
                  name="last"
                  type="text"
                  id="nameLast"
                  label="Last Name"
                  ref={nameLastRef}
                  style={{ width: '45%' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <TextField
                  required
                  name="email"
                  type="text"
                  className="form-control"
                  id="email"
                  label="Email"
                  ref={emailRef}
                  style={{ width: '45%' }}
                />
                <div
                  style={{ width: '45%', position: 'relative', top: '10px' }}
                >
                  <InputLabel htmlFor="email-subject">Subject</InputLabel>
                  <Select
                    required
                    label="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    name="subject"
                    id="email-subject"
                    style={{ width: '100%' }}
                  >
                    <MenuItem value="Question/Information">
                      Question/Information
                    </MenuItem>
                    <MenuItem value="Request Appointment">
                      Request Appointment
                    </MenuItem>
                    <MenuItem value="Free First Consultation">
                      Free First Consultation
                    </MenuItem>
                  </Select>
                </div>
              </div>

              <TextField
                multiline
                required
                name="body"
                type="text"
                className="form-control"
                id="comment"
                rows="4"
                label="Comment"
                ref={commentRef}
              />

              <Button
                variant="contained"
                color="primary"
                id="contact-submit"
                onClick={handleEmailSubmit}
                style={{ height: '36px' }}
              >
                {loading ? (
                  <div
                    style={{
                      marginRight: '5px',
                      position: 'relative',
                      top: '2px'
                    }}
                  >
                    <CircularProgress
                      style={{ width: '20px', height: '20px', color: 'white' }}
                    />
                  </div>
                ) : null}
                <div>Submit</div>
              </Button>
            </form>
          </div>
        </div>
        <Snackbar
          open={snackOpen}
          autoHideDuration={4000}
          onClose={() => setSnackOpen(false)}
          message={snackMsg}
        />
      </div>
    </Layout>
  );
}

export const query = graphql`
  query($slug: String!) {
    wordpressPage(slug: { eq: $slug }) {
      title
      content
    }
  }
`;
