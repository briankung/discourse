import Group from 'discourse/models/group';

export default Discourse.Route.extend({
  titleToken() {
    return I18n.t('groups.new.title');
  },

  model() {
    return Group.create({ automatic: false, visibility_level: 0 });
  },

  setupController(controller, model) {
    controller.set("model", model);
  },

  afterModel() {
    if (!(this.currentUser && this.currentUser.admin)) {
      this.transitionTo("groups");
    }
  },
});
