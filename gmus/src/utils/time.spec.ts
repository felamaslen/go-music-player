import { formatTime } from './time';

describe(formatTime.name, () => {
  it.each`
    case                       | input     | output
    ${'zero'}                  | ${0}      | ${'00:00'}
    ${null}                    | ${null}   | ${''}
    ${'less than ten seconds'} | ${7}      | ${'00:07'}
    ${'less than one minute'}  | ${26}     | ${'00:26'}
    ${'less than 10 minutes'}  | ${593}    | ${'09:53'}
    ${'less than one hour'}    | ${3176}   | ${'52:56'}
    ${'more than one hour'}    | ${3615}   | ${'1:00:15'}
    ${'more than one day'}     | ${86465}  | ${'1 day, 01:05'}
    ${'negative values'}       | ${-86465} | ${'-1 day, 01:05'}
  `('should handle case: $case', ({ input, output }) => {
    expect.assertions(1);
    expect(formatTime(input)).toBe(output);
  });
});
