import * as assert from 'assert';
import * as Snippets from '../../snippet';
import { ComponentInfo, DataType, Property } from '../../types';

suite('Snippet tests', () => {
  const mockComponentInfo: Readonly<ComponentInfo> = {
    className: 'SaveCancelButtonComponent',
    inputs: [
      { name: 'label', type: DataType.STRING },
      { name: 'disabled', type: DataType.BOOLEAN },
      { name: 'icon', type: DataType.STRING },
      { name: 'color', type: 'Color' },
      { name: 'tooltip', type: 'string|undefined' },
    ],
    outputs: [
      { name: 'cancel', type: DataType.BOOLEAN },
      { name: 'save', type: 'any' },
      { name: 'draft', type: 'any' },
    ],
    selector: 'save-cancel-button',
  };

  suite('createSnippet', () => {
    test('should create snippet for component info object', () => {
      assert.strictEqual(Snippets.createSnippet(mockComponentInfo), {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'Save Cancel Button': {
          body: [
            '<save-cancel-button ',
            '  [label]="$1"',
            '  [disabled]="${2|true,false|}"',
            '  [icon]="$3"',
            '  [color]="$4"',
            '  [tooltip]="$5"',
            '  (cancel)="$6:onCancel($event)"',
            '  (save)="$7:onSave($event)"',
            '  (draft)="$8:onDraft($event)"',
            '></save-cancel-button>',
            '$9',
          ],
          description: 'A code snippet for Save Cancel Button Component.',
          prefix: ['save-cancel-button'],
          scope: 'html',
        },
      });
    });
  });

  suite('getTypeValues', () => {
    [
      {
        type: DataType.BOOLEAN,
        expects: '|true,false|',
      },
      {
        type: DataType.NUMBER,
        expects: '',
      },
      {
        type: DataType.OBJECT,
        expects: '',
      },
      {
        type: DataType.STRING,
        expects: '',
      },
      {
        type: undefined,
        expects: '',
      },
    ].forEach(({ type, expects }) => {
      test(`should return expected '${expects}' value for ${type}`, () =>
        assert.strictEqual(Snippets['getTypeValues'](type), expects));
    });
  });

  suite('propertyToFunction', () => {
    [
      {
        property: <Property>{ name: 'change' },
        index: 0,
        expects: '  (change)="$0:onChange($event)"',
      },
    ].forEach(({ property, index, expects }) => {
      test('should take an event name and return properly indented function markup', () =>
        assert.strictEqual(
          Snippets.propertyToFunction(property, index),
          expects
        ));
    });
  });
});
