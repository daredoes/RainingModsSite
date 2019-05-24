import PropTypes from "prop-types"
import React from "react"
import { Link } from "gatsby"
import { GlobalStateContext, makeMessage } from "../components/globalState.js"
import Filters  from "./filters"
import InstallbyId from "./installById"
import ModManager from './manager'

import { toast, MDBNavbar, MDBNavbarBrand, MDBNavbarNav, MDBNavItem, MDBPopover, MDBPopoverHeader, MDBNavbarToggler, MDBCollapse, MDBDropdown, MDBDropdownToggle, MDBDropdownMenu, MDBHamburgerToggler, MDBContainer } from 'mdbreact';

class Header extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sortDateDirectionDescending: true,
      isOpen: false,
    }
  }

  toggleCollapse = () => {
    this.setState({ isOpen: !this.state.isOpen})
  }

  render() {
    const { siteTitle, description, client } = this.props;
    const latestClientRelease = client.releases.edges.length && client.releases.edges[0].node.releaseAssets.nodes.length ? client.releases.edges[0].node.releaseAssets.nodes[0] : null;
    let latestClientReleaseURL = latestClientRelease.downloadUrl;
    
    return (
      <GlobalStateContext.Consumer>
        {(globalState) => { 
          const hasRootFolder = globalState.user && globalState.user.rootFolder;
          const rootFolder = globalState.user ? globalState.user.rootFolder : "";
          const noUserElement = <p className="column is-12 has-text-centered  is-6 has-text-danger subtitle">Download our <a target={`${latestClientReleaseURL ? '_blank' : ''}`} href={`${latestClientReleaseURL || '#'}`}>Automatic Mod Installer<sup>{parseInt(latestClientRelease.size / 1000000)}MB</sup></a>, or turn it on <a role="button" tabIndex="0" onClick={() => {
            if (globalState.lookForClient) {
              let seconds = prompt('Enter a value of time in seconds for RainingMods to check for the client. Enter 0 to stop refreshing.', parseInt(globalState.lookForClientTimeout / 1000).toString());
              if (seconds) {
                seconds = parseInt(seconds) * 1000;
                if (seconds > 0) {
                  globalState.updateState({
                    lookForClientTimeout: seconds,
                    lookForClient: true,
                    lookForClientTimer: setInterval(globalState.lookForClientNow, seconds)
                  })
                } else {
                  if (globalState.lookForClientTimer) {
                    clearInterval(globalState.lookForClientTimer);
                  }
                  globalState.updateState({
                    lookForClient: false,
                    lookForClientTimer: null
                  })
                }
              }
            } else {
              globalState.updateState({
                lookForClient: true,
                lookForClientTimeout: 5000,
                lookForClientTimer: setInterval(globalState.lookForClientNow, 5000)
              })

            }
            
          }}>{globalState.lookForClient ? `while we check every ${parseInt(globalState.lookForClientTimeout / 1000)} seconds` : `and click here`}</a> to <Link to="/second">supercharge</Link> the website!</p>;
          const hasRootFolderElement = <p className="column is-12 has-text-centered is-6 has-text-success subtitle">Risk of Rain 2 {globalState.user && globalState.user.has_bepin && 'and BepInEx'} located at <a onClick={() => {
            const newPath = prompt('Enter the path to the folder where Risk of Rain 2.exe is found.\nThis is located in your Steam folder under "steamapps/common".', rootFolder || "C:\\Program Files (x86)\\Steam\\steamapps\\common\\Risk of Rain 2");
            if (newPath) {
              globalState.updateRootFolder(newPath)
            }
          }}>{rootFolder || ""}</a></p>;
          const missingRootFolderElement = <p className="column is-12 has-text-centered is-6 has-text-danger subtitle">Risk of Rain 2 cannot be located. We checked <a onClick={() => {
            const newPath = prompt('Enter the path to the folder where Risk of Rain 2.exe is found.\nThis is located in your Steam folder under "steamapps/common".', rootFolder || "C:\\Program Files (x86)\\Steam\\steamapps\\common\\Risk of Rain 2");
            if (newPath) {
              globalState.updateRootFolder(newPath)
            }
          }}>{rootFolder || "C:\\Program Files (x86)\\Steam\\steamapps\\common\\Risk of Rain 2"}</a></p>;
          return (
            <MDBContainer fluid className="sticky-top">
              <MDBNavbar dark color="unique-color"  expand="md">
                <MDBNavbarBrand>
                  <a href="#" className="text-light">
                    <strong>{siteTitle}</strong>
                  </a>
                </MDBNavbarBrand>
                <MDBNavbarToggler onClick={this.toggleCollapse} />
                <MDBCollapse navbar id="navbarCollapse" isOpen={this.state.isOpen}>
                  <MDBNavbarNav left>
                    <MDBNavItem>
                      <Filters globalState={globalState} />
                    </MDBNavItem>
                    <MDBNavItem>
                      <ModManager globalState={globalState} release={latestClientRelease} />
                    </MDBNavItem>
                    <InstallbyId globalState={globalState} />
                  </MDBNavbarNav>
                </MDBCollapse>
              </MDBNavbar>
            </MDBContainer>
        )}}
        
      </GlobalStateContext.Consumer>

    )
  }
}

Header.propTypes = {
  siteTitle: PropTypes.string,
}

Header.defaultProps = {
  siteTitle: ``,
}

export default Header
