// Original by Azik Samarkandiy at http://cssdeck.com/labs/traffic-light-using-css
// Heavily modified by Baobab Koodaa.

import React from "react"
import PropTypes from "prop-types"

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { faAngleDown, faAngleUp } from '@fortawesome/free-solid-svg-icons'

class Filter extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            direction: this.props.hasDirection || 1
        }
        this.onClick = this.onClick.bind(this)
    }

    onClick = () => {
        let { globalState, returnsSortFunctionBasedOnTernaryDirectionFunc: func } = this.props;
        let { direction } = this.state;
        globalState.sortItemsByFunc(func(direction));
        this.setState({
            direction: direction * -1
        })
    }

    render() {
        let {tag, hasDirection } = this.props;
        let { direction } = this.state;
        return (
            <a title={hasDirection != 0 ? `Switch to ${direction == -1 ? 'Ascending' : 'Descending'}` : `Turn ${direction == 1 ? 'Off' : 'On'}`} role="button" tabIndex="0" className={`tag ${hasDirection == 0 ? `is-${direction == 1 ? 'danger' : 'success'}` : ''}`} onClick={this.onClick}>
            {hasDirection != 0 && <FontAwesomeIcon icon={direction == 1 ? faAngleUp : faAngleDown} />}&nbsp;{tag}
            </a>
        )
    }
};

Filter.propTypes = {
    globalState: PropTypes.object.isRequired,
    tag: PropTypes.string,
    hasDirection: PropTypes.number,
    returnsSortFunctionBasedOnTernaryDirectionFunc: PropTypes.func.isRequired

}

Filter.defaultProps = {
    tag: '',
    hasDirection: false
}

export default Filter;