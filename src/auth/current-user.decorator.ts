import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { GqlContext } from './types';

export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): string => {
    const gqlCtx = GqlExecutionContext.create(ctx);
    return gqlCtx.getContext<GqlContext>().req.userId;
  },
);
