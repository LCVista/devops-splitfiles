import {getInput, getInputNumber} from "./utils/inputs";
import core from "@actions/core"
import fg from 'fast-glob';
import {context} from "@actions/github";

export type SortType = 'random' | 'lexicographical';
export type RunResponse = {
  files: string,
  count: number
}
export type GlobbyType = (
    patterns: string | string[],
    options?: fg.Options
) => Promise<string[]>;

const lexicographicalSort = (left: string, right: string): number => {
  return left.localeCompare(right);
};

const shuffleSort = (hash: string) => (left: string, right: string): number => {
  const leftPrime = hash+left;
  const rightPrime = hash+right;
  return leftPrime.localeCompare(rightPrime);
}

export async function run(
    globby: GlobbyType,
    sha1: string,
    glob: Array<string>,
    partitionIndex: number,
    totalPartitions: number,
    s: SortType,
    outputDelimiter: string
): Promise<RunResponse> {

  const matches = await globby(glob, { absolute: true});

  const partitionSize = Math.ceil(matches.length / totalPartitions);
  const minIndexInclusive = Math.max(partitionIndex * partitionSize, 0);
  const maxIndexExclusive = Math.min((partitionIndex+1) * partitionSize, matches.length);

  const partitionFiles = matches
      .sort( s === 'lexicographical' ? lexicographicalSort : shuffleSort(sha1))
      .filter( (value, index) => {
        return (index >= minIndexInclusive && index < maxIndexExclusive);
      })
  ;

  return {
    files: partitionFiles.join(outputDelimiter),
    count: partitionFiles.length
  }
}

/* istanbul ignore next */
if (require.main === module) {
  const sha1 = context.sha;
  const globInput = getInput("glob").split(" ");
  const partitionIndexInput = getInputNumber("partition_index");
  const totalPartitionsInput = getInputNumber("total_partitions");
  const sortInput = getInput("sort", "lexicographical");
  const outputDelimiterInput = getInput("output_delimiter", " ");

  core.debug(`globInput = ${globInput}`);
  core.debug(`partitionIndexInput = ${partitionIndexInput}`);
  core.debug(`totalPartitionsInput = ${totalPartitionsInput}`);
  core.debug(`sortInput = ${sortInput}`);
  core.debug(`outputDelimiterInput = ${outputDelimiterInput}`);

  if (partitionIndexInput === undefined) {
    core.error("partition_index is required");
    process.exit(1);
  }

  if (totalPartitionsInput === undefined) {
    core.error("total_partitions is required");
    process.exit(1);
  }

  const sort: SortType = function (s): SortType {
    switch (s) {
      case 'lexicographical':
        return 'lexicographical';
      case 'random':
        return 'random';
      default:
        return 'lexicographical';
    }
  }(sortInput);

  run(
      fg,
      sha1,
      globInput,
      partitionIndexInput,
      totalPartitionsInput,
      sort,
      outputDelimiterInput
  )
      .then( (result) => {
        core.setOutput("files", result.files);
        core.setOutput("count", result.count);
      })
      .catch((e) => {
        throw e;
      });
}
