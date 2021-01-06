import { GraphQLBoolean, GraphQLInputObjectType, GraphQLInt, GraphQLString } from 'graphql';

import { IsoDateString } from '../../v1/types';

import { AccountReferenceInput } from './AccountReferenceInput';

export const UpdateAttributesInput = new GraphQLInputObjectType({
  name: 'UpdateAttributesInput',
  description: 'Input type for UpdateType',
  fields: () => ({
    id: { type: GraphQLString },
    slug: { type: GraphQLString },
    title: { type: GraphQLString },
    isPrivate: { type: GraphQLBoolean },
    makePublicOn: { type: IsoDateString },
    html: { type: GraphQLString },
    fromAccount: { type: AccountReferenceInput },
  }),
});
