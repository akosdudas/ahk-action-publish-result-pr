# AHK result process action

Processes a text log file that is the result of a student work evaluation and publishes the result into a Pull Request.

## Usage

### Inputs

#### `input-file`

**Required** The path of the file to process. Default `"result.txt"`.

#### `github-token`

**Required** A GitHub access token to work with.

### Sample action

```yml
on: [pull_request]

jobs:
  job1:
    runs-on: ubuntu-18.04
    steps:
      - name: Checkout
        uses: actions/checkout@v1
        with:
          fetch-depth: 1
      - name: Evaluate
        run: do-eval.sh
      - name: Publish results
        uses: akosdudas/ahk-action-publish-result-pr@master
        with:
          input-file: "result.txt"
          github-token: "${{ secrets.GITHUB_TOKEN }}"
```

## Development

Requirements:

- NodeJS
- Yarn

Development process:

1. `yarn install`
1. code
1. `yarn run build`
1. push
