const path = require(`path`)
const fs = require('fs');

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
                        readme: object(expression: "master:README.md") {
                            ... on  GitHub_Blob {
                            text
                            }
                        },
                        releases(last: 5) {
                            totalCount,
                            edges {
                                node {
                                    name,
                                    id,
                                    description,
                                    tagName,
                                    releaseAssets(first: 100) {
                                        totalCount,
                                        nodes {
                                            name,
                                            downloadUrl,
                                            downloadCount,
                                            contentType,
                                        }
                                    }
                                }
                            }
                        }
                    }`
    }

    /* 
     * There are a few local images in this repo to show you how to fetch images with GraphQL.
     * In order to keep the repo small, the rest of the images are fetched from Unsplash by the client's
     * browser. Their URLs are stored in a text file. You don't want to fetch images like that in production.
     */
    var rawRemoteUrls = JSON.parse(fs.readFileSync('content/images/remote_image_urls.json', 'utf8'));
    const remoteImages = rawRemoteUrls.map(url => {
        const resizeParams = '?q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=300&h=300&fit=crop'
        return {
            "l": url,
            "s": url+resizeParams
        }
    })

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

        let mods = repositoryNames.map(name => {
            return result.data.github[name];
        })

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
                    countPages: countPages
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
