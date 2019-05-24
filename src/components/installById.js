// Original by Azik Samarkandiy at http://cssdeck.com/labs/traffic-light-using-css
// Heavily modified by Baobab Koodaa.

import React from "react"
import Filter from "./filter"
import PropTypes from "prop-types"
import moment from "moment"

import { MDBModal, MDBModalBody, MDBModalFooter, MDBModalHeader, MDBNavItem, MDBDropdownToggle } from 'mdbreact';

const minimumRows = 2;

class InstallbyId extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            rows: minimumRows,
            modCount: 0,
            mods: {},
            isOpen: false
        }
        this.setFilters();
        this.textRef = React.createRef();
    }

    makeFilter(tag, direction, func) {
        return {
            tag: tag,
            direction: direction,
            func: func
        }
    }

    setFilters = () => {
        let globalState = this.props.globalState;
        let filters = [
            this.makeFilter('Last Updated', -1, (direction) => {
                return (a, b) => {
                    const aTime = moment(a.releases.edges[0].node.updatedAt);
                    const bTime = moment(b.releases.edges[0].node.updatedAt);
                    if (aTime < bTime) {
                        return 1 * direction;
                    } else if (aTime > bTime) {
                        return -1 * direction;
                    } else {
                        return 0;
                    }
                }
            }),
            this.makeFilter('Total Downloads', 1, (direction) => {
                return (a, b) => {
                    const aTime = a.downloadCount;
                    const bTime = b.downloadCount;
                    if (aTime < bTime) {
                        return 1 * direction;
                    } else if (aTime > bTime) {
                        return -1 * direction;
                    } else {
                        return 0;
                    }
                }
            }),
            this.makeFilter('Installed', 0, (direction) => {
                return (a, b) => {
                    if (globalState.user && globalState.user.mods) {
                        const aRelease = globalState.user.mods[a.owner.id] && globalState.user.mods[a.owner.id]['repos'][a.id] ? globalState.user.mods[a.owner.id]['repos'][a.id]['release'] : null;
                        const bRelease = globalState.user.mods[b.owner.id] && globalState.user.mods[b.owner.id]['repos'][b.id] ? globalState.user.mods[b.owner.id]['repos'][b.id]['release'] : null;
                        if (aRelease && !bRelease) {
                            return 1 * direction;
                        } else if (!aRelease && bRelease) {
                            return -1 * direction;
                        }
                    }
                    return 0;
                }
            })
        ];
        let props = this.props;
        this.filterElements = filters.map((filter) => {
            return <Filter key={filter.tag} globalState={props.globalState} tag={filter.tag} hasDirection={filter.direction} returnsSortFunctionBasedOnTernaryDirectionFunc={filter.func} />
        })
    }

    componentDidUpdate = () => {
        this.setFilters();
    }

    onInputChange = (e) => {
        let lines = e.currentTarget.value.split("\n");
        let mods = {};
        let modCount = 0;
        lines.filter((i) => i.split("-").length == 3).forEach((line) => {
            let items = line.split("-");
            let mod_data = this.props.globalState.repositoryMap[items[0]][items[1]];
            let owner = mod_data['data']['owner'];
            let release_data = mod_data[items[2]]['node'];
            let repo = mod_data['data'];
            if (!mods.hasOwnProperty(owner.id)) {
                mods[owner.id] = {
                    'name': owner.login,
                    'url': owner.url,
                    'id': owner.id,
                    'repos': {}
                };
            }
            mods[owner.id]['repos'][repo.id] = {
                'id': repo.id,
                'name': repo.name,
                'url': repo.url,
                'readme': repo.readme.text,
                'description': repo.description,
                'release': {
                    'assets': {},
                    'name': release_data.name,
                    'tag_name': release_data.tagName,
                    'url': release_data.url,
                    'id': release_data.id,
                    'updated_at': release_data.updatedAt
                }
            }
            
            release_data.releaseAssets.nodes.forEach((edge) => {
                mods[owner.id]['repos'][repo.id]['release']['assets'][edge.id] = {
                    'download': edge.downloadUrl,
                    'name': edge.name,
                    'content_type': edge.contentType,
                    'id': edge.id
                }
            });
            modCount += 1;
        })
        this.setState({
            rows: lines.length,
            mods: mods,
            modCount: modCount
        })
    }

    onSubmit = (e) => {
        e.preventDefault();
        this.props.globalState.sendMessage('Install requested', 'install', this.state.mods)
    }

    copyMyModsToTextarea = () => {
        let node = this.textRef.current;
        let mods = this.props.globalState.user.mods;
        let keys = Object.keys(this.props.globalState.user.mods);
        let user_mods = [];
        keys.forEach((owner_id) => {
            let repos = mods[owner_id]['repos'];
            Object.keys(repos).forEach((repo_id) => {
                user_mods.push(`${owner_id}-${repo_id}-${repos[repo_id]['release']['id']}`)
            })
        })
        this.setState({
            modCount: user_mods.length,
            rows: user_mods.length
        })
        node.value = user_mods.join('\n')

    }

    toggleModal = () => {
        this.setState({
            isOpen: !this.state.isOpen
        })
    }

    render() {
        let rootFolder = this.props.globalState.user ? this.props.globalState.user.rootFolder : "";
        return (
            rootFolder ?
            <div>
                <MDBNavItem>
                    <a role="button" tabIndex="0" className="nav-link" onClick={this.toggleModal}>
                        Bulk Installer
                    </a>
                </MDBNavItem>
                <MDBModal centered isOpen={this.state.isOpen} toggle={this.toggleModal} size="lg" backdrop={true}>
                    <MDBModalHeader toggle={this.toggleModal}>Install By ID</MDBModalHeader>
                    <form onSubmit={this.onSubmit}>
                        <div className="field">
                            <p className="control">
                                <textarea className="textarea form-control" ref={this.textRef}
                                onChange={this.onInputChange} rows={this.state.rows > minimumRows ? this.state.rows : minimumRows} placeholder="Enter an ID on each line to install">

                                </textarea>
                            </p>
                        </div>
                        <div className="field is-grouped">
                            <p className="control">
                                <button  className={`button is-large is-${this.state.modCount > 0 ? 'success' : 'danger'}`} disabled={this.state.modCount == 0} type="submit">Install&nbsp;<span>{this.state.modCount}</span>&nbsp;Mods</button>
                            </p>
                            <p className="control">
                                <button className="is-large button is-primary" onClick={this.copyMyModsToTextarea}>Copy My Mods to Textarea</button>
                            </p>
                        </div>
                        <MDBModalBody>

                        </MDBModalBody>
                        <MDBModalFooter>

                        </MDBModalFooter>
                    </form>
                </MDBModal>
            </div> : null
        )
    }
};

InstallbyId.propTypes = {
    globalState: PropTypes.object.isRequired,
}

export default InstallbyId;