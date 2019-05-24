/**
 * Implement Gatsby's Browser APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/browser-apis/
 */

import React from "react"

import "@fortawesome/fontawesome-free/css/all.min.css";
import "bootstrap-css-only/css/bootstrap.min.css";
import "./static/mdbreact/scss/mdb.scss";

import { GlobalState } from "./src/components/globalState.js"

export const wrapRootElement = ({ element }) => {
    return (
        <GlobalState>
            {element}
        </GlobalState>
    )
}