import React from "react"

import GridItem from "./gridItem.js";

const Grid = ({ items }) => {
    let columns = [[], []];
    items.forEach((item, index) => {
        columns[index%columns.length].push(<GridItem item={item} key={index}/>)
    });
    return (
        <>
            <div className="columns is-multiline" style={{padding: "1.5rem"}}>
                {columns.map((children, index) => <div key={index} className="column is-6-desktop is-12-tablet">{children}</div>)}
            </div>
            <style jsx>
                {`
                    .grid {
                        display: flex;
                        flex-direction: column;
                    }
                `}
            </style>
        </>
    )
    
}





export default Grid;