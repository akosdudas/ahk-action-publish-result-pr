# AHK result process action

Gathers summary of a student submission into a PR comment.

## Usage

### Inputs

#### `input-file`

The path of the input file containing the evaluation result. When specified, the parsed results will be included in the result comment. Defaults to `"result.txt"`.

#### `image-extension`

The extension of image files (with leading dot). When specified, the images are include in the result comment. Defaults to _not specified_.

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
          image-extension: ".png"
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
