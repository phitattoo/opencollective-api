import { GraphQLNonNull, GraphQLString } from 'graphql';

import { createUpdate, deleteUpdate, editUpdate, publishUpdate, unpublishUpdate } from '../../common/update';
import { UpdateAudienceType } from '../enum';
import { UpdateAttributesInput } from '../input/UpdateAttributesInput';
import { UpdateInput } from '../input/UpdateInput';
import Update from '../object/Update';

const updateMutations = {
  createUpdate: {
    type: Update,
    args: {
      update: {
        type: new GraphQLNonNull(UpdateInput),
      },
    },
    resolve(_, args, req) {
      return createUpdate(_, args, req);
    },
  },
  editUpdate: {
    type: Update,
    args: {
      update: {
        type: new GraphQLNonNull(UpdateAttributesInput),
      },
    },
    resolve(_, args, req) {
      return editUpdate(_, args, req);
    },
  },
  publishUpdate: {
    type: Update,
    args: {
      id: {
        type: new GraphQLNonNull(GraphQLString),
      },
      notificationAudience: {
        type: new GraphQLNonNull(UpdateAudienceType),
      },
    },
    resolve(_, args, req) {
      return publishUpdate(_, args, req);
    },
  },
  unpublishUpdate: {
    type: Update,
    args: {
      id: {
        type: new GraphQLNonNull(GraphQLString),
      },
    },
    resolve(_, args, req) {
      return unpublishUpdate(_, args, req);
    },
  },
  deleteUpdate: {
    type: Update,
    args: {
      id: {
        type: new GraphQLNonNull(GraphQLString),
      },
    },
    resolve(_, args, req) {
      return deleteUpdate(_, args, req);
    },
  },
};

export default updateMutations;
