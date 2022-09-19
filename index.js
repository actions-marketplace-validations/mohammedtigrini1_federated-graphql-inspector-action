const request = require('request');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const  { diff } = require('@graphql-inspector/core');
const core = require('@actions/core');

const user = core.getInput('user');
const repo = core.getInput('repo') ;
const sourceBranch = core.getInput('sourceBranch');
const newBranch = core.getInput('newBranch');
const filePaths = core.getInput('filePaths').replace(/\s/g, '').split(',') ;
const TOKEN = core.getInput('token'); 

async function getFile(options) {
    return new Promise((resolve, reject) => {
        request(options, (error, response, body) => {
            if(error) {
                reject(`Error fetching file ${fP}`);
            }

            if(body.includes('404')) {
                reject(`Error fetching file ${fP}`);
            }

            resolve(body);
        });
    });
}

async function buildFederatedSchema(user, repo, branch, filePaths, token) {
    return new Promise(async (resolve, reject) => {
        let typeDefs = ``;
        for(let fP of filePaths) {
            let url = `https://raw.githubusercontent.com/${user}/${repo}/${branch}/${fP}?token=${token}`;
            var options = {
                url: url,
                headers: {
                'Authorization': 'token ' + token
                }
            };
            
            await getFile(options).then(body => { typeDefs += body += "\n"; }).catch((err) => { reject(err); return; });
        }

        resolve(makeExecutableSchema({typeDefs}));
    });
    
}

const compareSchemas = async () => {
    return new Promise(async (resolve, reject) => {
        const sourceFederatedSchema = await buildFederatedSchema(user, repo, sourceBranch, filePaths, TOKEN).catch(err => { reject(err); return; });
        const newFederatedSchema = await buildFederatedSchema(user, repo, newBranch, filePaths, TOKEN).catch(err => { reject(err); return; });
    
        diff(sourceFederatedSchema, newFederatedSchema).then((changes) => {
            console.log("LIST OF CHANGES");
            changes.map(c => {
                console.log(c);
            });
            const breakingChanges = changes.filter(c=> c.criticality.level == "BREAKING");
            if(breakingChanges.length > 0) {
                reject('There are breaking changes');
                return;
            }
            resolve();
        });
    });
}

compareSchemas().then(() => {
    console.log("Changes are safe to apply");
}).catch((err) => {
    core.setFailed(err);
})
