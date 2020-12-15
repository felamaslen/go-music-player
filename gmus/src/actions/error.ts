import { ActionLocal, ActionTypeLocal } from './types';

export enum ErrorLevel {
  Debug,
  Warn,
  Err,
}

type ErrorType = {
  message: string;
  level: ErrorLevel;
};

export type ActionErrorOccurred = ActionLocal<ActionTypeLocal.ErrorOccurred, ErrorType>;

export const errorOccurred = (
  message: string,
  level: ErrorLevel = ErrorLevel.Err,
): ActionErrorOccurred => ({
  type: ActionTypeLocal.ErrorOccurred,
  payload: { message, level },
});
