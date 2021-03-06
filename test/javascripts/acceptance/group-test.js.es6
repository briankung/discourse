import { acceptance, logIn } from "helpers/qunit-helpers";

acceptance("Group");

const response = object => {
  return [
    200,
    { "Content-Type": "application/json" },
    object
  ];
};

QUnit.test("Anonymous Viewing Group", assert => {
  visit("/groups/discourse");

  andThen(() => {
    assert.equal(
      count(".nav-pills li a[title='Messages']"),
      0,
      'it deos not show group messages navigation link'
    );
  });

  click(".nav-pills li a[title='Activity']");

  andThen(() => {
    assert.ok(count('.group-post') > 0, "it lists stream items");
  });

  click(".group-activity-nav li a[href='/groups/discourse/activity/topics']");

  andThen(() => {
    assert.ok(find('.topic-list'), "it shows the topic list");
    assert.equal(count('.topic-list-item'), 2, "it lists stream items");
  });

  click(".group-activity-nav li a[href='/groups/discourse/activity/mentions']");

  andThen(() => {
    assert.ok(count('.group-post') > 0, "it lists stream items");
  });

  andThen(() => {
    assert.ok(find(".nav-pills li a[title='Edit Group']").length === 0, 'it should not show messages tab if user is not admin');
    assert.ok(find(".nav-pills li a[title='Logs']").length === 0, 'it should not show Logs tab if user is not admin');
    assert.ok(count('.group-post') > 0, "it lists stream items");
  });

  selectKit('.group-dropdown').expand();

  andThen(() => {
    assert.equal(
      find('.select-kit-row').text().trim(), 'discourse',
      'it displays the right row'
    );
  });
});

QUnit.test("Anonymous Viewing Automatic Group", assert => {
  visit("/groups/moderators");

  andThen(() => {
    assert.equal(
      count(".nav-pills li a[title='Manage']"),
      0,
      'it deos not show group messages navigation link'
    );
  });
});

QUnit.test("User Viewing Group", assert => {
  logIn();
  Discourse.reset();

  visit("/groups");
  click('.group-index-request');

  server.post('/groups/Macdonald/request_membership', () => { // eslint-disable-line no-undef
    return [
      200,
      { "Content-Type": "application/json" },
      { relative_url: '/t/internationalization-localization/280' }
    ];
  });

  andThen(() => {
    assert.equal(find('.modal-header').text().trim(), I18n.t(
      'groups.membership_request.title', { group_name: 'Macdonald' }
    ));

    assert.equal(find('.request-group-membership-form textarea').val(), 'Please add me');
  });

  click('.modal-footer .btn-primary');

  andThen(() => {
    assert.equal(
      find('.fancy-title').text().trim(),
      "Internationalization / localization"
    );
  });

  visit("/groups/discourse");

  click('.group-message-button');

  andThen(() => {
    assert.ok(count('#reply-control') === 1, 'it opens the composer');
    assert.equal(find('.ac-wrap .item').text(), 'discourse', 'it prefills the group name');
  });
});

QUnit.test("Admin viewing group messages when there are no messages", assert => {
  server.get('/topics/private-messages-group/eviltrout/discourse.json', () => { // eslint-disable-line no-undef
    return response({ topic_list: { topics: [] } });
  });

  logIn();
  Discourse.reset();

  visit("/groups/discourse");

  click(".nav-pills li a[title='Messages']");

  andThen(() => {
    assert.equal(
      find(".alert").text().trim(),
      I18n.t('choose_topic.none_found'),
      'it should display the right alert'
    );
  });
});

QUnit.test("Admin viewing group messages", assert => {
  server.get('/topics/private-messages-group/eviltrout/discourse.json', () => { // eslint-disable-line no-undef
    return response({"users":[{"id":2, "username":"bruce1", "avatar_template":"/letter_avatar_proxy/v2/letter/b/9de053/{size}.png"}, {"id":3, "username":"CodingHorror", "avatar_template":"/letter_avatar_proxy/v2/letter/c/e8c25b/{size}.png"}], "primary_groups":[], "topic_list":{"can_create_topic":true, "draft":null, "draft_key":"new_topic", "draft_sequence":0, "per_page":30, "topics":[{"id":12199, "title":"This is a private message 1", "fancy_title":"This is a private message 1", "slug":"this-is-a-private-message-1", "posts_count":0, "reply_count":0, "highest_post_number":0, "image_url":null, "created_at":"2018-03-16T03:38:45.583Z", "last_posted_at":null, "bumped":true, "bumped_at":"2018-03-16T03:38:45.583Z", "unseen":false, "pinned":false, "unpinned":null, "visible":true, "closed":false, "archived":false, "bookmarked":null, "liked":null, "views":0, "like_count":0, "has_summary":false, "archetype":"private_message", "last_poster_username":"bruce1", "category_id":null, "pinned_globally":false, "featured_link":null, "posters":[{"extras":"latest single", "description":"Original Poster, Most Recent Poster", "user_id":2, "primary_group_id":null}], "participants":[{"extras":"latest", "description":null, "user_id":2, "primary_group_id":null}, {"extras":null, "description":null, "user_id":3, "primary_group_id":null}]}]}});
  });

  logIn();
  Discourse.reset();

  visit("/groups/discourse");
  click(".nav-pills li a[title='Messages']");

  andThen(() => {
    assert.equal(
      find(".topic-list-item .link-top-line").text().trim(),
      "This is a private message 1",
      'it should display the list of group topics'
    );
  });
});

QUnit.test("Admin Viewing Group", assert => {
  logIn();
  Discourse.reset();

  visit("/groups/discourse");

  andThen(() => {
    assert.ok(
      find(".nav-pills li a[title='Manage']").length === 1,
      'it should show manage group tab if user is admin'
    );

    assert.equal(count('.group-message-button'), 1, 'it displays show group message button');
    assert.equal(find('.group-info-name').text(), 'Awesome Team', 'it should display the group name');
  });
});

QUnit.test("Admin Viewing Automatic Group", assert => {
  logIn();
  Discourse.reset();

  visit("/groups/moderators");
  click(".nav-pills li a[title='Manage']");

  andThen(() => {
    assert.equal(
      count('.groups-form .control-group'), 5,
      'it should display the right fields'
    );
  });
});
