# Ahk result processing action

Posts the results of an automated evaluation of a student homework as a comment into a pull request.

See <https://github.com/akosdudas/ahk-sample-studentsolution/pull/1> for an example. Please refer to <https://akosdudas.github.io/automated-homework-evaluation/> for the "big picture."

## Usage of the action

The action must execute within the scope of a pull request.

### Arguments

#### `input-file`

The path of the input file containing the evaluation result. When specified, the parsed results will be included in the result comment. Defaults to `"result.txt"`.

#### `image-extension`

The extension of image files (with leading dot). When specified, the images are included in the result comment. Defaults to _not specified_.

#### `github-token`

**Required** A GitHub access token to work with.

### Sample action

```yml
on: [pull_request]

jobs:
  job1:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v2
        with:
          fetch-depth: 1
      - name: Evaluate
        run: do-eval.sh
      - name: Publish results
        uses: akosdudas/ahk-action-publish-result-pr@v1
        with:
          input-file: "result.txt"
          image-extension: ".png"
          github-token: "${{ secrets.GITHUB_TOKEN }}"
```

## Input format

There are three types of file inputs, all taken from the repository root:

- `neptun.txt` (**mandatory**);
- `result.txt` (or other file name configured as argument of the action);
- and image files.

### Example

Let the input be as follows.

1. `neptun.txt` has a single line with content "ABC123."
1. `result.txt` text file with content:

   ```
   ###ahk#Exercise 1#2#ok
   ###ahk#Exercise 2#3#3/4 points: not all cases covered
   ###ahk#Exercise 3#0#Unexpected exception:\
   System.NotImplementedException\
   The implementation is missing
   ###ahk#optional@Exercise 4#3
   ```

1. And two image files, `image1.png` and `image2.png` are in the repository root.

These files along with the configuration of the action as above yields the following comment in the pull request:

> \<image1.png inline\>
>
> \<image2.png inline\>
>
> **Neptun**: ABC123
>
> **Exercise 1**: 2
>
> ok
>
> **Exercise 2**: 3
>
> 3/4 points: not all cases covered
>
> **Exercise 3**: 0
>
> Unexpected exception:
>
> System.NotImplementedException
>
> The implementation is missing
>
> **Total**:
>
> 5
>
> optional: 3

### Syntax of `result.txt` file

Every line in the file contains the evaluation result of one exercise as:

```
###ahk#taskname#result#comment
```

#### `###ahk#`

`###ahk#` is a mandatory prefix.

#### `taskname`

A text that identifies the task or exercise name, e.g., "Exercise 2".

Exercises can be "grouped," e.g., to distinguish optional tasks from mandatory ones. The group is optional and is part of the exercise name as "optional@Exercise 5". The total of the exercises (e.g., the cumulative points) are summed for each group separately. If there is no group in an exercise name, e.g., "Task 2", it belongs to a default group with no name.

#### `result`

A number as text that corresponds to the result (i.e., score) achieved for the particular task. If there are no scores, you can use 1 for pass and 0 for failure.

#### `comment`

An optional text interpreted as a comment. Use it to comment on the achieved result and to report problems and errors. The comment can have multiple lines; check the example above.

## Development

Requirements:

- NodeJS
- Yarn

Development process:

1. `yarn install`
1. code
1. `yarn run build`
1. push
