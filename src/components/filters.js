// Original by Azik Samarkandiy at http://cssdeck.com/labs/traffic-light-using-css
// Heavily modified by Baobab Koodaa.

import React from "react"
import Filter from "./filter"
import PropTypes from "prop-types"
import moment from "moment"

class Filters extends React.Component {

    constructor(props) {
        super(props)
        this.setFilters();
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

    render() {
        
        return (
            <div className="container">
                <p className="has-text-centered">
                    Filters
                </p>
                <div className="">
                    {this.filterElements}
                </div>
            </div>
        )
    }
};

Filters.propTypes = {
    globalState: PropTypes.object.isRequired,
}

export default Filters;