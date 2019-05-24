import React from "react"
import PropTypes from "prop-types"
import { StaticQuery, graphql } from "gatsby"

import Header from "./header"
import 'typeface-open-sans/index.css'
import "./layout.scss"
import ribbon from "../../static/forkme_right_orange_ff7600.png"

import { ToastContainer } from 'mdbreact';

class Layout extends React.Component {

  render() {

    return (
      <StaticQuery
        query={graphql`
          query SiteTitleQuery {
            site {
              siteMetadata {
                title,
                description
              }
            },
            github {
              client: repository(owner:"daredoes", name:"RainingModsClient") {
                name,
                description,
                url,
                updatedAt,
                id,
                owner {
                    id
                    login
                    url
                    avatarUrl
                  }
                readme: object(expression: "master:README.md") {
                    ... on  GitHub_Blob {
                    text
                    }
                },
                releases(last: 5, orderBy: {field:CREATED_AT, direction:DESC}) {
                    totalCount,
                    edges {
                        node {
                            name,
                            id,
                            description,
                            tagName,
                            url,
                            updatedAt,
                            releaseAssets(first: 100) {
                                totalCount,
                                nodes {
                                    name,
                                    downloadUrl,
                                    downloadCount,
                                    contentType,
                                    size,
                                    id,
                                }
                            }
                        }
                    }
                }
              }
            }
          }
        `}
        render={data => (
              <>
                <ToastContainer newestOnTop={true}
          autoClose={false} />
                <Header siteTitle={data.site.siteMetadata.title} description={data.site.siteMetadata.description} client={data.github.client} />
                <div
                  style={{
                    margin: `0 auto`,
                    maxWidth: "100vw",
                    padding: `0px 0px 1.45rem`,
                    paddingTop: 0,
                    paddingLeft: "2px",
                    paddingRight: "2px"
                  }}
                >
                  <main>{this.props.children}</main>
                  <footer>
                  </footer>
                </div>
              </>
        )}
      />
    )
  }
}

Layout.propTypes = {
  children: PropTypes.node.isRequired,
}

export default Layout
