import React from "react"
import ReactDOM from 'react-dom'
import ReactMarkdown from "react-markdown"
import { StaticQuery } from "gatsby";
import moment from "moment";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { faAngleDown, faAngleUp, faCopy } from '@fortawesome/free-solid-svg-icons'
import { faGithub } from '@fortawesome/free-brands-svg-icons'

import { GlobalStateContext, makeMessage } from "../components/globalState.js"
import copyToClipboard from "../../scripts/copyToClipboard"

import { toast, MDBCard, MDBCardBody, MDBCardFooter, MDBCardHeader, MDBCardText, MDBCardTitle, MDBBtn, MDBRow, MDBCol } from 'mdbreact'

import { VersionManager } from './versionManager'

class GridItem extends React.Component {

    constructor(props) {
        super(props);
        this.owner = props.item.owner;
        this.repo = props.item;
        this.releasesURL = `${props.item.url}/releases`;
        this.uninstallData = {};
            this.uninstallData[this.owner.id] = this.repo.id;
        this.state = {
            viewReadme: false,
            activeVersion: props.item.releases.edges.length ? props.item.releases.edges[0].node : null
        }
    }

    componentDidUpdate = () => {
        let props = this.props;
        if (props.item.owner.id !== this.owner.id) {
            this.owner = props.item.owner;
            this.repo = props.item;
            this.releasesURL = `${props.item.url}/releases`;
            this.setState({
                activeVersion: props.item.releases.edges.length ? props.item.releases.edges[0].node : null
            })
            this.uninstallData = {};
            this.uninstallData[this.owner.id] = this.repo.id;
        }
    }

   

    toggleReadme = () => {
        this.setState({viewReadme: !this.state.viewReadme});
    }

    getDataForInstallMessage = () => {
        
        const active = this.state.activeVersion;
        let data = {};
        const item = this.props.item;
        const owner = item.owner;

        data[owner.id] = {
            'name': owner.login,
            'url': owner.url,
            'id': owner.id,
            'repos': {}
        };
        data[owner.id]['repos'][item.id] = {
            'id': item.id,
            'name': item.name,
            'url': item.url,
            'readme': item.readme.text,
            'description': item.description,
            'release': {}
        };
        data[owner.id]['repos'][item.id]['release'] = {
            'assets': {},
            'name': active.name,
            'tag_name': active.tagName,
            'url': active.url,
            'id': active.id,
            'updated_at': active.updatedAt
        };
        active.releaseAssets.nodes.forEach((edge) => {
            data[owner.id]['repos'][item.id]['release']['assets'][edge.id] = {
                'download': edge.downloadUrl,
                'name': edge.name,
                'content_type': edge.contentType,
                'id': edge.id
            }
        });
        return data;
    }

    render() {
        const props = this.props;
        const versions = props.item.releases.edges;
        return (
            <GlobalStateContext.Consumer>
                {(globalState) => {
                    const hasRootFolder = globalState.user && globalState.user.rootFolder;
                    const isModReady = globalState.user && globalState.user.has_bepin;

                    const release = globalState.user && globalState.user.mods && globalState.user.mods[this.owner.id] && globalState.user.mods[this.owner.id]['repos'][this.repo.id] ? globalState.user.mods[this.owner.id]['repos'][this.repo.id]['release'] : {};
                    const installElement = (<a role="button" tabIndex="0" onClick={() => {
                        globalState.sendMessage('Install requested', 'install', this.getDataForInstallMessage())
                    }} className="card-footer-item">{ release['updated_at'] ? moment(release['updated_at']) <= moment(this.state.activeVersion.updatedAt) ? 'Upgrade' : 'Downgrade' : 'Install'}</a>)
                    const installedElement = (<a role="button" tabIndex="0" onClick={() => {
                        globalState.sendMessage('Uninstall requested', 'uninstall', {data: this.uninstallData})
                    }} className="card-footer-item">Uninstall</a>)
                    const selectElement = (
                        <select className="browser-default custom-select" onChange={(event) => {this.setState(
                            {
                                activeVersion: globalState.repositoryMap[this.owner.id][this.repo.id][event.target.value].node
                            }
                        )}}>
                            {props.item.releases.edges.map((edge) => <option key={edge.node.id} value={edge.node.id}>{edge.node.tagName} {release['id'] == edge.node.id ? '(Installed)' : ''}</option>)}
                        </select>);
                    return (
                        <MDBCard>
                            <MDBCardHeader className="form-header rounded primary-color">
                                <MDBRow className="d-flex flex-column">
                                    <h4 className="my-1 text-center font-weight-bolder">{props.item.name}</h4>
                                    <h5 className="text-center font-weight-normal">{props.item.owner.login}</h5>
                                </MDBRow>
                                <MDBRow className="d-flex flex-wrap justify-content-center">
                                    <MDBBtn href={this.state.activeVersion.url} target="_blank" color="secondary" size="sm">Download</MDBBtn>
                                </MDBRow>
                            </MDBCardHeader>
                            <MDBCardBody>
                            {props.item.description}
                            
                            {this.state.viewReadme && props.item.readme && props.item.readme.text && <ReactMarkdown className="content" source={props.item.readme.text} />}
                            </MDBCardBody>
                            <MDBCardFooter>
                                <MDBRow>
                                    <MDBCol size={6}>
                                        <MDBBtn outline color="primary">ReadMe</MDBBtn>
                                    </MDBCol>
                                    <MDBCol size={6} className="d-flex justify-content-center align-items-center">
                                        {selectElement}
                                    </MDBCol>
                                </MDBRow>

                            </MDBCardFooter>
                        </MDBCard>
                    );
                    return (
                <div className="card mod" key={props.index} id={this.repo.id}>
                    <header className="card-header">
                    <div className="columns is-multiline is-mobile card-header-title">
                        <div className="column is-4">
                            <a href={props.item.url} target="_blank">
                                <span className="icon">
                                    <FontAwesomeIcon icon={faGithub} />
                                </span>
                                {props.item.name}
                            </a>
                        </div>
                        <div className="column is-4">
                            {selectElement}
                        </div>
                        <div className="column is-3">
                            <a role="button" tabIndex="0" onClick={this.toggleReadme} className="card-header-icon is-pulled-right" aria-label="more options">
                            {this.state.viewReadme ? 'Hide' : 'Show'} ReadMe
                                <span className="icon">
                                    <FontAwesomeIcon icon={this.state.viewReadme ? faAngleUp : faAngleDown} />
                                </span>
                            </a>
                        </div>
                        <div className="column is-1">
                            <a role="button" tabIndex="0" onClick={() => {
                                const joiningCharacter = '-'
                                const id = `${this.owner.id}${joiningCharacter}${this.repo.id}${joiningCharacter}${this.state.activeVersion.id}`;
                                copyToClipboard(id);
                                toast.info(<span>Copied <em>{id}</em> to clipboard</span>, {
                                    autoClose: 3000,
                                    hideProgressBar: false,
                                    pauseOnHover: false
                                })
                            }} className="button is-primary" aria-label="Copy ID to Clipboard" title="Copy ID to Clipboard">
                                <FontAwesomeIcon icon={faCopy} />
                            </a>
                        </div>
                    </div>
                        
                    </header>
                    <div className="card-content">
                        <div className="content">
                            {props.item.description}
                        </div>
                        <span className="has-text-weight-bold">Last Updated:</span> {moment(this.state.activeVersion.updatedAt).format('LLL')}
                        <br />
                        <span className="has-text-weight-bold">Version Downloads:</span> {this.state.activeVersion.downloadCount}
                        <br />
                        <span className="has-text-weight-bold">Total Downloads:</span> {props.item.downloadCount}
                        {this.state.viewReadme && props.item.readme && props.item.readme.text && <hr/>}
                        {this.state.viewReadme && props.item.readme && props.item.readme.text && <ReactMarkdown className="content" source={props.item.readme.text} />}
                    </div>
                    <footer className="card-footer">
                        <a href={this.state.activeVersion.url} className="card-footer-item">Download</a>
                        {isModReady ? release['id'] == this.state.activeVersion.id ? installedElement : installElement : null}
                        <a href={this.releasesURL} className="card-footer-item">All Releases</a>
                        <a role="button" tabIndex="0" onClick={this.toggleReadme} className="card-footer-item" aria-label="more options">
                            {this.state.viewReadme ? 'Hide' : 'Show'} ReadMe
                                <span className="icon">
                                    <FontAwesomeIcon icon={this.state.viewReadme ? faAngleUp : faAngleDown} />
                                </span>
                            </a>
                    </footer>
                </div>)}}
            </GlobalStateContext.Consumer>
        )
    }
}

export default GridItem