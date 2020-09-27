import {
  AppBar,
  Button,
  createMuiTheme,
  Drawer,
  makeStyles,
  Menu,
  MenuItem,
  TextField,
  ThemeProvider,
  Toolbar,
  withStyles
} from '@material-ui/core';
import { deepPurple, teal } from '@material-ui/core/colors';
import { graphql, Link, useStaticQuery } from 'gatsby';
import React from 'react';
import EmailIcon from '../assets/email-icon';
import logo from '../assets/innerpathlogos.svg';
import MenuIcon from '../assets/menu-icon';
import PhoneIcon from '../assets/phone-icon';

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
          anchorEl={anchorEl}
          keepMounted
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          {item.children.map((child, i) => (
            <MenuItem id={i} onClick={handleClose}>
              <Link
                to={'../' + child.targetSlug}
                style={{
                  color: 'black',
                  paddingLeft: '8px',
                  paddingRight: '8px',
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
      <div>
        <Button
          color="inherit"
          key={i}
          style={{
            margin: '2px',
            textTransform: 'none'
          }}
          onClick={item.children.length ? handleClick : null}
        >
          {item.children.length ? (
            <span style={{ fontWeight: 400, fontSize: '16px' }}>
              {item.name}
            </span>
          ) : (
            <Link
              to={'../' + item.targetSlug}
              style={{
                color: linkColor,
                paddingLeft: '8px',
                paddingRight: '8px',
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
                    textTransform: 'none'
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
        <div
          style={{ position: 'absolute', width: '100%', height: '100%' }}
        ></div>
        <main>{children}</main>
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
                InputProps={{
                  style: {
                    caretColor: `${theme.palette.primary.main}`,
                    color: 'white'
                  }
                }}
              />

              <Button variant="outlined" color="primary" id="contact-submit">
                Submit
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
