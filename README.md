# Federated Graphql Inspector action
## Description
This github action will concatenate schemas in two different branches and compare them for breaking changes.

## Inputs
  Input         | Description   |
| ------------- | ------------- |
| `user`  | Username of the github account  |
| `repo`  | Name of the repo  |
| `sourceBranch`  | Source branch of the repo (the one that contains the valid schemas) |
| `newBranch`  | New branch containing the edited schemas |
| `filePaths`  | Paths for the graphql files (separated by commas) |
| `token`  | Access token for the github repo |


## Example workflow
```yml
name: CI
 
on: [push]
 
jobs:
  job1:
    name: Concatenate Schemas
    runs-on: ubuntu-latest
    steps:
     - name: Get the current branch name
       shell: bash
       run: echo "::set-output name=branch::${GITHUB_REF#refs/heads/}"
       id: myref
     - name: Sleep for 5 seconds
       run: sleep 5s
       shell: bash
     - name: Graphql Inspector Federated Schemas Action
       uses: mohammedtigrini1/federated-graphql-inspector-action@v1.0.5
       with:
         user: MY_USERNAME
         repo: MY_REPO
         token: ${{ secrets.TOKEN }}
         sourceBranch: MY_SOURCE_BRANCH
         newBranch: ${{ steps.myref.outputs.branch }}
         filePaths: file1.graphql, file2.graphql, file3.graphql
```
