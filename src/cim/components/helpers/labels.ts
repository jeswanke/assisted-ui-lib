import { MatchExpression } from 'console-sdk-ai-lib';
import { AGENT_LOCATION_LABEL_KEY } from '../common';

export const getLocationsFromMatchExpressions = (expressions: MatchExpression[] = []) =>
  expressions.find((expr) => expr.key === AGENT_LOCATION_LABEL_KEY)?.values || [];

export const getAgentLocationMatchExpression = (
  locations?: string[],
): MatchExpression[] | undefined => {
  return locations?.length
    ? [
        {
          key: AGENT_LOCATION_LABEL_KEY,
          operator: 'In',
          values: locations,
        },
      ]
    : undefined;
};
