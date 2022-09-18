const request = require('request');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const  { diff } = require('@graphql-inspector/core');
const core = require('@actions/core');
const github = require('@actions/github');

const user = core.getInput('user');
const repo = core.getInput('repo') ;
const sourceBranch = core.getInput('sourceBranch');
const newBranch = core.getInput('newBranch');
const filePaths = core.getInput('filePaths').replace(/\s/g, '').split(',') ;

const TOKEN = core.getInput('token'); 

async function buildFederatedSchema(user, repo, branch, filePaths, token) {
    let typeDefs = ``;
    for(let fP of filePaths) {
        let url = `https://raw.githubusercontent.com/${user}/${repo}/${branch}/${fP}?token=${token}`;
        console.log(url);
        var options = {
            url: url,
            headers: {
              'Authorization': 'token ' + token
            }
        };
        
        await new Promise((resolve, reject) => {
            request(options, (error, response, body) => {
                if(error) {
                    console.log(err);
                    reject(`'Error fetching file ${fP}'`);
                }

                if(body.includes('404')) {
                    console.log(err);
                    reject(`'Error fetching file ${fP}'`);
                }

                typeDefs += body += "\n";
                resolve();
            });
        });
    
        
    }

    return makeExecutableSchema({typeDefs});
}

const compareSchemas = async () => {
    const sourceFederatedSchema = await buildFederatedSchema(user, repo, sourceBranch, filePaths, TOKEN).catch(err => { throw(err); });
    const newFederatedSchema = await buildFederatedSchema(user, repo, newBranch, filePaths, TOKEN).catch(err => { throw(err); });

    diff(sourceFederatedSchema, newFederatedSchema).then((changes) => {
        const breakingChanges = changes.filter(c=> c.criticality.level == "BREAKING");
        if(breakingChanges.length > 0) {
            breakingChanges.map(bC=> {
                console.log(bC);
            });
            core.setFailed('There are breaking changes');
            throw("There are breaking changes");
        }
    });
}

compareSchemas().then(() => {
    console.log("Changes are safe to apply");
}).catch((err) => {
    console.error(err);
})
