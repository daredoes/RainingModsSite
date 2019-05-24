// Original by Azik Samarkandiy at http://cssdeck.com/labs/traffic-light-using-css
// Heavily modified by Baobab Koodaa.

import React from "react"
import Filter from "./filter"
import PropTypes from "prop-types"
import moment from "moment"

import { MDBDropdown, MDBDropdownToggle, MDBDropdownMenu, MDBDropdownItem } from 'mdbreact';

class ModManager extends React.Component {
    render() {
        let rootFolder = this.props.globalState.user ? this.props.globalState.user.rootFolder : "";
        let children = rootFolder ? [
            <MDBDropdownItem key="deactivate" href="#!" onClick={this.props.globalState.closeSocket}>
                Deactivate
            </MDBDropdownItem>
        ] : [
            <MDBDropdownItem key="download" href={this.props.release.downloadUrl} target="_blank">
                Download {parseInt(this.props.release.size / 1000000)}MB
            </MDBDropdownItem>,
            <MDBDropdownItem key="activate" href="#!" onClick={this.props.globalState.lookForClientNow}>
                Activate
            </MDBDropdownItem>
        ];
        return (
            <MDBDropdown>
                <MDBDropdownToggle nav caret className="text-light">
                    <div className="d-inline">Automatic Mod Manager</div>
                </MDBDropdownToggle>
                <MDBDropdownMenu className="dropdown-default">
                    {children}
                </MDBDropdownMenu>
            </MDBDropdown>
        )
    }
};

ModManager.propTypes = {
    globalState: PropTypes.object.isRequired,
    release: PropTypes.object.isRequired,
}

export default ModManager;