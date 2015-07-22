/**
 * Module dependencies.
 */

import template from './template.jade';
import View from '../view/view';

export default class NewsfeedItem extends View {
  
  constructor(topic) {
    super(template, topic);
  }

}