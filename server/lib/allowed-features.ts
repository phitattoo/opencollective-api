import { get } from 'lodash';

import { types } from '../constants/collectives';
import FEATURE from '../constants/feature';

import { isPastEvent } from './collectivelib';

const HOST_TYPES = [types.USER, types.ORGANIZATION];

// Please refer to and update https://docs.google.com/spreadsheets/d/15ppKaZJCXBjvY7-AjjCj3w5D-4ebLQdEowynJksgDXE/edit#gid=0
const FeatureAllowedForTypes = {
  [FEATURE.RECEIVE_FINANCIAL_CONTRIBUTIONS]: [
    types.ORGANIZATION,
    types.COLLECTIVE,
    types.EVENT,
    types.FUND,
    types.PROJECT,
  ],
  [FEATURE.RECURRING_CONTRIBUTIONS]: [types.USER, types.ORGANIZATION, types.COLLECTIVE, types.FUND],
  [FEATURE.RECEIVE_HOST_APPLICATIONS]: HOST_TYPES,
  [FEATURE.HOST_DASHBOARD]: HOST_TYPES,
  [FEATURE.EVENTS]: [types.ORGANIZATION, types.COLLECTIVE],
  [FEATURE.PROJECTS]: [types.FUND],
  [FEATURE.USE_EXPENSES]: [types.ORGANIZATION, types.COLLECTIVE, types.EVENT, types.FUND, types.PROJECT],
  [FEATURE.RECEIVE_EXPENSES]: [types.ORGANIZATION, types.COLLECTIVE, types.EVENT, types.FUND, types.PROJECT],
  [FEATURE.COLLECTIVE_GOALS]: [types.COLLECTIVE, types.ORGANIZATION],
  [FEATURE.TOP_FINANCIAL_CONTRIBUTORS]: [types.COLLECTIVE, types.ORGANIZATION, types.FUND],
  [FEATURE.CONVERSATIONS]: [types.COLLECTIVE, types.ORGANIZATION],
  [FEATURE.UPDATES]: [types.COLLECTIVE, types.ORGANIZATION],
  [FEATURE.TEAM]: [types.ORGANIZATION, types.COLLECTIVE, types.EVENT, types.FUND, types.PROJECT],
  [FEATURE.CONTACT_FORM]: [types.COLLECTIVE, types.EVENT, types.ORGANIZATION],
  [FEATURE.TRANSFERWISE]: [types.ORGANIZATION],
  [FEATURE.PAYPAL_PAYOUTS]: [types.ORGANIZATION],
  [FEATURE.PAYPAL_DONATIONS]: [types.ORGANIZATION],
};

/**
 * A map of paths to retrieve the value of a feature flag from a collective
 */
export const OPT_OUT_FEATURE_FLAGS = {
  [FEATURE.CONTACT_FORM]: 'settings.features.contactForm',
  [FEATURE.UPDATES]: 'settings.features.updates',
};

export const OPT_IN_FEATURE_FLAGS = {
  [FEATURE.CROSS_CURRENCY_MANUAL_TRANSACTIONS]: 'settings.features.crossCurrencyManualTransactions',
  [FEATURE.COLLECTIVE_GOALS]: 'settings.collectivePage.showGoals',
  [FEATURE.PAYPAL_PAYOUTS]: 'settings.features.paypalPayouts',
  [FEATURE.PAYPAL_DONATIONS]: 'settings.features.paypalDonations',
  [FEATURE.RECEIVE_HOST_APPLICATIONS]: 'settings.apply',
  [FEATURE.CONVERSATIONS]: 'settings.features.conversations',
};

const FEATURES_ONLY_FOR_HOST_ORGS = new Set([
  FEATURE.RECEIVE_FINANCIAL_CONTRIBUTIONS,
  FEATURE.USE_EXPENSES,
  FEATURE.RECEIVE_EXPENSES,
  FEATURE.RECEIVE_HOST_APPLICATIONS,
  FEATURE.TOP_FINANCIAL_CONTRIBUTORS,
  FEATURE.COLLECTIVE_GOALS,
  FEATURE.TRANSFERWISE,
  FEATURE.PAYPAL_PAYOUTS,
  FEATURE.PAYPAL_DONATIONS,
  FEATURE.CONTACT_FORM,
  FEATURE.HOST_DASHBOARD,
]);

const FEATURES_ONLY_FOR_HOST_USERS = new Set([FEATURE.RECEIVE_HOST_APPLICATIONS, FEATURE.HOST_DASHBOARD]);

const FEATURES_ONLY_FOR_ACTIVE_ACCOUNTS = new Set([FEATURE.CONTACT_FORM]);

const FEATURES_ONLY_FOR_ACTIVE_HOSTS = new Set([FEATURE.RECEIVE_EXPENSES, FEATURE.RECEIVE_FINANCIAL_CONTRIBUTIONS]);

const FEATURES_DISABLED_FOR_PAST_EVENTS = new Set([FEATURE.RECEIVE_FINANCIAL_CONTRIBUTIONS]);

/**
 * Returns true if feature is allowed for this collective type, false otherwise.
 */
export const isFeatureAllowedForCollectiveType = (collectiveType: types, feature: FEATURE, isHost?: false): boolean => {
  const allowedTypes = FeatureAllowedForTypes[feature];
  const allowedForType = allowedTypes ? allowedTypes.includes(collectiveType) : true;

  if (!allowedForType) {
    return false;
  }

  // Check if allowed for host orgs but not normal orgs
  if (collectiveType === types.ORGANIZATION && FEATURES_ONLY_FOR_HOST_ORGS.has(feature) && !isHost) {
    return false;
  } else if (collectiveType === types.USER && FEATURES_ONLY_FOR_HOST_USERS.has(feature) && !isHost) {
    return false;
  }

  return true;
};

export const hasOptedOutOfFeature = (collective, feature): boolean => {
  const optOutFlag = OPT_OUT_FEATURE_FLAGS[feature];
  return optOutFlag ? get(collective, optOutFlag) === false : false;
};

export const hasOptedInForFeature = (collective, feature): boolean => {
  const optOutFlag = OPT_IN_FEATURE_FLAGS[feature];
  return get(collective, optOutFlag) === true;
};

/**
 * If a given feature is allowed for the collective type, check if it is activated for collective.
 */
export const hasFeature = (collective, feature: FEATURE): boolean => {
  if (!collective) {
    return false;
  }

  if (!isFeatureAllowedForCollectiveType(collective.type, feature, collective.isHostAccount)) {
    return false;
  }

  // Features only for active accounts
  if (!collective.isActive && FEATURES_ONLY_FOR_ACTIVE_ACCOUNTS.has(feature)) {
    return false;
  } else if (!collective.isActive && collective.isHost && FEATURES_ONLY_FOR_ACTIVE_HOSTS.has(feature)) {
    return false;
  }

  // Check opt-out flags
  if (feature in OPT_OUT_FEATURE_FLAGS) {
    return !hasOptedOutOfFeature(collective, feature);
  }

  // Check opt-in flags
  if (feature in OPT_IN_FEATURE_FLAGS) {
    return hasOptedInForFeature(collective, feature);
  }

  // Checks for past events
  if (collective.type === types.EVENT && isPastEvent(collective) && FEATURES_DISABLED_FOR_PAST_EVENTS.has(feature)) {
    return false;
  }

  return true;
};

export { FEATURE };
