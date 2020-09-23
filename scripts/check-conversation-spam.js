#!/usr/bin/env node
import '../server/env';

import { AkismetClient } from 'akismet-api';
import config from 'config';
import { get } from 'lodash';

import { sleep } from '../server/lib/utils';
import models, { sequelize } from '../server/models';

const key = config.akismet.key;
const blog = 'https://blog.opencollective.com';
const client = new AkismetClient({ key, blog });

async function run() {
  const conversations = await models.Conversation.findAll({
    limit: 100,
    order: [['createdAt', 'DESC']],
  });

  for (const conversation of conversations) {
    const user = await models.User.findByPk(conversation.CreatedByUserId, { paranoid: false });
    const toCollective = await models.Collective.findByPk(conversation.CollectiveId);
    const fromCollective = await models.Collective.findByPk(conversation.FromCollectiveId);
    if (!user || !fromCollective || !toCollective) {
      continue;
    }

    await sleep(Math.random() * 1000 * 2);

    const ip = get(user, 'data.lastSignInRequest.ip', get(user, 'data.creationRequest.ip'));
    const useragent = get(user, 'data.lastSignInRequest.userAgent', get(user, 'data.creationRequest.userAgent'));

    const comment = {
      ip,
      useragent,
      content: `${conversation.title} ${conversation.summary}`,
      email: user.email,
      name: fromCollective.name,
      type: 'forum-post',
    };

    try {
      const isSpam = await client.checkSpam(comment);

      if (isSpam) {
        console.log(conversation.id, conversation.title, { result: 'OMG Spam!' });
        console.log('from', fromCollective.slug, `https://opencollective.com/${fromCollective.slug}`);
        console.log('to', toCollective.slug, `https://opencollective.com/${toCollective.slug}`);
        // await conversation.update({ data: { ...conversation.data, spam: true } });
      } else {
        // console.log(conversation.id, conversation.title, { result: 'Not spam' });
        // await conversation.update({ data: { ...conversation.data, spam: false } });
      }
    } catch (err) {
      console.error('Something went wrong:', err.message);
    }
  }

  await sequelize.close();
}

run();
