import React from "react"
import ReactMarkdown from "react-markdown"
import { StaticQuery } from "gatsby";
import moment from "moment";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { faAngleDown, faAngleUp } from '@fortawesome/free-solid-svg-icons'
import { faGithub } from '@fortawesome/free-brands-svg-icons'

import { GlobalStateContext, makeMessage } from "../components/globalState.js"

class GridItem extends React.Component {

    constructor(props) {
        super(props);
        this.owner = props.item.owner;
        this.repo = props.item;
        this.releasesURL = `${props.item.url}/releases`;
        this.state = {
            viewReadme: false,
            activeVersion: props.item.releases.edges.length ? props.item.releases.edges[0].node : null
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
            'id': active.id
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
                    const installElement = (<a href={`#${props.item.id}`} onClick={() => {
                        globalState.sendMessage('Install requested', 'install', this.getDataForInstallMessage())
                    }} className="card-footer-item">Install</a>)
                    const installedElement = (<span className="card-footer-item">Installed</span>)
                    const selectElement = (
                    <div className="select">
                        <select onChange={(event) => {this.setState(
                            {
                                activeVersion: globalState.repositoryMap[this.owner.id][this.repo.id][event.target.value].node
                            }
                        )}}>
                            {props.item.releases.edges.map((edge) => <option key={edge.node.id} value={edge.node.id}>{edge.node.tagName} {release['id'] == edge.node.id ? '(Installed)' : ''}</option>)}
                        </select>
                    </div>);
                    return (
                <div className="card" key={props.index} id={this.repoID}>
                    <header className="card-header">
                            
                        <span className="card-header-title">
                            <a href={props.item.url} target="_blank" className="card-header-title" aria-label="more options">
                                <span className="icon">
                                    <FontAwesomeIcon icon={faGithub} />
                                </span>
                                {props.item.name}
                            </a>
                        {selectElement}
                        </span>
                        <a href={`#${this.repoID}`} onClick={this.toggleReadme} className="card-header-icon" aria-label="more options">
                        Read {this.state.viewReadme ? 'Less' : 'More'}
                            <span className="icon">
                                <FontAwesomeIcon icon={this.state.viewReadme ? faAngleUp : faAngleDown} />
                            </span>
                        </a>
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
                        <a href={`#${this.repoID}`} className="card-footer-item">Download</a>
                        {isModReady ? release['id'] == this.state.activeVersion.id ? installedElement : installElement : null}
                        <a href={this.releasesURL} className="card-footer-item">{props.item.releases.totalCount} Older Releases</a>
                    </footer>
                </div>)}}
            </GlobalStateContext.Consumer>
        )
    }
}

export default GridItem