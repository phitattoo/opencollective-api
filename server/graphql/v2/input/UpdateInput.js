import { GraphQLBoolean, GraphQLInputObjectType, GraphQLInt, GraphQLNonNull, GraphQLString } from 'graphql';

import { CollectiveAttributesInputType, TierInputType } from '../../v1/inputTypes';
import { IsoDateString } from '../../v1/types';

export const UpdateInput = new GraphQLInputObjectType({
  name: 'UpdateInput',
  description: 'Input type for UpdateType',
  fields: () => ({
    id: { type: GraphQLInt },
    views: { type: GraphQLInt },
    slug: { type: GraphQLString },
    title: { type: GraphQLString },
    image: { type: GraphQLString },
    isPrivate: { type: GraphQLBoolean },
    makePublicOn: { type: IsoDateString },
    markdown: { type: GraphQLString },
    html: { type: GraphQLString },
    fromCollective: { type: CollectiveAttributesInputType },
    collective: { type: new GraphQLNonNull(CollectiveAttributesInputType) },
    tier: { type: TierInputType },
  }),
});
