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
