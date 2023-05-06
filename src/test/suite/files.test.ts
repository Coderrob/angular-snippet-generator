/**
 * MIT License
 * Copyright (c) 2023 Rob "Coderrob" Lindley
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
import assert from 'assert';
import * as files from '../../files';

suite('Files tests', () => {
  suite('getFileData', () => {
    test('should read file data', () => {});

    test('should handle file read failure', () => {});
  });

  suite('getSupportedFiles', () => {});

  suite('isFileSupported', () => {
    test('should return true if file extension and file suffix match Angular component naming convention', () => {
      assert.strictEqual(
        files.isSupportedFile('c:\\some\\path\\some.component.ts'),
        true
      );
      assert.strictEqual(
        files.isSupportedFile('c:\\some\\path\\some.module.ts'),
        false
      );
    });

    test('should return false if file extension is valid but and file suffix does not match Angular component naming convention', () => {
      assert.strictEqual(
        files.isSupportedFile('c:\\some\\path\\some.module.ts'),
        false
      );
    });
  });

  suite('hasFileExtension', () => {
    test('should return false when no extensions are provided', () => {
      assert.strictEqual(files.isSupportedFile('/some/path/derp'), false);
    });

    test('should return false when no path is provided', () => {
      assert.strictEqual(files.isSupportedFile(undefined), false);
    });

    test('should return false when no extensions match the file extensions name', () => {
      assert.strictEqual(files.isSupportedFile('/some/path/index.sass'), false);
    });

    test('should return false even when a file extensions matches a provided extension if component is not in the name', () => {
      assert.strictEqual(files.isSupportedFile('/some/path/index.ts'), false);
    });

    test('should return true when a file extensions matches a provided extension and contains component in the name', () => {
      assert.strictEqual(
        files.isSupportedFile('/some/path/test.component.ts'),
        true
      );
    });
  });
});
