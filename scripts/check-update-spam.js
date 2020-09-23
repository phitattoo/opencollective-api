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
  const updates = await models.Update.findAll({
    limit: 10,
    order: [['createdAt', 'DESC']],
  });

  for (const update of updates) {
    const user = await models.User.findByPk(update.CreatedByUserId, { paranoid: false });
    const collective = await models.Collective.findByPk(update.CollectiveId);
    const fromCollective = await models.Collective.findByPk(update.FromCollectiveId);
    if (!user || !collective || !fromCollective) {
      continue;
    }

    await sleep(Math.random() * 1000 * 2);

    const ip = get(user, 'data.lastSignInRequest.ip', get(user, 'data.creationRequest.ip'));
    const useragent = get(user, 'data.lastSignInRequest.userAgent', get(user, 'data.creationRequest.userAgent'));

    const comment = {
      ip,
      useragent,
      content: `${update.title} ${update.html}`,
      email: user.email,
      name: fromCollective.name,
      type: 'forum-post',
    };

    try {
      const isSpam = await client.checkSpam(comment);

      if (isSpam) {
        console.log(update.id, update.title, { result: 'OMG Spam!' });
        console.log(collective.slug, fromCollective.slug);
        // await conversation.update({ data: { ...conversation.data, spam: true } });
      } else {
        console.log(update.id, update.title, { result: 'Not spam' });
        // await conversation.update({ data: { ...conversation.data, spam: false } });
      }
    } catch (err) {
      console.error('Something went wrong:', err.message);
    }
  }

  await sequelize.close();
}

run();
