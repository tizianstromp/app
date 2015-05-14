import lock from 'loading-lock';
import t from 't-component';
import dom from 'component-dom';
import page from 'page';
import config from '../config/config.js';
import FormView from '../form-view/form-view.js';
import DemocracyUnique from '../democracy-unique/democracy-unique.js';
import democracy from '../democracy-model/democracy-model.js';
import template from './template.jade';

export default class DemocracyForm extends FormView {

  /**
   * DemocracyForm
   *
   * @return {DemocracyForm} `DemocracyForm` democracy.
   * @api public
   */

  constructor () {
    super(template, { domain: `${config.protocol}://${config.host}/` });
    this.elUrl = this.find('input[name=name]');
    this.form = this.find('form');
    this.democracyUnique = new DemocracyUnique({ el: this.elUrl });
  }

  switchOn () {
    this.on('success', this.bound('onsuccess'));
    this.democracyUnique.on('success', this.bound('onuserchecked'));
  }

  switchOff () {
    this.off('success', this.bound('onsuccess'));
    this.democracyUnique.off('success', this.bound('onuserchecked'));
  }

  onuserchecked (res) {
    let container = this.find('.input-group', this.elUrl);
    let message = this.find('.name-unavailable', this.elUrl);

    if (res.exists) {
      container.addClass('has-error');
      container.removeClass('has-success');
      message.removeClass('hide');
    } else {
      container.removeClass('has-error');
      container.addClass('has-success');
      message.addClass('hide');
    }
  }

  onsuccess () {
    debugger;
    this.loading();
    democracy.once('status:change', this.onChange);
    democracy.fetch();
  }

  onChange (status) {
    debugger;
    if ('creating' === status || 'destroying' === status) {
      return democracy.once('status:change', this.onChange);
    }

    if ('error' === status || 'non-existent' === status) {
      this.unloading();
      this.messages(t('democracy.status.error'), 'error');
    } else {
      page('/');
    }
  }

  loading () {
    this.disable();
    this.messageTimer = setTimeout(() => {
      this.messages(t('democracy.form.create.wait'), 'sending');
      this.spin();
      this.find('a.cancel').addClass('enabled');
    }, 1000);
  }

  spin () {
    var div = this.find('.fieldsets');
    if (!div.length) return;
    this.spinTimer = setTimeout(() => {
      this.spinner = lock(div[0], { size: 100 });
      this.spinner.lock();
    }, 500);
  }

  unspin () {
    clearTimeout(this.spinTimer);
    if (!this.spinner) return;
    this.spinner.unlock();
  }

  disable () {
    this.disabled = true;
    this.form.attr('disabled', true);
    this.find('button').attr('disabled', true);
  }

  enable () {
    this.disabled = false;
    this.form.attr('disabled', null);
    this.find('button').attr('disabled', null);
  }
}