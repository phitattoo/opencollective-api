#!/usr/bin/env node
import '../server/env';

import { AkismetClient } from 'akismet-api';
import config from 'config';
import { get } from 'lodash';

import { sleep } from '../server/lib/utils';
import models, { Op } from '../server/models';

const key = config.akismet.key;
const blog = 'https://blog.opencollective.com';
const client = new AkismetClient({ key, blog });

async function run() {
  const collectives = await models.Collective.findAll({
    where: {
      approvedAt: { [Op.is]: null },
      [Op.or]: [
        { description: { [Op.not]: null } },
        { longDescription: { [Op.not]: null } },
        { website: { [Op.not]: null } },
      ],
      updatedAt: { [Op.lt]: '2020-11-15' },
    },
    limit: 100,
    order: [['updatedAt', 'DESC']],
  });

  for (const collective of collectives) {
    let user = await models.User.findByPk(collective.CreatedByUserId, { paranoid: false });
    if (!user) {
      const adminUsers = await collective.getAdminUsers();
      if (adminUsers.length > 0) {
        user = adminUsers[0];
      }
    }
    if (!user) {
      console.log('User missing, skipping');
      continue;
    }

    await sleep(Math.random() * 1000 * 2);

    const ip = get(user, 'data.lastSignInRequest.ip', get(user, 'data.creationRequest.ip'));
    const useragent = get(user, 'data.lastSignInRequest.userAgent', get(user, 'data.creationRequest.userAgent'));
    if (!ip || !useragent) {
      console.log('Ip or User-Agent missing, skipping.');
      continue;
    }

    const comment = {
      ip,
      useragent,
      content: `${collective.name} ${collective.description} ${collective.longDescription} ${collective.website}`,
      email: user.email,
      name: collective.name,
      type: 'forum-post',
    };

    try {
      const isSpam = await client.checkSpam(comment);

      if (isSpam) {
        console.log(collective.slug, collective.name, `https://opencollective.com/${collective.slug}`, {
          result: 'OMG Spam!',
        });
        // console.log(collective.slug, `https://opencollective.com/${collective.slug}`);
        // await conversation.update({ data: { ...conversation.data, spam: true } });
      } else {
        // console.log(collective.slug, collective.name, { result: 'Not spam' });
        // await conversation.update({ data: { ...conversation.data, spam: false } });
      }
    } catch (err) {
      console.error('Something went wrong:', err.message);
    }
  }
}

run();
