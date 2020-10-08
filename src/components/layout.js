import {
  AppBar,
  Button,
  CircularProgress,
  createMuiTheme,
  Drawer,
  makeStyles,
  Menu,
  MenuItem,
  Snackbar,
  TextField,
  ThemeProvider,
  Toolbar,
  withStyles
} from '@material-ui/core';
import { deepPurple, teal } from '@material-ui/core/colors';
import { graphql, Link, useStaticQuery } from 'gatsby';
import React, { useRef } from 'react';
import EmailIcon from '../assets/email-icon';
// @ts-ignore
import logo from '../assets/innerpathlogos.svg';
import MenuIcon from '../assets/menu-icon';
import PhoneIcon from '../assets/phone-icon';
import { sendMail } from '../util/contact';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1
  },
  menuButton: {
    marginRight: theme.spacing(2)
  },
  title: {
    flexGrow: 1
  },
  drawerPaper: {
    width: 200
  }
}));

const CssTextField = withStyles((theme) => ({
  root: {
    '& label': {
      color: 'hsl(0, 0%, 64%)'
    },
    '& label.Mui-focused': {
      color: `${theme.palette.primary.main}`
    },
    '& .MuiInput-underline:before': {
      borderBottomColor: 'hsl(0, 0%, 64%)'
    },
    '&:hover .MuiInput-underline:before': {
      borderBottomColor: 'hsl(0, 0%, 64%)'
    },
    '& .MuiInput-underline:after': {
      borderBottomColor: `${theme.palette.primary.main}`
    }
  }
}))(TextField);

const theme = createMuiTheme({
  palette: {
    primary: teal,
    secondary: deepPurple
  },
  typography: {
    fontFamily: ['Work Sans', '"sans-serif"'].join(',')
  }
});

const Layout = ({ path, children }) => {
  const classes = useStyles();
  const menuData = useStaticQuery(graphql`
    query MenuQuery {
      allWordpressMenuItem {
        edges {
          node {
            name
            parentWpID
            targetSlug
            wpID
          }
        }
      }
    }
  `);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const [snackOpen, setSnackOpen] = React.useState(false);
  const [snackMsg, setSnackMsg] = React.useState('');
  const [loading, setLoading] = React.useState(false);

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
      body: commentRef.current.children[1].firstElementChild.value
      //subject: ''
    };

    let emailReg = /(?:[a-z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+\/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/g;

    if (
      mailData.first === '' ||
      mailData.last === '' ||
      mailData.email === '' ||
      mailData.body === ''
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

  const menuItems = menuData.allWordpressMenuItem.edges.map(
    (edge) => edge.node
  );

  const parentItems = menuItems
    .filter((item) => item.parentWpID === 0)
    .map((parent) => {
      parent.children = menuItems.filter(
        (child) => child.parentWpID === parent.wpID
      );
      return parent;
    });

  const parentMenu = parentItems.map((item, i) => {
    let submenu = null;
    const linkColor = drawerOpen ? 'black' : 'white';
    if (item.children.length) {
      submenu = (
        <Menu
          id={`${item.wpID}-menu`}
          key={i}
          anchorEl={anchorEl}
          keepMounted
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          {item.children.map((child, i) => (
            <MenuItem
              id={i}
              key={i}
              onClick={handleClose}
              style={{ margin: 0, padding: 0 }}
            >
              <Link
                to={'../' + child.targetSlug}
                style={{
                  color: 'black',
                  padding: '10px',
                  width: '100%'
                }}
              >
                <span style={{ fontWeight: 400, fontSize: '16px' }}>
                  {child.name}
                </span>
              </Link>
            </MenuItem>
          ))}
        </Menu>
      );
    }
    return (
      <div key={i}>
        <Button
          color="inherit"
          style={{
            textTransform: 'none',
            margin: '0 10px 0 0',
            padding: 0
          }}
          onClick={item.children.length ? handleClick : null}
        >
          {item.children.length ? (
            <span
              style={{ fontWeight: 400, fontSize: '16px', padding: '10px' }}
            >
              {item.name}
            </span>
          ) : (
            <Link
              to={'../' + item.targetSlug}
              style={{
                color: linkColor,
                padding: '10px',
                width: '100%'
              }}
            >
              <span style={{ fontWeight: 400, fontSize: '16px' }}>
                {item.name}
              </span>
            </Link>
          )}
        </Button>
        {submenu}
      </div>
    );
  });

  return (
    <ThemeProvider theme={theme}>
      <div>
        <div className={classes.root}>
          <AppBar position="static">
            <Toolbar>
              <Link to="/" style={{ color: 'white' }}>
                <Button
                  color="inherit"
                  style={{
                    textTransform: 'none',
                    margin: 0,
                    padding: 0
                  }}
                >
                  <img
                    loading="eager"
                    src={logo}
                    width="60px"
                    alt="flower-logo"
                  />
                  <span className="logo-text">
                    <span className="logo-text-1">Inner Path</span>
                    <span className="logo-text-2">Counseling & Wellness</span>
                  </span>
                </Button>
              </Link>
              <div style={{ flexGrow: 1 }}></div>
              <span style={{ display: 'flex' }} className="hide-main-menu">
                {parentMenu}
              </span>
              <Drawer
                anchor="right"
                open={drawerOpen}
                onClose={toggleDrawer}
                classes={{
                  paper: classes.drawerPaper
                }}
              >
                {parentMenu}
              </Drawer>
              <Button
                className="hide-button"
                style={{ color: 'white' }}
                onClick={toggleDrawer}
              >
                <MenuIcon style={{ width: '20px' }} />
              </Button>
            </Toolbar>
          </AppBar>
        </div>
        <main>{children}</main>
        <Snackbar
          open={snackOpen}
          autoHideDuration={4000}
          onClose={() => setSnackOpen(false)}
          message={snackMsg}
        />
        <footer>
          <h4 id="contact-text">Want to contact us?</h4>

          <div id="address-form">
            <div id="contact-info">
              <div>Inner Path Counseling and Wellness</div>
              <div className="divider"></div>
              <div>825 N Cass Ave</div>
              <div>Suite 115</div>
              <div>Westmont, IL 60559</div>
              <div className="divider"></div>
              <div>
                <PhoneIcon style={{ width: '20px', marginRight: '2px' }} />{' '}
                (708) 571-0082
              </div>
              <div>
                <EmailIcon style={{ width: '20px', marginRight: '2px' }} />{' '}
                innerpath.inquiries@gmail.com
              </div>
            </div>

            <form id="contact-form">
              <div id="contact-name">
                <CssTextField
                  required
                  name="first"
                  type="text"
                  id="nameFirst"
                  label="First Name"
                  ref={nameFirstRef}
                  InputProps={{
                    style: {
                      caretColor: `${theme.palette.primary.main}`,
                      color: 'white'
                    }
                  }}
                />
                <CssTextField
                  required
                  name="last"
                  type="text"
                  id="nameLast"
                  label="Last Name"
                  ref={nameLastRef}
                  InputProps={{
                    style: {
                      caretColor: `${theme.palette.primary.main}`,
                      color: 'white'
                    }
                  }}
                />
              </div>

              <CssTextField
                required
                name="email"
                type="text"
                className="form-control"
                id="email"
                label="Email"
                ref={emailRef}
                InputProps={{
                  style: {
                    caretColor: `${theme.palette.primary.main}`,
                    color: 'white'
                  }
                }}
              />

              <CssTextField
                multiline
                required
                name="body"
                type="text"
                className="form-control"
                id="comment"
                rows="4"
                label="Comment"
                ref={commentRef}
                InputProps={{
                  style: {
                    caretColor: `${theme.palette.primary.main}`,
                    color: 'white'
                  }
                }}
              />

              <Button
                variant="outlined"
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
                      style={{ width: '20px', height: '20px' }}
                    />
                  </div>
                ) : null}
                <div>Submit</div>
              </Button>
            </form>
          </div>

          <div id="copy">
            <p>
              © Inner Path Counseling And Wellness, LLC{' '}
              {new Date().getFullYear()}. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </ThemeProvider>
  );
};

export default Layout;
