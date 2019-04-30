const path = require(`path`)
const fs = require('fs');
const moment = require('moment');

class DefaultDict {
    constructor(defaultInit, defaultInitValue) {
      return new Proxy({}, {
        get: (target, name) => name in target ?
          target[name] :
          (target[name] = typeof defaultInit === 'function' ?
            new defaultInit(defaultInitValue).valueOf() :
            defaultInit)
      })
    }
  }
  

exports.createPages = ({ graphql, actions}) => {
    const { createPage } = actions
    let repositoryNames = [];

    alpha = "abcdefghijklmnopqrstuvwxyz"; 
    function a(num) { num = num > 0? num - 1 : 0; if (num < alpha.length) return alpha[num]; else return a(Math.floor(num/alpha.length)) + '' + alpha[num%alpha.length]; }

    function makeGithubRepositoryDataFromGraphQLChunk(owner, name) {
        const repoName = a(repositoryNames.length+1);
        repositoryNames.push(repoName)
        return `${repoName}: repository(owner:"${owner}", name:"${name}") {
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
                                            id,
                                        }
                                    }
                                }
                            }
                        }
                    }`
    }

    let repostiories = JSON.parse(fs.readFileSync('content/images/remote_mods.json', 'utf8'));
    const repoQueries = repostiories.map(url => {
        const urlData = url.replace('https://github.com/', '').split('/', 2);
        const owner = urlData[0];
        const name = urlData[1];
        return makeGithubRepositoryDataFromGraphQLChunk(owner, name);
    })

    const repoQuery = repoQueries.join(',\n');
    /* In production you should fetch your images with GraphQL like this: */
    return graphql(`
        {
            github {
                ${repoQuery}
            }
        }
        
    `).then(result => {
        if (result.errors) {
            throw result.errors
        }

        let repositoryMap = new DefaultDict(DefaultDict, Object);
        let mods = repositoryNames.map(name => {
            let mod = Object.assign({}, result.data.github[name]);
            let mostRecentRelease = mod.releases.edges[0].node;
            mod.downloadCount = 0;
            mod.releases.edges.forEach((edge, index) => {
                let downloadCount = 0;
                let brake = false;
                let node = edge.node;
                repositoryMap[mod.owner.id][mod.id][node.id] = edge;
                node.releaseAssets.nodes.some((assetNode) => {
                        if (assetNode.name.indexOf('.dll') != -1) {
                            downloadCount += assetNode.downloadCount;
                            return true;
                        }
                });
                mod.releases.edges[index].node.downloadCount = downloadCount;
                mod.downloadCount += downloadCount;
            });
            
            repositoryMap[mod.owner.id][mod.id]['data'] = mod;
            return mod;
        })

        mods.sort((a, b) => {
            const aTime = a.releases.edges[0].node.downloadCount;
            const bTime = b.releases.edges[0].node.downloadCount;
            if (aTime < bTime) {
                return 1
            } else if (aTime > bTime) {
                return -1;
            } else {
                return 0;
            }
        });

        mods.sort((a, b) => {
            const aTime = moment(a.releases.edges[0].node.updatedAt);
            const bTime = moment(b.releases.edges[0].node.updatedAt);
            if (aTime < bTime) {
                return 1
            } else if (aTime > bTime) {
                return -1;
            } else {
                return 0;
            }
        });

        /* Gatsby will use this template to render the paginated pages (including the initial page for infinite scroll). */
        const paginatedPageTemplate = path.resolve(`src/templates/paginatedPageTemplate.js`)

        /* Iterate needed pages and create them. */
        const countModsPerPage = 20
        const countPages = Math.ceil(mods.length / countModsPerPage)
        for (var currentPage=1; currentPage<=countPages; currentPage++) {
            const pathSuffix = (currentPage>1? currentPage : "") /* To create paths "/", "/2", "/3", ... */

            /* Collect images needed for this page. */
            const startIndexInclusive = countModsPerPage * (currentPage - 1)
            const endIndexExclusive = startIndexInclusive + countModsPerPage
            const pageMods = mods.slice(startIndexInclusive, endIndexExclusive)

            /* Combine all data needed to construct this page. */
            const pageData = {
                path: `/${pathSuffix}`, 
                component: paginatedPageTemplate,
                context: {
                     /* If you need to pass additional data, you can pass it inside this context object. */
                    pageMods: pageMods,
                    currentPage: currentPage,
                    countPages: countPages,
                    repositoryMap: repositoryMap
                }
            }
            /* Create normal pages (for pagination) and corresponding JSON (for infinite scroll). */
            createJSON(pageData)
            createPage(pageData)
        }
        console.log(`\nCreated ${countPages} pages of paginated content.`)

    })
}

function createJSON(pageData) {
    const pathSuffix = pageData.path.substring(1)
    const dir = "public/paginationJson/"
    if (!fs.existsSync(dir)){
      fs.mkdirSync(dir);
    }
    const filePath = dir+"index"+pathSuffix+".json";
    const dataToSave = JSON.stringify(pageData.context.pageMods);
    fs.writeFile(filePath, dataToSave, function(err) {
      if(err) {
        return console.log(err);
      }
    }); 
}
