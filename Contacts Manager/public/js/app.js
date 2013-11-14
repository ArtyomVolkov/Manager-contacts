$(function() {

    window.App = {
    Models: {},
    Views: {},
    Collections: {},
    Router: {}
    }
    
    //template
    window.template = function(id){
      return _.template( $('#' + id).html() );
    };

    //create model User
    App.Models.User = Backbone.Model.extend({
      urlRoot: "/contacts",
      idAttribute: "_id",
      validate: function (attrs) {
        if (! $.trim(attrs.firstName)) {
          console.log("The user name is incorrect!");
          return 'The user name is incorrect!';
        };
      }
    });

    // create view for user
    App.Views.User = Backbone.View.extend({
      tagName: 'li',
      template: template('userTemplate'), 
      // for update view of model
      initialize: function(){
        this.model.on('change', this.render, this);
        this.model.on('destroy', this.remove, this);
      },
      remove: function(){
        this.$el.remove();
      },
      render: function () {
        var template = this.template(this.model.toJSON());
        this.$el.html(template);
        return this;
      },
      events: {
        'click #edit'   : 'editUser',
        'click #remove' : 'removeUser',
        'click #info'   : 'infoUser'
      },
      editUser: function(){
        var id = this.model.get('_id');
        var that = this;
        var user = new App.Models.User({_id: id});
        user.fetch({success: function(){
            $('#edit-page').html(new App.Views.EditUser({model: that.model}).el);
        }});
        router.navigate("contacts/" + id, true);
        console.log("Edit user with id: " + id);
      },
      infoUser: function(){
        var id = this.model.get('_id');
        $('div#info-page').find('label[name=fname]').text(this.model.get('firstName'));
        $('div#info-page').find('label[name=lname]').text(this.model.get('lastName'));
        $('div#info-page').find('label[name=age]').text(this.model.get('age'));
        router.navigate("contacts/info/" + id, true);
        console.log("Info user with id: " + id);
      },
      removeUser: function () {
        this.model.destroy();
        return false;
      }
    });

    // create collection contains models
    App.Collections.User = Backbone.Collection.extend({
      model: App.Models.User,
      url: "/contacts"
    });

    // collection of users 
    window.usersCollection = new App.Collections.User( 
      // [
      //   {
      //     id: 1,
      //     firstName: 'Artem',
      //     lastName: 'Volkov',
      //     age: 24
      //   },
      //   {
      //     id: 4,
      //     firstName: 'Helen',
      //     lastName: 'Demidenko',
      //     age: 25
      //   },
      //   {
      //     id: 2,
      //     firstName: 'Ivan',
      //     lastName: 'Cotelevsky',
      //     age: 26
      //   },
      //   {
      //     id: 3,
      //     firstName: 'John',
      //     lastName: 'Caningem',
      //     age: 32
      //   }
      // ]
      );

    // create view for render list of users
    App.Views.Users = Backbone.View.extend({
      initialize: function(){
        usersCollection.fetch(); 
        this.collection.on('add', this.addOne, this);
      },
      tagName: 'ul',
      render: function () {
        this.collection.each(this.addOne, this);
        return this;
      },
      addOne: function (user) {
        // create new view
        var userView = new App.Views.User({model: user});
        this.$el.append(userView.render().el);
      }
    });

    var usersView = new App.Views.Users({collection: usersCollection});

    // create view for adding new user
    App.Views.AddUser = Backbone.View.extend({
      el: '#addUser',
      events: {
        'submit': 'submit'
      },
      initialize: function(){
      },
      submit: function(e){
        // cansel send data from form (on default)
        e.preventDefault();
        var newUserFname = $(e.currentTarget).find('input[name=fname]').val();
        var newUserLname = $(e.currentTarget).find('input[name=lname]').val();
        var newUserAge = $(e.currentTarget).find('input[name=age]').val();
        var newPhoto = $(e.currentTarget).find('input[name=photo]').val();

        var newUser = new App.Models.User({
          firstName: newUserFname,
          lastName: newUserLname,
          age: newUserAge,
          picture: newPhoto
        });
        // for add data at server
        this.collection.create(newUser);
        router.navigate("contacts", true);
      }
    });

    var addUserView = new App.Views.AddUser({collection: usersCollection}); 
    $('#contact-page').html(usersView.render().el);

    //create editUser view for editing user
    App.Views.EditUser = Backbone.View.extend({
      initialize: function(){
        this.render(); 
      },

      template: template('editTemplate'),

      render: function(){
        $(this.el).html(this.template(this.model.toJSON()));
        return this;
      },

      tagName: 'div#edit-page',

      events: {
      'submit': 'inputEdit'
      },
      inputEdit: function(e){
        e.preventDefault();
        var newFname = $('div#edit-page').find('input[name=fname]').val();
        var newLname = $('div#edit-page').find('input[name=lname]').val();
        var newAge = $('div#edit-page').find('input[name=age]').val();
        
        var contact = {
          firstName: newFname,
          lastName: newLname,
          age: newAge
        };

        this.model.set('firstName', newFname);
        this.model.set('lastName', newLname);
        this.model.set('age', newAge);
        // for update data at server
        this.model.save(contact);
        router.navigate("contacts", true);
      }
    });

    App.Router = Backbone.Router.extend({
      routes: {
        ''                  : 'home',
        'home'              : 'home',
        'contacts'          : 'contacts',
        'addUser'           : 'addUser',
        'about'             : 'about',
        'contacts/:id'      : 'edit',
        'contacts/info/:id' : 'info',
        '*other'            : 'default'
       },

       deselectedPills: function(){
         $('ul.nav li').removeClass('active');
       },
       selectPill: function(pill){
         this.deselectedPills();
         $(pill).addClass('active');
       },
       hidePages: function(){
          //hide all pages with 'pages' class
          $('div.pages').hide();
        },
        showPage: function(page){
          //hide all pages
          this.hidePages();
          //show passed page by selector
          $(page).show();
        },
        addUser: function() {
            this.showPage('div#add-page');
            this.selectPill('li.add-pill');
        },
        about: function() {
            this.showPage('div#about-page');
            this.selectPill('li.about-pill');
        },
        contacts: function() {
            this.showPage('div#contact-page');
            this.selectPill('li.contact-pill');
        },
        home: function(){
          this.showPage('div#home-page');
          this.selectPill('li.home-pill');
        },
        edit: function(){
           this.showPage('div#edit-page');
           this.deselectedPills();
        },
        info: function(){
          this.showPage('div#info-page');
          this.deselectedPills();
        },
        default: function(other){
          this.showPage('div#undefined-page');
          this.deselectedPills();
        }
    });

    window.router = new App.Router();
    Backbone.history.start();
});
