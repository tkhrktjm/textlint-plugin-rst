import type { TextlintPluginOptions } from '@textlint/types'

import { parse } from './rst-to-ast'

export class ReSTProcessor {
  config: TextlintPluginOptions
  constructor(config = {}) {
    this.config = config
  }

  static availableExtensions() {
    return ['.rst', '.rest']
  }

  processor(ext: string) {
    return {
      preProcess(text: string, filePath?: string) {
        return parse(text)
      },
      postProcess(messages: any[], filePath?: string) {
        return {
          messages,
          filePath: filePath ? filePath : '<rst>',
        }
      },
    }
  }
}
