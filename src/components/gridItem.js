import React from "react"
import ReactMarkdown from "react-markdown"
import { StaticQuery } from "gatsby";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { faAngleDown, faAngleUp } from '@fortawesome/free-solid-svg-icons'
import { faGithub } from '@fortawesome/free-brands-svg-icons'

import { GlobalStateContext, makeMessage } from "../components/globalState.js"

class GridItem extends React.Component {

    constructor(props) {
        super(props);
        let releasesMap = {};
        props.item.releases.edges.forEach((edge) => {
            releasesMap[edge.node.id] = edge.node;
        });
        this.state = {
            viewReadme: false,
            activeVersion: props.item.releases.edges.length ? releasesMap[props.item.releases.edges[0].node.id] : null,
            releasesMap: releasesMap,
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
                    return (
                <div className="card" key={props.index} id={props.item.id}>
                    <header className="card-header">
                        <p className="card-header-title">
                        <a href={props.item.url} target="_blank" className="card-header-title" aria-label="more options">
                        <span className="icon">
                            <FontAwesomeIcon icon={faGithub} />
                            </span>
                        {props.item.name}
                        </a>
                        </p>
                        
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
                        {this.state.viewReadme && props.item.readme && props.item.readme.text && <ReactMarkdown className="content" source={props.item.readme.text} />}
                    </div>
                    <footer className="">
                        <div className="has-text-right" style={{ padding: "0 0.5rem"}}>
                            <span>Version: <div className="select">
                            <select onChange={(event) => {this.setState({
                                activeVersion: this.state.releasesMap[event.target.value]
                            })}}>
                                {props.item.releases.edges.map((edge) => <option key={edge.node.id} value={edge.node.id}>{edge.node.tagName}</option>)}
                            </select>
                            </div></span><br /><a target="_blank" href={this.state.activeVersion.url.split('/tag/', 1)[0]}>{props.item.releases.totalCount} Older Releases</a>
                        </div>
                        <div className="">
                            <footer className="card-footer">
                                <a href={`#${props.item.id}`} className="card-footer-item">Save</a>
                                {isModReady && <a href={`#${props.item.id}`} className="card-footer-item">Install</a>}
                                <a href={`#${props.item.id}`} className="card-footer-item">Download</a>
                            </footer>
                        </div>
                        
                    </footer>
                </div>)}}
            </GlobalStateContext.Consumer>
        )
    }
}

export default GridItem