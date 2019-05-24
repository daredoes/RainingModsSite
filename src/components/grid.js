import React from "react"
import ReactDOM from 'react-dom'

import GridItem from "./gridItem.js";

import { MDBRow, MDBContainer, MDBCol } from 'mdbreact';



class Grid extends React.Component {

    render() {
        let {items } = this.props;
        return (
            <MDBContainer fluid className=''>
                <MDBRow className="pt-3">
                    {items.map((children, index) => <MDBCol key={index} md={12} lg={6} xl={4} className="px-3 py-2"><GridItem item={children} /></MDBCol>)}
                </MDBRow>
            </MDBContainer>
        )
    }
}

export default Grid;