import PropTypes from "prop-types"
import React from "react"
import { Link } from "gatsby"
import { GlobalStateContext, makeMessage } from "../components/globalState.js"

class Header extends React.Component {
  render() {
    const { siteTitle, description } = this.props;
    
    return (
      <GlobalStateContext.Consumer>
        {(globalState) => { 
          const hasRootFolder = globalState.user && globalState.user.rootFolder;
          const rootFolder = globalState.user ? globalState.user.rootFolder : "";
          const noUserElement = <p className="is-6 has-text-danger subtitle">Download our <a href="#">Automatic Mod Installer</a>, or turn it on to <Link to="/second">supercharge</Link> the website!</p>;
          const hasRootFolderElement = <p className="is-6 has-text-success subtitle">Risk of Rain 2 {globalState.user && globalState.user.has_bepin && 'and BepInEx'} located at <a onClick={() => {
            const newPath = prompt('Enter the path to the folder where Risk of Rain 2.exe is found.\nThis is located in your Steam folder under "steamapps/common".', rootFolder || "C:\\Program Files (x86)\\Steam\\steamapps\\common\\Risk of Rain 2");
            if (newPath) {
              globalState.updateRootFolder(newPath)
            }
          }}>{rootFolder || ""}</a></p>;
          const missingRootFolderElement = <p className="is-6 has-text-danger subtitle">Risk of Rain 2 cannot be located. We checked <a onClick={() => {
            const newPath = prompt('Enter the path to the folder where Risk of Rain 2.exe is found.\nThis is located in your Steam folder under "steamapps/common".', rootFolder || "C:\\Program Files (x86)\\Steam\\steamapps\\common\\Risk of Rain 2");
            if (newPath) {
              globalState.updateRootFolder(newPath)
            }
          }}>{rootFolder || "C:\\Program Files (x86)\\Steam\\steamapps\\common\\Risk of Rain 2"}</a></p>;
          return (
          <header style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center"
          }}>
              <a href="/" className="is-2 has-text-primary title">
                  {siteTitle}
              </a>
              <p className="is-5 has-text-primary subtitle">
                  {description}
              </p>
              {globalState.user && globalState.user.rootFolder ? rootFolder ? hasRootFolderElement : missingRootFolderElement : noUserElement}
              <div className="container">
                <p className="has-text-centered">
                  Filters
                </p>
                <div className="">
                  <span className="tag">hello</span>
                  <span className="tag">hello</span>
                </div>
              </div>
          </header>
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
