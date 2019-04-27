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
        this.state = {
            viewReadme: false,
            activeVersion: props.item.releases.edges.length ? props.item.releases.edges[0].node : null,
            ownerId: props.item.owner.id,
            releasesURL: `${props.item.url}/releases`
        }
    }

    toggleReadme = () => {
        this.setState({viewReadme: !this.state.viewReadme});
    }

    render() {
        const props = this.props;
        return (
            <GlobalStateContext.Consumer>
                {(globalState) => {
                    const hasRootFolder = globalState.user && globalState.user.rootFolder;
                    const isModReady = globalState.user && globalState.user.has_bepin;
                    const selectElement = <div className="select">
                    
                    <select onChange={(event) => {console.log(globalState.repositoryMap); console.log(this.state); console.log(event.target.value); this.setState({
                        
                        activeVersion: globalState.repositoryMap[this.state.ownerId][props.item.id][event.target.value].node
                    })}}>
                        {props.item.releases.edges.map((edge) => <option key={edge.node.id} value={edge.node.id}>{edge.node.tagName}</option>)}
                    </select>
                </div>;
                    return (
                <div className="card" key={props.index} id={props.item.id}>
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
                        <a href={`#${props.item.id}`} onClick={this.toggleReadme} className="card-header-icon" aria-label="more options">
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
                        <a href={`#${props.item.id}`} className="card-footer-item">Download</a>
                        {isModReady && <a href={`#${props.item.id}`} className="card-footer-item">Install</a>}
                        <a href={this.state.releasesURL} className="card-footer-item">{props.item.releases.totalCount} Older Releases</a>
                    </footer>
                </div>)}}
            </GlobalStateContext.Consumer>
        )
    }
}

export default GridItem