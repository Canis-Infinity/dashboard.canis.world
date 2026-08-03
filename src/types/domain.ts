// @ts-nocheck
/**
 * @typedef {'web' | 'tool' | 'uiux'} WorkType
 * @typedef {'unread' | 'pending' | 'done'} ContactStatus
 *
 * @typedef {Object} LocalizedText
 * @property {string} tw
 * @property {string} cn
 * @property {string} en
 *
 * @typedef {Object} Work
 * @property {string} _id
 * @property {WorkType} type
 * @property {LocalizedText} title
 * @property {LocalizedText} content
 *
 * @typedef {Object} Festival
 * @property {string} _id
 * @property {LocalizedText} title
 * @property {LocalizedText} content
 * @property {string} dateStart
 * @property {string} dateEnd
 * @property {string} color
 * @property {string} imgs
 */
export {};
