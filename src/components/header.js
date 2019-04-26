import PropTypes from "prop-types"
import React from "react"

import { GlobalStateContext, makeMessage } from "../components/globalState.js"

const Header = ({ siteTitle }) => (
  <GlobalStateContext.Consumer>
    {globalState => (
      <header
      style={{
        background: `rebeccapurple`,
      }}
    >
        <div
          style={{
            margin: `0 auto 2px`,
            maxWidth: 960,
            padding: `1.45rem 1.0875rem`,
          }}
        >
          <h1 style={{ margin: 0, color: `white` }}>

              {siteTitle}

          </h1>
          { globalState.user && !globalState.user.rootFolder && <input type="text" value={globalState.user && globalState.user.rootFolder || ""} onChange={(event) => {
            globalState.updateRootFolder(event.target.value)
          }} /> }
        </div>
      </header>
    )}
    
  </GlobalStateContext.Consumer>

)

Header.propTypes = {
  siteTitle: PropTypes.string,
}

Header.defaultProps = {
  siteTitle: ``,
}

export default Header
