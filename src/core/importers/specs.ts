import SwaggerParser from '@apidevtools/swagger-parser';
import { resolve } from 'upath';
import { Options } from '../../types';
import { WriteSpecsProps } from '../../types/writers';
import { githubResolver } from '../../utils/github';
import { isObject, isString } from '../../utils/is';
import { mergeDeep } from '../../utils/mergeDeep';
import { isUrl } from '../../utils/url';
import { importOpenApi } from './openApi';

const parserDefaultOptions = {
  resolve: { github: githubResolver },
} as SwaggerParser.Options;

export const importSpecs = async (
  workspace: string,
  options: Options,
): Promise<WriteSpecsProps> => {
  const { input, output } = options;

  const targetPath = isString(input) ? input : input?.target;

  if (!targetPath) {
    throw new Error('You need to provide an input');
  }

  if (!output) {
    throw new Error('You need to provide an output');
  }

  const isPathUrl = isUrl(targetPath);
  const path = isPathUrl ? targetPath : resolve(workspace, targetPath);

  const parserOptions = isObject(options.input)
    ? mergeDeep(parserDefaultOptions, options.input.parserOptions || {})
    : parserDefaultOptions;
  const data = (await SwaggerParser.resolve(path, parserOptions)).values();

const resolveSpecs = async (
  path: string,
  parserOptions: SwaggerParser.Options,
) => {
  const data = (await SwaggerParser.resolve(path, parserOptions)).values();

  // normalizing slashes after SwaggerParser
  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => [resolve(key), value]),
  );
};

const data = await resolveSpecs(path, parserOptions);
  return importOpenApi({
    data,
    ...(isObject(input) && {
      input,
    }),
    ...(isObject(output) && {
      output,
    }),
    path,
    workspace,
  });
};
