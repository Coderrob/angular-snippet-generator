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
import * as generate from '../../parser';

suite('Generate tests', () => {
  const mockComponentInfo = {
    className: 'SaveCancelButtonComponent',
    inputs: [
      { name: 'label', type: 'string' },
      { name: 'disabled', type: 'boolean' },
      { name: 'icon', type: 'string' },
      { name: 'color', type: 'Color' },
      { name: 'tooltip', type: 'string|undefined' },
    ],
    outputs: [
      { name: 'cancel', type: 'boolean' },
      { name: 'save', type: 'any' },
      { name: 'draft', type: 'any' },
    ],
    selector: 'save-cancel-button',
  };

  const mockComponentData = `
  enum Color {
    RED = "red",
    WHITE = "white",
    BLUE = "blue",
  }
  
  @Component({
    templateUrl: "save-cancel-button.component.html",
    selector: "save-cancel-button",
  })
  export class SaveCancelButtonComponent {
    @Input()
    public label: string;
  
    @Input("disabled")
    public get notEnabled(): boolean {
      return this._enabled;
    }
    private _enabled = false;
  
    @Input("icon")
    public iconName = "info";
    @Input() public color: Color;
    @Input() tooltip?: string;
  
    @Output("cancel")
    public deleteItAll: EventEmitter<boolean>;
  
    @Output() save = new EventEmitter<undefined>();
    @Output()
    public draft = new EventEmitter<any>();
  }
  `;

  suite('parseComponent', () => {
    test('should parse and return a component information object matching the mocked component data', () => {
      const component = generate.parseComponent(mockComponentData);
      assert.deepEqual(component, [mockComponentInfo]);
    });
  });
});
