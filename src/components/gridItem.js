import React from "react"
import ReactMarkdown from "react-markdown"
import { StaticQuery } from "gatsby";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { faAngleDown, faAngleUp } from '@fortawesome/free-solid-svg-icons'
import { faGithub } from '@fortawesome/free-brands-svg-icons'

class GridItem extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            viewReadme: false
        }
    }

    toggleReadme = () => {
        this.setState({viewReadme: !this.state.viewReadme});
    }

    render() {
        const props = this.props;
        return (
            <React.Fragment>
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
                    <footer className="card-footer">
                        <a href={`#${props.item.id}`} className="card-footer-item">Save</a>
                        <a href={`#${props.item.id}`} className="card-footer-item">Edit</a>
                        <a href={`#${props.item.id}`} className="card-footer-item">X</a>
                    </footer>
                </div>
            </React.Fragment>
        )
    }
}

export default GridItem